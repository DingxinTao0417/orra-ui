"use client";

import { RiSparklingLine } from "@remixicon/react";
import { Announcement } from "@orra-ui/react";

export default function AnnouncementOverview() {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="w-full overflow-hidden rounded-card border border-line">
        <Announcement href="#changelog" dismissible>
          智能报表现已支持自然语言提问
        </Announcement>
        <div className="flex h-24 items-center justify-center bg-surface text-body-sm text-fg-subtle">页面内容</div>
      </div>
      <Announcement variant="pill" href="#release" icon={<RiSparklingLine />}>
        Orra 3.0 正式发布：工作流自动化
      </Announcement>
    </div>
  );
}
