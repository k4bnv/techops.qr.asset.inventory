import { TierId } from "@prisma/client";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, useLoaderData } from "react-router";
import { z } from "zod";
import { Switch } from "~/components/forms/switch";
import { Button } from "~/components/shared/button";
import { db } from "~/database/db.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { sendNotification } from "~/utils/emitter/send-notification.server";
import { makeShelfError } from "~/utils/error";
import { payload, error, parseData } from "~/utils/http.server";
import { requireAdmin } from "~/utils/roles.server";

export const meta = () => [{ title: appendToMetaTitle("Tier-limieten") }];

const STANDARD_TIERS = [TierId.free, TierId.tier_1, TierId.tier_2] as const;

const TIER_DISPLAY_NAMES: Record<string, string> = {
  free: "Free",
  tier_1: "Tier 1",
  tier_2: "Tier 2",
};

const TierLimitSchema = z.object({
  tierId: z.nativeEnum(TierId),
  canImportAssets: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  canExportAssets: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  canImportNRM: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  canHideShelfBranding: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  canInviteTeamMembers: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  maxCustomFields: z.string().transform((v) => Math.max(0, parseInt(v) || 0)),
  maxOrganizations: z.string().transform((v) => Math.max(1, parseInt(v) || 1)),
  maxAssets: z.string().transform((v) => Math.max(0, parseInt(v) || 0)),
});

export async function loader({ context }: LoaderFunctionArgs) {
  const { userId } = context.getSession();

  try {
    await requireAdmin(userId);

    const [tierLimits, userCountsByTier] = await Promise.all([
      db.tierLimit.findMany({
        where: { id: { in: STANDARD_TIERS as unknown as TierId[] } },
      }),
      db.user.groupBy({
        by: ["tierId"],
        _count: { id: true },
      }),
    ]);

    const userCounts = Object.fromEntries(
      userCountsByTier.map((r) => [r.tierId, r._count.id])
    );

    return payload({ tierLimits, userCounts });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { userId } = context.getSession();

  try {
    await requireAdmin(userId);

    const formData = await request.formData();
    const {
      tierId,
      canImportAssets,
      canExportAssets,
      canImportNRM,
      canHideShelfBranding,
      canInviteTeamMembers,
      maxCustomFields,
      maxOrganizations,
      maxAssets,
    } = parseData(formData, TierLimitSchema);

    await db.tierLimit.upsert({
      where: { id: tierId },
      update: {
        canImportAssets,
        canExportAssets,
        canImportNRM,
        canHideShelfBranding,
        canInviteTeamMembers,
        maxCustomFields,
        maxOrganizations,
        maxAssets,
      },
      create: {
        id: tierId,
        canImportAssets,
        canExportAssets,
        canImportNRM,
        canHideShelfBranding,
        canInviteTeamMembers,
        maxCustomFields,
        maxOrganizations,
        maxAssets,
      },
    });

    sendNotification({
      title: "Tier-limiet opgeslagen",
      message: `Limieten voor ${TIER_DISPLAY_NAMES[tierId] ?? tierId} zijn bijgewerkt.`,
      icon: { name: "success", variant: "success" },
      senderId: userId,
    });

    return payload({ success: true });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export default function TierLimitsPage() {
  const { tierLimits, userCounts } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <h2 className="mb-1 text-lg font-semibold">Tier-limieten</h2>
      <p className="mb-6 text-sm text-gray-500">
        Configureer de rechten en limieten per abonnementsniveau. Waarde 0 bij
        numerieke velden = onbeperkt.
      </p>

      <div className="space-y-8">
        {STANDARD_TIERS.map((tierId) => {
          const limit = tierLimits.find((l) => l.id === tierId);
          const count = userCounts[tierId] ?? 0;

          return (
            <div
              key={tierId}
              className="rounded-lg border border-gray-200 bg-white"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {TIER_DISPLAY_NAMES[tierId]}
                  </h3>
                  <p className="text-xs text-gray-500">{count} gebruikers</p>
                </div>
              </div>

              <Form method="post" className="p-4">
                <input type="hidden" name="tierId" value={tierId} />

                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <NumberField
                    name="maxAssets"
                    label="Max assets"
                    hint="0 = onbeperkt"
                    defaultValue={limit?.maxAssets ?? 0}
                  />
                  <NumberField
                    name="maxOrganizations"
                    label="Max werkruimtes"
                    hint="incl. persoonlijke"
                    defaultValue={limit?.maxOrganizations ?? 1}
                    min={1}
                  />
                  <NumberField
                    name="maxCustomFields"
                    label="Max aangepaste velden"
                    hint="0 = geen toegang"
                    defaultValue={limit?.maxCustomFields ?? 0}
                  />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <ToggleField
                    name="canInviteTeamMembers"
                    label="Teamleden uitnodigen"
                    defaultChecked={limit?.canInviteTeamMembers ?? true}
                  />
                  <ToggleField
                    name="canImportAssets"
                    label="Assets importeren"
                    defaultChecked={limit?.canImportAssets ?? false}
                  />
                  <ToggleField
                    name="canExportAssets"
                    label="Assets exporteren"
                    defaultChecked={limit?.canExportAssets ?? false}
                  />
                  <ToggleField
                    name="canImportNRM"
                    label="NRM importeren"
                    defaultChecked={limit?.canImportNRM ?? false}
                  />
                  <ToggleField
                    name="canHideShelfBranding"
                    label="Branding verbergen"
                    defaultChecked={limit?.canHideShelfBranding ?? false}
                  />
                </div>

                <Button type="submit" variant="primary" size="sm">
                  Opslaan
                </Button>
              </Form>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NumberField({
  name,
  label,
  hint,
  defaultValue,
  min = 0,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue: number;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {hint ? (
          <span className="ml-1 font-normal text-gray-400">({hint})</span>
        ) : null}
      </label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        min={min}
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

function ToggleField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded border border-gray-100 bg-gray-50 px-3 py-2">
      <Switch name={name} defaultChecked={defaultChecked} title={label} />
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}
