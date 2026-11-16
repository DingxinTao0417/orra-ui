"use client";

import { useState } from "react";
import { Tag, TagGroup } from "@orra-ui/react";

export default function TagGroupOverview() {
  const [tags, setTags] = useState([
    { id: "ux", name: "用户研究" },
    { id: "proto", name: "原型设计" },
    { id: "ds", name: "设计系统" },
    { id: "a11y", name: "无障碍" },
  ]);
  return (
    <div className="w-full max-w-sm">
      <TagGroup
        label="擅长领域"
        description="按 Backspace 删除聚焦的标签。"
        items={tags}
        onRemove={(keys) => setTags((list) => list.filter((t) => !keys.has(t.id)))}
        onAdd={(name) => setTags((list) => (list.some((t) => t.name === name) ? list : [...list, { id: `${Date.now()}`, name }]))}
      >
        {(tag) => <Tag id={tag.id}>{tag.name}</Tag>}
      </TagGroup>
    </div>
  );
}
