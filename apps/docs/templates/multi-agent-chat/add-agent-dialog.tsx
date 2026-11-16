"use client";

import { useState } from "react";
import { RiShuffleLine, RiUserAddLine } from "@remixicon/react";
import {
  AgentAvatar,
  Badge,
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Modal,
  ModelPicker,
  SegmentedControl,
  Select,
  SelectItem,
  Textarea,
  type AgentAvatarState,
} from "@orra-ui/react";
import { AGENT_MODELS, ROLES, TOOLS, modelName, type TeamAgent } from "./agents-data";

const PREVIEW_STATES: { id: AgentAvatarState; label: string }[] = [
  { id: "idle", label: "空闲" },
  { id: "thinking", label: "思考" },
  { id: "working", label: "执行" },
];

const ROLE_TOOLS: Record<string, string[]> = {
  research: ["web", "browse"],
  copy: ["files"],
  data: ["code", "sheet"],
  design: ["image"],
  support: ["files", "mail"],
  review: ["browse", "files"],
};

export interface AddAgentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (agent: TeamAgent) => void;
}

/** Create a new team member: name, role, model, tools and a seeded avatar preview. */
export function AddAgentDialog({ isOpen, onOpenChange, onAdd }: AddAgentDialogProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("review");
  const [model, setModel] = useState("lumen-4-pro");
  const [tools, setTools] = useState<string[]>(ROLE_TOOLS.review!);
  const [brief, setBrief] = useState("");
  const [salt, setSalt] = useState(0);
  const [preview, setPreview] = useState<AgentAvatarState>("thinking");

  const roleName = ROLES.find((r) => r.id === role)?.name ?? "";
  const displayName = name.trim() || "新成员";
  const seed = `${displayName}-${salt}`;

  const reset = () => {
    setName("");
    setRole("review");
    setModel("lumen-4-pro");
    setTools(ROLE_TOOLS.review!);
    setBrief("");
    setSalt(0);
    setPreview("thinking");
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) reset();
      }}
      title="添加智能体"
      description="新成员会加入当前协作，领航员可以把任务交接给它。"
      icon={<RiUserAddLine />}
      size="lg"
      footer={({ close }) => (
        <>
          <Button variant="plain" tone="neutral" onPress={close}>
            取消
          </Button>
          <Button
            isDisabled={!name.trim()}
            startIcon={<RiUserAddLine />}
            onPress={() => {
              onAdd({
                id: `agent-${Date.now()}`,
                name: name.trim(),
                role: roleName,
                seed,
                model,
                tools,
                state: "idle",
                activity: brief.trim() ? brief.trim() : "刚加入，等待分派",
              });
              close();
            }}
          >
            添加到团队
          </Button>
        </>
      )}
    >
      <div className="grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
        {/* preview */}
        <div className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface-muted p-5 text-center sm:self-start">
          <AgentAvatar seed={seed} name={displayName} state={preview} size="xl" />
          <div className="flex min-w-0 flex-col items-center gap-1">
            <span className="max-w-full truncate text-body font-semibold text-fg">{displayName}</span>
            <Badge size="sm">{roleName}</Badge>
            <span className="text-caption text-fg-subtle">{modelName(model)}</span>
          </div>
          <SegmentedControl
            aria-label="预览状态"
            size="sm"
            fullWidth
            value={preview}
            onChange={(v) => setPreview(v as AgentAvatarState)}
            options={PREVIEW_STATES.map((s) => ({ id: s.id, label: s.label }))}
          />
          <Button size="sm" variant="plain" tone="neutral" startIcon={<RiShuffleLine />} onPress={() => setSalt((s) => s + 1)}>
            换一种配色
          </Button>
        </div>

        {/* form */}
        <div className="flex min-w-0 flex-col gap-4">
          <Input label="名称" placeholder="例如：审稿官" value={name} onChange={setName} isRequired autoFocus />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="角色"
              selectedKey={role}
              onSelectionChange={(k) => {
                if (k == null) return;
                setRole(String(k));
                setTools(ROLE_TOOLS[String(k)] ?? []);
              }}
            >
              {ROLES.map((r) => (
                <SelectItem key={r.id} id={r.id} description={r.hint} textValue={r.name}>
                  {r.name}
                </SelectItem>
              ))}
            </Select>
            <div className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium text-fg">模型</span>
              <ModelPicker models={AGENT_MODELS} value={model} onChange={setModel} className="w-full justify-between" />
            </div>
          </div>
          <CheckboxGroup label="可用工具" value={tools} onChange={setTools} orientation="horizontal" columns={2} description="只授予完成角色所需的最少权限。">
            {TOOLS.map((t) => (
              <Checkbox key={t.id} value={t.id}>
                {t.label}
              </Checkbox>
            ))}
          </CheckboxGroup>
          <Textarea
            label="工作说明"
            placeholder="例如：所有对外文案发出前，检查事实、数字与品牌语气。"
            value={brief}
            onChange={setBrief}
            minRows={2}
            maxRows={4}
            limit={120}
            showCount
          />
        </div>
      </div>
    </Modal>
  );
}
