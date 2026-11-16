"use client";

import { Combobox, ComboboxItem } from "@orra-ui/react";

const CITIES = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安", "苏州", "重庆", "厦门"];

export default function ComboboxOverview() {
  return (
    <div className="w-full max-w-xs">
      <Combobox label="办公城市" placeholder="输入城市名筛选" description="支持输入拼音之外的任意关键字。">
        {CITIES.map((city) => (
          <ComboboxItem key={city} id={city}>
            {city}
          </ComboboxItem>
        ))}
      </Combobox>
    </div>
  );
}
