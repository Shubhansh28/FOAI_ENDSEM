import { useMemo, useState } from 'react';
import { HiPaperAirplane, HiRefresh } from 'react-icons/hi';
import { MdSmartToy } from 'react-icons/md';
import { useDashboard } from '../context/DashboardContext';
import { useTheme } from '../context/ThemeContext';
import { chatWithAI } from '../utils/api';
import { formatDate } from '../utils/helpers';

function buildSystemContext(issData, astronauts, newsData) {
  const headlines = Object.entries(newsData.articles)
    .filter(([category]) => category !== 'search')
    .flatMap(([category, articles]) =>
      articles.slice(0, 3).map((article) => {
        const source = article.source?.name || 'Unknown source';
        return `- ${category}: ${article.title} (${source}, ${formatDate(article.publishedAt)})`;
      })
    )
    .slice(0, 18);

  return [
    `ISS latitude: ${issData.latitude.toFixed(4)}`,
    `ISS longitude: ${issData.longitude.toFixed(4)}`,
    `ISS speed: ${issData.speed || 'collecting'} km/h`,
    `ISS location label: ${issData.locationName}`,
    `Tracked positions: ${issData.positions.length}`,
    `People in space: ${astronauts.number}`,
    `Crew: ${astronauts.people.map((person) => `${person.name} on ${person.craft}`).join(', ') || 'loading'}`,
    `Loaded news articles: ${newsData.totalArticles}`,
    `Headlines:\n${headlines.join('\n') || 'News is still loading.'}`,
  ].join('\n');
}

export default function AIAssistant() {
  const { issData, astronauts, newsData } = useDashboard();
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ask me about the live ISS position, astronauts, or the headlines loaded here.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const systemContext = useMemo(
    () => buildSystemContext(issData, astronauts, newsData),
    [issData, astronauts, newsData]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    const nextMessages = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const answer = await chatWithAI(nextMessages, systemContext);
      setMessages([...nextMessages, { role: 'assistant', content: answer }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Ask me about the live ISS position, astronauts, or the headlines loaded here.',
      },
    ]);
    setError('');
  };

  return (
    <div className={`glass-card rounded-xl overflow-hidden ${
      isDark ? '' : 'shadow-md'
    }`}>
      <div className={`p-4 border-b ${
        isDark ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <MdSmartToy className="text-white text-lg" />
            </div>
            <div className="min-w-0">
              <h2 className={`font-bold ${isDark ? 'text-text-dark' : 'text-gray-900'}`}>
                SpaceDesk AI
              </h2>
              <p className={`text-xs ${isDark ? 'text-text-muted' : 'text-gray-500'}`}>
                Grounded in current dashboard data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetChat}
            aria-label="Reset chat"
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? 'text-text-muted hover:text-text-dark hover:bg-white/5'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <HiRefresh className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-[420px] overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              message.role === 'user'
                ? 'bg-primary text-white'
                : isDark
                  ? 'bg-white/5 text-text-dark'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`rounded-xl px-3 py-2 ${
              isDark ? 'bg-white/5' : 'bg-gray-100'
            }`}>
              <div className="flex gap-1">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl px-3 py-2 text-sm bg-danger/10 text-danger border border-danger/20">
            {error}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={`p-4 border-t ${
        isDark ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div className={`flex items-end gap-2 rounded-xl border p-2 ${
          isDark
            ? 'bg-surface-darker/50 border-white/10'
            : 'bg-white border-gray-200'
        }`}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            placeholder="Ask about ISS or news..."
            className={`w-full resize-none bg-transparent outline-none text-sm ${
              isDark ? 'text-text-dark placeholder-text-muted' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="p-2.5 rounded-lg bg-primary text-white transition-all hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiPaperAirplane className="w-4 h-4 rotate-90" />
          </button>
        </div>
      </form>
    </div>
  );
}
