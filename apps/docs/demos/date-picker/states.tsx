"use client";

import { getLocalTimeZone, today } from "@internationalized/date";
import { DatePicker } from "@orra-ui/react";

export default function DatePickerStates() {
  const now = today(getLocalTimeZone());
  return (
    <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
      <DatePicker size="sm" label="小号" defaultValue={now} />
      <DatePicker size="lg" label="大号" defaultValue={now} />
      <DatePicker label="必须是未来日期" isRequired validationBehavior="aria" minValue={now.add({ days: 1 })} defaultValue={now} errorMessage="请选择明天或之后的日期" />
      <DatePicker label="已禁用" isDisabled defaultValue={now} />
    </div>
  );
}
