import { Turnstile, type TurnstileInstance, type TurnstileProps } from "@marsidev/react-turnstile";
import { forwardRef } from "react";
import { env } from "@labas/env/web";

export const TURNSTILE_SITE_KEY = env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY;

type TurnstileFieldProps = Omit<TurnstileProps, "siteKey"> & {
  siteKey?: string;
};

export const TurnstileField = forwardRef<TurnstileInstance, TurnstileFieldProps>(
  function TurnstileField({ options, className, siteKey, ...props }, ref) {
    const resolvedSiteKey = siteKey ?? TURNSTILE_SITE_KEY;
    if (!resolvedSiteKey) return null;

    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border border-[var(--oat-border)] bg-muted/40 px-2 py-2.5">
          <Turnstile
            ref={ref}
            siteKey={resolvedSiteKey}
            className={className ?? "w-full min-h-[65px] [&>iframe]:mx-auto"}
            options={{ theme: "auto", size: "flexible", ...options }}
            {...props}
          />
        </div>
      </div>
    );
  },
);
