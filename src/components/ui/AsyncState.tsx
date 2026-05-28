import type { ReactNode } from "react";

type AsyncStateProps = {
  status: "idle" | "loading" | "success" | "error" | "empty";
  loading?: ReactNode;
  error?: ReactNode;
  empty?: ReactNode;
  children?: ReactNode;
};

export function AsyncState({
  status,
  loading,
  error,
  empty,
  children,
}: AsyncStateProps) {
  if (status === "loading") {
    return (
      <div className="py-12 text-center" role="status" aria-live="polite">
        {loading ?? (
          <p className="text-sm text-rose-400 font-medium animate-pulse">
            불러오는 중…
          </p>
        )}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-10 px-4 text-center rounded-2xl bg-rose-50 border border-rose-100">
        {error}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="py-10 px-4 text-center rounded-2xl bg-white/80 border border-rose-100">
        {empty}
      </div>
    );
  }

  if (status === "success") {
    return <>{children}</>;
  }

  return null;
}
