"use client";

import { RiBarChartBoxLine, RiCalendarLine, RiChat3Line, RiFlowChart } from "@remixicon/react";
import { Checkbox, CheckboxGroup } from "@orra-ui/react";

export default function CheckboxCards() {
  return (
    <div className="w-full max-w-lg">
      <CheckboxGroup label="启用模块" columns={2} defaultValue={["analytics", "calendar"]}>
        <Checkbox variant="card" value="analytics" icon={<RiBarChartBoxLine />} description="实时指标与自定义报表">
          数据分析
        </Checkbox>
        <Checkbox variant="card" value="calendar" icon={<RiCalendarLine />} description="团队日程与会议室预订">
          日历
        </Checkbox>
        <Checkbox variant="card" value="chat" icon={<RiChat3Line />} description="频道、私信与消息提醒">
          即时沟通
        </Checkbox>
        <Checkbox variant="card" value="flow" icon={<RiFlowChart />} description="审批与自动化流程" isDisabled>
          工作流（企业版）
        </Checkbox>
      </CheckboxGroup>
    </div>
  );
}
