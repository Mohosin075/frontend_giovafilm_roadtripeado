"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  XCircle,
} from "lucide-react";

export type AppAlertIcon =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "question";

export type AppAlertOptions = {
  title?: string;
  text?: string;
  html?: string;
  icon?: AppAlertIcon;
  showCancelButton?: boolean;
  showDenyButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  denyButtonText?: string;
  confirmButtonColor?: string;
  timer?: number;
  timerProgressBar?: boolean;
  input?: "select";
  inputOptions?: Record<string, string>;
  inputPlaceholder?: string;
  inputValidator?: (value: string) => string | null | undefined | false;
  allowOutsideClick?: boolean;
};

export type AppAlertDismiss = "cancel" | "timer" | "backdrop";

export type AppAlertResult = {
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  dismiss?: AppAlertDismiss;
  value?: string;
};

export const DismissReason = {
  cancel: "cancel",
  timer: "timer",
  backdrop: "backdrop",
} as const;

type IconMeta = {
  wrap: string;
  icon: string;
  Icon: typeof CheckCircle2;
};

const ICON_META: Record<AppAlertIcon, IconMeta> = {
  success: {
    wrap: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-100 dark:ring-emerald-500/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  error: {
    wrap: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-100 dark:ring-rose-500/20",
    icon: "text-rose-600 dark:text-rose-400",
    Icon: XCircle,
  },
  warning: {
    wrap: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-100 dark:ring-amber-500/20",
    icon: "text-amber-500 dark:text-amber-400",
    Icon: AlertTriangle,
  },
  info: {
    wrap: "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-100 dark:ring-yellow-500/20",
    icon: "text-yellow-500 dark:text-yellow-400",
    Icon: Info,
  },
  question: {
    wrap: "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-100 dark:ring-yellow-500/20",
    icon: "text-yellow-500 dark:text-yellow-400",
    Icon: HelpCircle,
  },
};

function stripHtml(value?: string) {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

function isDestructive(
  confirmButtonColor?: string,
  confirmButtonText?: string,
) {
  const text = (confirmButtonText || "").toLowerCase();
  if (/(delete|cancel it)/.test(text)) return true;
  if (!confirmButtonColor) return false;
  return /#(d33|e53935|ef4444|dc2626|f87171|e11d48|b91c1c|c62828)/i.test(
    confirmButtonColor,
  );
}

function AppAlertModal({
  options,
  onClose,
}: {
  options: AppAlertOptions;
  onClose: (result: AppAlertResult) => void;
}) {
  const {
    title,
    text,
    html,
    icon = "info",
    showCancelButton = false,
    showDenyButton = false,
    confirmButtonText = "OK",
    cancelButtonText = "Cancel",
    denyButtonText = "No",
    confirmButtonColor,
    timer,
    timerProgressBar,
    input,
    inputOptions,
    inputPlaceholder = "Select an option",
    inputValidator,
    allowOutsideClick = true,
  } = options;

  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    timer ? Math.ceil(timer / 1000) : 0,
  );
  const [progress, setProgress] = useState(100);
  const [selected, setSelected] = useState("");
  const [inputError, setInputError] = useState("");
  const closedRef = useRef(false);
  const startedAt = useRef(Date.now());
  const meta = ICON_META[icon] || ICON_META.info;
  const Icon = meta.Icon;
  const destructive = isDestructive(confirmButtonColor, confirmButtonText);
  const selectEntries = useMemo(
    () => Object.entries(inputOptions || {}),
    [inputOptions],
  );

  const finish = (result: AppAlertResult) => {
    if (closedRef.current) return;
    closedRef.current = true;
    setOpen(false);
    window.setTimeout(() => onClose(result), 180);
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        finish({
          isConfirmed: false,
          isDenied: false,
          isDismissed: true,
          dismiss: "cancel",
        });
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!timer) return;
    startedAt.current = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const remaining = Math.max(0, timer - elapsed);
      setSecondsLeft(Math.ceil(remaining / 1000));
      setProgress((remaining / timer) * 100);
      if (remaining <= 0) {
        window.clearInterval(tick);
        finish({
          isConfirmed: false,
          isDenied: false,
          isDismissed: true,
          dismiss: "timer",
        });
      }
    }, 80);
    return () => window.clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer]);

  const confirm = () => {
    if (input === "select") {
      const error = inputValidator?.(selected);
      if (error) {
        setInputError(String(error));
        return;
      }
      if (!selected) {
        setInputError(inputValidator?.("") || "Please select an option.");
        return;
      }
    }

    finish({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value: input === "select" ? selected : undefined,
    });
  };

  const deny = () => {
    finish({
      isConfirmed: false,
      isDenied: true,
      isDismissed: false,
    });
  };

  const cleanTitle = stripHtml(title);
  const cleanText = text || (!html ? "" : "");

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close alert"
        className={`absolute inset-0 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => {
          if (!allowOutsideClick) return;
          finish({
            isConfirmed: false,
            isDenied: false,
            isDismissed: true,
            dismiss: "backdrop",
          });
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-alert-title"
        className={`relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-slate-800 shadow-[0_24px_80px_rgba(15,23,42,0.22)] ring-1 ring-black/5 dark:ring-white/10 transition-all duration-200 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
      >
        {timerProgressBar && timer ? (
          <div className="h-1 w-full bg-yellow-100 dark:bg-slate-800">
            <div
              className="h-full bg-[#FACC15] transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}

        <div className="px-6 pt-7 pb-6 sm:px-8">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ring-8 ${meta.wrap}`}
          >
            <Icon className={`h-8 w-8 ${meta.icon}`} strokeWidth={2.2} />
          </div>

          {cleanTitle ? (
            <h3
              id="app-alert-title"
              className="text-center font-[family-name:var(--font-inter)] text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100"
            >
              {cleanTitle}
            </h3>
          ) : null}

          {cleanText ? (
            <p className="mt-2 text-center font-[family-name:var(--font-inter)] text-sm leading-6 text-slate-500 dark:text-slate-400">
              {cleanText}
            </p>
          ) : null}

          {html ? (
            <div
              className="mt-2 text-center font-[family-name:var(--font-inter)] text-sm leading-6 text-slate-500 dark:text-slate-400"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : null}

          {timer && icon !== "success" ? (
            <p className="mt-3 text-center text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-400">
              Auto-confirming in {secondsLeft}s
            </p>
          ) : null}

          {input === "select" ? (
            <div className="mt-5 max-h-56 space-y-2 overflow-y-auto pr-1">
              {selectEntries.map(([value, label]) => {
                const active = selected === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSelected(value);
                      setInputError("");
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 text-slate-900 dark:text-slate-100 ring-2 ring-yellow-200 dark:ring-yellow-500/30"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 hover:border-yellow-300 dark:hover:border-yellow-500/40 hover:bg-yellow-50/50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`h-4 w-4 rounded-full border-2 ${
                        active
                          ? "border-yellow-500 bg-yellow-400"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    />
                  </button>
                );
              })}
              {!selected && inputPlaceholder ? (
                <p className="px-1 pt-1 text-xs text-slate-400 dark:text-slate-500">
                  {inputPlaceholder}
                </p>
              ) : null}
              {inputError ? (
                <p className="px-1 text-xs font-medium text-rose-500 dark:text-rose-400">
                  {inputError}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row">
            {showCancelButton ? (
              <button
                type="button"
                onClick={() =>
                  finish({
                    isConfirmed: false,
                    isDenied: false,
                    isDismissed: true,
                    dismiss: "cancel",
                  })
                }
                className="h-12 flex-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700/80"
              >
                {cancelButtonText}
              </button>
            ) : null}
            {showDenyButton ? (
              <button
                type="button"
                onClick={deny}
                className="h-12 flex-1 rounded-2xl bg-slate-200 dark:bg-slate-800/80 border border-transparent dark:border-slate-700 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                {denyButtonText}
              </button>
            ) : null}
            <button
              type="button"
              onClick={confirm}
              className={`h-12 flex-1 rounded-2xl px-4 text-sm font-bold transition ${
                destructive
                  ? "bg-rose-500 text-white hover:bg-rose-600 shadow-sm"
                  : icon === "success"
                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                    : "bg-[#FACC15] text-slate-900 hover:bg-[#F59E0B] shadow-sm"
              }`}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

let host: HTMLDivElement | null = null;
let root: Root | null = null;

function ensureHost() {
  if (typeof document === "undefined") return null;
  if (!host) {
    host = document.createElement("div");
    host.id = "app-alert-root";
    document.body.appendChild(host);
    root = createRoot(host);
  }
  return root;
}

function unmountAlert() {
  root?.render(null);
}

function fire(options: AppAlertOptions): Promise<AppAlertResult> {
  if (
    options.icon === "success" &&
    !options.showCancelButton &&
    options.timer == null &&
    !options.confirmButtonText
  ) {
    options = { ...options, timer: 1800, timerProgressBar: true };
  }

  if (typeof window === "undefined") {
    return Promise.resolve({
      isConfirmed: false,
      isDenied: false,
      isDismissed: true,
      dismiss: "cancel",
    });
  }

  return new Promise<AppAlertResult>((resolve) => {
    const reactRoot = ensureHost();
    reactRoot?.render(
      <AppAlertModal
        options={options}
        onClose={(result) => {
          unmountAlert();
          resolve(result);
        }}
      />,
    );
  });
}

export const appAlert = {
  fire,
  DismissReason,
};
