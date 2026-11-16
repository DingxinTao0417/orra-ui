"use client";

import { NumberField } from "@orra-ui/react";

export default function NumberFieldOverview() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <NumberField label="采购数量" stepper="split" defaultValue={12} minValue={1} maxValue={99} description="单次最多 99 件。" />
      <NumberField label="单价" defaultValue={1290} step={10} minValue={0} formatOptions={{ style: "currency", currency: "CNY" }} />
      <NumberField label="折扣" defaultValue={0.15} step={0.05} minValue={0} maxValue={1} formatOptions={{ style: "percent" }} />
    </div>
  );
}
