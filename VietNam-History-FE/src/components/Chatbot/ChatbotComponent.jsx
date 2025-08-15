import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { processQuery } from "../../services/ChatbotService";
import "./ChatbotComponent.css";
import { FaPaperPlane, FaTimes, FaRobot, FaUser } from "react-icons/fa";

const ChatbotComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      content: "Xin chào! Tôi là trợ lý AI về lịch sử Việt Nam. Bạn có thể hỏi tôi về các triều đại, nhân vật lịch sử, sự kiện quan trọng, di tích lịch sử và nhiều thông tin khác về lịch sử Việt Nam. Tôi có thể giúp gì cho bạn?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = {
      type: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await processQuery(input, user?.id || null);

      // Add bot response to chat
      if (response.status === "OK") {
        const botMessage = {
          type: "bot",
          content: response.message,
          data: response.data,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(response.message || "Đã xảy ra lỗi");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        type: "bot",
        content:
          "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (message) => {
    if (message.isError) {
      return <div className="error-message">{message.content}</div>;
    }

    // Regular text message
    return <div>{message.content}</div>;
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot toggle button */}
      <button
        className={`chatbot-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleChatbot}
        aria-label="Toggle chatbot"
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Trợ lý lịch sử Việt Nam</h3>
            <button
              className="close-button"
              onClick={toggleChatbot}
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.type === "bot" ? "bot" : "user"}`}
              >
                <div className="message-avatar">
                  {message.type === "bot" ? <FaRobot /> : <FaUser />}
                </div>
                <div className="message-content">
                  {renderMessageContent(message)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Nhập câu hỏi về lịch sử Việt Nam..."
              disabled={isLoading}
              ref={inputRef}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotComponent;