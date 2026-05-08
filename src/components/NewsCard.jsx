import { useTheme } from '../context/ThemeContext';
import { formatDate } from '../utils/helpers';
import { HiExternalLink } from 'react-icons/hi';

export default function NewsCard({ article }) {
  const { isDark } = useTheme();

  return (
    <div className={`glass-card rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${
      isDark ? 'hover:shadow-primary/10' : 'shadow-md hover:shadow-primary/15'
    }`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168d8c?w=600&h=300&fit=crop';
            }}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isDark ? 'bg-surface-hover' : 'bg-gray-200'
          }`}>
            <span className="text-4xl">📰</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-primary/90 text-white text-xs font-semibold rounded-full">
            {article.source?.name || 'News'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${
          isDark ? 'text-text-dark' : 'text-gray-900'
        }`}>
          {article.title}
        </h3>

        <p className={`text-xs leading-relaxed line-clamp-3 ${
          isDark ? 'text-text-muted' : 'text-gray-500'
        }`}>
          {article.description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            {article.author && (
              <p className={`text-xs font-medium truncate max-w-[150px] ${
                isDark ? 'text-text-muted' : 'text-gray-600'
              }`}>
                By {article.author}
              </p>
            )}
            <p className={`text-xs ${isDark ? 'text-text-muted/70' : 'text-gray-400'}`}>
              {formatDate(article.publishedAt)}
            </p>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
          >
            Read More
            <HiExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
