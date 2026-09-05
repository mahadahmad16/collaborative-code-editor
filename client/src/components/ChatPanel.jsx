import { useState } from "react";

const ChatPanel = ({ messages = [], onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    onSendMessage?.(trimmedMessage);
    setMessage("");
  };

  return (
    <section className="chat-panel">
      <div className="chat-panel__header">
        <h3>Room Chat</h3>
      </div>

      <div className="chat-panel__messages">
        {messages.length > 0 ? (
          messages.map((item) => (
            <div className="chat-message" key={item.id}>
              <div className="chat-message__meta">
                <span>{item.user?.name || "User"}</span>
                <time>{item.time || ""}</time>
              </div>

              <p>{item.message}</p>
            </div>
          ))
        ) : (
          <p className="chat-panel__empty">
            No messages yet. Start the conversation.
          </p>
        )}
      </div>

      <form className="chat-panel__form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Send a message..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />

        <button type="submit" aria-label="Send message">
          ↑
        </button>
      </form>
    </section>
  );
};

export default ChatPanel;