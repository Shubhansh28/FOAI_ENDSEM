import { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../utils/api';
import { useDashboard } from '../context/DashboardContext';
import { useTheme } from '../context/ThemeContext';
import { HiChat, HiX, HiPaperAirplane, HiTrash } from 'react-icons/hi';

const MAX_MESSAGES = 30;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="typing-dot w-2 h-2 bg-primary rounded-full" />
      <div className="typing-dot w-2 h-2 bg-primary rounded-full" />
      <div className="typing-dot w-2 h-2 bg-primary rounded-full" />
    </div>
  );
}

export default function Chatbot() {
  const { isDark } = useTheme();
  const { issData, astronauts, newsData } = useDashboard();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('spacedesk-chat');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('spacedesk-chat', JSON.stringify(messages.slice(-MAX_MESSAGES)));
    } catch {}
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Build system context from dashboard data
  const buildContext = () => {
    const newsArticles = Object.entries(newsData.articles)
      .filter(([key]) => key !== 'search')
      .map(([category, articles]) =>
        `Category "${category}": ${articles.length} articles. Titles: ${articles.map(a => a.title).join('; ')}`
      ).join('\n');

    return `
ISS TRACKING DATA:
- Current Latitude: ${issData.latitude.toFixed(4)}°
- Current Longitude: ${issData.longitude.toFixed(4)}°
- Current Speed: ${issData.speed.toLocaleString()} km/h
- Current Location: ${issData.locationName}
- Positions Tracked: ${issData.positions.length}
- Total People in Space: ${astronauts.number}
- Astronauts: ${astronauts.people.map(p => `${p.name} (${p.craft})`).join(', ')}

NEWS DATA:
- Total Articles Loaded: ${newsData.totalArticles}
${newsArticles}
    `.trim();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const context = buildContext();
      const response = await chatWithAI([...messages, userMsg], context);
      const aiMsg = { role: 'assistant', content: response, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg].slice(-MAX_MESSAGES));
    } catch (err) {
      const errorMsg = { role: 'assistant', content: `⚠️ ${err.message}`, timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('spacedesk-chat');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-danger rotate-90'
            : 'bg-gradient-to-br from-primary to-accent'
        }`}
        style={{ boxShadow: isOpen ? '0 8px 32px rgba(239,68,68,0.4)' : '0 8px 32px rgba(99,102,241,0.4)' }}
      >
        {isOpen ? <HiX className="text-white text-xl" /> : <HiChat className="text-white text-xl" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-surface-dark border-white/10'
            : 'bg-white border-gray-200'
        }`}
        style={{ maxHeight: 'calc(100vh - 140px)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">SpaceDesk AI</h3>
                <p className="text-white/70 text-xs">Dashboard assistant</p>
              </div>
            </div>
            <button
              id="chatbot-clear"
              onClick={clearChat}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Clear chat"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[350px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className={`text-center py-8 ${isDark ? 'text-text-muted' : 'text-gray-400'}`}>
                <p className="text-3xl mb-2">👋</p>
                <p className="text-sm font-medium">Hi! Ask me anything about</p>
                <p className="text-xs mt-1">ISS location, speed, astronauts, or news articles</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-md'
                    : isDark
                      ? 'bg-surface-card text-text-dark rounded-bl-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className={`rounded-2xl rounded-bl-md ${
                  isDark ? 'bg-surface-card' : 'bg-gray-100'
                }`}>
                  <TypingIndicator />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className={`p-3 border-t ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <input
                id="chatbot-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about ISS or news..."
                disabled={isTyping}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                  isDark
                    ? 'bg-surface-card text-text-dark placeholder-text-muted border border-white/10 focus:border-primary'
                    : 'bg-gray-100 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-primary'
                }`}
              />
              <button
                type="submit"
                id="chatbot-send"
                disabled={isTyping || !input.trim()}
                className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiPaperAirplane className="w-4 h-4 rotate-90" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
