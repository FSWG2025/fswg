import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ConsultationInsightChartProps {
    data: { name: string; consultations: number; previous?: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 shadow-lg rounded-xl border border-gray-100 text-sm">
                <p className="font-bold text-[#12213E]">{label}</p>
                {payload.map((entry: any, idx: number) => (
                    <p key={idx} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ConsultationInsightChart = ({
    data,
}: ConsultationInsightChartProps) => {
    const currentMonth = data[data.length - 1];
    const prevMonth = data[data.length - 2];
    const change =
        prevMonth && currentMonth
            ? ((currentMonth.consultations - prevMonth.consultations) / prevMonth.consultations) * 100
            : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden relative">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold text-[#12213E]">
                                Consultation Performance
                            </CardTitle>
                            <p className="text-sm text-gray-500">Monthly bookings this year</p>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-50 rounded-full px-3 py-1">
                            <span className="text-xs font-semibold text-amber-700">
                                {currentMonth?.consultations || 0} this month
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="consultGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="consultations"
                                stroke="#2563EB"
                                strokeWidth={2}
                                fill="url(#consultGradient)"
                                dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, fill: "#2563EB", stroke: "#fff", strokeWidth: 2 }}
                            />
                            {prevMonth && (
                                <ReferenceLine
                                    y={prevMonth.consultations}
                                    stroke="#F59E0B"
                                    strokeDasharray="5 5"
                                    label={{
                                        position: "right",
                                        value: `Prev: ${prevMonth.consultations}`,
                                        fill: "#F59E0B",
                                        fontSize: 12,
                                    }}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>

                    {/* Insight badge */}
                    <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${change >= 0 ? "bg-emerald-100" : "bg-red-100"}`}
                        >
                            {change >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#12213E]">
                                {change >= 0 ? "+" : ""}
                                {change.toFixed(1)}% vs last month
                            </p>
                            <p className="text-xs text-gray-500">
                                {currentMonth?.consultations} consultations in {currentMonth?.name}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ConsultationInsightChart;