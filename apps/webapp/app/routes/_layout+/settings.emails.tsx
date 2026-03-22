import { useState } from "react";
import { OrganizationType } from "@prisma/client";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, Form, useActionData, useLoaderData } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { ViewButtonGroup } from "~/components/calendar/view-button-group";
import { ErrorContent } from "~/components/errors";
import type { HeaderData } from "~/components/layout/header/types";
import { Button } from "~/components/shared/button";
import { useDisabled } from "~/hooks/use-disabled";
import { EMAIL_FOOTER_MAX_LENGTH } from "~/modules/email-footer/constants";
import { processEmailFooter } from "~/modules/email-footer/email-footer-validator.server";
import { updateOrganization } from "~/modules/organization/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { sendNotification } from "~/utils/emitter/send-notification.server";
import { ShelfError, makeShelfError } from "~/utils/error";
import { getValidationErrors } from "~/utils/http";
import { payload, error, parseData } from "~/utils/http.server";
import type { DataOrErrorResponse } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export const emailFooterSchema = z.object({
  customEmailFooter: z.string().max(500).optional().default(""),
});

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { currentOrganization } = await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.emailSettings,
      action: PermissionAction.read,
    });

    if (currentOrganization.type === OrganizationType.PERSONAL) {
      throw new ShelfError({
        cause: null,
        title: "Niet toegestaan",
        message: "E-mailinstellingen zijn niet beschikbaar voor persoonlijke werkruimtes.",
        label: "Settings",
        shouldBeCaptured: false,
        status: 403,
      });
    }

    const header: HeaderData = {
      title: "E-mailinstellingen",
    };

    return payload({
      header,
      organization: currentOrganization,
    });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export const handle = {
  breadcrumb: () => "Emails",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export const ErrorBoundary = () => <ErrorContent />;

export async function action({ context, request }: ActionFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId } = await requirePermission({
      userId: authSession.userId,
      request,
      entity: PermissionEntity.emailSettings,
      action: PermissionAction.update,
    });

    const formData = await request.formData();

    const { customEmailFooter } = parseData(formData, emailFooterSchema, {
      additionalData: { organizationId },
    });

    const result = processEmailFooter(customEmailFooter);

    if (!result.success) {
      return data(
        error(
          new ShelfError({
            cause: null,
            message: result.error || "Invalid email footer",
            label: "Settings",
            shouldBeCaptured: false,
            additionalData: {
              validationErrors: {
                customEmailFooter: { message: result.error },
              },
            },
          })
        ),
        { status: 400 }
      );
    }

    await updateOrganization({
      id: organizationId,
      userId,
      customEmailFooter: result.message,
    });

    sendNotification({
      title: "Instellingen bijgewerkt",
      message: "E-mailvoettekst is succesvol bijgewerkt",
      icon: { name: "success", variant: "success" },
      senderId: authSession.userId,
    });

    return data(payload({ success: true }), { status: 200 });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}

export default function EmailSettingsPage() {
  const { organization } = useLoaderData<typeof loader>();
  const zo = useZorm("emailFooter", emailFooterSchema);
  const disabled = useDisabled();

  const actionData = useActionData<DataOrErrorResponse>();
  const validationErrors = getValidationErrors<typeof emailFooterSchema>(
    actionData?.error
  );

  const currentFooter = organization.customEmailFooter || "";
  const [charCount, setCharCount] = useState(currentFooter.length);
  const [footerPreview, setFooterPreview] = useState(currentFooter);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      {/* Left column: Form */}
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <h3 className="text-text-lg font-semibold">Aangepaste e-mailvoettekst</h3>
          <p className="text-sm text-gray-600">
            Voeg een aangepast bericht toe dat onderaan alle werkruimte-e-mails wordt weergegeven die naar teamleden worden verzonden.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 text-sm font-medium text-gray-700">
            Deze voettekst verschijnt in de volgende e-mails:
          </p>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              <span className="font-medium">Reserveringen:</span> Gereserveerd, checkout-herinnering, check-in herinnering, te laat, voltooid, verlengd, geannuleerd, bijgewerkt, verwijderd
            </li>
            <li>
              <span className="font-medium">Asset herinneringen:</span> Herinneringsmeldingen
            </li>
            <li>
              <span className="font-medium">Uitnodigingen:</span> Uitnodigingsmails voor werkruimte
            </li>
            <li>
              <span className="font-medium">Toegang:</span> Kennisgevingen van intrekking van toegang
            </li>
            <li>
              <span className="font-medium">Audits:</span> Toewijzing, geannuleerd, voltooid, herinnering, te laat meldingen
            </li>
            <li>
              <span className="font-medium">Rolwijzigingen:</span> Meldingen van rolwijzigingen
            </li>
          </ul>
        </div>

        <Form method="POST" ref={zo.ref} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor={zo.fields.customEmailFooter()}
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Voettekstbericht
            </label>
            <textarea
              id={zo.fields.customEmailFooter()}
              name={zo.fields.customEmailFooter()}
              defaultValue={currentFooter}
              disabled={disabled}
              maxLength={EMAIL_FOOTER_MAX_LENGTH}
              rows={10}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-25 disabled:opacity-50"
              placeholder="bijv. ACME Corp - support@acme.com - (555) 123-4567"
              onChange={(e) => {
                setCharCount(e.target.value.length);
                setFooterPreview(e.target.value);
              }}
            />
            {(validationErrors?.customEmailFooter?.message ||
              zo.errors.customEmailFooter()?.message) && (
              <p className="mt-1 text-sm text-error-500">
                {validationErrors?.customEmailFooter?.message ||
                  zo.errors.customEmailFooter()?.message}
              </p>
            )}
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Links zijn niet toegestaan. E-mailadressen en telefoonnummers zijn toegestaan.
              </p>
              <span className="text-xs text-gray-500">
                {charCount} / {EMAIL_FOOTER_MAX_LENGTH} tekens
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Opmerking: aangepaste voetteksten met bepaalde inhoud kunnen de afleverbaarheid van e-mail en spamscores beïnvloeden.
          </p>

          <div>
            <Button type="submit" disabled={disabled}>
              {disabled ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </Form>
      </div>

      {/* Right column: Email preview */}
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700">Voorbeeld</p>
          <ViewButtonGroup
            views={[
              { label: "Desktop", value: "desktop" },
              { label: "Mobiel", value: "mobile" },
            ]}
            currentView={previewMode}
            onViewChange={(v) => setPreviewMode(v as "desktop" | "mobile")}
            size="xs"
          />
        </div>
        <EmailPreview
          footerText={footerPreview}
          organizationName={organization.name}
          previewMode={previewMode}
        />
      </div>
    </div>
  );
}

/** Static email preview mimicking the booking email template */
function EmailPreview({
  footerText,
  organizationName,
  previewMode,
}: {
  footerText: string;
  organizationName: string;
  previewMode: "desktop" | "mobile";
}) {
  const isMobile = previewMode === "mobile";

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-300 shadow-lg"
      style={isMobile ? { maxWidth: "375px", margin: "0 auto" } : undefined}
    >
      {/* Title bar — macOS-style window chrome */}
      <div className="flex items-center gap-2 bg-[#3B3B3B] px-4 py-3">
        <span className="size-3 rounded-full bg-[#FF5F57]" />
        <span className="size-3 rounded-full bg-[#FEBC2E]" />
        <span className="size-3 rounded-full bg-[#28C840]" />
      </div>

      {/* Email header — From / To / Subject */}
      <div className="border-b border-gray-200 bg-gray-100 px-5 py-3 text-[13px] leading-relaxed text-gray-600">
        <p>
          <span className="text-gray-400">Van:</span>{" "}
          <span className="text-gray-700">
            TechOps &lt;notifications@shelf.nu&gt;
          </span>
        </p>
        <p>
          <span className="text-gray-400">Aan:</span>{" "}
          <span className="text-gray-700">jane@example.com</span>
        </p>
        <p>
          <span className="text-gray-400">Onderwerp:</span>{" "}
          <span className="text-gray-700">
            ✅ Reservering voor Jane Doe - shelf.nu
          </span>
        </p>
      </div>

      {/* Email body viewport — scrollable gray area with white card */}
      <div
        className="overflow-y-auto bg-gray-200 p-6"
        style={{ maxHeight: "600px" }}
      >
        <div
          className="mx-auto rounded-lg bg-white shadow-sm"
          style={{
            maxWidth: "600px",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          {/* Matches Container from bookings-updates-template.tsx */}
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "32px",
              }}
            >
              <img
                src="/static/images/logo-full-color(x2).png"
                alt="TechOps logo"
                style={{ height: "32px", width: "auto" }}
              />
            </div>

            {/* Email heading */}
            <div style={{ margin: "32px" }}>
              <h1
                style={{
                  fontSize: "20px",
                  color: "#101828",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                Reservering voor Jane Doe
              </h1>
              <h2
                style={{
                  fontSize: "16px",
                  color: "#101828",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                Kantoorapparatuur reservering | 3 assets
              </h2>
              <p style={{ fontSize: "16px", color: "#344054" }}>
                <span style={{ color: "#101828", fontWeight: "600" }}>
                  Beheerder:
                </span>{" "}
                Jane Doe
              </p>
              <p style={{ fontSize: "16px", color: "#344054" }}>
                <span style={{ color: "#101828", fontWeight: "600" }}>
                  Van:
                </span>{" "}
                01/15/26, 9:00 AM
              </p>
              <p style={{ fontSize: "16px", color: "#344054" }}>
                <span style={{ color: "#101828", fontWeight: "600" }}>Tot:</span>{" "}
                01/17/26, 5:00 PM
              </p>
            </div>

            {/* View button */}
            <div
              style={{
                display: "inline-block",
                backgroundColor: "#EF6820",
                color: "white",
                fontSize: "14px",
                fontWeight: "700",
                padding: "10px 18px",
                borderRadius: "4px",
                marginBottom: "32px",
              }}
            >
              Bekijk reservering in app
            </div>

            {/* Custom footer - live preview */}
            {footerText ? (
              <p
                style={{
                  fontSize: "13px",
                  color: "#667085",
                  borderTop: "1px solid #EAECF0",
                  paddingTop: "16px",
                  marginTop: "16px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {footerText}
              </p>
            ) : null}

            {/* Standard email footer */}
            <p
              style={{
                marginTop: "32px",
                fontSize: "14px",
                color: "#344054",
              }}
            >
              Deze e-mail is naar jane@example.com verzonden omdat deze deel uitmaakt van de werkruimte{" "}
              <span style={{ color: "#101828", fontWeight: "600" }}>
                &quot;{organizationName}&quot;
              </span>
              .
              <br /> Als u denkt dat u deze e-mail niet had mogen ontvangen, neem dan contact op met de eigenaar van de werkruimte.
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#344054",
                marginBottom: "32px",
              }}
            >
              &copy; 2026 TechOps Asset Inventory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
