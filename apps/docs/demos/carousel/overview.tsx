"use client";

import { Badge, Carousel } from "@orra-ui/react";

const TEMPLATES = [
  { title: "销售漏斗看板", desc: "按阶段追踪商机转化与预计成交额", tag: "销售", tint: "bg-accent-50" },
  { title: "客户成功周报", desc: "健康分、续约风险与跟进记录一页看完", tag: "客服", tint: "bg-success-soft" },
  { title: "招聘进度追踪", desc: "候选人状态、面试安排与 Offer 审批", tag: "人事", tint: "bg-warning-soft" },
  { title: "产品发布清单", desc: "跨团队的上线检查项与负责人", tag: "产品", tint: "bg-info-soft" },
  { title: "费用报销流程", desc: "自动汇总票据并按部门统计预算", tag: "财务", tint: "bg-danger-soft" },
];

export default function CarouselOverview() {
  return (
    <div className="w-full max-w-xl">
      <Carousel aria-label="精选模板" slideSize="78%" gap={12}>
        {TEMPLATES.map((t) => (
          <article key={t.title} className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface">
            <div className={`h-28 ${t.tint}`} />
            <div className="flex flex-col gap-1.5 p-4">
              <Badge size="sm" className="mb-1">
                {t.tag}
              </Badge>
              <span className="text-body font-medium text-fg">{t.title}</span>
              <span className="text-body-sm text-fg-subtle">{t.desc}</span>
            </div>
          </article>
        ))}
      </Carousel>
    </div>
  );
}
