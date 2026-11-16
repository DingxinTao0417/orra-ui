"use client";

import { Questionnaire, type QuestionnaireQuestion } from "@orra-ui/react";

const QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: "scope",
    title: "这次调研重点关注哪方面？",
    options: [
      { id: "pricing", label: "定价与套餐", description: "价格区间、席位计费、折扣策略" },
      { id: "features", label: "核心功能", description: "功能矩阵与差异点" },
      { id: "growth", label: "增长与获客", description: "渠道、内容、社区运营" },
    ],
  },
  {
    id: "competitors",
    title: "需要对比哪些产品？",
    type: "multiple",
    allowOther: true,
    otherPlaceholder: "输入产品名称，用逗号分隔",
    options: [
      { id: "nimbus", label: "Nimbus" },
      { id: "kitewise", label: "Kitewise" },
      { id: "fieldnote", label: "Fieldnote" },
    ],
  },
  {
    id: "format",
    title: "结果用什么形式交付？",
    options: [
      { id: "doc", label: "一页纸文档", description: "结论在前，附对比表" },
      { id: "slides", label: "8 页左右的幻灯片" },
      { id: "sheet", label: "可筛选的表格" },
    ],
  },
];

export default function QuestionnaireOverview() {
  return (
    <div className="w-full max-w-md">
      <Questionnaire questions={QUESTIONS} onDismiss={() => {}} />
    </div>
  );
}
