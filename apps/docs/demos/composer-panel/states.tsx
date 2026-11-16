"use client";

import { ComposerPanel } from "@orra-ui/react";

export default function ComposerPanelStates() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <ComposerPanel defaultValue="汇总本周所有客户反馈" loading onStop={() => {}} minRows={1} />
      <ComposerPanel isDisabled placeholder="本月额度已用完，升级后继续使用" minRows={1} />
    </div>
  );
}
