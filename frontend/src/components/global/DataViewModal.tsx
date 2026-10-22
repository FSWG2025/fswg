import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  columns: Column[];
}

const DataViewModal = ({ isOpen, onClose, title, endpoint, columns }: Props) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .get(endpoint)
        .then(({ data: response }) => {
          const items = response.data || response.users || response.leads || 
                       response.applications || response.content || response;
          setData(Array.isArray(items) ? items : []);
        })
        .catch(() => setData([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen, endpoint]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-2xl font-extrabold text-[#12213E] flex items-center gap-2">
 {title}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin w-8 h-8 text-[#C69259]" />
                </div>
              ) : data.length === 0 ? (
                <p className="text-center text-gray-500 py-20">No data found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            className="text-left py-3 px-4 font-semibold text-[#12213E]"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                          {columns.map((col) => (
                            <td key={col.key} className="py-3 px-4 text-gray-600">
                              {col.render
                                ? col.render(row[col.key], row)
                                : row[col.key] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DataViewModal;