import { useEffect, useState } from "react";
import { Link } from "react-router";

type ConsentStatus = "all" | "necessary" | null;

const STORAGE_KEY = "cookie-consent";

export function CookieConsentBanner() {
  const [status, setStatus] = useState<ConsentStatus | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentStatus | null;
    setStatus(stored);
  }, []);

  // Not yet determined from storage — don't render anything yet
  if (status === undefined) return null;
  // Already made a choice
  if (status !== null) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "all");
    setStatus("all");
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, "necessary");
    setStatus("necessary");
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie-instellingen"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-4 shadow-lg md:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          Wij gebruiken cookies om het platform goed te laten werken.
          Analytische cookies helpen ons de dienst te verbeteren. Lees meer in
          ons{" "}
          <Link
            to="/privacy-policy"
            className="underline hover:text-primary"
          >
            privacybeleid
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={decline}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Alleen noodzakelijk
          </button>
          <button
            onClick={accept}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Accepteer alle cookies
          </button>
        </div>
      </div>
    </div>
  );
}
