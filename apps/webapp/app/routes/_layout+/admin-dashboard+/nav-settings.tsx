import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Form, useLoaderData } from "react-router";
import { Switch } from "~/components/forms/switch";
import { Button } from "~/components/shared/button";
import {
  NAV_ITEM_KEYS,
  NAV_ITEM_LABELS,
  type NavItemKey,
} from "~/modules/app-settings/constants";
import {
  getNavSettings,
  updateNavSettings,
} from "~/modules/app-settings/service.server";
import { db } from "~/database/db.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { sendNotification } from "~/utils/emitter/send-notification.server";
import { makeShelfError } from "~/utils/error";
import { payload, error } from "~/utils/http.server";
import { requireAdmin } from "~/utils/roles.server";

export const meta = () => [
  { title: appendToMetaTitle("Navigatie-instellingen") },
];

export async function loader({ context }: LoaderFunctionArgs) {
  const { userId } = context.getSession();

  try {
    await requireAdmin(userId);
    const navSettings = await getNavSettings();

    const signupConfig = await db.siteConfig.findUnique({
      where: { key: "disableSignup" },
    });
    const disableSignup = (signupConfig?.value as { value: boolean } | null)?.value ?? false;

    return payload({ navSettings, disableSignup });
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

    // Handle disableSignup toggle
    const disableSignup = formData.get("disableSignup") === "on";
    await db.siteConfig.upsert({
      where: { key: "disableSignup" },
      update: { value: { value: disableSignup } },
      create: { key: "disableSignup", value: { value: disableSignup } },
    });

    const settings = Object.fromEntries(
      NAV_ITEM_KEYS.map((key) => {
        const rawUrl = formData.get(`customUrl_${key}`) as string;
        return [
          key,
          {
            visible: formData.get(`visible_${key}`) === "on",
            customUrl: rawUrl?.trim() || null,
          },
        ];
      })
    ) as Record<NavItemKey, { visible: boolean; customUrl: string | null }>;

    await updateNavSettings(settings);

    sendNotification({
      title: "Instellingen opgeslagen",
      message: "Navigatie-instellingen zijn bijgewerkt.",
      icon: { name: "success", variant: "success" },
      senderId: userId,
    });

    return payload({ success: true });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

/** Nav keys that are for sidebar links (vs bottom-bar buttons) */
const SIDEBAR_LINK_KEYS: NavItemKey[] = [
  "home", "assets", "kits", "categories", "tags", "locations",
  "audits", "bookings", "reminders", "team", "workspaceSettings", "scanner",
];
const BOTTOM_LINK_KEYS: NavItemKey[] = ["feedback", "support"];

export default function NavSettingsPage() {
  const { navSettings, disableSignup } = useLoaderData<typeof loader>();

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="mb-1 text-lg font-semibold">Navigatie &amp; Registratie</h2>
      <p className="mb-6 text-sm text-gray-500">
        Beheer navigatie-items, ondersteunende links en gebruikersregistratie.
      </p>

      <Form method="post" className="space-y-8">

        {/* Registration toggle */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Registratie
          </h3>
          <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
            <Switch
              name="disableSignup"
              defaultChecked={!disableSignup}
              title="Zelfregistratie inschakelen"
            />
            <div>
              <p className="font-medium text-gray-900">Zelfregistratie toestaan</p>
              <p className="text-sm text-gray-500">
                Schakel in om nieuwe gebruikers toe te staan zichzelf te registreren via de inlogpagina.
                Uitschakelen betekent dat nieuwe gebruikers alleen via uitnodigingen kunnen deelnemen.
              </p>
            </div>
          </div>
        </section>

        {/* Main nav items */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Zijbalk Navigatie
          </h3>
          <div className="space-y-3">
            {SIDEBAR_LINK_KEYS.map((key) => (
              <NavItemRow key={key} navKey={key} navSettings={navSettings} />
            ))}
          </div>
        </section>

        {/* Bottom nav items: feedback & support */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Ondersteuning &amp; Feedback Links
          </h3>
          <div className="space-y-3">
            {BOTTOM_LINK_KEYS.map((key) => (
              <NavItemRow key={key} navKey={key} navSettings={navSettings} />
            ))}
          </div>
        </section>

        <div>
          <Button type="submit" variant="primary">
            Opslaan
          </Button>
        </div>
      </Form>
    </div>
  );
}

function NavItemRow({
  navKey,
  navSettings,
}: {
  navKey: NavItemKey;
  navSettings: Record<NavItemKey, { visible: boolean; customUrl: string | null }>;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <Switch
        name={`visible_${navKey}`}
        defaultChecked={navSettings[navKey].visible}
        title={`${NAV_ITEM_LABELS[navKey]} zichtbaarheid`}
      />
      <div className="flex-1">
        <p className="mb-1 font-medium text-gray-900">{NAV_ITEM_LABELS[navKey]}</p>
        <input
          type="text"
          name={`customUrl_${navKey}`}
          defaultValue={navSettings[navKey].customUrl ?? ""}
          placeholder="Aangepaste URL (optioneel)"
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}
