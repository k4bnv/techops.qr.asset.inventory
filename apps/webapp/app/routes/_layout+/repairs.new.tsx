import { RepairStatus } from "@prisma/client";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useActionData, useSearchParams } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { Form } from "~/components/custom-form";
import DynamicSelect from "~/components/dynamic-select/dynamic-select";
import Input from "~/components/forms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/forms/select";
import { Button } from "~/components/shared/button";
import { db } from "~/database/db.server";
import { useDisabled } from "~/hooks/use-disabled";
import { createRepair } from "~/modules/repair/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { sendNotification } from "~/utils/emitter/send-notification.server";
import { makeShelfError, ShelfError } from "~/utils/error";
import { assertIsPost, payload, error, parseData } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";
import { zodFieldIsRequired } from "~/utils/zod";

export const NewRepairFormSchema = z.object({
  assetId: z.string().min(1, "Asset is vereist"),
  title: z.string().min(2, "Titel is vereist (minimaal 2 tekens)"),
  description: z.string().optional(),
  status: z.nativeEnum(RepairStatus).optional().default(RepairStatus.PLANNED),
});

const title = "Nieuwe reparatie";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.repair,
      action: PermissionAction.create,
    });

    return payload({ header: { title } });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export const handle = {
  breadcrumb: () => <span>{title}</span>,
  name: "repairs.new",
};

export async function action({ context, request }: ActionFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    assertIsPost(request);

    const { organizationId } = await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.repair,
      action: PermissionAction.create,
    });

    const parsedData = parseData(
      await request.formData(),
      NewRepairFormSchema,
      { additionalData: { userId, organizationId } }
    );

    // Resolve asset: accept UUID or sequential ID (e.g. SAM-0001)
    const asset = await db.asset.findFirst({
      where: {
        organizationId,
        OR: [
          { id: parsedData.assetId },
          {
            sequentialId: {
              equals: parsedData.assetId,
              mode: "insensitive",
            },
          },
        ],
      },
      select: { id: true },
    });

    if (!asset) {
      throw new ShelfError({
        cause: null,
        message: `Asset niet gevonden. Controleer het geselecteerde asset.`,
        label: "Repair",
        status: 400,
        shouldBeCaptured: false,
      });
    }

    await createRepair({
      title: parsedData.title,
      description: parsedData.description ?? null,
      assetId: asset.id,
      organizationId,
      performedById: null,
      status: parsedData.status,
      cost: null,
      timeSpentHours: null,
      partsUsed: null,
      startedAt: new Date(),
      completedAt: null,
    });

    sendNotification({
      title: "Reparatie aangemaakt",
      message: "Uw reparatie is succesvol aangemaakt",
      icon: { name: "success", variant: "success" },
      senderId: authSession.userId,
    });

    return redirect("/repairs");
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}

const STATUS_OPTIONS = [
  { value: RepairStatus.PLANNED, label: "Gepland" },
  { value: RepairStatus.IN_PROGRESS, label: "Bezig" },
  { value: RepairStatus.COMPLETED, label: "Voltooid" },
  { value: RepairStatus.CANCELLED, label: "Geannuleerd" },
];

export default function NewRepairPage() {
  const zo = useZorm("NewRepairForm", NewRepairFormSchema);
  const disabled = useDisabled();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const prefillAssetId = searchParams.get("assetId") ?? "";

  return (
    <div className="relative">
      <Form
        method="post"
        className="block rounded border border-gray-200 bg-white px-6 py-5"
        ref={zo.ref}
      >
        <div className="flex flex-col gap-4 lg:max-w-lg">
          <div className="flex flex-col gap-1.5">
            <DynamicSelect
              disabled={disabled}
              defaultValue={prefillAssetId || undefined}
              model={{ name: "asset", queryKey: "title" }}
              fieldName={zo.fields.assetId()}
              label="Asset"
              contentLabel="Selecteer een asset"
              placeholder="Zoek een asset..."
              required={zodFieldIsRequired(NewRepairFormSchema.shape.assetId)}
              closeOnSelect
              selectionMode="set"
            />
            {zo.errors.assetId() && (
              <p className="text-sm text-error-500">
                {zo.errors.assetId()?.message}
              </p>
            )}
          </div>

          <Input
            label="Titel"
            placeholder="Beschrijf de reparatie"
            name={zo.fields.title()}
            disabled={disabled}
            error={zo.errors.title()?.message}
            autoFocus={!prefillAssetId}
            required={zodFieldIsRequired(NewRepairFormSchema.shape.title)}
          />

          <Input
            label="Beschrijving"
            placeholder="Optionele details over de reparatie"
            name={zo.fields.description()}
            disabled={disabled}
            inputType="textarea"
            className="min-h-[80px]"
          />

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="repair-status"
              className="text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <Select
              name={zo.fields.status()}
              defaultValue={RepairStatus.PLANNED}
            >
              <SelectTrigger id="repair-status">
                <SelectValue placeholder="Selecteer status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              to="/repairs"
              size="sm"
              disabled={disabled}
            >
              Annuleren
            </Button>
            <Button type="submit" size="sm" disabled={disabled}>
              Aanmaken
            </Button>
          </div>

          {actionData?.error ? (
            <div className="text-sm text-error-500">
              {actionData.error.message}
            </div>
          ) : null}
        </div>
      </Form>
    </div>
  );
}
