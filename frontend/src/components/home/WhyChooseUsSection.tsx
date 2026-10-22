import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const WhyChooseUsSection = () => {
  return (
    <section className="relative bg-[#E4EFF8] py-24 overflow-hidden" id="why-choose-us">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="sm:hidden inline-flex items-center gap-2 bg-white/80 border border-gray-200 rounded-full px-4 py-1.5 shadow-sm mb-6">
          <span className="w-2 h-2 bg-[#C69259] rounded-full animate-pulse" />
          <span className="text-sm font-medium text-[#12213E]">The First Step Difference</span>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="section-headline relative mb-4 inline-block tracking-tight text-[#0F172A]">
          <span className="relative">
            Why First Step
            <svg className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-6 pointer-events-none" viewBox="0 0 120 20" fill="none">
              <motion.path d="M 5 15 Q 30 2 60 10 T 115 15" stroke="#C69259" strokeWidth="2.5" strokeLinecap="round" fill="none" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.4 }} />
            </svg>
          </span>{" "}
          Wealth?
          <svg className="absolute -bottom-3 right-0 w-20 h-6 pointer-events-none" viewBox="0 0 80 20" fill="none">
            <motion.path d="M 2 15 L 15 5 L 30 12 L 45 3 L 60 10 L 75 2" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.6 }} />
          </svg>
        </motion.h2>

        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-lg text-[#475569] max-w-2xl mx-auto">
          We combine technology, expertise, and genuine care to deliver financial peace of mind.
        </motion.p>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="bg-[#FEF08A] rounded-[32px] p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ y: -4 }}>
            <span className="text-6xl font-extrabold text-[#0F172A]">2,500+</span>
            <h3 className="text-xl font-bold text-[#0F172A] mt-2">Families Empowered</h3>
            <p className="text-sm text-[#475569] mt-3 leading-relaxed">We've helped over two thousand families across Canada build financial stability.</p>
            <div className="mt-6 flex justify-end">
              <motion.button className="bg-[#2563EB] text-white rounded-full px-6 py-3 font-bold shadow-lg flex items-center gap-2 hover:bg-[#1D4ED8] transition-colors" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>Book a Call <ArrowRight className="w-4 h-4" /></motion.button>
            </div>
          </motion.div>

          <motion.div className="bg-[#0F172A] rounded-[32px] p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} whileHover={{ y: -4 }}>
            <div>
              <span className="text-6xl font-extrabold text-white">15+</span>
              <h3 className="text-xl font-bold text-white mt-2">Years Experience</h3>
              <p className="text-sm text-[#94A3B8] mt-3 leading-relaxed">Our advisors have navigated every market cycle. Their wisdom becomes your advantage.</p>
            </div>
            <div className="flex items-center mt-6">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (<div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-gray-400 overflow-hidden"><img src={`https://i.pravatar.cc/150?img=${50 + i}`} alt="" className="w-full h-full object-cover" /></div>))}
                <div className="w-10 h-10 rounded-full bg-[#2563EB] border-2 border-[#0F172A] flex items-center justify-center text-white text-xs font-bold">+30</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="bg-[#FDBA74] rounded-[32px] p-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} whileHover={{ y: -4 }}>
            <span className="text-6xl font-extrabold text-white">98%</span>
            <h3 className="text-xl font-bold text-white mt-2">Client Satisfaction</h3>
            <p className="text-sm text-white/80 mt-3 leading-relaxed">Our clients consistently rate us 4.9 out of 5. We're proud of the trust they place in us.</p>
            <div className="absolute -bottom-4 -right-4 w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" alt="Consultant" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;