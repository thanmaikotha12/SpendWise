import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, CornerDownLeft, RefreshCw } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const SUGGESTED_QUERIES = [
  'What is my current balance?',
  'How much did I spend on food this month?',
  'Which category do I spend the most on?',
  'How much can I save if I reduce shopping by 20%?',
  'How are my budgets doing?',
  'What are my upcoming bills?',
  'What is my financial goals progress?',
];

export default function Assistant() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const chatEndRef = useRef(null);

  const { user } = useAuth();

  const defaultGreeting = {
    role: 'assistant',
    text: 'Hello! I am your SpendWise Financial Assistant. I analyze your live transaction ledger, budgets, and savings goals in real time. Ask me anything about your finances or select one of the suggested prompts below.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // Load chat history from MongoDB on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get('/dashboard/assistant/history');
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((m) => ({
            role: m.role,
            text: m.text,
            source: m.source,
            time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(mapped);
        } else {
          setMessages([defaultGreeting]);
        }
      } catch (err) {
        setMessages([defaultGreeting]);
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadHistory();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleAsk = async (textToSend) => {
    const qText = (textToSend || query).trim();
    if (!qText || loading) return;

    const userMsg = {
      role: 'user',
      text: qText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/dashboard/assistant', { q: qText });
      const botMsg = {
        role: 'assistant',
        text: res.data.answer,
        source: res.data.source || 'SpendWise real data engine',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I encountered an error querying your financial data. Please make sure the backend server is running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete('/dashboard/assistant/history');
      setMessages([
        {
          role: 'assistant',
          text: 'Conversation history cleared. How can I assist you with your financial data today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages([defaultGreeting]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleAsk(query);
  };

  return (
    <div className="page assistant-page">
      {/* Page Header */}
      <div className="page-head">
        <div>
          <div className="eyebrow">INTELLIGENT FINANCIAL INFERENCE</div>
          <h2>AI Financial Assistant</h2>
          <p>Direct conversational interface evaluating your actual MongoDB transaction ledger.</p>
        </div>
      </div>

      <div className="assistant-container panel">
        {/* Assistant Header */}
        <div className="assistant-header-bar">
          <div className="assistant-identity">
            <div className="ai-avatar-glow">
              <Sparkles size={20} />
            </div>
            <div>
              <h4>SpendWise Financial Intelligence</h4>
              <span className="ai-status-indicator">
                <span className="status-dot" /> Connected to live ledger data
              </span>
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={handleClearHistory}
            title="Clear conversation history from database"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Chat Messages Log */}
        <div className="chat-messages-log">
          {messages.map((m, idx) => (
            <div className={`chat-message-row ${m.role}`} key={idx}>
              <div className="message-avatar">
                {m.role === 'assistant' ? (
                  <Sparkles size={16} />
                ) : (
                  <span>{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                )}
              </div>

              <div className="message-bubble-wrapper">
                <div className="message-bubble">
                  <p className="message-text">{m.text}</p>
                </div>
                <div className="message-meta-row">
                  <span className="msg-time">{m.time}</span>
                  {m.source && <span className="msg-source-tag">{m.source}</span>}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message-row assistant">
              <div className="message-avatar">
                <Sparkles size={16} />
              </div>
              <div className="message-bubble-wrapper">
                <div className="message-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Queries Chips */}
        <div className="suggested-queries-tray">
          <span className="tray-label">Quick Prompts:</span>
          <div className="chips-scroller">
            {SUGGESTED_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                className="query-chip"
                onClick={() => handleAsk(sq)}
                disabled={loading}
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input Box */}
        <form className="chat-input-bar" onSubmit={handleFormSubmit}>
          <input
            type="text"
            placeholder="Ask about spending, current balance, savings rate, or budget status…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button className="primary-btn send-btn" type="submit" disabled={!query.trim() || loading}>
            <Send size={16} />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}
