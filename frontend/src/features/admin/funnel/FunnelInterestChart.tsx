import LeadInterestsCurvyChart from "./LeadInterestsCurvyChart";

type Slice = { name: string; value: number };

type Props = {
  data: Slice[];
  conversionRate: number;
};

export default function FunnelInterestChart({ data, conversionRate }: Props) {
  return (
    <LeadInterestsCurvyChart
      title="Lead interests"
      subtitle="Interest mix across First Step services"
      data={data}
      height={220}
      centerLabel="Convert"
      centerValue={`${conversionRate}%`}
    />
  );
}
