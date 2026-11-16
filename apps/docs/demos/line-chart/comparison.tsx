"use client";

import { ChartCard, LineChart } from "@orra-ui/react";

const DAYS = Array.from({ length: 14 }, (_, i) => i + 1);
const THIS = [0.312, 0.318, 0.325, 0.321, 0.334, 0.341, 0.338, 0.352, 0.349, 0.361, 0.366, 0.372, 0.369, 0.381];
const LAST = [0.298, 0.301, 0.296, 0.305, 0.309, 0.311, 0.307, 0.315, 0.318, 0.316, 0.322, 0.326, 0.324, 0.329];
const DATA = DAYS.map((d, i) => ({ day: `第 ${d} 天`, current: THIS[i], previous: LAST[i] }));

export default function LineChartComparison() {
  return (
    <ChartCard className="mx-auto w-full max-w-2xl" title="次日留存率" value="38.1%" delta={0.158}>
      <LineChart
        data={DATA}
        index="day"
        series={[
          { key: "current", label: "本月" },
          { key: "previous", label: "上月", comparison: true },
        ]}
        curve="step"
        valueFormat="percent"
        yDomain={["dataMin", "dataMax"]}
        height={200}
      />
    </ChartCard>
  );
}
