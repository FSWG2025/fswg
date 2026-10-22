import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowRight, Calendar, X, ChevronDown } from "lucide-react";

const abbreviateCurrency = (val: number) => {
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${Math.round(val).toLocaleString()}`;
};

const formatFullCurrency = (val: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(val);

const formatCurrency = (val: number): string =>
  Math.abs(val) < 1e5 ? formatFullCurrency(val) : abbreviateCurrency(val);

interface BarData {
  year: number;
  contributions: number;
  interest: number;
  total: number;
}

const interestRateOptions = [
  { value: 0.10, label: "10%" },
  { value: 0.15, label: "15%" },
  { value: 0.20, label: "20%" },
  { value: 0.25, label: "25%" },
];

const panel = "rounded-[28px] bg-[#F4F7FB] p-5 md:p-6";
const chartCard = "rounded-[22px] bg-white p-4 shadow-[0_8px_24px_rgba(18,33,62,0.04)]";

const SplitBars = ({
  data,
  selectedYear,
  onPoint,
}: {
  data: BarData[];
  selectedYear: number;
  onPoint: (d: BarData) => void;
}) => {
  const width = 320;
  const height = 168;
  const max = Math.max(...data.map((item) => Math.max(item.contributions, item.interest)), 1);
  const group = width / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Contributions and interest by decade">
      {data.map((item, index) => {
        const bar = (value: number) => Math.max((value / max) * 112, value > 0 ? 8 : 0);
        const contribH = bar(item.contributions);
        const interestH = bar(item.interest);
        const x = index * group + group / 2;
        const active = item.year === selectedYear;
        return (
          <g key={item.year} onClick={() => onPoint(item)} className="cursor-pointer">
            <rect x={x - 20} y={8} width="40" height="128" fill="transparent" />
            <rect x={x - 16} y={128 - contribH} width="12" height={contribH} rx="6" fill={active ? "#12213E" : "#8AA0C0"} />
            <rect x={x + 0} y={128 - interestH} width="12" height={interestH} rx="6" fill={active ? "#C69259" : "#E4C9A4"} />
            <text x={x} y={150} textAnchor="middle" fill="#6B7280" fontSize="11">{item.year}</text>
          </g>
        );
      })}
    </svg>
  );
};

const GrowthBars = ({
  data,
  selectedYear,
  onPoint,
}: {
  data: BarData[];
  selectedYear: number;
  onPoint: (d: BarData) => void;
}) => {
  const width = 520;
  const height = 210;
  const padL = 42;
  const padB = 28;
  const max = Math.max(...data.map((item) => item.total), 1);
  const ticks = [0.25, 0.5, 0.75, 1];
  const plotH = height - padB - 16;
  const scale = (value: number) => Math.max(Math.pow(value / max, 0.45) * plotH, value > 0 ? 10 : 0);
  const slot = (width - padL - 12) / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Projected total by decade">
      <defs>
        <pattern id="wealthHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="6" height="6" fill="#E7EEF6" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#12213E" strokeWidth="2" />
        </pattern>
      </defs>
      {ticks.map((tick) => {
        const y = height - padB - scale(max * tick);
        return (
          <g key={tick}>
            <line x1={padL} x2={width - 8} y1={y} y2={y} stroke="#EEF2F6" />
            <text x={padL - 6} y={y + 3} textAnchor="end" fill="#9CA3AF" fontSize="10">{abbreviateCurrency(max * tick)}</text>
          </g>
        );
      })}
      {data.map((item, index) => {
        const barH = scale(item.total);
        const x = padL + index * slot + slot * 0.22;
        const barW = slot * 0.56;
        const y = height - padB - barH;
        const active = item.year === selectedYear;
        return (
          <g key={item.year} onClick={() => onPoint(item)} className="cursor-pointer">
            <rect x={x - 6} y={8} width={barW + 12} height={height - padB - 8} fill="transparent" />
            <rect x={x} y={y} width={barW} height={barH} rx="10" fill={active ? "#12213E" : "url(#wealthHatch)"} />
            {active && (
              <g>
                <rect x={x + barW / 2 - 36} y={Math.max(y - 28, 2)} width="72" height="22" rx="11" fill="#12213E" />
                <text x={x + barW / 2} y={Math.max(y - 13, 17)} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{formatCurrency(item.total)}</text>
              </g>
            )}
            <text x={x + barW / 2} y={height - 8} textAnchor="middle" fill="#6B7280" fontSize="11">{item.year}y</text>
          </g>
        );
      })}
    </svg>
  );
};

const YearLine = ({ points }: { points: { year: number; total: number; contributions: number }[] }) => {
  const width = 460;
  const height = 180;
  const pad = 18;
  const max = Math.max(...points.map((point) => point.total), 1);
  const coords = points.map((point, index) => {
    const x = pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2);
    const y = (value: number) => height - pad - (value / max) * (height - pad * 2);
    return { ...point, x, yTotal: y(point.total), yContrib: y(point.contributions) };
  });
  const path = (key: "yTotal" | "yContrib") => coords.map((point) => `${point.x},${point[key]}`).join(" ");
  const marker = coords[Math.min(coords.length - 1, Math.max(0, Math.floor(coords.length * 0.55)))] ?? coords[0];

  if (!marker) return null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Year by year growth">
      <polyline points={path("yContrib")} fill="none" stroke="#C69259" strokeWidth="2.5" strokeLinejoin="round" />
      <polyline points={path("yTotal")} fill="none" stroke="#12213E" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1={marker.x} x2={marker.x} y1={marker.yTotal} y2={height - pad} stroke="#D5E3F2" strokeDasharray="3 4" />
      <circle cx={marker.x} cy={marker.yTotal} r="5" fill="#12213E" />
      <g>
        <rect x={Math.min(marker.x - 28, width - 78)} y={Math.max(marker.yTotal - 30, 2)} width="70" height="22" rx="11" fill="#12213E" />
        <text x={Math.min(marker.x + 7, width - 43)} y={Math.max(marker.yTotal - 15, 17)} textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{formatCurrency(marker.total)}</text>
      </g>
      <text x={pad} y={height - 2} fill="#9CA3AF" fontSize="10">Year 1</text>
      <text x={width - pad} y={height - 2} textAnchor="end" fill="#9CA3AF" fontSize="10">Year {points[points.length - 1]?.year}</text>
    </svg>
  );
};

const BarDetailModal = ({ data, onClose, rateLabel }: { data: BarData | null; onClose: () => void; rateLabel: string }) => {
  if (!data) return null;
  const interestAsPercent = data.contributions > 0 ? ((data.interest / data.contributions) * 100).toFixed(0) : 0;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl sm:p-8"
      >
        <button onClick={onClose} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200">
          <X className="h-5 w-5 text-gray-600" />
        </button>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#12213E] shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#12213E]">{data.year}‑Year Summary</h3>
          <p className="mt-1 text-sm text-gray-500">At {rateLabel} annual return</p>
        </div>
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-xs text-gray-500"><span>Contributions</span><span>Interest</span></div>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-[#D1D5DB]" style={{ width: `${data.total > 0 ? (data.contributions / data.total) * 100 : 0}%` }} />
            <div className="h-full bg-[#C69259]" style={{ width: `${data.total > 0 ? (data.interest / data.total) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
            <div><p className="text-sm text-gray-500">Total Contributions</p><p className="text-2xl font-bold text-[#12213E]">{formatFullCurrency(data.contributions)}</p></div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#FBF6EF] p-4">
            <div><p className="text-sm text-[#8A6840]">Interest Earned</p><p className="text-2xl font-bold text-[#12213E]">{formatFullCurrency(data.interest)}</p></div>
            <span className="rounded-full bg-[#F3E6D4] px-2 py-1 text-xs font-bold text-[#8A6840]">{interestAsPercent}%</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-[#E4EFF6] p-4">
            <div><p className="text-sm text-[#12213E]">Total Value</p><p className="text-3xl font-extrabold text-[#12213E]">{formatFullCurrency(data.total)}</p></div>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">This assumes a constant annual return with monthly compounding.</p>
      </motion.div>
    </motion.div>
  );
};

const WealthProjectionSection = () => {
  const navigate = useNavigate();
  const [monthlySavings, setMonthlySavings] = useState(500);
  const [inputValue, setInputValue] = useState("500");
  const [selectedYear, setSelectedYear] = useState(20);
  const [selectedBar, setSelectedBar] = useState<BarData | null>(null);
  const [annualRate, setAnnualRate] = useState(0.10);
  const [rateDropdownOpen, setRateDropdownOpen] = useState(false);
  const maxMonthly = 1_000_000;
  const years = [10, 20, 30, 40, 50, 60];

  const rateLabel = interestRateOptions.find((rate) => rate.value === annualRate)?.label || "10%";
  const months = selectedYear * 12;
  const futureValue = monthlySavings > 0
    ? monthlySavings * ((Math.pow(1 + annualRate / 12, months) - 1) / (annualRate / 12))
    : 0;
  const totalContributions = monthlySavings * months;
  const totalInterest = futureValue - totalContributions;

  const chartData: BarData[] = years.map((year) => {
    const period = year * 12;
    const value = monthlySavings > 0
      ? monthlySavings * ((Math.pow(1 + annualRate / 12, period) - 1) / (annualRate / 12))
      : 0;
    const contributions = monthlySavings * period;
    return { year, contributions, interest: value - contributions, total: value };
  });

  const yearlyPath = Array.from({ length: selectedYear }, (_, index) => {
    const year = index + 1;
    const period = year * 12;
    const total = monthlySavings > 0
      ? monthlySavings * ((Math.pow(1 + annualRate / 12, period) - 1) / (annualRate / 12))
      : 0;
    return { year, total, contributions: monthlySavings * period };
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (raw === "") {
      setInputValue("");
      setMonthlySavings(0);
      return;
    }
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const clamped = Math.max(0, Math.min(num, maxMonthly));
    setInputValue(String(clamped));
    setMonthlySavings(clamped);
  };

  const openPoint = (point: BarData) => {
    setSelectedYear(point.year);
    setSelectedBar(point);
  };

  const interestShare = futureValue > 0 ? Math.round((totalInterest / futureValue) * 100) : 0;
  const reasons = [
    "Time in the market beats timing the market",
    "No minimums, no hidden fees",
    "Your future self will thank you",
  ];

  return (
    <section className="bg-[#E4EFF8] py-16 md:py-24">
      <div className="mx-auto w-[98%] md:w-full md:max-w-[1100px]">
        <h2 className="section-headline text-center text-[#12213E]">
          See your money <span className="text-[#C69259]">compound</span> over decades
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-[#6B7280]">
          Enter your monthly savings, choose your return rate, and watch your wealth grow.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <article className={`${panel} md:col-span-5`}>
            <p className="text-sm font-semibold text-[#6B7280]">Projected total</p>
            <h3 className="mt-2 text-[1.7rem] font-bold leading-tight tracking-tight text-[#12213E]">
              Set a monthly deposit and see what <span className="text-[#C69259]">{selectedYear} years</span> can become.
            </h3>
            <div className={`${chartCard} mt-5`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[#6B7280]">After {selectedYear} years</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-[#12213E]">{formatCurrency(futureValue)}</p>
                </div>
                <label className="rounded-2xl bg-[#F4F7FB] px-3 py-2 text-right">
                  <span className="block text-[11px] font-semibold text-[#6B7280]">Monthly</span>
                  <span className="flex items-center justify-end">
                    <span className="text-sm text-[#6B7280]">$</span>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={handleInputChange}
                      min="0"
                      max={maxMonthly}
                      aria-label="Your Monthly Saving"
                      className="w-16 bg-transparent text-right text-sm font-bold text-[#12213E] outline-none"
                    />
                  </span>
                </label>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#E4EFF6]">
                <div className="h-full rounded-full bg-[#12213E]" style={{ width: `${interestShare}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">{formatCurrency(totalInterest)} interest earned</span>
                <span className="font-semibold text-[#C69259]">{interestShare}%</span>
              </div>
              <div className="mt-5 space-y-2">
                {reasons.map((reason) => (
                  <p key={reason} className="text-sm leading-snug text-[#12213E]">{reason}</p>
                ))}
              </div>
              <button type="button" onClick={() => navigate("/register")} className="cta-email mt-5 !w-full justify-between ring-1 ring-[#E4EFF6] md:!w-fit md:justify-start">
                <span className="whitespace-nowrap">Start Investing Today</span>
                <span className="cta-email-arrow"><ArrowRight className="h-4 w-4" /></span>
              </button>
            </div>
          </article>

          <article className={`${panel} md:col-span-7`}>
            <h3 className="max-w-sm text-[1.65rem] font-bold leading-tight tracking-tight text-[#12213E]">Watch the total grow with each decade.</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6B7280]">
              A longer horizon changes the balance between what you deposit and what interest earns.
            </p>
            <div className={`${chartCard} mt-5`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#6B7280]">Total by decade</p>
                  <p className="mt-1 text-2xl font-bold text-[#12213E]">
                    {formatCurrency(futureValue)}
                    <span className="ml-2 text-sm font-semibold text-[#C69259]">{interestShare}% interest</span>
                  </p>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRateDropdownOpen(!rateDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-[#E8EDF2] bg-[#F7FBFE] px-3 py-1.5 text-xs font-semibold text-[#12213E]"
                    aria-label="Annual Return Rate"
                  >
                    {rateLabel} return
                    <ChevronDown className={`h-3.5 w-3.5 transition ${rateDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {rateDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="absolute right-0 z-20 mt-1 w-28 overflow-hidden rounded-2xl border border-[#E8EDF2] bg-white shadow-lg"
                      >
                        {interestRateOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setAnnualRate(option.value);
                              setRateDropdownOpen(false);
                            }}
                            className={`block w-full px-3 py-2 text-left text-sm font-semibold ${annualRate === option.value ? "bg-[#E4EFF6]" : ""} text-[#12213E]`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <GrowthBars data={chartData} selectedYear={selectedYear} onPoint={openPoint} />
            </div>
          </article>

          <article className={`${panel} md:col-span-7`}>
            <h3 className="text-[1.65rem] font-bold leading-tight tracking-tight text-[#12213E]">Year by year</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6B7280]">
              This assumes a constant annual return with monthly compounding.
            </p>
            <div className={`${chartCard} mt-5`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[#6B7280]">Total after {selectedYear} years</p>
                  <p className="text-2xl font-bold text-[#12213E]">{formatFullCurrency(futureValue)}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYear(year)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${selectedYear === year ? "bg-[#12213E] text-white" : "bg-[#F4F7FB] text-[#12213E]"}`}
                    >
                      {year}y
                    </button>
                  ))}
                </div>
              </div>
              <YearLine points={yearlyPath} />
              <div className="mt-1 flex items-center gap-4 text-xs text-[#6B7280]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#12213E]" /> Total value</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C69259]" /> Contributions</span>
              </div>
            </div>
          </article>

          <article className={`${panel} md:col-span-5`}>
            <h3 className="text-[1.65rem] font-bold leading-tight tracking-tight text-[#12213E]">Contributions and interest</h3>
            <p className="mt-2 text-sm text-[#6B7280]">What you put in, and what compounding adds, at each decade.</p>
            <div className={`${chartCard} mt-5`}>
              <p className="text-sm font-medium text-[#6B7280]">Total contributions</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-[#12213E]">{formatCurrency(totalContributions)}</p>
              <SplitBars data={chartData} selectedYear={selectedYear} onPoint={openPoint} />
              <div className="mt-2 flex items-center gap-4 text-xs text-[#6B7280]">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#12213E]" /> Contributions</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C69259]" /> Interest</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <AnimatePresence>
        {selectedBar && (
          <BarDetailModal data={selectedBar} onClose={() => setSelectedBar(null)} rateLabel={rateLabel} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default WealthProjectionSection;
