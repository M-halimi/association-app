"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { useI18n } from "@/lib/i18n/client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl">
      <ErrorState
        title={t.error.title}
        message={t.error.loadPage}
        onRetry={reset}
        retryLabel={t.error.tryAgain}
      />
    </div>
  );
}