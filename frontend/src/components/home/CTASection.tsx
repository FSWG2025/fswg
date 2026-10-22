import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Rocket, MapPin } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/AuthProvider";
import ConsultationBookingModal from "@/components/global/ConsultationBookingModal";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const ComingSoonModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-5 h-5 text-gray-600" /></button>
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#C69259]/20 rounded-full blur-xl" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#12213E]/10 rounded-full blur-xl" />
          <div className="relative z-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C69259] to-[#D4A96A] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-extrabold text-[#12213E] mb-2">Coming Soon!</h2>
            <p className="text-gray-600 mb-2">Our mobile app is currently in the works.</p>
            <p className="text-sm text-gray-500 mb-6">We're crafting a premium experience. Stay tuned!</p>
            <button onClick={onClose} className="bg-[#C69259] text-white rounded-full px-8 py-3 font-semibold hover:bg-[#B07D4A] transition-colors shadow-md">Got it, thanks!</button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const CTASection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState({ name: "", phone: "", email: "", location: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const cleaned = value.replace(/[^\d\s\(\)\+\-]/g, "").replace(/^-/, "");
      setFormState({ ...formState, phone: cleaned });
      return;
    }
    setFormState({ ...formState, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.phone || !formState.location.trim()) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      await api.post("/leads", {
        firstName: formState.name.split(" ")[0] || formState.name,
        lastName: formState.name.split(" ").slice(1).join(" ") || "",
        email: formState.email,
        phone: formState.phone,
        source: "website",
        interest: "Consultation",
      });
      setSubmitted(true);
    } catch (error) {
      toast.error("Could not submit your request. Please try again.");
    }
  };

  const handleBookConsultationClick = () => {
    if (user) setConsultModalOpen(true);
    else document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[#E4EFF8] py-24" id="cta">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C69259]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#12213E]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-center mb-24">
          <motion.div className="lg:col-span-5 space-y-6 text-center lg:text-left" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#C69259]/20 rounded-full px-4 py-1.5 shadow-sm mb-4">
              <span className="text-sm font-medium text-[#12213E]">Start Your Journey Today</span>
            </div>
            <h2 className="section-headline text-[#12213E]">Ready to Take Your First Step?</h2>
            <p className="text-lg text-gray-500 max-w-md mx-auto lg:mx-0">Book your free, no‑obligation consultation now and let our experts create your personalized wealth roadmap.</p>
            <button onClick={handleBookConsultationClick} className="inline-flex items-center gap-2 bg-[#12213E] text-white rounded-full px-6 py-3 font-semibold hover:bg-[#0D1A2E] transition-colors shadow-lg">
              {user ? "Book a Consultation" : "Get Started"} <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {!user && (
            <motion.div className="lg:col-span-7 flex justify-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} id="booking-form">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-10 bg-gradient-to-b from-gray-200 to-gray-100 rounded-t-2xl shadow-inner flex items-center justify-center border-b border-gray-300"><div className="w-10 h-3 bg-gray-300 rounded-full" /></div>
                {!submitted ? (
                  <>
                    <h3 className="text-2xl font-bold text-[#12213E] text-center mb-2">Book Appointment</h3>
                    <p className="text-sm text-gray-500 text-center mb-6">Fill in your details and we'll reach out within 24 hours.</p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label><input type="text" name="name" value={formState.name} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C69259]/50 focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400" placeholder="John Doe" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Telephone number *</label><input type="tel" name="phone" value={formState.phone} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C69259]/50 focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400" placeholder="+1 (555) 123-4567" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" name="email" value={formState.email} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C69259]/50 focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400" placeholder="you@example.com" /></div>
                      <div><label className="block text-sm font-medium text-gray-700 mb-1"><MapPin className="w-4 h-4 inline-block mr-1 text-[#C69259]" /> City / Location *</label><input type="text" name="location" value={formState.location} onChange={handleFormChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C69259]/50 focus:border-transparent transition-all text-gray-800 placeholder:text-gray-400" placeholder="e.g. Toronto, ON" /></div>
                      <button type="submit" className="w-full bg-[#C69259] text-white rounded-full py-3 font-semibold hover:bg-[#B07D4A] transition-colors shadow-lg flex items-center justify-center gap-2">Book Appointment</button>
                    </form>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <h3 className="text-2xl font-bold text-[#12213E] mb-2">Thank You!</h3>
                    <p className="text-gray-600 mb-6">We'll reach out within 24 hours.<br /><span className="font-medium">Create an account to track your request.</span></p>
                    <button
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (formState.name.trim()) params.set("name", formState.name.trim());
                        if (formState.email.trim()) params.set("email", formState.email.trim());
                        if (formState.phone.trim()) params.set("phone", formState.phone.trim());
                        if (formState.location.trim())
                          params.set("address", formState.location.trim());
                        navigate(`/register?${params.toString()}`);
                      }}
                      className="bg-[#12213E] text-white rounded-full px-6 py-3 font-semibold hover:bg-[#0D1A2E] transition-colors shadow-lg w-full"
                    >
                      Create Account
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>

        <motion.div className="bg-[#12213E] rounded-[32px] p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-2xl" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C69259]/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C69259]/10 rounded-full blur-2xl" />
          <div className="text-center max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">Join First Step Wealth & Get a Free Consultation</h3>
              <p className="text-white/70 text-base max-w-lg mx-auto">Sign up for our newsletter and receive a complimentary 30‑minute strategy session with a senior advisor.</p>
              <div className="flex max-w-md mx-auto">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#C69259]/50 text-white placeholder-white/50" />
                <button className="bg-[#C69259] text-white px-6 py-3 rounded-r-full font-semibold hover:bg-[#B07D4A] transition-colors">Sign Up</button>
              </div>
              <div className="flex justify-center gap-4 mt-8">
                <button onClick={() => setModalOpen(true)} className="bg-black text-white rounded-xl px-5 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors shadow-lg">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                  <div className="text-left"><div className="text-[10px] leading-tight">Download on the</div><div className="text-sm font-semibold -mt-0.5">App Store</div></div>
                </button>
                <button onClick={() => setModalOpen(true)} className="bg-black text-white rounded-xl px-5 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors shadow-lg">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" /></svg>
                  <div className="text-left"><div className="text-[10px] leading-tight">GET IT ON</div><div className="text-sm font-semibold -mt-0.5">Google Play</div></div>
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <ComingSoonModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <ConsultationBookingModal isOpen={consultModalOpen} onClose={() => setConsultModalOpen(false)} />
    </section>
  );
};

export default CTASection;