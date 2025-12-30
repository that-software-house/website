import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';
import { sendChatMessage } from '../services/chatService';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);

    // Add user message to conversation history
    const updatedHistory = [...conversationHistory, { role: 'user', content: userMessage }];

    // Show typing indicator
    setIsTyping(true);

    try {
      // Call OpenAI API through chat service
      const response = await sendChatMessage(userMessage, conversationHistory);

      setIsTyping(false);

      // Add bot response to messages
      setMessages(prev => [...prev, { sender: 'bot', text: response.reply }]);

      // Update conversation history
      if (response.success) {
        setConversationHistory([...updatedHistory, { role: 'assistant', content: response.reply }]);
      }
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I encountered an error. Please try again or contact us at contact@thatsoftwarehouse.com'
      }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-widget">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? 'is-open' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-title">
            <div className="chat-avatar">TSH</div>
            <div>
              <div className="chat-name">TSH Assistant</div>
              <div className="chat-status">
                <span className="status-dot"></span>
                Online
              </div>
            </div>
          </div>
          <button
            className="icon-button"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message message--${message.sender}`}>
              <div
                className="message__bubble"
                dangerouslySetInnerHTML={{ __html: message.text }}
              />
            </div>
          ))}

          {isTyping && (
            <div className="message message--bot">
              <div className="message__bubble typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        className="chat-toggle"
        onClick={toggleChat}
        aria-label="Open chat"
      >
        <span className="chat-toggle__icon">💬</span>
        <span className="chat-toggle__label">Chat</span>
      </button>
    </div>
  );
};

export default ChatWidget;
