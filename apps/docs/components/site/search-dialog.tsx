"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RiBarChartBoxLine, RiBookOpenLine, RiCornerDownLeftLine, RiLayout4Line, RiPuzzle2Line, RiRobot2Line, RiSearchLine, RiShapesLine } from "@remixicon/react";
import { Autocomplete, Dialog, Header, Input, Menu, MenuItem, MenuSection, Modal, ModalOverlay, SearchField, useFilter } from "react-aria-components";
import { cx } from "@orra-ui/react/lib/cx";
import { floatingPanel, menuHeading, menuItem, overlayBackdrop } from "@orra-ui/react/lib/recipes";
import search from "@/generated/search.json";
import { FOUNDATIONS, GUIDES } from "@/lib/nav";

type Entry = { slug: string; name: string; title: string; category: string; description: string; keywords: string[] };

const SECTIONS: { id: string; title: string; icon: typeof RiShapesLine }[] = [
  { id: "base", title: "基础组件", icon: RiShapesLine },
  { id: "agents", title: "智能体组件", icon: RiRobot2Line },
  { id: "blocks", title: "区块", icon: RiPuzzle2Line },
  { id: "charts", title: "图表", icon: RiBarChartBoxLine },
  { id: "templates", title: "模板", icon: RiLayout4Line },
];

const hrefOf = (e: Entry) => (e.category === "templates" ? `/templates/${e.slug}` : `/components/${e.slug}`);

/** ⌘K search across guides, components and templates (Chinese + English names and keywords). */
export function SearchDialog({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { contains } = useFilter({ sensitivity: "base" });
  const entries = search as Entry[];
  const guides = [...GUIDES, ...FOUNDATIONS];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onOpenChange]);

  return (
    <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable className={overlayBackdrop}>
      <Modal className="fixed inset-x-4 top-[12vh] mx-auto max-w-xl outline-none data-[entering]:animate-dialog-in data-[exiting]:animate-dialog-out">
        <Dialog aria-label="搜索" className={cx(floatingPanel, "flex max-h-[70vh] flex-col overflow-hidden p-0")}>
          <Autocomplete filter={contains}>
            <SearchField aria-label="搜索" autoFocus className="flex items-center gap-2 border-b border-line px-4">
              <RiSearchLine className="size-4 text-fg-subtle" />
              <Input placeholder="搜索组件、模板或文档…" className="h-12 flex-1 bg-transparent text-body-lg text-fg outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden" />
            </SearchField>
            <Menu
              className="min-h-0 flex-1 overflow-y-auto p-1.5 outline-none"
              onAction={(key) => {
                onOpenChange(false);
                router.push(String(key));
              }}
              renderEmptyState={() => <div className="px-4 py-10 text-center text-body text-fg-subtle">没有找到匹配的结果</div>}
            >
              <MenuSection>
                <Header className={menuHeading}>文档</Header>
                {guides.map((g) => {
                  const Icon = g.icon ?? RiBookOpenLine;
                  return (
                    <MenuItem key={g.href} id={g.href} textValue={`${g.title} ${g.href}`} className={menuItem}>
                      <Icon className="size-4 text-fg-subtle" />
                      <span className="flex-1">{g.title}</span>
                    </MenuItem>
                  );
                })}
              </MenuSection>
              {SECTIONS.map((section) => {
                const list = entries.filter((e) => e.category === section.id);
                if (!list.length) return null;
                return (
                  <MenuSection key={section.id}>
                    <Header className={menuHeading}>{section.title}</Header>
                    {list.map((e) => (
                      <MenuItem key={e.slug} id={hrefOf(e)} textValue={[e.title, e.name, e.slug, ...e.keywords].join(" ")} className={menuItem}>
                        <section.icon className="size-4 text-fg-subtle" />
                        <span className="flex-1">{e.title}</span>
                        <span className="text-body-sm text-fg-subtle">{e.name}</span>
                      </MenuItem>
                    ))}
                  </MenuSection>
                );
              })}
            </Menu>
          </Autocomplete>
          <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-caption text-fg-subtle">
            <span className="flex items-center gap-1"><RiCornerDownLeftLine className="size-3.5" /> 打开</span>
            <span>↑↓ 选择</span>
            <span>Esc 关闭</span>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
