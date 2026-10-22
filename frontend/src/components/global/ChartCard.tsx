import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

interface ChartCardProps {
    title: string;
    type: "line" | "area" | "pie" | "bar";
    data: any[];
    dataKeys: string[];
    colors?: string[];
    height?: number;
}

const DEFAULT_COLORS = ["#12213E", "#C69259", "#2563EB", "#10B981", "#F59E0B", "#EF4444"];

const ChartCard = ({ title, type, data, dataKeys, colors = DEFAULT_COLORS, height = 300 }: ChartCardProps) => {
    const renderChart = () => {
        switch (type) {
            case "line":
                return (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        {dataKeys.map((key, idx) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2} dot={{ r: 4 }} />
                        ))}
                    </LineChart>
                );
            case "area":
                return (
                    <AreaChart data={data}>
                        <defs>
                            {dataKeys.map((key, idx) => (
                                <linearGradient key={key} id={`color${idx}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        {dataKeys.map((key, idx) => (
                            <Area key={key} type="monotone" dataKey={key} stroke={colors[idx % colors.length]} fill={`url(#color${idx})`} strokeWidth={2} />
                        ))}
                    </AreaChart>
                );
            case "pie":
                return (
                    <PieChart>
                        <Pie data={data} dataKey={dataKeys[0]} nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                );
            case "bar":
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        {dataKeys.map((key, idx) => (
                            <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} radius={[4, 4, 0, 0]} />
                        ))}
                    </BarChart>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-[#12213E]">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={height}>
                        {renderChart()}
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ChartCard;