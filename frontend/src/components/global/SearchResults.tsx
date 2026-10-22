import { motion } from "framer-motion";
import { FileText, Globe, Server } from "lucide-react";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  url?: string;
  fullBody?: string;
}

interface Props {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
}

const typeIcons: Record<string, React.FC<{ className?: string }>> = {
  blog: FileText,
  page: Globe,
  section: Globe,
  faq: FileText,
  topic: FileText,
  insight: FileText,
  testimonial: FileText,
  service_extra: FileText,
  service: Server,
  service_static: Server,
};

const SearchResults = ({ results, loading, query, onSelect }: Props) => {
  const getIcon = (type: string) => {
    const Icon = typeIcons[type] || FileText;
    return <Icon className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="p-2">
      {loading && (
        <div className="flex items-center justify-center p-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="w-5 h-5 border-2 border-gray-300 border-t-[#2563EB] rounded-full"
          />
        </div>
      )}
      {!loading && results.length === 0 && query.trim().length > 0 && (
        <div className="p-4 text-sm text-gray-500 text-center">
          <p>
            No results found for "<span className="font-semibold text-gray-700">{query}</span>"
          </p>
          <p className="text-xs mt-1 text-gray-400">
            Try a different keyword or browse the site.
          </p>
        </div>
      )}
      {!loading &&
        results.map((result) => (
          <button
            key={result.id}
            onClick={() => onSelect(result)}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors flex items-start gap-3"
          >
            <span className="mt-0.5">{getIcon(result.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[#12213E] truncate">
                {result.title}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                {result.snippet}
              </div>
              <div className="text-[10px] text-[#2563EB] uppercase mt-1 font-medium">
                {result.type}
              </div>
            </div>
          </button>
        ))}
    </div>
  );
};

export default SearchResults;