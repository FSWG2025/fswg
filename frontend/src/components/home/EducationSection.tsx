import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, ChevronLeft, ChevronRight, Building, CreditCard, FileCheck, Shield, Award, Mail, Briefcase, Heart, Zap, Target, Quote, Users } from "lucide-react";

interface Slide { title: string; content: string; }
interface Topic { title: string; icon: React.FC<{ className?: string }>; color: string; resources: string; shortDescription: string; slides: Slide[]; }
interface InsuranceResource { title: string; icon: React.FC<{ className?: string }>; description: string; image: string; color: string; slides: Slide[]; }

const rentalTopics: Topic[] = [
  { title: "Understanding the Rental Market", icon: Building, color: "from-blue-500 to-blue-600", resources: "6 guides", shortDescription: "Learn how the Canadian rental market works and what landlords look for.", slides: [{ title: "How the Canadian Rental Market Works", content: "Rental markets vary across Canada..." }, { title: "What Landlords Look For", content: "Stable income, good credit history..." }, { title: "Average Rental Costs by City", content: "Toronto, Vancouver, Montreal..." }] },
  { title: "Building Credit from Scratch", icon: CreditCard, color: "from-emerald-500 to-emerald-600", resources: "4 courses", shortDescription: "Even with no Canadian credit history, you can build a strong profile.", slides: [{ title: "Why Canadian Credit Matters", content: "Your credit score affects your ability to rent..." }, { title: "Secured Credit Cards", content: "A secured card requires a deposit..." }] },
  { title: "Rental Application Tips", icon: FileCheck, color: "from-amber-500 to-amber-600", resources: "5 articles", shortDescription: "Stand out from other applicants even without a guarantor.", slides: [{ title: "Preparing Your Application", content: "Gather proof of income..." }, { title: "Writing a Strong Cover Letter", content: "A personal letter explaining your situation..." }] },
  { title: "The Rental Guarantee Program", icon: Shield, color: "from-violet-500 to-violet-600", resources: "Full Details", shortDescription: "Our flagship program that guarantees your rent to landlords.", slides: [{ title: "What Is Insurance Coverage?", content: "Insurance coverage helps protect..." }, { title: "Who Qualifies?", content: "Canadian residents, newcomers..." }] },
];

const insuranceResources: InsuranceResource[] = [
  { title: "Life & Critical Illness Insurance", icon: Shield, description: "Compare Canada's top life and critical illness policies.", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=400&q=80", color: "from-blue-500 to-blue-600", slides: [{ title: "Why Insurance Matters", content: "Insurance is a financial safety net..." }] },
  { title: "Start Your Own Business in Canada", icon: Briefcase, description: "Turn your skills into a thriving business.", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80", color: "from-emerald-500 to-emerald-600", slides: [{ title: "Business Structures", content: "Sole proprietorship, partnership..." }] },
  { title: "Disability & Income Protection", icon: Heart, description: "If you can't work, disability insurance replaces your income.", image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=400&q=80", color: "from-rose-500 to-rose-600", slides: [{ title: "Short‑Term vs. Long‑Term", content: "Short‑term covers a few months..." }] },
];

const CarouselModal = ({ slides, onClose, icon: Icon, color, title }: { slides: Slide[]; onClose: () => void; icon: React.FC<{ className?: string }>; color: string; title: string }) => {
  const [index, setIndex] = useState(0);
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-5 h-5 text-gray-600" /></button>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="text-center max-w-lg">
              <div className="flex justify-center mb-6"><div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}><Icon className="w-8 h-8 text-white" /></div></div>
              <h3 className="text-2xl font-extrabold text-[#0F2E47] mb-4">{slides[index].title}</h3>
              <p className="text-gray-600 leading-relaxed">{slides[index].content}</p>
              <p className="text-sm text-gray-400 mt-4">{index + 1} of {slides.length}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-center gap-4 pb-6 px-6">
          <button onClick={() => setIndex((prev) => (prev - 1 + slides.length) % slides.length)} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-[#0F2E47]" /></button>
          <div className="flex items-center gap-2">{slides.map((_, i) => (<button key={i} onClick={() => setIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === index ? "bg-[#F09A67] w-6" : "bg-gray-300"}`} />))}</div>
          <button onClick={() => setIndex((prev) => (prev + 1) % slides.length)} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"><ChevronRight className="w-5 h-5 text-[#0F2E47]" /></button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const EducationSection = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceResource | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const colors = { deepBlue: "#0F2E47", pastelBlue: "#A3BAE0", pastelPurple: "#C1A7E2", sageGreen: "#B0D49C", accentOrange: "#F09A67", cream: "#FAF9F6" };

  return (
    <section className="relative overflow-hidden bg-[#E4EFF8] py-20 lg:py-28" id="education">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(#4338CA 1px, transparent 1px), linear-gradient(90deg, #4338CA 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div className="absolute -left-16 -top-16 w-64 h-64 bg-[#4338CA]/10 rounded-full blur-3xl" />
      <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#EA580C]/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full px-4 py-1.5 shadow-sm mb-6"><span className="text-sm font-semibold text-gray-800">Free Financial Education</span></div>
          <h2 className="section-headline" style={{ color: colors.deepBlue }}>Renting, Insurance & Business Made Easy</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-4">From securing your first rental to starting a business, we've got you covered.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <motion.div className="md:col-span-4 rounded-[28px] p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer" style={{ backgroundColor: colors.pastelBlue }} whileHover={{ y: -4 }} onClick={() => setSelectedTopic(rentalTopics[0])}>
            <div><span className="text-xs font-bold text-gray-700 uppercase">Market 101</span><h3 className="text-2xl font-extrabold mt-2" style={{ color: colors.deepBlue }}>{rentalTopics[0].title}</h3><p className="text-sm mt-2" style={{ color: colors.deepBlue, opacity: 0.8 }}>{rentalTopics[0].shortDescription}</p></div>
            <div className="mt-4 flex items-center gap-2"><span className="text-sm font-semibold" style={{ color: colors.deepBlue }}>Explore guides</span><ArrowRight className="w-4 h-4" /></div>
          </motion.div>

          <motion.div className="md:col-span-4 rounded-[28px] p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer" style={{ backgroundColor: colors.pastelPurple }} whileHover={{ y: -4 }} onClick={() => setSelectedTopic(rentalTopics[1])}>
            <div className="flex items-start gap-4"><div><h3 className="text-xl font-extrabold text-white">{rentalTopics[1].title}</h3><p className="text-sm text-white/80 mt-1">{rentalTopics[1].shortDescription}</p></div></div>
            <div className="mt-4 flex items-center gap-2 text-white font-semibold">Learn More <ArrowRight className="w-4 h-4" /></div>
          </motion.div>

          <motion.div className="md:col-span-4 rounded-[28px] p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer" style={{ backgroundColor: colors.sageGreen }} whileHover={{ y: -4 }} onClick={() => setShowSignup(true)}>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">{[1, 2, 3].map((i) => (<img key={i} src={`https://i.pravatar.cc/150?img=${i}`} alt="" className="w-10 h-10 rounded-full border-2 border-white" />))}</div>
              <span className="bg-white/80 text-xs font-medium px-3 py-1 rounded-full">2.3k Families</span>
            </div>
            <div className="mt-8"><h3 className="text-3xl font-extrabold text-gray-800">500+ Families Housed</h3><p className="text-sm text-gray-700 mt-2">Our guarantee program has already helped hundreds.</p></div>
          </motion.div>
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-8"><h3 className="text-3xl font-extrabold" style={{ color: colors.deepBlue }}>Insurance & Entrepreneurship</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {insuranceResources.map((res, idx) => (
              <motion.div key={idx} className="bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer" whileHover={{ y: -4 }} onClick={() => setSelectedInsurance(res)}>
                <div className="h-44 overflow-hidden"><img src={res.image} alt={res.title} className="w-full h-full object-cover" /></div>
                <div className="p-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2E47] to-[#2D5F8A] flex items-center justify-center mb-3"><res.icon className="w-5 h-5 text-white" /></div>
                  <h4 className="font-bold text-lg" style={{ color: colors.deepBlue }}>{res.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{res.description}</p>
                  <button className="mt-4 w-full bg-black text-white rounded-full py-2.5 font-semibold flex items-center justify-center gap-2">Explore <ArrowRight className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>{selectedTopic && <CarouselModal slides={selectedTopic.slides} onClose={() => setSelectedTopic(null)} icon={selectedTopic.icon} color={selectedTopic.color} title={selectedTopic.title} />}</AnimatePresence>
      <AnimatePresence>{selectedInsurance && <CarouselModal slides={selectedInsurance.slides} onClose={() => setSelectedInsurance(null)} icon={selectedInsurance.icon} color={selectedInsurance.color} title={selectedInsurance.title} />}</AnimatePresence>
      <AnimatePresence>
        {showSignup && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSignup(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 text-center">
              <h2 className="text-2xl font-extrabold text-[#0F2E47] mb-4">Unlock All Resources</h2>
              <p className="text-gray-600 mb-6">Sign up for a free account to access our full library.</p>
              <div className="flex flex-col gap-3">
                <button className="w-full bg-[#F09A67] text-white rounded-full py-3 font-bold hover:bg-[#D98A5B] transition-colors">Book a Free Consultation</button>
                <button onClick={() => setShowSignup(false)} className="text-gray-500 text-sm hover:underline">Maybe later</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default EducationSection;