// ChatWidget - bong bóng chat nổi cho khách hàng (thay vai trò MessengerChat cũ).
// Hiển thị lịch sử, lời chào + quick replies, badge chưa đọc, typing, card đính kèm.
// Nội dung render text thuần (React tự escape) — không nhúng HTML người dùng (Req 14.3).

import { useEffect, useRef, useState } from 'react';
import { useMatch } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import type { ChatMessage } from '../../services/chatService';
import '../../styles/chat-widget.css';

export default function ChatWidget({ productContextId }: { productContextId?: number }) {
  const {
    isOpen, messages, unread, connected, agentTyping,
    conversation, openWidget, closeWidget, sendMessage, requestHandoff, notifyTyping,
  } = useChat();

  // Nhận diện ngữ cảnh sản phẩm khi đang ở trang chi tiết /product/:id (Req 3.4)
  const productMatch = useMatch('/product/:id');
  const routeProductId = productMatch?.params.id ? Number(productMatch.params.id) : undefined;
  const effectiveProductId = productContextId ?? (Number.isFinite(routeProductId) ? routeProductId : undefined);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, agentTyping]);

  const handleToggle = () => {
    if (isOpen) closeWidget();
    else void openWidget(effectiveProductId);
  };

  const handleSend = async (text: string) => {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setInput('');
    try {
      await sendMessage(value);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (v: string) => {
    setInput(v);
    notifyTyping(true);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => notifyTyping(false), 1500);
  };

  const status = conversation?.status;

  return (
    <div className="kk-chat">
      {/* Nút nổi */}
      <button
        className="kk-chat__bubble"
        onClick={handleToggle}
        aria-label="Mở hỗ trợ trực tuyến"
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && unread > 0 && <span className="kk-chat__badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="kk-chat__window" role="dialog" aria-label="Hỗ trợ trực tuyến">
          <div className="kk-chat__header">
            <div>
              <strong>Hỗ trợ KaitoKid</strong>
              <div className="kk-chat__status">
                {status === 'agent' ? 'Đang chat với nhân viên'
                  : status === 'waiting' ? 'Đang kết nối nhân viên…'
                  : connected ? 'Trợ lý trực tuyến' : 'Đang kết nối…'}
              </div>
            </div>
            <button className="kk-chat__close" onClick={closeWidget} aria-label="Đóng">✕</button>
          </div>

          <div className="kk-chat__body" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="kk-chat__hint">
                Xin chào! Mình có thể giúp bạn tra cứu đơn hàng, kiểm tra tồn kho, mã giảm giá hoặc chính sách.
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} onQuickReply={handleSend} />
            ))}
            {agentTyping && <div className="kk-chat__typing">Nhân viên đang nhập…</div>}
          </div>

          {status !== 'agent' && (
            <button className="kk-chat__handoff" onClick={() => void requestHandoff()}>
              👤 Gặp nhân viên
            </button>
          )}

          <form
            className="kk-chat__input"
            onSubmit={(e) => { e.preventDefault(); void handleSend(input); }}
          >
            <input
              type="text"
              value={input}
              placeholder="Nhập tin nhắn…"
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()}>Gửi</button>
          </form>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg, onQuickReply }: { msg: ChatMessage; onQuickReply: (text: string) => void }) {
  const cls = msg.senderType === 'customer' ? 'kk-msg kk-msg--me' : 'kk-msg kk-msg--them';
  return (
    <div className={cls}>
      <div className="kk-msg__text">{msg.content}</div>

      {msg.attachment && (
        <a className="kk-msg__card" href={msg.attachment.url ?? '#'}>
          {msg.attachment.imageUrl && <img src={msg.attachment.imageUrl} alt="" />}
          <div>
            <div className="kk-msg__card-title">{msg.attachment.title}</div>
            {msg.attachment.subtitle && <div className="kk-msg__card-sub">{msg.attachment.subtitle}</div>}
          </div>
        </a>
      )}

      {msg.quickReplies && msg.quickReplies.length > 0 && (
        <div className="kk-msg__quick">
          {msg.quickReplies.map((q, i) => (
            <button key={i} onClick={() => onQuickReply(q.payload)}>{q.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
