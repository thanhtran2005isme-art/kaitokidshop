using API.Customer.DTOs;
using API.Customer.Services.Bot;

namespace API.Customer.Services;

/// <summary>
/// Kết quả khi khách gửi một tin nhắn: tin của khách + (tùy chọn) phản hồi bot,
/// và cờ cho biết phiên có được chuyển sang nhân viên hay không.
/// </summary>
public record CustomerMessageResult(MessageDto CustomerMessage, MessageDto? BotMessage, bool HandedOff);

/// <summary>
/// Nghiệp vụ chat thuần (không phụ thuộc transport) — dùng chung cho Controller và Hub.
/// </summary>
public interface IChatService
{
    Task<ConversationDto> GetOrCreateAsync(ChatIdentity who, int? productContextId);
    Task<ConversationDto?> GetConversationAsync(int conversationId);
    Task<CustomerMessageResult> AddCustomerMessageAsync(ChatIdentity who, int conversationId, string text, ChatAttachment? attach);
    Task<MessageDto> AddAgentMessageAsync(int staffId, int conversationId, string text, ChatAttachment? attach);
    Task<IReadOnlyList<MessageDto>> GetHistoryAsync(ChatIdentity who, int conversationId, int take, int beforeId);
    Task<bool> RequestHandoffAsync(int conversationId, string? reason);
    Task<bool> ClaimAsync(int staffId, int conversationId);
    Task CloseAsync(int conversationId, ChatActor by);
    Task MarkReadAsync(int conversationId, ChatActor reader);
    Task<PagedResult<ConversationDto>> ListForAgentAsync(ChatInboxFilter filter);

    /// <summary>Kiểm tra một danh tính có sở hữu phiên không (dùng cho phân quyền ở transport).</summary>
    Task<bool> IsOwnerAsync(int conversationId, ChatIdentity who);
}
