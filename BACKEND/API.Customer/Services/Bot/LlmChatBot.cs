using System.Text;
using System.Text.Json;
using API.Customer.DTOs;
using API.Customer.Models;

namespace API.Customer.Services.Bot;

/// <summary>
/// Chatbot dùng LLM (tùy chọn) — chỉ được đăng ký khi có cấu hình <c>Chat:Llm:ApiKey</c>.
/// Vẫn ưu tiên các skill rule-based truy DB cho câu hỏi nghiệp vụ (đơn/kho/coupon/FAQ);
/// chỉ gọi LLM cho câu hỏi tự do. Nếu LLM lỗi → fallback sang rule-based / đề nghị handoff (Req 13.3).
/// </summary>
public class LlmChatBot(
    HttpClient http,
    IEnumerable<IChatSkill> skills,
    IConfiguration config,
    ILogger<LlmChatBot> logger) : IChatBot
{
    private readonly List<IChatSkill> _skills = skills.ToList();

    private string? ApiKey => config["Chat:Llm:ApiKey"];
    private string Endpoint => config["Chat:Llm:Endpoint"] ?? "";
    private string Model => config["Chat:Llm:Model"] ?? "gpt-4o-mini";
    private int MaxBotFailBeforeHandoff =>
        int.TryParse(config["Chat:MaxBotFailBeforeHandoff"], out var v) ? v : 2;

    private static readonly string[] HandoffKeywords =
    [
        "gặp nhân viên", "gap nhan vien", "nhân viên", "nhan vien", "người thật", "nguoi that",
        "tư vấn viên", "tu van vien", "tổng đài", "tong dai"
    ];

    public async Task<BotReply> RespondAsync(BotContext context)
    {
        var text = context.UserText?.Trim() ?? string.Empty;
        var lower = text.ToLowerInvariant();

        // 1) Yêu cầu gặp nhân viên
        if (HandoffKeywords.Any(lower.Contains))
            return BotReply.HandoffReply("Mình đang kết nối bạn với nhân viên hỗ trợ. Bạn chờ chút nhé!");

        // 2) Ưu tiên skill nghiệp vụ truy DB (chính xác hơn LLM, không tốn token)
        foreach (var skill in _skills)
        {
            if (skill.CanHandle(text, context))
                return await skill.HandleAsync(context);
        }

        // 3) Câu hỏi tự do → gọi LLM; lỗi thì fallback
        try
        {
            var answer = await CallLlmAsync(context);
            if (!string.IsNullOrWhiteSpace(answer))
                return BotReply.Simple(answer.Trim(), BotIntent.Faq);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "LLM call failed, falling back to rule-based handoff.");
        }

        // 4) Fallback
        if (context.BotFailCount + 1 >= MaxBotFailBeforeHandoff)
            return BotReply.HandoffReply(
                "Mình chưa hỗ trợ được câu hỏi này. Mình sẽ kết nối bạn với nhân viên nhé!");

        return BotReply.Simple("Bạn có thể mô tả rõ hơn để mình hỗ trợ tốt hơn không?", BotIntent.Unknown);
    }

    private async Task<string?> CallLlmAsync(BotContext context)
    {
        if (string.IsNullOrWhiteSpace(ApiKey) || string.IsNullOrWhiteSpace(Endpoint))
            return null;

        // Payload kiểu OpenAI Chat Completions (tương thích nhiều provider)
        var messages = new List<object>
        {
            new { role = "system", content =
                "Bạn là trợ lý của KaitoKid Shop (thời trang). Trả lời ngắn gọn, lịch sự bằng tiếng Việt. " +
                "Nếu câu hỏi về đơn hàng/tồn kho/mã giảm giá cụ thể mà bạn không có dữ liệu, hãy đề nghị khách cung cấp thông tin hoặc gặp nhân viên." }
        };
        foreach (var m in context.RecentHistory.TakeLast(6))
        {
            var role = m.SenderType == ChatSender.Customer ? "user" : "assistant";
            messages.Add(new { role, content = m.Content });
        }
        messages.Add(new { role = "user", content = context.UserText });

        var payload = new { model = Model, messages, temperature = 0.4, max_tokens = 400 };
        using var req = new HttpRequestMessage(HttpMethod.Post, Endpoint)
        {
            Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"),
        };
        req.Headers.Add("Authorization", $"Bearer {ApiKey}");

        using var resp = await http.SendAsync(req);
        resp.EnsureSuccessStatusCode();
        var json = await resp.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();
    }
}
