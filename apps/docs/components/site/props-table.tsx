import type { PropsGroup } from "@/lib/registry-types";

export function PropsTable({ groups }: { groups: PropsGroup[] }) {
  return (
    <div className="flex flex-col gap-8">
      {groups.map((g) => (
        <div key={g.component} className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3">
            <h3 className="font-mono text-body-lg font-semibold text-fg">{`<${g.component} />`}</h3>
            {g.description ? <p className="text-body text-fg-subtle">{g.description}</p> : null}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[640px] border-collapse text-start">
              <thead>
                <tr className="border-b border-line text-caption font-medium text-fg-subtle">
                  <th className="px-4 py-2.5 text-start font-medium">属性</th>
                  <th className="px-4 py-2.5 text-start font-medium">类型</th>
                  <th className="px-4 py-2.5 text-start font-medium">默认值</th>
                  <th className="px-4 py-2.5 text-start font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                {g.props.map((p) => (
                  <tr key={p.name} className="border-b border-line align-top last:border-0">
                    <td className="px-4 py-3 font-mono text-body-sm font-medium whitespace-nowrap text-accent-600 dark:text-accent-400">
                      {p.name}
                      {p.required ? <span className="text-danger">*</span> : null}
                    </td>
                    <td className="max-w-[260px] px-4 py-3 font-mono text-caption break-words text-fg-muted">{p.type}</td>
                    <td className="px-4 py-3 font-mono text-caption whitespace-nowrap text-fg-subtle">{p.default ?? "—"}</td>
                    <td className="px-4 py-3 text-body-sm text-fg-muted">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
