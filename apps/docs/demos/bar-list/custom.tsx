"use client";

import { RiAppleLine, RiAndroidLine, RiGlobalLine, RiWechatLine } from "@remixicon/react";
import { BarList } from "@orra-ui/react";

const DATA = [
  { label: "网页端", value: 1284000, icon: <RiGlobalLine /> },
  { label: "iOS App", value: 862000, icon: <RiAppleLine /> },
  { label: "Android App", value: 641000, icon: <RiAndroidLine /> },
  { label: "微信小程序", value: 418000, icon: <RiWechatLine /> },
];

export default function BarListCustom() {
  return (
    <div className="mx-auto w-full max-w-md">
      <BarList
        aria-label="各端销售额"
        data={DATA}
        valueFormat="currency"
        currency="CNY"
        color="var(--color-chart-4)"
        labelHeading="终端"
        valueHeading="销售额"
      />
    </div>
  );
}
