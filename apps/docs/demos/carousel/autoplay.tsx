"use client";

import { Carousel } from "@orra-ui/react";

const QUOTES = [
  { text: "上线第一周，我们的周报准备时间从半天缩短到 20 分钟。", who: "苏婉清 · 运营负责人" },
  { text: "权限和审计日志做得很细，安全评审一次就通过了。", who: "Daniel Brooks · IT 主管" },
  { text: "移动端体验很顺，外勤同事终于愿意每天填数据了。", who: "何俊杰 · 区域经理" },
];

export default function CarouselAutoplay() {
  return (
    <div className="w-full max-w-md">
      <Carousel aria-label="客户评价" autoplay={4000} arrows="footer">
        {QUOTES.map((q) => (
          <figure key={q.who} className="flex h-full flex-col justify-between gap-4 rounded-card border border-line bg-surface p-6">
            <blockquote className="text-body-lg text-fg">“{q.text}”</blockquote>
            <figcaption className="text-body-sm text-fg-subtle">{q.who}</figcaption>
          </figure>
        ))}
      </Carousel>
    </div>
  );
}
