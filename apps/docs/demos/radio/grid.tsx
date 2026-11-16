"use client";

import { Radio, RadioGroup } from "@orra-ui/react";

export default function RadioGrid() {
  return (
    <div className="w-full max-w-lg">
      <RadioGroup label="配送时段" variant="card" columns={3} defaultValue="pm" isRequired>
        <Radio value="am" description="09:00 – 12:00">
          上午
        </Radio>
        <Radio value="pm" description="13:00 – 18:00">
          下午
        </Radio>
        <Radio value="night" description="已约满" isDisabled>
          晚间
        </Radio>
      </RadioGroup>
    </div>
  );
}
