"use client";

import { useState } from "react";
import { Questionnaire, type QuestionnaireAnswers } from "@orra-ui/react";

export default function QuestionnaireControlled() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({ tone: { selected: ["friendly"] } });
  const [result, setResult] = useState<string | null>(null);
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Questionnaire
        title="写邮件前确认一下"
        allowSkip={false}
        value={answers}
        onChange={setAnswers}
        submitLabel="开始撰写"
        onSubmit={(a) => setResult(`语气：${a.tone?.selected.join("、")}；长度：${a.length?.selected.join("、")}`)}
        questions={[
          {
            id: "tone",
            title: "回复客户的语气？",
            options: [
              { id: "formal", label: "正式" },
              { id: "friendly", label: "友好亲切" },
              { id: "brief", label: "简洁直接" },
            ],
          },
          {
            id: "length",
            title: "篇幅控制在多少字？",
            options: [
              { id: "short", label: "100 字以内" },
              { id: "medium", label: "200–300 字" },
            ],
          },
        ]}
      />
      {result ? <p className="px-1 text-caption text-fg-subtle">{result}</p> : null}
    </div>
  );
}
