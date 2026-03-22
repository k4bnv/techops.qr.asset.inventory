import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, Link, Outlet } from "react-router";
import { z } from "zod";
import { ErrorContent } from "~/components/errors";
import {
  softDeleteCustomField,
  getCustomField,
} from "~/modules/custom-field/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { sendNotification } from "~/utils/emitter/send-notification.server";
import { ShelfError, makeShelfError } from "~/utils/error";
import { payload, error, parseData } from "~/utils/http.server";

import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export const meta = () => [
  { title: appendToMetaTitle("Instellingen aangepaste velden") },
];

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.customField,
      action: PermissionAction.read,
    });

    return payload(null);
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export async function action({ context, request }: ActionFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId } = await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.customField,
      action: PermissionAction.delete,
    });

    const { id, confirmation } = parseData(
      await request.formData(),
      z.object({
        id: z.string(),
        confirmation: z
          .string()
          .min(1, "Bevestiging is vereist")
          .transform((value) => value.trim()),
      }),
      { additionalData: { userId } }
    );

    const customField = await getCustomField({ id, organizationId });

    // Case-insensitive comparison
    if (customField.name.toLowerCase() !== confirmation.toLowerCase()) {
      throw new ShelfError({
        cause: null,
        message:
          "De bevestigingstekst komt niet overeen met de naam van het aangepaste veld (hoofdletterongevoelig).",
        additionalData: {
          userId,
          customFieldId: id,
          confirmation,
          expected: customField.name,
        },
        label: "Custom fields",
        status: 400,
        shouldBeCaptured: false,
      });
    }

    await softDeleteCustomField({ id, organizationId });

    sendNotification({
      title: "Aangepast veld verwijderd",
      message: `Het aangepaste veld "${customField.name}" is verwijderd. U kunt nu indien nodig een nieuw veld met dezelfde naam maken.`,
      icon: { name: "success", variant: "success" },
      senderId: userId,
    });

    return payload({ success: true });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}

export const handle = {
  breadcrumb: () => <Link to="/settings/custom-fields">Aangepaste velden</Link>,
};

// export const shouldRevalidate = () => false;

export default function CustomFieldsPage() {
  return <Outlet />;
}

export const ErrorBoundary = () => <ErrorContent />;
