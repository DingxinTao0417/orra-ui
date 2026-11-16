"use client";

import { useEffect, useId, useState } from "react";
import type { FormEvent, ReactNode, Ref } from "react";
import { Form, Heading } from "react-aria-components";
import { RiArrowLeftLine, RiLockLine, RiMailLine, RiMailSendLine, RiUserLine } from "@remixicon/react";
import { fill, useCopy } from "../../lib/copy";
import { cx } from "../../lib/cx";
import { card } from "../../lib/recipes";
import { useControllableState } from "../../lib/use-controllable-state";
import { Button } from "../button/button";
import { Divider } from "../divider/divider";
import { Input } from "../input/input";
import { InputOTP } from "../input-otp/input-otp";
import { LinkButton } from "../link-button/link-button";
import { Notification } from "../notification/notification";
import { SocialButton } from "../social-button/social-button";
import type { SocialProvider } from "../social-button/social-logos";

const COPY = {
  en: {
    signInTitle: "Welcome back",
    signInDescription: "Sign in to continue to your workspace.",
    signUpTitle: "Create your account",
    signUpDescription: "Start free. No credit card required.",
    forgotTitle: "Reset your password",
    forgotDescription: "Enter your email and we'll send you a reset code.",
    verifyTitle: "Check your inbox",
    verifyDescription: "We sent a {length}-digit code to {email}.",
    name: "Full name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@company.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    newPasswordPlaceholder: "Create a password",
    passwordHint: "Use 8 or more characters.",
    forgot: "Forgot password?",
    signIn: "Sign in",
    signUp: "Create account",
    continueEmail: "Continue with email",
    sendCode: "Send reset code",
    verify: "Verify",
    code: "Verification code",
    or: "or",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signUpLink: "Sign up",
    signInLink: "Sign in",
    backToSignIn: "Back to sign in",
    changeEmail: "Use a different email",
    noCode: "Didn't get a code?",
    resend: "Resend",
    resendIn: "Resend in {seconds}s",
    termsPrefix: "By continuing, you agree to our",
    terms: "Terms of Service",
    and: "and",
    privacy: "Privacy Policy",
    genericError: "Something went wrong. Please try again.",
    invalidCode: "That code didn't work. Check it and try again.",
  },
  zh: {
    signInTitle: "欢迎回来",
    signInDescription: "登录以继续使用你的工作区。",
    signUpTitle: "创建账号",
    signUpDescription: "免费开始，无需绑定银行卡。",
    forgotTitle: "重置密码",
    forgotDescription: "输入注册邮箱，我们会发送一个重置验证码。",
    verifyTitle: "查收验证码",
    verifyDescription: "我们已向 {email} 发送了 {length} 位验证码。",
    name: "姓名",
    namePlaceholder: "你的名字",
    email: "邮箱",
    emailPlaceholder: "you@company.com",
    password: "密码",
    passwordPlaceholder: "输入密码",
    newPasswordPlaceholder: "设置登录密码",
    passwordHint: "至少 8 个字符。",
    forgot: "忘记密码？",
    signIn: "登录",
    signUp: "创建账号",
    continueEmail: "使用邮箱继续",
    sendCode: "发送验证码",
    verify: "验证",
    code: "验证码",
    or: "或",
    noAccount: "还没有账号？",
    haveAccount: "已有账号？",
    signUpLink: "立即注册",
    signInLink: "去登录",
    backToSignIn: "返回登录",
    changeEmail: "更换邮箱",
    noCode: "没有收到？",
    resend: "重新发送",
    resendIn: "{seconds} 秒后可重新发送",
    termsPrefix: "继续即表示你同意",
    terms: "服务条款",
    and: "和",
    privacy: "隐私政策",
    genericError: "出了点问题，请稍后重试。",
    invalidCode: "验证码不正确，请检查后重试。",
  },
};
export type AuthCardLabels = (typeof COPY)["en"];

export type AuthCardMode = "signIn" | "signUp" | "forgot" | "verify";

export interface AuthCardValues {
  /** The mode the form was submitted from. */
  mode: Exclude<AuthCardMode, "verify">;
  email: string;
  password?: string;
  name?: string;
}

export interface AuthCardProps {
  mode?: AuthCardMode;
  defaultMode?: AuthCardMode;
  onModeChange?: (mode: AuthCardMode) => void;
  /** Brand mark above the title. */
  logo?: ReactNode;
  /** Replace the default title / description of the sign-in and sign-up steps. */
  title?: ReactNode;
  description?: ReactNode;
  /** Identity providers shown as social buttons (default Google + GitHub). Pass `[]` to hide. */
  providers?: SocialProvider[];
  /** `stack` (default): full-width buttons. `grid`: two per row. `icons`: a row of logo-only buttons. */
  socialLayout?: "stack" | "grid" | "icons";
  /** Show social buttons above (default) or below the email form. */
  socialPosition?: "top" | "bottom";
  /** `password` (default) asks for a password; `code` is passwordless: email → one-time code. */
  method?: "password" | "code";
  /** Ask for a name when signing up (default true). */
  collectName?: boolean;
  /**
   * Called with the form values. Return (or resolve) `"verify"` to move to the
   * code step; throw an Error to show its message. Forgot-password and
   * passwordless submissions go to the code step automatically.
   */
  onSubmit?: (values: AuthCardValues) => unknown;
  onSocial?: (provider: SocialProvider) => unknown;
  /** Called with the full code. Throw (or reject) to mark it invalid. */
  onVerify?: (code: string, email: string) => unknown;
  onResend?: (email: string) => unknown;
  /** Seconds before "Resend" is enabled again (default 30). */
  resendCooldown?: number;
  /** Code length for the verify step (default 6). */
  codeLength?: number;
  termsHref?: string;
  privacyHref?: string;
  /** Replaces the terms sentence; `false` hides it. */
  terms?: ReactNode | false;
  /** Allow switching between sign in and sign up (default true). */
  allowModeSwitch?: boolean;
  /** Extra content under the card body (e.g. SSO link). */
  footer?: ReactNode;
  /** `card` (default) draws the surface; `plain` renders only the content. */
  variant?: "card" | "plain";
  defaultEmail?: string;
  labels?: Partial<AuthCardLabels>;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const errorText = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);
const isPromise = (v: unknown): v is Promise<unknown> => !!v && typeof (v as Promise<unknown>).then === "function";

/**
 * Sign-in / sign-up card: logo, title, social providers, email (+ password)
 * form, terms, and a one-time-code step. Switches between modes on its own or
 * under your control.
 *
 *   <AuthCard logo={<Logo />} onSubmit={signIn} onVerify={verifyCode} />
 */
export function AuthCard({
  mode: modeProp,
  defaultMode = "signIn",
  onModeChange,
  logo,
  title,
  description,
  providers = ["google", "github"],
  socialLayout = "stack",
  socialPosition = "top",
  method = "password",
  collectName = true,
  onSubmit,
  onSocial,
  onVerify,
  onResend,
  resendCooldown = 30,
  codeLength = 6,
  termsHref = "#",
  privacyHref = "#",
  terms,
  allowModeSwitch = true,
  footer,
  variant = "card",
  defaultEmail = "",
  labels,
  className,
  ref,
}: AuthCardProps) {
  const t = useCopy(COPY, labels);
  const titleId = useId();
  const [mode, setModeState] = useControllableState(modeProp, defaultMode, onModeChange);
  const [returnMode, setReturnMode] = useState<Exclude<AuthCardMode, "verify">>("signIn");
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const setMode = (next: AuthCardMode) => {
    setError(null);
    setCodeInvalid(false);
    if (next === "verify") {
      setCode("");
      setCooldown(resendCooldown);
    } else setReturnMode(next);
    setModeState(next);
  };

  const run = async (key: string, fn: () => unknown) => {
    setError(null);
    setPending(key);
    try {
      const out = fn();
      return isPromise(out) ? await out : out;
    } finally {
      setPending(null);
    }
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === "verify") return;
    const data = new FormData(e.currentTarget);
    const values: AuthCardValues = {
      mode,
      email: String(data.get("email") ?? "").trim(),
      password: data.has("password") ? String(data.get("password")) : undefined,
      name: data.has("name") ? String(data.get("name")).trim() : undefined,
    };
    setEmail(values.email);
    try {
      const result = await run("submit", () => onSubmit?.(values));
      if (result === "verify" || mode === "forgot" || method === "code") setMode("verify");
    } catch (err) {
      setError(errorText(err, t.genericError));
    }
  };

  const verify = async (value = code) => {
    if (value.length < codeLength || pending) return;
    try {
      await run("verify", () => onVerify?.(value, email));
    } catch (err) {
      setCodeInvalid(true);
      setError(errorText(err, t.invalidCode));
    }
  };

  const resend = async () => {
    try {
      await run("resend", () => onResend?.(email));
      setCooldown(resendCooldown);
    } catch (err) {
      setError(errorText(err, t.genericError));
    }
  };

  const social = async (provider: SocialProvider) => {
    try {
      await run(provider, () => onSocial?.(provider));
    } catch (err) {
      setError(errorText(err, t.genericError));
    }
  };

  const heading = {
    signIn: [t.signInTitle, t.signInDescription],
    signUp: [t.signUpTitle, t.signUpDescription],
    forgot: [t.forgotTitle, t.forgotDescription],
    verify: [t.verifyTitle, fill(t.verifyDescription, { email: email || "—", length: codeLength })],
  }[mode];

  const showSocial = (mode === "signIn" || mode === "signUp") && providers.length > 0;
  const socialBlock = showSocial ? (
    <div
      className={cx(
        socialLayout === "stack" && "flex flex-col gap-2.5",
        socialLayout === "grid" && "grid grid-cols-2 gap-2.5",
        socialLayout === "icons" && "flex flex-wrap justify-center gap-2.5",
      )}
    >
      {providers.map((p) => (
        <SocialButton
          key={p}
          provider={p}
          action={mode === "signUp" ? "signUp" : "continue"}
          iconOnly={socialLayout === "icons"}
          fullWidth={socialLayout !== "icons"}
          loading={pending === p}
          isDisabled={!!pending && pending !== p}
          onPress={() => social(p)}
          className={socialLayout === "icons" ? "w-14" : undefined}
        />
      ))}
    </div>
  ) : null;
  const divider = showSocial ? <Divider className="text-caption">{t.or}</Divider> : null;

  const termsNode =
    terms === false ? null : (
      <p className="text-center text-caption text-fg-subtle">
        {terms ?? (
          <>
            {t.termsPrefix}{" "}
            <LinkButton href={termsHref} tone="muted" underline="always">
              {t.terms}
            </LinkButton>{" "}
            {t.and}{" "}
            <LinkButton href={privacyHref} tone="muted" underline="always">
              {t.privacy}
            </LinkButton>
          </>
        )}
      </p>
    );

  const submitLabel = mode === "signUp" ? t.signUp : mode === "forgot" ? t.sendCode : method === "code" ? t.continueEmail : t.signIn;

  const form =
    mode === "verify" ? (
      <div className="flex flex-col gap-5">
        <InputOTP
          length={codeLength}
          value={code}
          onChange={(v) => {
            setCode(v);
            if (codeInvalid) {
              setCodeInvalid(false);
              setError(null);
            }
          }}
          onComplete={(v) => verify(v)}
          isInvalid={codeInvalid}
          autoFocus
          label={<span className="sr-only">{t.code}</span>}
          className="items-center"
        />
        <Button fullWidth loading={pending === "verify"} isDisabled={code.length < codeLength} onPress={() => verify()}>
          {t.verify}
        </Button>
        <p className="text-center text-body-sm text-fg-muted">
          {t.noCode}{" "}
          {cooldown > 0 ? (
            <span className="tabular-nums text-fg-subtle">{fill(t.resendIn, { seconds: cooldown })}</span>
          ) : (
            <LinkButton onPress={resend} isDisabled={pending === "resend"}>
              {t.resend}
            </LinkButton>
          )}
        </p>
      </div>
    ) : (
      <Form onSubmit={submit} className="flex flex-col gap-4" aria-labelledby={titleId}>
        {mode === "signUp" && collectName ? (
          <Input name="name" label={t.name} placeholder={t.namePlaceholder} autoComplete="name" isRequired startIcon={<RiUserLine />} />
        ) : null}
        <Input
          name="email"
          type="email"
          label={t.email}
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          isRequired
          defaultValue={email}
          startIcon={<RiMailLine />}
        />
        {method === "password" && mode !== "forgot" ? (
          <div className="flex flex-col gap-1.5">
            <Input
              name="password"
              type="password"
              label={t.password}
              placeholder={mode === "signUp" ? t.newPasswordPlaceholder : t.passwordPlaceholder}
              autoComplete={mode === "signUp" ? "new-password" : "current-password"}
              isRequired
              minLength={mode === "signUp" ? 8 : undefined}
              description={mode === "signUp" ? t.passwordHint : undefined}
              startIcon={<RiLockLine />}
            />
            {mode === "signIn" ? (
              <LinkButton size="sm" className="self-end" onPress={() => setMode("forgot")}>
                {t.forgot}
              </LinkButton>
            ) : null}
          </div>
        ) : null}
        <Button type="submit" fullWidth loading={pending === "submit"} isDisabled={!!pending && pending !== "submit"} className="mt-1">
          {submitLabel}
        </Button>
      </Form>
    );

  const switchRow =
    mode === "verify" ? (
      <LinkButton tone="muted" size="sm" startIcon={<RiArrowLeftLine />} onPress={() => setMode(returnMode)} className="self-center">
        {t.changeEmail}
      </LinkButton>
    ) : mode === "forgot" ? (
      <LinkButton tone="muted" size="sm" startIcon={<RiArrowLeftLine />} onPress={() => setMode("signIn")} className="self-center">
        {t.backToSignIn}
      </LinkButton>
    ) : allowModeSwitch ? (
      <p className="text-center text-body-sm text-fg-muted">
        {mode === "signIn" ? t.noAccount : t.haveAccount}{" "}
        <LinkButton onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}>{mode === "signIn" ? t.signUpLink : t.signInLink}</LinkButton>
      </p>
    ) : null;

  return (
    <div ref={ref} className={cx("flex w-full max-w-[400px] flex-col gap-6", variant === "card" && cx(card, "px-6 py-8 sm:px-8"), className)}>
      <header className="flex flex-col items-center gap-4 text-center">
        {mode === "verify" ? (
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-accent-50 text-fg-accent [&>svg]:size-6">
            <RiMailSendLine />
          </span>
        ) : logo ? (
          <div className="flex items-center justify-center">{logo}</div>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Heading id={titleId} level={1} className="text-title font-semibold tracking-tight text-fg">
            {(mode === "signIn" || mode === "signUp") && title != null ? title : heading[0]}
          </Heading>
          <p className="text-body text-fg-muted">{(mode === "signIn" || mode === "signUp") && description != null ? description : heading[1]}</p>
        </div>
      </header>

      {error ? <Notification tone="danger" variant="soft" className="py-2.5 text-body-sm" description={error} /> : null}

      {socialPosition === "top" ? socialBlock : null}
      {socialPosition === "top" ? divider : null}
      {form}
      {socialPosition === "bottom" ? divider : null}
      {socialPosition === "bottom" ? socialBlock : null}

      {switchRow}
      {mode === "signIn" || mode === "signUp" ? termsNode : null}
      {footer}
    </div>
  );
}
