import type { Prisma } from "@prisma/client";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, redirect, useLoaderData } from "react-router";

import { z } from "zod";
import { Card } from "~/components/shared/card";
import { createChangeEmailSchema } from "~/components/user/change-email";
import {
  UserDetailsForm,
  UserDetailsFormSchema,
} from "~/components/user/details-form";
import PasswordResetForm from "~/components/user/password-reset-form";
import { RequestDeleteUser } from "~/components/user/request-delete-user";
import {
  UserContactDetailsForm,
  UserContactDetailsFormSchema,
} from "~/components/user/user-contact-form";
import {
  changeEmailAddressHtmlEmail,
  changeEmailAddressTextEmail,
} from "~/emails/change-user-email-address";

import { sendEmail } from "~/emails/mail.server";
import { getSupabaseAdmin } from "~/integrations/supabase/client";
import { refreshAccessToken } from "~/modules/auth/service.server";
import {
  getUserByID,
  getUserWithContact,
  updateProfilePicture,
  updateUser,
  updateUserEmail,
} from "~/modules/user/service.server";
import type { UpdateUserPayload } from "~/modules/user/types";
import type { UpdateUserContactPayload } from "~/modules/user-contact/service.server";
import { updateUserContact } from "~/modules/user-contact/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { checkExhaustiveSwitch } from "~/utils/check-exhaustive-switch";
import { delay } from "~/utils/delay";
import { sendNotification } from "~/utils/emitter/send-notification.server";
import { ADMIN_EMAIL, SERVER_URL } from "~/utils/env";
import { makeShelfError, ShelfError } from "~/utils/error";
import { payload, error, parseData } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";
import { getConfiguredSSODomains } from "~/utils/sso.server";

// First we define our intent schema
const IntentSchema = z.object({
  intent: z.enum([
    "resetPassword",
    "updateUser",
    "deleteUser",
    "initiateEmailChange",
    "verifyEmailChange",
    "updateUserContact",
  ]),
});

// Then we define schemas for each intent type
const ActionSchemas = {
  resetPassword: z.object({
    type: z.literal("resetPassword"),
  }),

  updateUser: UserDetailsFormSchema.extend({
    type: z.literal("updateUser"),
  }),

  updateUserContact: UserContactDetailsFormSchema.extend({
    type: z.literal("updateUserContact"),
  }),

  deleteUser: z.object({
    type: z.literal("deleteUser"),
    email: z.string(),
    reason: z.string(),
  }),

  initiateEmailChange: z.object({
    type: z.literal("initiateEmailChange"),
    email: z.string().email(),
  }),

  verifyEmailChange: z.object({
    email: z.string().email(),
    type: z.literal("verifyEmailChange"),
    otp: z.string().min(6).max(6),
  }),
} as const;

// Helper function to get schema
function getActionSchema(intent: z.infer<typeof IntentSchema>["intent"]) {
  return ActionSchemas[intent].extend({ intent: z.literal(intent) });
}

export type UserPageActionData = typeof action;

export async function action({ context, request }: ActionFunctionArgs) {
  const authSession = context.getSession();
  const { userId, email } = authSession;

  try {
    await requirePermission({
      userId,
      request,
      entity: PermissionEntity.userData,
      action: PermissionAction.update,
    });

    // First parse just the intent
    const { intent } = parseData(
      await request.clone().formData(),
      IntentSchema
    );

    // Then parse the full payload with the correct schema
    const parsedData = parseData(
      await request.clone().formData(),
      getActionSchema(intent),
      {
        additionalData: { userId },
      }
    );

    switch (intent) {
      case "resetPassword": {
        if (parsedData.type !== "resetPassword")
          throw new Error("Invalid payload type");

        /** Logout user after 3 seconds */
        await delay(2000);

        context.destroySession();

        return redirect("/forgot-password");
      }
      case "updateUser": {
        if (parsedData.type !== "updateUser")
          throw new Error("Invalid payload type");
        /** Create the payload if the client side validation works */

        const updateUserPayload: UpdateUserPayload = {
          email: parsedData.email,
          username: parsedData.username,
          firstName: parsedData.firstName,
          lastName: parsedData.lastName,
          id: userId,
        };

        const { currentOrganization } = await getSelectedOrganization({
          userId,
          request,
        });

        await updateProfilePicture({
          request,
          userId,
          organizationId: currentOrganization.id,
        });

        /** Update the user */
        await updateUser(updateUserPayload);

        sendNotification({
          title: "Gebruiker bijgewerkt",
          message: "Uw instellingen zijn succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return payload({ success: true });
      }
      case "updateUserContact": {
        if (parsedData.type !== "updateUserContact")
          throw new ShelfError({
            cause: null,
            message: "Ongeldig payload type",
            label: "User",
          });

        const updateUserContactPayload: UpdateUserContactPayload = {
          userId,
          phone: parsedData.phone,
          street: parsedData.street,
          city: parsedData.city,
          stateProvince: parsedData.stateProvince,
          zipPostalCode: parsedData.zipPostalCode,
          countryRegion: parsedData.countryRegion,
        };

        await updateUserContact(updateUserContactPayload);

        sendNotification({
          title: "Contactgegevens bijgewerkt",
          message: "Uw contactgegevens zijn succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return payload({ success: true });
      }
      case "deleteUser": {
        if (parsedData.type !== "deleteUser")
          throw new Error("Invalid payload type");

        let reason = "Geen reden opgegeven";
        if ("reason" in parsedData && parsedData.reason) {
          reason = parsedData?.reason;
        }

        sendEmail({
          to: ADMIN_EMAIL || `"TechOps" <updates@emails.shelf.nu>`,
          subject: "Verzoek tot accountverwijdering",
          text: `User with id ${userId} and email ${parsedData.email} has requested to delete their account. \n User: ${SERVER_URL}/admin-dashboard/${userId} \n\n Reason: ${reason}\n\n`,
        });

        sendEmail({
          to: parsedData.email,
          subject: "Verzoek tot accountverwijdering ontvangen",
          text: `We have received your request to delete your account. It will be processed within 72 hours.\n\n Kind regards,\nthe TechOps team \n\n`,
        });

        sendNotification({
          title: "Verzoek om accountverwijdering",
          message:
            "Uw verzoek is verzonden naar de beheerder en wordt binnen 24 uur verwerkt. U ontvangt een e-mailbevestiging.",
          icon: { name: "success", variant: "success" },
          senderId: authSession.userId,
        });

        return payload({ success: true });
      }
      case "initiateEmailChange": {
        if (parsedData.type !== "initiateEmailChange")
          throw new Error("Invalid payload type");

        const ssoDomains = await getConfiguredSSODomains();
        const user = await getUserByID(userId, {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          } satisfies Prisma.UserSelect,
        });
        // Validate the payload using our schema
        const { email: newEmail } = parseData(
          await request.clone().formData(),
          createChangeEmailSchema(
            email,
            ssoDomains.map((d) => d.domain)
          ),
          {
            additionalData: { userId },
          }
        );

        // Generate email change link/OTP
        const { data: linkData, error: generateError } =
          await getSupabaseAdmin().auth.admin.generateLink({
            type: "email_change_new",
            email: email,
            newEmail: newEmail,
          });

        if (generateError) {
          const emailExists = generateError.code === "email_exists";
          throw new ShelfError({
            cause: generateError,
            ...(emailExists && { title: "E-mailadres is al in gebruik." }),
            message: emailExists
              ? "Kies een ander e-mailadres dat nog niet in gebruik is."
              : "Kon e-mailwijziging niet starten",
            additionalData: { userId, newEmail },
            label: "Auth",
            shouldBeCaptured: !emailExists,
          });
        }

        // Send email with OTP using our email service
        sendEmail({
          to: newEmail,
          subject: `🔐 TechOps verification code: ${linkData.properties.email_otp}`,
          text: changeEmailAddressTextEmail({
            otp: linkData.properties.email_otp,
            user,
          }),
          html: await changeEmailAddressHtmlEmail(
            linkData.properties.email_otp,
            user
          ),
        });

        sendNotification({
          title: "E-mailupdate gestart",
          message: "Controleer uw e-mail voor een bevestigingscode",
          icon: { name: "success", variant: "success" },
          senderId: userId,
        });

        return payload({
          awaitingOtp: true,
          newEmail, // We'll need this to show which email we're waiting for verification
          success: true,
        });
      }
      case "verifyEmailChange": {
        if (parsedData.type !== "verifyEmailChange")
          throw new Error("Invalid payload type");

        const { otp, email: newEmail } = parsedData;

        /** Just to make sure the user exists */
        await getUserByID(userId, {
          select: { id: true } satisfies Prisma.UserSelect,
        });

        // Attempt to verify the OTP
        const { error: verifyError } = await getSupabaseAdmin().auth.verifyOtp({
          email: newEmail,
          token: otp,
          type: "email_change",
        });

        if (verifyError) {
          throw new ShelfError({
            cause: verifyError,
            message: "Ongeldige of verlopen verificatiecode",
            additionalData: { userId },
            label: "Auth",
          });
        }

        /** Update the user's email */
        await updateUserEmail({ userId, currentEmail: email, newEmail });

        /** Refresh the session so it has the up-to-date email */
        const { refreshToken } = authSession;
        const newSession = await refreshAccessToken(refreshToken);
        context.setSession(newSession);
        /** Destroy all other sessions */
        await getSupabaseAdmin().auth.admin.signOut(
          newSession.accessToken,
          "others"
        );

        sendNotification({
          title: "E-mail bijgewerkt",
          message: "Uw e-mailadres is succesvol bijgewerkt",
          icon: { name: "success", variant: "success" },
          senderId: userId,
        });

        return payload({
          success: true,
          awaitingOtp: false,
          emailChanged: true,
        });
      }
      default: {
        checkExhaustiveSwitch(intent);
        return payload(null);
      }
    }
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;
  try {
    await requirePermission({
      userId,
      request,
      entity: PermissionEntity.userData,
      action: PermissionAction.read,
    });

    const title = "Accountgegevens";
    const user = await getUserWithContact(userId);

    return payload({ title, user });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.title) : "" },
];

export const handle = {
  breadcrumb: () => "Algemeen",
};

export default function UserPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="mb-2.5 flex flex-col justify-between gap-3">
      <UserDetailsForm user={user} />
      <UserContactDetailsForm user={user} />
      {!user.sso && (
        <>
          <Card className="my-0">
            <div className="mb-6">
              <h3 className="text-text-lg font-semibold">Wachtwoord</h3>
              <p className="text-sm text-gray-600">
                Werk hier uw wachtwoord bij.
              </p>
            </div>
            <div>
              <p>Wachtwoord vergeten?</p>
              <p>
                Klik hieronder om het herstelproces te starten. U wordt uitgelogd en
                doorgeleid naar onze pagina voor het opnieuw instellen van uw wachtwoord.
              </p>
            </div>
            <PasswordResetForm />
          </Card>
          <Card className="my-0">
            <h3 className="text-text-lg font-semibold">Account verwijderen</h3>
            <p className="text-sm text-gray-600">
              Stuur een verzoek om uw account te verwijderen.
            </p>
            <RequestDeleteUser />
          </Card>
        </>
      )}
    </div>
  );
}
