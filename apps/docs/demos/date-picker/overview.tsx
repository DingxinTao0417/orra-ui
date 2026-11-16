"use client";

import { useState } from "react";
import type { DateValue } from "react-aria-components";
import { DatePicker } from "@orra-ui/react";

export default function DatePickerOverview() {
  const [date, setDate] = useState<DateValue | null>(null);
  return (
    <div className="w-full max-w-60">
      <DatePicker label="截止日期" description="可直接输入，也可从日历中选择" value={date} onChange={setDate} />
    </div>
  );
}
