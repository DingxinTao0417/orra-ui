"use client";

import { Avatar, AvatarGroup } from "@orra-ui/react";

const TEAM = ["林晓雨", "周子航", "Marta Kowalski", "陈思远", "Priya Nair", "王嘉禾", "Tomás Ortega"];

export default function AvatarOverview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-4">
        <Avatar name="林晓雨" size="lg" status="online" />
        <Avatar name="Marta Kowalski" size="lg" status="away" />
        <Avatar name="周子航" size="lg" status="busy" />
        <Avatar name="Orra 构建机器人" initials="OB" size="lg" square />
        <Avatar size="lg" />
      </div>
      <AvatarGroup max={4}>
        {TEAM.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
    </div>
  );
}
