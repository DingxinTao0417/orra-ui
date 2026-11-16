"use client";

import { useState } from "react";
import { Button, StatCards } from "@orra-ui/react";

export default function StatCardsLoading() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="flex w-full flex-col gap-4">
      <StatCards
        loading={loading}
        dense
        columns={4}
        stats={[
          { id: "headcount", label: "在职人数", value: 486, previous: 471, description: "含外包 32 人" },
          { id: "hires", label: "本季入职", value: 38, previous: 29 },
          { id: "attrition", label: "主动离职率", value: 0.042, format: "percent", previous: 0.051, invertDelta: true },
          { id: "openings", label: "开放职位", value: 17, delta: 0, deltaLabel: "与上季持平" },
        ]}
      />
      <Button size="sm" variant="outline" tone="neutral" className="self-center" onPress={() => setLoading((v) => !v)}>
        {loading ? "加载完成" : "重新加载"}
      </Button>
    </div>
  );
}
