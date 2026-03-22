import { OrganizationRoles, OrganizationType } from "@prisma/client";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, useLoaderData } from "react-router";
import {
  AutoArchiveSettings,
  AutoArchiveDaysSchema,
  AutoArchiveToggleSchema,
} from "~/components/booking/auto-archive-settings";
import {
  ExplicitCheckinSettings,
  ExplicitCheckinSettingsSchema,
} from "~/components/booking/explicit-checkin-settings";
import {
  TagsRequiredSettings,
  TagsRequiredSettingsSchema,
} from "~/components/booking/tags-required/tags-required-settings";
import {
  TimeSettings,
  TimeSettingsSchema,
} from "~/components/booking/time-settings";
import { ErrorContent } from "~/components/errors";
import type { HeaderData } from "~/components/layout/header/types";
import { Overrides } from "~/components/working-hours/overrides/overrides";
import { EnableWorkingHoursForm } from "~/components/working-hours/toggle-working-hours-form";
import { WeeklyScheduleForm } from "~/components/working-hours/weekly-schedule-form";
import {
  getBookingSettingsForOrganization,
  updateBookingSettings,
} from "~/modules/booking-settings/service.server";
import {
  createWorkingHoursOverride,
  deleteWorkingHoursOverride,
  getWorkingHoursForOrganization,
  toggleWorkingHours,
  updateWorkingHoursSchedule,
} from "~/modules/working-hours/service.server";
import type { WeeklyScheduleJson } from "~/modules/working-hours/types";
import { parseWeeklyScheduleFromFormData } from "~/modules/working-hours/utils";
import {
  CreateOverrideFormSchema,
  WeeklyScheduleSchema,
  WorkingHoursToggleSchema,
} from "~/modules/working-hours/zod-utils";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { sendNotification } from "~/utils/emitter/send-notification.server";
import { ShelfError, makeShelfError } from "~/utils/error";
import { payload, error, parseData } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId, currentOrganization } = await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.workingHours,
      action: PermissionAction.update,
    });

    if (currentOrganization.type === OrganizationType.PERSONAL) {
      throw new ShelfError({
        cause: null,
        title: "Niet toegestaan",
        message:
          "U heeft geen toegang tot werktijden in een persoonlijke werkruimte.",
        label: "Settings",
        shouldBeCaptured: false,
      });
    }

    const [bookingSettings, workingHours] = await Promise.all([
      getBookingSettingsForOrganization(organizationId),
      getWorkingHoursForOrganization(organizationId),
    ]);

    const header: HeaderData = {
      title: "Reserveringsinstellingen",
    };

    return payload({
      header,
      organization: currentOrganization,
      bookingSettings,
      workingHours,
    });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export const handle = {
  breadcrumb: () => "Bookings",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export const ErrorBoundary = () => <ErrorContent />;

export type BookingSettingsActionData = typeof action;
export async function action({ context, request }: ActionFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId, role } = await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.workingHours,
      action: PermissionAction.update,
    });

    const formData = await request.formData();

    // Get intent manually to avoid any parseData issues with numeric keys in updateSchedule form data
    const intent = formData.get("intent") as string;
    if (
      !intent ||
      ![
        "updateTimeSettings",
        "updateTagsRequired",
        "updateAutoArchiveToggle",
        "updateAutoArchiveDays",
        "updateExplicitCheckin",
        "toggle",
        "updateSchedule",
        "createOverride",
        "deleteOverride",
      ].includes(intent)
    ) {
      throw new ShelfError({
        cause: null,
        message: "Invalid action",
        additionalData: { intent },
        label: "Working hours",
      });
    }

    switch (intent) {
      case "updateTimeSettings": {
        const {
          bufferStartTime,
          maxBookingLength,
          maxBookingLengthSkipClosedDays,
        } = parseData(formData, TimeSettingsSchema, {
          additionalData: {
            intent,
            organizationId,
            formData: Object.fromEntries(formData),
          },
        });

        await updateBookingSettings({
          organizationId,
          bufferStartTime,
          maxBookingLength: maxBookingLength || null,
          maxBookingLengthSkipClosedDays,
        });

        sendNotification({
          title: "Instellingen bijgewerkt",
          message: "Beperkingen voor reserveringstijd zijn succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }
      case "updateTagsRequired": {
        const { tagsRequired } = parseData(
          formData,
          TagsRequiredSettingsSchema,
          {
            additionalData: {
              intent,
              organizationId,
              formData: Object.fromEntries(formData),
            },
          }
        );

        await updateBookingSettings({
          organizationId,
          tagsRequired,
        });

        sendNotification({
          title: "Instellingen bijgewerkt",
          message: "Tags vereiste-instelling is succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }
      case "updateAutoArchiveToggle": {
        const { autoArchiveBookings } = parseData(
          formData,
          AutoArchiveToggleSchema,
          {
            additionalData: {
              intent,
              organizationId,
              formData: Object.fromEntries(formData),
            },
          }
        );

        await updateBookingSettings({
          organizationId,
          autoArchiveBookings,
        });

        sendNotification({
          title: "Instellingen bijgewerkt",
          message: "Instelling voor automatisch archiveren is succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }
      case "updateAutoArchiveDays": {
        const { autoArchiveDays } = parseData(formData, AutoArchiveDaysSchema, {
          additionalData: {
            intent,
            organizationId,
            formData: Object.fromEntries(formData),
          },
        });

        await updateBookingSettings({
          organizationId,
          autoArchiveDays,
        });

        sendNotification({
          title: "Instellingen bijgewerkt",
          message: "Instelling voor automatisch archiveren (dagen) is succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }
      case "toggle": {
        // Only use parseData for simple fields without numeric keys
        const { enableWorkingHours } = parseData(
          formData,
          WorkingHoursToggleSchema
        );

        await toggleWorkingHours({
          organizationId,
          enabled: enableWorkingHours,
        });

        sendNotification({
          title: "Werkruimte bijgewerkt",
          message: "Uw werkruimte is succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }

      case "updateSchedule": {
        // CRITICAL: Do NOT use parseData here - it will fail with numeric keys
        // Parse manually using your utility function
        const weeklyScheduleData = parseWeeklyScheduleFromFormData(formData);

        // Validate directly with Zod (bypass parseData completely)
        const validation = WeeklyScheduleSchema.safeParse(weeklyScheduleData);

        if (!validation.success) {
          throw new ShelfError({
            cause: validation.error,
            title: "Ongeldig schema",
            message: "Controleer uw werktijdenschema op fouten",
            additionalData: {
              userId,
              organizationId,
              validationErrors: validation.error.errors.reduce(
                (acc, error) => {
                  const field = error.path.join(".");
                  acc[field] = error.message;
                  return acc;
                },
                {} as Record<string, string>
              ),
            },
            label: "Working hours",
          });
        }

        await updateWorkingHoursSchedule({
          organizationId,
          weeklySchedule: validation.data,
        });

        sendNotification({
          title: "Schema bijgewerkt",
          message: "Uw wekelijkse schema is succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }
      case "createOverride": {
        // Use parseData function following your standard pattern
        const validatedData = parseData(formData, CreateOverrideFormSchema);

        // Store the date as-is without timezone conversion
        // Working hours overrides should use absolute dates since they represent
        // real-world location-specific dates that don't change based on user timezone
        await createWorkingHoursOverride({
          organizationId,
          date: validatedData.date, // Store date directly without timezone adjustment
          isOpen: validatedData.isOpen,
          openTime: validatedData.openTime || undefined,
          closeTime: validatedData.closeTime || undefined,
          reason: validatedData.reason,
        });

        sendNotification({
          title: "Uitzondering gemaakt",
          message: "Uitzondering op werktijden is succesvol gemaakt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }

      case "deleteOverride": {
        const overrideId = formData.get("overrideId") as string;

        if (!overrideId) {
          throw new ShelfError({
            cause: null,
            message: "Override ID is required",
            additionalData: { intent },
            label: "Working hours",
          });
        }

        await deleteWorkingHoursOverride(overrideId);

        sendNotification({
          title: "Uitzondering verwijderd",
          message: "Uw uitzondering op werktijden is succesvol verwijderd",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }

      case "updateExplicitCheckin": {
        // Only workspace owners can change explicit check-in settings
        if (role !== OrganizationRoles.OWNER) {
          throw new ShelfError({
            cause: null,
            title: "Niet toegestaan",
            message:
              "Alleen de werkruimte-eigenaar kan instellingen voor expliciete check-in wijzigen",
            status: 403,
            label: "Booking Settings",
          });
        }

        const {
          requireExplicitCheckinForAdmin,
          requireExplicitCheckinForSelfService,
        } = parseData(formData, ExplicitCheckinSettingsSchema, {
          additionalData: {
            intent,
            organizationId,
            formData: Object.fromEntries(formData),
          },
        });

        await updateBookingSettings({
          organizationId,
          requireExplicitCheckinForAdmin,
          requireExplicitCheckinForSelfService,
        });

        sendNotification({
          title: "Instellingen bijgewerkt",
          message: "Instellingen voor expliciete check-in zijn succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return data(payload({ success: true }), { status: 200 });
      }

      default: {
        throw new ShelfError({
          cause: null,
          message: "Invalid action",
          additionalData: { intent },
          label: "Working hours",
        });
      }
    }
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}
export default function GeneralPage() {
  const { workingHours, bookingSettings } = useLoaderData<typeof loader>();

  return (
    <>
      {/* Explicit check-in settings form */}
      <ExplicitCheckinSettings
        header={{
          title: "Expliciete check-in vereiste",
          subHeading:
            "Beheer of specifieke rollen de scanner-gebaseerde expliciete check-in stroom moeten gebruiken in plaats van de snelle check-in met één klik. Alleen werkruimte-eigenaren kunnen deze instelling wijzigen.",
        }}
        defaultValues={{
          requireExplicitCheckinForAdmin:
            bookingSettings.requireExplicitCheckinForAdmin,
          requireExplicitCheckinForSelfService:
            bookingSettings.requireExplicitCheckinForSelfService,
        }}
      />

      {/* Tags required settings form */}
      <TagsRequiredSettings
        header={{
          title: "Tags vereiste",
          subHeading:
            "Beheer of gebruikers tags aan hun reserveringen moeten toevoegen. Dit helpt bij de categorisering en organisatie van reserveringen.",
        }}
        defaultValue={bookingSettings.tagsRequired}
      />

      {/* Auto-archive settings form */}
      <AutoArchiveSettings
        header={{
          title: "Automatisering",
          subHeading:
            "Configureer automatische acties voor voltooide reserveringen om uw werkruimte netjes te houden.",
        }}
        defaultAutoArchiveBookings={bookingSettings.autoArchiveBookings}
        defaultAutoArchiveDays={bookingSettings.autoArchiveDays}
      />

      {/* Time settings form */}
      <TimeSettings
        header={{
          title: "Beperkingen voor reserveringstijd",
          subHeading:
            "Beheer beperkingen voor reserveringstijden, waaronder de minimale voorafgaande kennisgeving en maximale reserveringsduur.",
        }}
        defaultBufferValue={bookingSettings.bufferStartTime}
        defaultMaxLengthValue={bookingSettings.maxBookingLength}
        defaultMaxBookingLengthSkipClosedDays={
          bookingSettings.maxBookingLengthSkipClosedDays
        }
      />

      {/* Enable working hours form */}
      <EnableWorkingHoursForm
        enabled={workingHours.enabled}
        header={{
          title: "Werktijden",
          subHeading:
            "Beheer de werktijden van uw werkruimte. Hiermee kunt u beperken wanneer start- en eindtijden en -datums van reserveringen vallen.",
        }}
      />
      {/* New weekly schedule form - only show if working hours are enabled */}
      {workingHours.enabled && (
        <WeeklyScheduleForm
          weeklySchedule={
            workingHours.weeklySchedule as unknown as WeeklyScheduleJson
          }
        />
      )}
      {/* New weekly schedule form - only show if working hours are enabled */}
      {workingHours.enabled && <Overrides overrides={workingHours.overrides} />}
    </>
  );
}
