import { useState } from "react";
import type { Currency } from "@prisma/client";
import {
  CheckCircle2Icon,
  ClipboardCheckIcon,
  SparklesIcon,
} from "lucide-react";
import { useFetcher } from "react-router";
import { CustomerPortalForm } from "~/components/subscription/customer-portal-form";
import type { PriceWithProduct } from "~/components/subscription/prices";
import { AUDIT_ADDON } from "~/config/addon-copy";
import { formatCurrency } from "~/utils/currency";
import { tw } from "~/utils/tw";
import { Button } from "../shared/button";

type AuditSubInfo = {
  interval: "month" | "year";
  amount: number;
  currency: string;
  status: string;
} | null;

const fmtPrice = (amountInCents: number, currency: string) =>
  formatCurrency({
    value: amountInCents / 100,
    currency: currency as Currency,
    locale: "en-US",
  });

export function UnlockAuditsPage({
  isOwner,
  usedAuditTrial,
  monthlyPrice,
  yearlyPrice,
  auditSubInfo,
  hasPaymentMethod = false,
}: {
  isOwner: boolean;
  usedAuditTrial: boolean;
  monthlyPrice: PriceWithProduct | null;
  yearlyPrice: PriceWithProduct | null;
  auditSubInfo?: AuditSubInfo;
  hasPaymentMethod?: boolean;
}) {
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">(
    "year"
  );

  const canStartTrial = isOwner && !usedAuditTrial;
  const trialExpired = isOwner && usedAuditTrial;
  const selectedPrice =
    selectedInterval === "year" ? yearlyPrice : monthlyPrice;

  /** Calculate yearly discount percentage compared to monthly */
  const yearlyDiscount =
    monthlyPrice && yearlyPrice
      ? Math.round(
          (1 -
            (yearlyPrice.unit_amount || 0) /
              12 /
              (monthlyPrice.unit_amount || 1)) *
            100
        )
      : null;

  const features = AUDIT_ADDON.features;

  return (
    <div className="flex size-full items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full border-[5px] border-solid border-primary-50 bg-primary-100 p-3 text-primary">
            <ClipboardCheckIcon className="size-6" />
          </div>
          <h2 className="mb-2 text-display-xs font-semibold">
            Ontgrendel {AUDIT_ADDON.label}
          </h2>
          <p className="text-gray-600">{AUDIT_ADDON.subtitle}</p>
        </div>

        {/* Feature list */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Wat u krijgt met Audits
          </h3>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-primary-500" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing — only show when user can still choose (not after expired trial) */}
        {!trialExpired && (monthlyPrice || yearlyPrice) && (
          <PricingSection
            monthlyPrice={monthlyPrice}
            yearlyPrice={yearlyPrice}
            selectedInterval={selectedInterval}
            onIntervalChange={setSelectedInterval}
            yearlyDiscount={yearlyDiscount}
          />
        )}

        {/* CTAs */}
        <div className="space-y-3">
          {isOwner ? (
            trialExpired ? (
              <TrialExpiredCTA auditSubInfo={auditSubInfo} />
            ) : (
              <OwnerCTAs
                canStartTrial={canStartTrial}
                yearlyPrice={yearlyPrice}
                selectedPrice={selectedPrice}
                selectedInterval={selectedInterval}
                hasPaymentMethod={hasPaymentMethod}
              />
            )
          ) : (
            <NonOwnerMessage />
          )}
        </div>
      </div>
    </div>
  );
}

/** Pricing interval selector with monthly/yearly cards */
function PricingSection({
  monthlyPrice,
  yearlyPrice,
  selectedInterval,
  onIntervalChange,
  yearlyDiscount,
}: {
  monthlyPrice: PriceWithProduct | null;
  yearlyPrice: PriceWithProduct | null;
  selectedInterval: "month" | "year";
  onIntervalChange: (interval: "month" | "year") => void;
  yearlyDiscount: number | null;
}) {
  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Selecteer uw prijsplan</h3>
      <div className="flex flex-wrap items-stretch gap-4">
        {monthlyPrice && (
          <IntervalCard
            label="Maandelijks"
            isSelected={selectedInterval === "month"}
            onSelect={() => onIntervalChange("month")}
            mainPrice={fmtPrice(
              monthlyPrice.unit_amount || 0,
              monthlyPrice.currency
            )}
            footnote="Maandelijks gefactureerd"
          />
        )}
        {yearlyPrice && (
          <IntervalCard
            label="Jaarlijks"
            isSelected={selectedInterval === "year"}
            onSelect={() => onIntervalChange("year")}
            mainPrice={fmtPrice(
              Math.round((yearlyPrice.unit_amount || 0) / 12),
              yearlyPrice.currency
            )}
            footnote={`Jaarlijks gefactureerd ${fmtPrice(
              yearlyPrice.unit_amount || 0,
              yearlyPrice.currency
            )}`}
            discountBadge={
              yearlyDiscount != null && yearlyDiscount > 0
                ? `Bespaar ${yearlyDiscount}%`
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

/** A single monthly/yearly interval selection card */
function IntervalCard({
  label,
  isSelected,
  onSelect,
  mainPrice,
  footnote,
  discountBadge,
}: {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  mainPrice: string;
  footnote: string;
  discountBadge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={tw(
        "relative flex flex-1 cursor-pointer flex-col items-center rounded-lg p-4 text-center transition-colors",
        isSelected
          ? "border-2 border-primary-200 bg-primary-25"
          : "border border-gray-200"
      )}
    >
      {discountBadge && (
        <span className="absolute -top-2.5 rounded-full bg-primary-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          {discountBadge}
        </span>
      )}
      <p
        className={tw(
          "mb-1 text-sm font-medium",
          isSelected ? "text-primary-600" : "text-gray-500"
        )}
      >
        {label}
      </p>
      <p className="text-2xl font-semibold">
        {mainPrice}
        <span className="text-sm font-normal text-gray-500">/mo</span>
      </p>
      <p className="text-xs text-gray-500">{footnote}</p>
      <p className="mt-1 text-xs text-gray-500">per workspace</p>
    </button>
  );
}

/** Shown when the user's audit trial has expired and subscription is paused */
function TrialExpiredCTA({ auditSubInfo }: { auditSubInfo?: AuditSubInfo }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
      <p className="mb-1 font-semibold text-gray-900">
        Uw Audits-proefperiode is afgelopen
      </p>
      <p className="mb-2 text-sm text-gray-600">
        Voeg een betaalmethode toe om Audits te blijven gebruiken.
      </p>
      {auditSubInfo && (
        <p className="mb-4 text-sm text-gray-500">
          Uw plan:{" "}
          <span className="font-medium text-gray-700">
            {fmtPrice(
              auditSubInfo.interval === "year"
                ? Math.round(auditSubInfo.amount / 12)
                : auditSubInfo.amount,
              auditSubInfo.currency
            )}
            /mo
          </span>
          {auditSubInfo.interval === "year" && (
            <span>
              {" "}
              (jaarlijks gefactureerd{" "}
              {fmtPrice(auditSubInfo.amount, auditSubInfo.currency)}/jr)
            </span>
          )}
          {auditSubInfo.interval === "month" && <span> (maandelijks gefactureerd)</span>}
        </p>
      )}
      {!auditSubInfo && <div className="mb-4" />}
      <CustomerPortalForm
        buttonText="Betaalmethode toevoegen om door te gaan"
        buttonProps={{ variant: "primary", width: "full" }}
      />
    </div>
  );
}

/** Trial and subscribe buttons for workspace owners */
function OwnerCTAs({
  canStartTrial,
  yearlyPrice,
  selectedPrice,
  selectedInterval,
  hasPaymentMethod,
}: {
  canStartTrial: boolean;
  yearlyPrice: PriceWithProduct | null;
  selectedPrice: PriceWithProduct | null;
  selectedInterval: "month" | "year";
  hasPaymentMethod: boolean;
}) {
  const trialFetcher = useFetcher();
  const subscribeFetcher = useFetcher();
  const isStartingTrial = trialFetcher.state !== "idle";
  const isSubscribing = subscribeFetcher.state !== "idle";
  const [consentChecked, setConsentChecked] = useState(false);

  const needsConsent = hasPaymentMethod && canStartTrial;

  return (
    <>
      {needsConsent && (
        <div className="rounded-lg border border-[#FFE082] bg-[#FFF8E1] p-3">
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-[13px] text-gray-600">
              Ik begrijp dat na de gratis proefperiode van 7 dagen, mijn
              bekende betaalmethode automatisch wordt belast tegen het
              reguliere abonnementstarief. Ik kan op elk moment annuleren
              voordat de proefperiode afloopt om kosten te voorkomen.
            </span>
          </label>
        </div>
      )}

      {canStartTrial && yearlyPrice && (
        <trialFetcher.Form method="post" action="/audits">
          <input type="hidden" name="intent" value="trial" />
          <input type="hidden" name="priceId" value={yearlyPrice.id} />
          {consentChecked && (
            <input type="hidden" name="consentAcknowledged" value="true" />
          )}
          <Button
            type="submit"
            variant="primary"
            width="full"
            disabled={isStartingTrial || (hasPaymentMethod && !consentChecked)}
          >
            <span className="item flex gap-2">
              <SparklesIcon className="size-4" />
              {isStartingTrial ? "Inschakelen..." : "7 dagen gratis inschakelen"}
            </span>
          </Button>
        </trialFetcher.Form>
      )}

      {selectedPrice && (
        <subscribeFetcher.Form method="post" action="/audits">
          <input type="hidden" name="intent" value="subscribe" />
          <input type="hidden" name="priceId" value={selectedPrice.id} />
          <Button
            type="submit"
            variant={canStartTrial ? "secondary" : "primary"}
            width="full"
            disabled={isSubscribing}
          >
            {isSubscribing
              ? "Doorsturen..."
              : selectedInterval === "year"
              ? `Jaarlijks abonneren (${fmtPrice(
                  selectedPrice.unit_amount || 0,
                  selectedPrice.currency
                )}/jr)`
              : `Maandelijks abonneren (${fmtPrice(
                  selectedPrice.unit_amount || 0,
                  selectedPrice.currency
                )}/mo)`}
          </Button>
        </subscribeFetcher.Form>
      )}
    </>
  );
}

/** Informational message for non-owners */
function NonOwnerMessage() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="text-gray-600">{AUDIT_ADDON.nonOwnerDescription}</p>
    </div>
  );
}
