import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Users, Home, Shield, TrendingUp, X, ArrowRight,
  Building2, Heart, MessageCircle, UserPlus,
  ShieldCheck, Clock, Bell
} from "lucide-react";
import { useNavigate } from "react-router";

/* ═══════════════════════════════════════════════════════
   WhatsApp Configuration
═══════════════════════════════════════════════════════ */
const WHATSAPP_NUMBER = "1234567890";
const WHATSAPP_MESSAGE = "Hi! I'm interested in rental support from First Step Wealth Group. Can you help me get started?";
const openWhatsApp = () => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`, "_blank");

/* ═══════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════ */
interface ImpactLocation {
  city: string;
  province: string;
  families: number;
  lat: number;
  lng: number;
  services: string[];
  description: string;
  originCommunities: string[];
  image: string;
  color: string;
  icon: React.FC<{ className?: string }>;
  successStory: { quote: string; name: string; origin: string };
}

/* ═══════════════════════════════════════════════════════
   Impact Locations Data
═══════════════════════════════════════════════════════ */
const impactLocations: ImpactLocation[] = [
  {
    city: "Toronto", province: "Ontario", families: 8, lat: 43.6532, lng: -79.3832,
    services: ["Rental Guarantee", "Investment Advisory", "Insurance Protection"],
    description: "Our largest community hub. We've helped over 8 newcomer families, many from Nigeria, Ghana, Kenya, and across Africa, secure their first Canadian rental, build credit, and eventually buy homes in the GTA.",
    originCommunities: ["Nigeria", "Ghana", "Kenya", "India", "Philippines"],
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=600&q=80",
    color: "from-rose-500 to-rose-600", icon: Users,
    successStory: { quote: "We arrived from Lagos with no Canadian credit. First Step guaranteed our rent, and within 18 months, we bought our first home in Brampton.", name: "Chidi & Adaeze O.", origin: "Lagos, Nigeria" },
  },
  {
    city: "Vancouver", province: "British Columbia", families: 3, lat: 49.2827, lng: -123.1207,
    services: ["Rental Support", "Cross-border Insurance", "Real Estate Guidance"],
    description: "In one of Canada's most competitive housing markets, we've helped over 3 newcomer families navigate the rental landscape.",
    originCommunities: ["Nigeria", "China", "India", "Iran", "Kenya"],
    image: "https://images.unsplash.com/photo-1602536054536-8b56874300ca?auto=format&fit=crop&w=600&q=80",
    color: "from-blue-500 to-blue-600", icon: Home,
    successStory: { quote: "Without Canadian credit history, no landlord would rent to us. First Step's guarantee changed everything.", name: "Obinna & Grace E.", origin: "Abuja, Nigeria" },
  },
  {
    city: "Calgary", province: "Alberta", families: 3, lat: 51.0447, lng: -114.0719,
    services: ["Portfolio Diversification", "Rental Guarantee", "Education Savings"],
    description: "Alberta's energy capital has attracted skilled workers from across Africa. We've helped over 3 families transition smoothly.",
    originCommunities: ["Nigeria", "Ghana", "South Africa", "Sudan"],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=600&q=80",
    color: "from-violet-500 to-violet-600", icon: TrendingUp,
    successStory: { quote: "Moving from Port Harcourt to Calgary was daunting. First Step helped us rent immediately.", name: "Efe & Tolu A.", origin: "Port Harcourt, Nigeria" },
  },
  {
    city: "Edmonton", province: "Alberta", families: 3, lat: 53.5461, lng: -113.4938,
    services: ["First-Time Home Buyer", "Insurance Protection", "Wealth Building"],
    description: "Edmonton's affordable housing combined with our rental guarantee has helped over 3 newcomer families.",
    originCommunities: ["Somalia", "Ethiopia", "DRC", "Nigeria", "Eritrea"],
    image: "https://images.unsplash.com/photo-1582559934353-2e47140e7501?auto=format&fit=crop&w=600&q=80",
    color: "from-emerald-500 to-emerald-600", icon: Heart,
    successStory: { quote: "We came from Ethiopia with nothing. First Step guaranteed our rent, and three years later, we own our home.", name: "Dawit & Selam T.", origin: "Addis Ababa, Ethiopia" },
  },
  {
    city: "Ottawa", province: "Ontario", families: 2, lat: 45.4215, lng: -75.6972,
    services: ["Cross-border Tax Planning", "Pension Advice", "Rental Guarantee"],
    description: "The nation's capital is home to diplomats, government employees, and international students. We've helped over 2 families settle in.",
    originCommunities: ["Nigeria", "Kenya", "Ghana", "Rwanda", "Uganda"],
    image: "https://images.unsplash.com/photo-1590099033599-75a15a60d60a?auto=format&fit=crop&w=600&q=80",
    color: "from-cyan-500 to-cyan-600", icon: Shield,
    successStory: { quote: "As a diplomat from Nairobi, I needed help understanding Canadian finances. First Step made everything clear.", name: "Ambassador Wanjiku M.", origin: "Nairobi, Kenya" },
  },
  {
    city: "Montreal", province: "Quebec", families: 2, lat: 45.5017, lng: -73.5673,
    services: ["Bilingual Financial Services", "Rental Guarantee", "RESP Planning"],
    description: "Québec's unique system can be challenging. We've helped over 2 Francophone African families navigate the rental market.",
    originCommunities: ["Côte d'Ivoire", "Senegal", "Cameroon", "DRC", "Haiti"],
    image: "https://images.unsplash.com/photo-1560780552-ba54683cb263?auto=format&fit=crop&w=600&q=80",
    color: "from-indigo-500 to-indigo-600", icon: Building2,
    successStory: { quote: "Arrivé d'Abidjan sans historique de crédit. First Step a garanti notre loyer et maintenant nous sommes propriétaires.", name: "Kouadio & Aminata F.", origin: "Abidjan, Côte d'Ivoire" },
  },
  {
    city: "Winnipeg", province: "Manitoba", families: 1, lat: 49.8951, lng: -97.1384,
    services: ["Rental Guarantee", "Insurance Protection", "Business Mentorship"],
    description: "Manitoba's growing newcomer community has found a trusted partner in First Step with over 1 family helped.",
    originCommunities: ["Nigeria", "Eritrea", "South Sudan", "Ethiopia"],
    image: "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?auto=format&fit=crop&w=600&q=80",
    color: "from-amber-500 to-amber-600", icon: MapPin,
    successStory: { quote: "We never imagined we could own a home in Canada. First Step walked with us every step of the way.", name: "Akello & Mary O.", origin: "Kampala, Uganda" },
  },
  {
    city: "Halifax", province: "Nova Scotia", families: 2, lat: 44.6488, lng: -63.5752,
    services: ["Rental Support", "First-Time Home Buyer", "Investment Starter Kits"],
    description: "Atlantic Canada's growing diversity is reflected in our Halifax community with over 2 newcomer families helped.",
    originCommunities: ["Nigeria", "Ghana", "India", "China", "Bangladesh"],
    image: "https://images.unsplash.com/photo-1580541832625-27b9e44e5ca5?auto=format&fit=crop&w=600&q=80",
    color: "from-teal-500 to-teal-600", icon: Home,
    successStory: { quote: "Came to Halifax as an international student from Accra. First Step helped me rent, build credit, and now I'm a proud homeowner.", name: "Kwesi A.", origin: "Accra, Ghana" },
  },
  {
    city: "Saskatoon", province: "Saskatchewan", families: 2, lat: 52.1332, lng: -106.6700,
    services: ["Rental Guarantee", "Insurance Education", "Wealth Intelligence"],
    description: "Saskatchewan's opportunities have drawn families from across Africa. We've helped over 2 newcomer families overcome credit barriers.",
    originCommunities: ["Nigeria", "Zimbabwe", "Ghana", "Kenya"],
    image: "https://images.unsplash.com/photo-1572557798996-8feb8b5c16e6?auto=format&fit=crop&w=600&q=80",
    color: "from-orange-500 to-orange-600", icon: TrendingUp,
    successStory: { quote: "From Harare to Saskatoon, the transition was hard until we found First Step. Their rental guarantee gave us a home.", name: "Tendai & Rumbi M.", origin: "Harare, Zimbabwe" },
  },
  {
    city: "St. John's", province: "Newfoundland & Labrador", families: 4, lat: 47.5615, lng: -52.7126,
    services: ["Rental Support", "Financial Education", "Community Integration"],
    description: "Even in Canada's easternmost province, we're making an impact with over 4 newcomer families helped.",
    originCommunities: ["Nigeria", "Egypt", "Ghana", "Kenya", "India"],
    image: "https://images.unsplash.com/photo-1551801693-f58b44186d7f?auto=format&fit=crop&w=600&q=80",
    color: "from-pink-500 to-pink-600", icon: Heart,
    successStory: { quote: "As a healthcare worker from Cairo, finding housing in St. John's was my biggest challenge. First Step made it happen.", name: "Dr. Fatima H.", origin: "Cairo, Egypt" },
  },
];

const impactPoints: [number, number][] = impactLocations.map((loc) => [loc.lat, loc.lng]);

const pinIcon = L.divIcon({
  className: "fswg-map-pin",
  html: '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#12213E;border:3px solid #C69259;box-shadow:0 2px 8px rgba(18,33,62,0.35)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const FitCanada = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(points, { padding: [36, 36] });
  }, [map, points]);
  return null;
};

/* ═══════════════════════════════════════════════════════
   Dual CTA Modal
═══════════════════════════════════════════════════════ */
const DualCTAModal = ({ isOpen, onClose, cityName }: { isOpen: boolean; onClose: () => void; cityName?: string }) => {
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <motion.div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-6 sm:p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-5 h-5 text-gray-600" /></button>
        <div className="text-center mb-6"><div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#12213E] to-[#1E3A5F] flex items-center justify-center mx-auto mb-4 shadow-lg"><ShieldCheck className="w-7 h-7 text-white" /></div><h2 className="text-2xl font-extrabold text-[#12213E]">Get Started {cityName ? `in ${cityName}` : "Today"}</h2><p className="text-gray-500 mt-2 text-sm">Choose how you'd like to connect with us</p></div>
        <div className="bg-gradient-to-r from-[#FFFBF5] to-[#FEE7D4] rounded-2xl p-4 mb-6 border border-[#F0CBB3]">
          <p className="text-sm font-semibold text-[#12213E] mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-[#C69259]" />Why we recommend creating an account:</p>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-[#C69259] mt-0.5 shrink-0" /><span><strong>Accountability:</strong> Track your application status</span></li>
            <li className="flex items-start gap-2"><Clock className="w-4 h-4 text-[#C69259] mt-0.5 shrink-0" /><span><strong>Faster follow-ups:</strong> Get personalized support</span></li>
            <li className="flex items-start gap-2"><Bell className="w-4 h-4 text-[#C69259] mt-0.5 shrink-0" /><span><strong>Never miss updates:</strong> Receive document requests instantly</span></li>
            <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-[#C69259] mt-0.5 shrink-0" /><span><strong>Secure & confidential:</strong> Your information is protected</span></li>
          </ul>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute -top-3 left-4 bg-[#C69259] text-white text-xs font-bold px-3 py-1 rounded-full z-10">RECOMMENDED</span>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onClose(); navigate("/register"); }} className="w-full pt-6 pb-4 px-5 bg-gradient-to-r from-[#12213E] to-[#1E3A5F] text-white font-bold rounded-2xl shadow-lg flex items-center gap-3 hover:shadow-xl transition-all border-2 border-[#C69259]"><div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"><UserPlus className="w-5 h-5 text-white" /></div><div className="text-left"><p className="text-base font-bold">Create Your Free Account</p><p className="text-xs text-white/60">Best for tracking progress & personalized support</p></div><ArrowRight className="w-5 h-5 ml-auto shrink-0" /></motion.button>
          </div>
          <div className="flex items-center gap-4"><div className="flex-1 h-px bg-gray-200" /><span className="text-sm text-gray-400 font-medium">or</span><div className="flex-1 h-px bg-gray-200" /></div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { onClose(); openWhatsApp(); }} className="w-full py-4 px-5 bg-white border-2 border-[#25D366] hover:bg-[#25D366] hover:text-white text-[#25D366] font-bold rounded-2xl shadow-lg flex items-center gap-3 hover:shadow-xl transition-all group"><div className="w-10 h-10 rounded-full bg-[#25D366]/10 group-hover:bg-white/20 flex items-center justify-center shrink-0"><MessageCircle className="w-5 h-5" /></div><div className="text-left"><p className="text-base font-bold">Chat With Us on WhatsApp</p><p className="text-xs opacity-70">Get quick answers directly from our team</p></div><ArrowRight className="w-5 h-5 ml-auto shrink-0" /></motion.button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-5">No commitment • Free consultation • 100% confidential</p>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   Location Detail Modal
═══════════════════════════════════════════════════════ */
const LocationDetailModal = ({ location, onClose, onApply }: { location: ImpactLocation | null; onClose: () => void; onApply: () => void }) => {
  if (!location) return null;
  const Icon = location.icon;
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"><X className="w-5 h-5 text-gray-600" /></button>
        <div className="h-48 sm:h-56 rounded-t-[32px] overflow-hidden"><img src={location.image} alt={location.city} className="w-full h-full object-cover" /></div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${location.color} flex items-center justify-center shadow`}><Icon className="w-6 h-6 text-white" /></div><div><h2 className="text-2xl font-extrabold text-[#0F172A]">{location.city}</h2><p className="text-sm text-gray-500">{location.province} • {location.families}+ families helped</p></div></div>
          <p className="text-gray-600 leading-relaxed text-sm">{location.description}</p>
          <div><h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-[#C69259]" />Newcomer Communities</h4><div className="flex flex-wrap gap-2">{location.originCommunities.map((c, i) => <span key={i} className="px-3 py-1.5 bg-[#FDF6EC] rounded-full text-xs font-semibold text-[#12213E] border border-[#C69259]/20">{c}</span>)}</div></div>
          <div><h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-2">Services</h4><div className="flex flex-wrap gap-2">{location.services.map((s, i) => <span key={i} className="px-3 py-1.5 bg-[#F8FAFC] rounded-full text-xs font-semibold text-[#12213E] border border-gray-100">{s}</span>)}</div></div>
          <div className="bg-gradient-to-r from-[#FFFBF5] to-[#FEE7D4] rounded-2xl p-5 border border-[#F0CBB3]">
            <p className="text-xs font-bold text-[#C69259] uppercase tracking-wider mb-2">Success Story</p>
            <p className="text-sm text-[#12213E] italic leading-relaxed mb-3">"{location.successStory.quote}"</p>
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C69259] to-[#12213E] flex items-center justify-center text-white text-xs font-bold">{location.successStory.name.charAt(0)}</div><div><p className="text-sm font-bold text-[#12213E]">{location.successStory.name}</p><p className="text-xs text-gray-500">Originally from {location.successStory.origin}</p></div></div>
          </div>
          <button onClick={onApply} className="cta-email w-full">
            <span className="min-w-0 flex-1 whitespace-nowrap">Apply for Rental Guarantee</span>
            <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════
   Main Section
═══════════════════════════════════════════════════════ */
const GlobalImpactSection = () => {
  const [selectedLocation, setSelectedLocation] = useState<ImpactLocation | null>(null);
  const [dualCTAModalOpen, setDualCTAModalOpen] = useState(false);
  const [ctaCityName, setCtaCityName] = useState<string | undefined>(undefined);

  const totalFamilies = impactLocations.reduce((sum, loc) => sum + loc.families, 0);
  const totalCities = impactLocations.length;
  const provincesCovered = [...new Set(impactLocations.map((l) => l.province))].length;

  const openDualCTA = (cityName?: string) => { setCtaCityName(cityName); setDualCTAModalOpen(true); };

  return (
    <section className="bg-[#E4EFF8] py-16 md:py-24">
      <div className="mx-auto w-[98%] md:w-full md:max-w-[1180px] md:px-6">
      <div className="rounded-[28px] bg-white px-4 py-10 shadow-[0_18px_50px_rgba(18,33,62,0.06)] md:px-10 md:py-14">
        <p className="text-center text-sm font-medium text-[#12213E]">Proudly Serving Newcomers Across Canada</p>
        <h2 className="section-headline mx-auto mt-5 max-w-3xl text-center text-[#12213E]">
          Our Impact Across <span className="text-[#C69259]">Canada</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-[#6B7280]">
          From coast to coast, we've helped immigrant and newcomer families, many originally from Nigeria, Ghana, Kenya, Ethiopia, and across Africa, secure their first Canadian home, build credit, and created lasting stability and peace of mind.
        </p>
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => openDualCTA()} className="cta-email">
            <span className="whitespace-nowrap">Apply for Rental Guarantee</span>
            <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
          </button>
        </div>

        <div className="relative mt-8">
          <div className="relative z-0 isolate h-[300px] overflow-hidden rounded-[24px] sm:h-[380px] md:h-[460px] [&_.leaflet-container]:z-0 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:bg-[#E4EFF6] [&_.leaflet-control-attribution]:text-[10px]">
            <MapContainer
              center={[56, -96]}
              zoom={4}
              scrollWheelZoom={false}
              className="h-full w-full"
              aria-label="Map of Canadian cities where First Step has helped newcomers"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitCanada points={impactPoints} />
              {impactLocations.map((loc) => (
                <Marker
                  key={loc.city}
                  position={[loc.lat, loc.lng]}
                  icon={pinIcon}
                  eventHandlers={{ click: () => setSelectedLocation(loc) }}
                  title={loc.city}
                />
              ))}
            </MapContainer>
          </div>

          <div className="relative z-10 mt-4 grid grid-cols-3 items-end gap-2 px-1 md:mt-6 md:gap-4 md:px-6">
            <div className="rounded-2xl bg-white p-3 shadow-[0_12px_30px_rgba(18,33,62,0.08)] md:p-5">
              <p className="text-2xl font-bold tracking-tight text-[#12213E] md:text-4xl">{totalFamilies}+</p>
              <p className="mt-1 text-[11px] leading-snug text-[#6B7280] md:text-sm">Newcomer Families Helped</p>
            </div>
            <div className="rounded-2xl bg-[#12213E] p-3 text-center text-white shadow-[0_12px_30px_rgba(18,33,62,0.16)] md:p-5">
              <p className="text-2xl font-bold tracking-tight md:text-4xl">{provincesCovered}</p>
              <p className="mt-1 text-[11px] text-white/70 md:text-sm">Provinces</p>
            </div>
            <div className="rounded-2xl bg-white p-3 text-right shadow-[0_12px_30px_rgba(18,33,62,0.08)] md:p-5">
              <p className="text-2xl font-bold tracking-tight text-[#12213E] md:text-4xl">{totalCities}</p>
              <p className="mt-1 text-[11px] leading-snug text-[#6B7280] md:text-sm">Canadian Cities</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {impactLocations.map((loc) => (
              <button
                key={loc.city}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                className="rounded-full bg-[#F4F7FB] px-3 py-1.5 text-xs font-semibold text-[#12213E]"
              >
                {loc.city}
              </button>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-[#6B7280]">
          We're proud to have served newcomers/immigrants across Canada and from <span className="font-semibold text-[#12213E]">over 15 countries</span> world-wide.
        </p>
      </div>
      </div>

      <AnimatePresence>{selectedLocation && <LocationDetailModal location={selectedLocation} onClose={() => setSelectedLocation(null)} onApply={() => openDualCTA(selectedLocation?.city)} />}</AnimatePresence>
      <AnimatePresence><DualCTAModal isOpen={dualCTAModalOpen} onClose={() => setDualCTAModalOpen(false)} cityName={ctaCityName} /></AnimatePresence>
    </section>
  );
};

export default GlobalImpactSection;