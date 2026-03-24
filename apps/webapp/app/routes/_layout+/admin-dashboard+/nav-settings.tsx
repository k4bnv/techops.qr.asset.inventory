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
    return payload({ navSettings });
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
      title: "Navigatie opgeslagen",
      message: "De navigatie-instellingen zijn bijgewerkt.",
      icon: { name: "success", variant: "success" },
      senderId: userId,
    });

    return payload({ success: true });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export default function NavSettingsPage() {
  const { navSettings } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <h2 className="mb-1 text-lg font-semibold">Navigatie-instellingen</h2>
      <p className="mb-6 text-sm text-gray-500">
        Schakel navigatie-items in of uit en stel aangepaste URL&apos;s in.
      </p>

      <Form method="post">
        <div className="space-y-3">
          {NAV_ITEM_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
            >
              <Switch
                name={`visible_${key}`}
                defaultChecked={navSettings[key].visible}
                title={`${NAV_ITEM_LABELS[key]} zichtbaarheid`}
              />
              <div className="flex-1">
                <p className="mb-1 font-medium text-gray-900">
                  {NAV_ITEM_LABELS[key]}
                </p>
                <input
                  type="text"
                  name={`customUrl_${key}`}
                  defaultValue={navSettings[key].customUrl ?? ""}
                  placeholder="Aangepaste URL (optioneel)"
                  className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button type="submit" variant="primary">
            Opslaan
          </Button>
        </div>
      </Form>
    </div>
  );
}
