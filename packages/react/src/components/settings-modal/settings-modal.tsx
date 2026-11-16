"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode, Ref } from "react";
import { Dialog, DialogTrigger, Heading, Modal as AriaModal, ModalOverlay } from "react-aria-components";
import { RiCheckLine } from "@remixicon/react";
import { useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { overlayBackdrop } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { Button } from "../button/button";
import { CloseButton } from "../close-button/close-button";
import { Tab, TabList, TabPanel, Tabs } from "../tabs/tabs";
import { SettingsModalContext, type SettingsModalApi } from "./settings-parts";
import { useSampleSettingsSections } from "./settings-sample";

const COPY = {
  en: {
    settings: "Settings",
    close: "Close settings",
    unsaved: "You have unsaved changes",
    discard: "Discard",
    save: "Save changes",
    saved: "Changes saved",
    saveFailed: "Couldn't save. Try again.",
  },
  zh: {
    settings: "设置",
    close: "关闭设置",
    unsaved: "有未保存的更改",
    discard: "放弃",
    save: "保存更改",
    saved: "已保存",
    saveFailed: "保存失败，请重试。",
  },
};
export type SettingsModalLabels = (typeof COPY)["en"];

/* ------------------------------------------------------------------ modal */

export interface SettingsSection {
  id: string;
  label: ReactNode;
  /** Icon element for the nav. */
  icon?: ReactNode;
  /** Shown under the page title. */
  description?: ReactNode;
  /** Page content. A function receives the modal API. */
  content: ReactNode | ((api: SettingsModalApi) => ReactNode);
}

export interface SettingsModalProps {
  /** A pressable element that opens the dialog. Omit it to control `isOpen`. */
  trigger?: ReactElement;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  /** Pages; defaults to sample General / Profile / Notifications / Appearance / Billing pages. */
  sections?: SettingsSection[];
  section?: string;
  defaultSection?: string;
  onSectionChange?: (id: string) => void;
  /** Heading above the nav (default "Settings"). */
  title?: ReactNode;
  /** Unsaved-changes flag (controlled). Otherwise edits inside the pages set it automatically. */
  dirty?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  /** Save handler; return a promise to show a pending state. Throw to keep the changes. */
  onSave?: () => unknown;
  /** Called when the user discards; uncontrolled fields are reset by remounting the page. */
  onDiscard?: () => void;
  /** Content under the nav (e.g. version, help link). */
  navFooter?: ReactNode;
  labels?: Partial<SettingsModalLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

/**
 * Multi-page settings dialog: a nav of sections on the start side, each page
 * built from SettingsGroup / SettingsRow, and a save bar that appears when
 * something changed.
 *
 *   <SettingsModal trigger={<Button>设置</Button>} sections={sections} onSave={save} />
 */
export function SettingsModal({
  trigger,
  isOpen,
  defaultOpen,
  onOpenChange,
  sections: sectionsProp,
  section,
  defaultSection,
  onSectionChange,
  title,
  dirty: dirtyProp,
  onDirtyChange,
  onSave,
  onDiscard,
  navFooter,
  labels,
  className,
  ref,
}: SettingsModalProps) {
  const t = useCopy(COPY, labels);
  const sample = useSampleSettingsSections();
  const sections: SettingsSection[] = sectionsProp ?? sample;
  const [active, setActive] = useControllableState(section, defaultSection ?? sections[0]?.id ?? "", onSectionChange);
  const [dirty, setDirty] = useControllableState(dirtyProp, false, onDirtyChange);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [resetKey, setResetKey] = useState(0);
  const narrow = useIsNarrow();
  const savedTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(savedTimer.current), []);

  const markDirty = () => {
    if (!dirty) setDirty(true);
    if (status === "saved" || status === "error") setStatus("idle");
  };

  const save = async () => {
    setStatus("saving");
    try {
      const out = onSave?.();
      if (out && typeof (out as Promise<unknown>).then === "function") await out;
      setDirty(false);
      setStatus("saved");
      window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(() => setStatus("idle"), 2200);
    } catch {
      setStatus("error");
    }
  };

  const discard = () => {
    onDiscard?.();
    setDirty(false);
    setStatus("idle");
    setResetKey((k) => k + 1);
  };

  const overlayState = trigger ? {} : Object.fromEntries(Object.entries({ isOpen, defaultOpen, onOpenChange }).filter(([, v]) => v !== undefined));

  const overlay = (
    <ModalOverlay {...overlayState} isDismissable={!dirty} className={cx(overlayBackdrop, "flex items-center justify-center p-2 sm:p-6")}>
      <AriaModal
        ref={ref}
        className={cx(
          "relative flex h-[min(680px,calc(100dvh-1rem))] w-full max-w-[960px] overflow-hidden rounded-card bg-surface-raised text-fg shadow-raised outline-none",
          "data-[entering]:animate-dialog-in data-[exiting]:animate-dialog-out sm:h-[min(680px,calc(100dvh-3rem))]",
          className,
        )}
      >
        <Dialog aria-label={typeof title === "string" ? title : t.settings} className="flex min-h-0 min-w-0 flex-1 outline-none">
          {({ close }) => {
            const api: SettingsModalApi = { markDirty, dirty, section: active, setSection: setActive, close };
            return (
              <SettingsModalContext.Provider value={api}>
                <Tabs
                  orientation={narrow ? "horizontal" : "vertical"}
                  variant="segment"
                  selectedKey={active}
                  onSelectionChange={(k) => setActive(String(k))}
                  className={cx("min-h-0 min-w-0 flex-1 gap-0", narrow ? "flex-col" : "flex-row items-stretch")}
                >
                  <div
                    className={cx(
                      "flex shrink-0 bg-canvas",
                      narrow ? "flex-col gap-2 border-b border-line px-3 pt-4 pb-3" : "w-[232px] flex-col gap-3 border-e border-line px-3 py-5",
                    )}
                  >
                    <Heading slot="title" className={cx("px-2.5 font-semibold text-fg", narrow ? "pe-10 text-body" : "text-title-sm")}>
                      {title ?? t.settings}
                    </Heading>
                    <TabList
                      aria-label={typeof title === "string" ? title : t.settings}
                      items={sections}
                      className={cx(
                        "rounded-none bg-transparent p-0",
                        narrow ? "flex w-full gap-1 overflow-x-auto [scrollbar-width:none]" : "flex w-full flex-col gap-0.5",
                      )}
                    >
                      {(s) => (
                        <Tab id={s.id} icon={s.icon} className={cx("h-9 rounded-control px-2.5 text-body", narrow ? "shrink-0" : "w-full justify-start")}>
                          {s.label}
                        </Tab>
                      )}
                    </TabList>
                    {navFooter && !narrow ? <div className="mt-auto px-2.5 text-caption text-fg-subtle">{navFooter}</div> : null}
                  </div>

                  {sections.map((s) => (
                    <TabPanel key={s.id} id={s.id} className="flex min-h-0 min-w-0 flex-1 flex-col rounded-none data-[focus-visible]:outline-offset-[-2px]">
                      <div className={cx("flex shrink-0 flex-col gap-1 px-6 pt-6 pb-4", !narrow && "pe-16")}>
                        <h2 className="text-title-sm font-semibold text-fg">{s.label}</h2>
                        {s.description ? <p className="text-body-sm text-fg-muted">{s.description}</p> : null}
                      </div>
                      <div
                        key={resetKey}
                        className={cx("@container min-h-0 flex-1 overflow-y-auto px-6", dirty || status !== "idle" ? "pb-24" : "pb-6")}
                        onChange={markDirty}
                      >
                        {typeof s.content === "function" ? s.content(api) : s.content}
                      </div>
                    </TabPanel>
                  ))}
                </Tabs>

                {dirty || status !== "idle" ? (
                  <div
                    role="status"
                    className={cx(
                      "absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-menu border border-line bg-surface-raised px-4 py-2.5 shadow-popover animate-rise",
                      !narrow && "start-[244px]",
                    )}
                  >
                    {status === "saved" ? (
                      <span className="flex flex-1 items-center gap-2 text-body-sm font-medium text-success">
                        <RiCheckLine aria-hidden className="size-4" />
                        {t.saved}
                      </span>
                    ) : (
                      <>
                        <span className={cx("min-w-0 flex-1 truncate text-body-sm", status === "error" ? "text-danger" : "text-fg-muted")}>
                          {status === "error" ? t.saveFailed : t.unsaved}
                        </span>
                        <Button size="sm" variant="plain" tone="neutral" isDisabled={status === "saving"} onPress={discard}>
                          {t.discard}
                        </Button>
                        <Button size="sm" loading={status === "saving"} onPress={save}>
                          {t.save}
                        </Button>
                      </>
                    )}
                  </div>
                ) : null}
                <CloseButton aria-label={t.close} onPress={close} className={cx("absolute end-4 z-10", narrow ? "top-3.5" : "top-5")} />
              </SettingsModalContext.Provider>
            );
          }}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );

  if (!trigger) return overlay;
  return (
    <DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger}
      {overlay}
    </DialogTrigger>
  );
}
