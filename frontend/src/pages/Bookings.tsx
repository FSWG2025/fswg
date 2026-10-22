import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Plus, SearchX } from "lucide-react";
import type { Consultation } from "@/types";
import ConsultationBookingModal from "@/components/global/ConsultationBookingModal";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "Scheduled" },
  completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled" },
  approved: { bg: "bg-violet-100", text: "text-violet-700", label: "Approved" },
  rejected: { bg: "bg-orange-100", text: "text-orange-700", label: "Rejected" },
};

const Bookings = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get("/consultations");
        setConsultations(data.consultations || data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-10 w-10 border-4 border-[#C69259] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-[#E4EFF8]">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-[#12213E] flex items-center gap-2">
            My Bookings          </h1>
          <p className="text-gray-500 mt-1">View and manage your consultations.</p>
        </div>
        {user?.role === "client" && (
          <Button
            onClick={() => setBookingModalOpen(true)}
            className="bg-[#C69259] hover:bg-[#B07D4A] text-white rounded-full px-6 py-3 shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Booking
          </Button>
        )}
      </motion.div>

      {consultations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-white rounded-2xl border border-gray-100"
        >
          <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No consultations yet.</p>
          <p className="text-sm text-gray-400 mt-1">Book a call to get started!</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {consultations.map((c) => {
            const cfg = statusConfig[c.status] || statusConfig.scheduled;
            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#12213E]">
                    {c.service?.title || "Consultation"}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#C69259]" />
                    {new Date(c.dateTime).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#C69259]" />
                    {new Date(c.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#C69259]" />
                    {c.consultant?.name || "TBD"}
                  </span>
                </div>
                {c.notes && (
                  <p className="mt-3 text-sm text-gray-400 italic">"{c.notes}"</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <ConsultationBookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} />
    </div>
  );
};

export default Bookings;