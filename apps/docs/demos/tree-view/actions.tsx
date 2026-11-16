"use client";

import { RiAddLine, RiMoreLine } from "@remixicon/react";
import { IconButton, TreeView, type TreeViewNode } from "@orra-ui/react";

const PAGES: TreeViewNode[] = [
  {
    id: "handbook",
    name: "团队手册",
    children: [
      { id: "onboarding", name: "新人入职指南" },
      { id: "process", name: "研发流程", children: [{ id: "review", name: "代码评审规范" }, { id: "release", name: "发布清单" }] },
    ],
  },
  { id: "meeting", name: "会议纪要", children: [{ id: "weekly", name: "周会 · 11 月 10 日" }] },
];

export default function TreeViewActions() {
  return (
    <div className="w-full max-w-xs rounded-card border border-line bg-surface p-2 shadow-card">
      <TreeView
        aria-label="知识库"
        items={PAGES}
        defaultExpandedKeys={["handbook", "process"]}
        onAction={() => {}}
        renderActions={(node) => (
          <>
            {node.children ? <IconButton size="sm" icon={<RiAddLine />} aria-label={`在「${node.name}」下新建页面`} className="size-6" /> : null}
            <IconButton size="sm" icon={<RiMoreLine />} aria-label={`「${node.name}」的更多操作`} className="size-6" />
          </>
        )}
      />
    </div>
  );
}
