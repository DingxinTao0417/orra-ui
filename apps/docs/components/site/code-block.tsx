import { cx } from "@orra-ui/react/lib/cx";
import { CopyButton } from "@/components/site/copy-button";
import { highlight } from "@/lib/highlight";

/** Server-rendered, highlighted code with a copy button. */
export async function CodeBlock({ code, lang = "tsx", title, className }: { code: string; lang?: string; title?: string; className?: string }) {
  const html = await highlight(code, lang);
  return (
    <div className={cx("overflow-hidden rounded-2xl border border-line bg-surface", className)}>
      {title ? (
        <div className="flex h-10 items-center justify-between border-b border-line ps-4 pe-1">
          <span className="font-mono text-caption font-medium text-fg-subtle">{title}</span>
          <CopyButton value={code} />
        </div>
      ) : null}
      <div className="relative">
        {!title ? <CopyButton value={code} className="absolute end-1.5 top-1.5 z-10 bg-surface" /> : null}
        <div className="max-h-[520px] overflow-auto p-4 font-mono text-[13px] leading-6 [&_pre]:outline-none" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
