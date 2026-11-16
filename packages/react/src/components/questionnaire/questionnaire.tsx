"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode, Ref } from "react";
import { Button as AriaButton, Checkbox as AriaCheckbox, CheckboxGroup as AriaCheckboxGroup, Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiQuestionAnswerLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { card, focusRing } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { Button } from "../button/button";
import { CheckboxIndicator } from "../checkbox/checkbox";
import { CloseButton } from "../close-button/close-button";
import { Input } from "../input/input";
import { RadioIndicator } from "../radio/radio";

const COPY = {
  en: {
    title: "A few questions before I start",
    step: "Question {n} of {total}",
    summaryStep: "Review",
    other: "Other",
    otherPlaceholder: "Type your answer…",
    skip: "Skip",
    back: "Back",
    next: "Next",
    review: "Review answers",
    submit: "Start",
    summaryTitle: "Here's what I'll go with",
    edit: "Edit",
    skipped: "Skipped",
    multiHint: "Choose all that apply",
    submitted: "Answers sent",
    dismiss: "Dismiss",
  },
  zh: {
    title: "开始之前，确认几件事",
    step: "第 {n} 题，共 {total} 题",
    summaryStep: "确认",
    other: "其他",
    otherPlaceholder: "输入你的答案…",
    skip: "跳过",
    back: "上一步",
    next: "下一步",
    review: "查看汇总",
    submit: "开始执行",
    summaryTitle: "我会按以下设定执行",
    edit: "修改",
    skipped: "已跳过",
    multiHint: "可多选",
    submitted: "已提交回答",
    dismiss: "关闭",
  },
};
export type QuestionnaireLabels = (typeof COPY)["en"];

export interface QuestionnaireOption {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface QuestionnaireQuestion {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  /** `single` (default) or `multiple` choice. */
  type?: "single" | "multiple";
  options: QuestionnaireOption[];
  /** Add an "Other" option with a free-text field. */
  allowOther?: boolean;
  otherPlaceholder?: string;
}

export interface QuestionnaireAnswer {
  /** Selected option ids (`"other"` for the free-text option). */
  selected: string[];
  /** Free text typed for "Other". */
  other?: string;
  skipped?: boolean;
}
export type QuestionnaireAnswers = Record<string, QuestionnaireAnswer>;

const OTHER = "other";

export interface QuestionnaireProps {
  questions: QuestionnaireQuestion[];
  /** Answers by question id (controlled). */
  value?: QuestionnaireAnswers;
  defaultValue?: QuestionnaireAnswers;
  onChange?: (answers: QuestionnaireAnswers) => void;
  /** Called from the summary's start button. The card then collapses to a read-only recap. */
  onSubmit?: (answers: QuestionnaireAnswers) => void;
  /** Shows a × in the header. */
  onDismiss?: () => void;
  /** Header text (default "A few questions before I start"). */
  title?: ReactNode;
  /** Allow skipping questions (default true). */
  allowSkip?: boolean;
  /** Replace the summary's "Start" button text. */
  submitLabel?: ReactNode;
  labels?: Partial<QuestionnaireLabels>;
  className?: string;
  ref?: Ref<HTMLElement>;
}

function isAnswered(a?: QuestionnaireAnswer) {
  if (!a || a.skipped) return false;
  return a.selected.some((id) => id !== OTHER) || (a.selected.includes(OTHER) && !!a.other?.trim());
}

/**
 * Clarifying questions an agent asks before it acts: one question at a time
 * with single or multiple choice, an optional free-text "Other", progress
 * dots, back / next / skip, and a summary to confirm. Number keys pick
 * options.
 *
 *   <Questionnaire questions={questions} onSubmit={start} />
 */
export function Questionnaire({
  questions,
  value,
  defaultValue = {},
  onChange,
  onSubmit,
  onDismiss,
  title,
  allowSkip = true,
  submitLabel,
  labels,
  className,
  ref,
}: QuestionnaireProps) {
  const t = useCopy(COPY, labels);
  const [answers, setAnswers] = useControllableState(value, defaultValue, onChange);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const total = questions.length;
  const onSummary = step >= total;
  const question = questions[Math.min(step, total - 1)];
  const bodyRef = useRef<HTMLDivElement>(null);
  const shownStep = useRef(step);
  // Move focus to the new question so keyboard users (and number keys) carry on from there.
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    bodyRef.current?.focus({ preventScroll: true });
  }, [step]);

  const update = (id: string, next: QuestionnaireAnswer) => setAnswers({ ...answers, [id]: next });
  const go = (n: number) => setStep(Math.max(0, Math.min(total, n)));

  const optionText = (q: QuestionnaireQuestion, a?: QuestionnaireAnswer): ReactNode => {
    if (!a || a.skipped || !isAnswered(a)) return <span className="text-fg-subtle">{t.skipped}</span>;
    const parts: ReactNode[] = q.options.filter((o) => a.selected.includes(o.id)).map((o) => o.label);
    if (a.selected.includes(OTHER) && a.other?.trim()) parts.push(a.other.trim());
    return parts.map((p, i) => (
      <span key={i}>
        {i > 0 ? <span className="text-fg-subtle"> · </span> : null}
        {p}
      </span>
    ));
  };

  const recap = (editable: boolean) => (
    <dl className="flex flex-col divide-y divide-line rounded-control border border-line">
      {questions.map((q, i) => (
        <div key={q.id} className="flex items-start gap-3 px-3.5 py-2.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <dt className="text-caption text-fg-subtle">{q.title}</dt>
            <dd className="text-body-sm font-medium text-fg">{optionText(q, answers[q.id])}</dd>
          </div>
          {editable ? (
            <AriaButton
              onPress={() => go(i)}
              className={cx("shrink-0 rounded-[6px] px-1.5 py-0.5 text-caption font-medium text-fg-accent data-[hovered]:bg-accent-50", focusRing)}
            >
              {t.edit}
            </AriaButton>
          ) : null}
        </div>
      ))}
    </dl>
  );

  if (submitted) {
    return (
      <section ref={ref} className={cx(card, "flex w-full flex-col gap-3 p-4 motion-safe:animate-fade-in", className)}>
        <div className="flex items-center gap-2 text-body-sm font-medium text-fg">
          <span className="flex size-5 items-center justify-center rounded-full bg-success-soft text-success">
            <RiCheckLine className="size-3.5" />
          </span>
          {t.submitted}
        </div>
        {recap(false)}
      </section>
    );
  }

  const current = question ? answers[question.id] : undefined;
  const canNext = isAnswered(current);

  // Number keys 1–9 pick options (when not typing).
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (onSummary || !question || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
    const n = Number(e.key);
    if (!Number.isInteger(n) || n < 1) return;
    const ids = [...question.options.map((o) => o.id), ...(question.allowOther ? [OTHER] : [])];
    const id = ids[n - 1];
    if (!id) return;
    e.preventDefault();
    const prev = current?.selected ?? [];
    const selected = question.type === "multiple" ? (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]) : [id];
    update(question.id, { ...current, selected, skipped: false });
  };

  return (
    <section ref={ref} onKeyDown={onKeyDown} className={cx(card, "flex w-full flex-col p-5", className)}>
      <header className="flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-control bg-accent-50 text-fg-accent">
          <RiQuestionAnswerLine className="size-4" />
        </span>
        <h3 className="min-w-0 flex-1 truncate text-body-sm font-medium text-fg-muted">{title ?? t.title}</h3>
        <span className="sr-only">{onSummary ? t.summaryStep : fill(t.step, { n: step + 1, total })}</span>
        <ol aria-hidden className="flex items-center gap-1">
          {questions.map((q, i) => (
            <li
              key={q.id}
              className={cx(
                "h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out-soft",
                i === step ? "w-5 bg-accent-500" : "w-1.5",
                i !== step && (isAnswered(answers[q.id]) ? "bg-accent-300" : "bg-line-strong"),
              )}
            />
          ))}
          <li className={cx("h-1.5 rounded-full transition-[width,background-color] duration-300 ease-out-soft", onSummary ? "w-5 bg-accent-500" : "w-1.5 bg-line-strong")} />
        </ol>
        {onDismiss ? <CloseButton size="sm" aria-label={t.dismiss} onPress={onDismiss} className="-me-1.5" /> : null}
      </header>

      <div ref={bodyRef} tabIndex={-1} key={onSummary ? "summary" : question?.id} className="mt-4 flex flex-col gap-3 outline-none motion-safe:animate-rise">
        {onSummary ? (
          <>
            <h4 className="text-body-lg font-medium text-fg">{t.summaryTitle}</h4>
            {recap(true)}
          </>
        ) : question ? (
          <QuestionBody question={question} answer={current} onAnswer={(a) => update(question.id, a)} t={t} />
        ) : null}
      </div>

      <footer className="mt-5 flex items-center gap-2">
        {!onSummary && allowSkip ? (
          <Button
            variant="plain"
            tone="neutral"
            size="sm"
            onPress={() => {
              if (question) update(question.id, { selected: [], skipped: true });
              go(step + 1);
            }}
          >
            {t.skip}
          </Button>
        ) : null}
        <span className="flex-1" />
        {step > 0 ? (
          <Button variant="outline" tone="neutral" size="sm" startIcon={<RiArrowLeftLine className="rtl:-scale-x-100" />} onPress={() => go(step - 1)}>
            {t.back}
          </Button>
        ) : null}
        {onSummary ? (
          <Button
            size="sm"
            onPress={() => {
              setSubmitted(true);
              onSubmit?.(answers);
            }}
          >
            {submitLabel ?? t.submit}
          </Button>
        ) : (
          <Button size="sm" isDisabled={!canNext} endIcon={<RiArrowRightLine />} onPress={() => go(step + 1)}>
            {step === total - 1 ? t.review : t.next}
          </Button>
        )}
      </footer>
    </section>
  );
}

const optionRow = cx(
  "group relative flex cursor-default items-start gap-3 rounded-control border px-3 py-2.5 outline-none transition-[background-color,border-color] duration-150",
  "border-line data-[hovered]:border-line-hover data-[hovered]:bg-surface-hover/60",
  "data-[selected]:border-accent-500 data-[selected]:bg-accent-50/60",
  "data-[focus-visible]:focus-ring",
);

function KeyHint({ n }: { n: number }) {
  return (
    <span
      aria-hidden
      className="mt-px flex size-5 shrink-0 items-center justify-center rounded-[6px] border border-line-strong bg-surface text-micro font-medium text-fg-subtle tabular-nums group-data-[selected]:border-accent-500 group-data-[selected]:text-fg-accent"
    >
      {n}
    </span>
  );
}

function OptionText({ option }: { option: QuestionnaireOption }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-body-sm font-medium text-fg">{option.label}</span>
      {option.description ? <span className="text-caption text-fg-subtle">{option.description}</span> : null}
    </span>
  );
}

function QuestionBody({
  question,
  answer,
  onAnswer,
  t,
}: {
  question: QuestionnaireQuestion;
  answer?: QuestionnaireAnswer;
  onAnswer: (a: QuestionnaireAnswer) => void;
  t: QuestionnaireLabels;
}) {
  const selected = answer?.skipped ? [] : (answer?.selected ?? []);
  const multiple = question.type === "multiple";
  const otherOn = selected.includes(OTHER);
  const heading = (
    <div className="flex flex-col gap-1">
      <h4 className="text-body-lg font-medium text-fg">{question.title}</h4>
      {question.description || multiple ? (
        <p className="text-body-sm text-fg-subtle">
          {question.description}
          {question.description && multiple ? " · " : null}
          {multiple ? t.multiHint : null}
        </p>
      ) : null}
    </div>
  );
  const otherOption: QuestionnaireOption = { id: OTHER, label: t.other };
  const options = question.allowOther ? [...question.options, otherOption] : question.options;
  const otherField = otherOn ? (
    <div className="ps-8 motion-safe:animate-fade-in">
      <Input
        aria-label={t.other}
        size="sm"
        autoFocus
        placeholder={question.otherPlaceholder ?? t.otherPlaceholder}
        value={answer?.other ?? ""}
        onChange={(other) => onAnswer({ selected, other, skipped: false })}
      />
    </div>
  ) : null;

  if (multiple) {
    return (
      <>
        {heading}
        <AriaCheckboxGroup
          aria-label={typeof question.title === "string" ? question.title : undefined}
          value={selected}
          onChange={(next) => onAnswer({ selected: next, other: answer?.other, skipped: false })}
          className="flex flex-col gap-2"
        >
          {options.map((o, i) => (
            <AriaCheckbox key={o.id} value={o.id} className={optionRow}>
              {({ isSelected }) => (
                <>
                  <KeyHint n={i + 1} />
                  <OptionText option={o} />
                  <CheckboxIndicator isSelected={isSelected} className="mt-px" />
                </>
              )}
            </AriaCheckbox>
          ))}
          {otherField}
        </AriaCheckboxGroup>
      </>
    );
  }

  return (
    <>
      {heading}
      <AriaRadioGroup
        aria-label={typeof question.title === "string" ? question.title : undefined}
        value={selected[0] ?? null}
        onChange={(id) => onAnswer({ selected: [id], other: answer?.other, skipped: false })}
        className="flex flex-col gap-2"
      >
        {options.map((o, i) => (
          <AriaRadio key={o.id} value={o.id} className={optionRow}>
            {({ isSelected }) => (
              <>
                <KeyHint n={i + 1} />
                <OptionText option={o} />
                <RadioIndicator isSelected={isSelected} className="mt-px" />
              </>
            )}
          </AriaRadio>
        ))}
        {otherField}
      </AriaRadioGroup>
    </>
  );
}
