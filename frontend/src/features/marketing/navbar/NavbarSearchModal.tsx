import type { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, X } from "lucide-react";
import SearchResults from "@/components/global/SearchResults";

type Props = {
  open: boolean;
  onClose: () => void;
  query: string;
  setQuery: (q: string) => void;
  results: any[];
  loading: boolean;
  inputRef: RefObject<HTMLInputElement>;
  onSelect: (result: any) => void;
};

export default function NavbarSearchModal({
  open,
  onClose,
  query,
  setQuery,
  results,
  loading,
  inputRef,
  onSelect,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anything: rental, insurance, mortgage, FAQ…"
                className="flex-1 bg-transparent text-lg text-[#12213E] outline-none placeholder:text-gray-400"
              />
              {loading && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              <SearchResults
                results={results}
                loading={loading}
                query={query}
                onSelect={onSelect}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
