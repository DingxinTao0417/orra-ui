"use client";

import { NumberField } from "@orra-ui/react";

export default function NumberFieldFormats() {
  return (
    <div className="grid w-full max-w-md grid-cols-2 gap-4">
      <NumberField label="包裹重量" defaultValue={2.4} step={0.1} minValue={0} formatOptions={{ style: "unit", unit: "kilogram", maximumFractionDigits: 1 }} />
      <NumberField label="恒温设定" defaultValue={24} minValue={16} maxValue={30} formatOptions={{ style: "unit", unit: "celsius" }} />
      <NumberField label="年度预算" defaultValue={2500000} step={10000} formatOptions={{ style: "currency", currency: "CNY", notation: "compact" }} />
      <NumberField label="汇率" defaultValue={7.1835} step={0.0001} stepper="none" formatOptions={{ minimumFractionDigits: 4 }} />
    </div>
  );
}
