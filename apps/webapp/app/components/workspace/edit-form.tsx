import { useState } from "react";
import {
  type Organization,
  type Currency,
  OrganizationType,
  type QrIdDisplayPreference,
} from "@prisma/client";
import { useAtom, useAtomValue } from "jotai";
import { useFetcher, useLoaderData } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { updateDynamicTitleAtom } from "~/atoms/dynamic-title-atom";
import { fileErrorAtom, defaultValidateFileAtom } from "~/atoms/file";
import { useDisabled } from "~/hooks/use-disabled";
import { useUserRoleHelper } from "~/hooks/user-user-role-helper";
import type { loader } from "~/routes/_layout+/account-details.workspace.$workspaceId.edit";
import { ACCEPT_SUPPORTED_IMAGES } from "~/utils/constants";
import { tw } from "~/utils/tw";
import { zodFieldIsRequired } from "~/utils/zod";
import CurrencySelector from "./currency-selector";
import QrIdDisplayPreferenceSelector from "./qr-id-display-preference-selector";
import { QrLabel } from "../code-preview/code-preview";
import FormRow from "../forms/form-row";
import { InnerLabel } from "../forms/inner-label";
import Input from "../forms/input";
import { Switch } from "../forms/switch";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import { Spinner } from "../shared/spinner";

/** Pass props of the values to be used as default for the form fields */
interface Props {
  name?: Organization["name"];
  currency?: Organization["currency"];
  qrIdDisplayPreference?: Organization["qrIdDisplayPreference"];
  className?: string;
}

export const EditGeneralWorkspaceSettingsFormSchema = (
  personalOrg: boolean = false
) =>
  z.object({
    id: z.string(),
    name: personalOrg
      ? z.string().optional()
      : z.string().min(2, "Naam is vereist"),
    logo: z.any().optional(),
    currency: z.custom<Currency>(),
    qrIdDisplayPreference: z.custom<QrIdDisplayPreference>(),
    showShelfBranding: z
      .union([z.literal("on"), z.literal("off"), z.undefined()])
      .transform((value) => {
        if (value === undefined) return undefined;
        return value === "on";
      })
      .optional(),
  });

export const WorkspaceEditForms = ({
  name,
  currency,
  qrIdDisplayPreference,
  className,
}: Props) => (
  <div className={tw("flex flex-col gap-3", className)}>
    <WorkspaceGeneralEditForms
      name={name}
      currency={currency}
      qrIdDisplayPreference={qrIdDisplayPreference}
    />
    <WorkspacePermissionsEditForm />
    <WorkspaceSSOEditForm />
  </div>
);

const WorkspaceGeneralEditForms = ({
  name,
  currency,
  qrIdDisplayPreference,
  className,
}: Props) => {
  const { organization, isPersonalWorkspace, canHideShelfBranding } =
    useLoaderData<typeof loader>();

  const schema = EditGeneralWorkspaceSettingsFormSchema(isPersonalWorkspace);
  const zo = useZorm("NewQuestionWizardScreen", schema);
  const fetcher = useFetcher({ key: "general" });
  const disabled = useDisabled(fetcher);
  const fileError = useAtomValue(fileErrorAtom);
  const [, validateFile] = useAtom(defaultValidateFileAtom);
  const [, updateTitle] = useAtom(updateDynamicTitleAtom);

  const fetcherError = (
    fetcher.data as
      | {
          error?: {
            message: string;
            additionalData?: { field?: string };
          };
        }
      | undefined
  )?.error;

  const imageError =
    (fetcherError?.additionalData?.field === "image"
      ? fetcherError.message
      : undefined) ?? fileError;

  return (
    <fetcher.Form
      ref={zo.ref}
      method="post"
      className="flex  flex-col gap-2"
      encType="multipart/form-data"
    >
      <Card className={tw("my-0", className)}>
        <div className="mb-6">
          <h3 className="text-text-lg font-semibold">Algemeen</h3>
          <p className="text-sm text-gray-600">
            Beheer algemene werkruimte-instellingen.
          </p>
        </div>
        <input type="hidden" value={organization.id} name="id" />

        <FormRow
          rowLabel={"Naam"}
          className="border-b-0 pb-[10px] pt-0"
          required={zodFieldIsRequired(schema.shape.name)}
        >
          <Input
            label="Naam"
            hideLabel
            name={zo.fields.name()}
            disabled={isPersonalWorkspace || disabled}
            error={zo.errors.name()?.message}
            autoFocus
            onChange={updateTitle}
            className="w-full"
            defaultValue={name || undefined}
            placeholder=""
            required={!isPersonalWorkspace}
          />
        </FormRow>

        <FormRow rowLabel={"Hoofdafbeelding"} className="border-b-0">
          <div>
            <p className="hidden lg:block">
              Accepteert PNG, JPG, JPEG of WebP (max. 4 MB)
            </p>
            <Input
              // disabled={disabled}
              accept={ACCEPT_SUPPORTED_IMAGES}
              name="image"
              type="file"
              onChange={validateFile}
              label={"Hoofdafbeelding"}
              hideLabel
              error={imageError}
              className="mt-2"
              inputClassName="border-0 shadow-none p-0 rounded-none"
            />
            <p className="mt-2 lg:hidden">
              Accepteert PNG, JPG, JPEG of WebP (max. 4 MB)
            </p>
          </div>
        </FormRow>

        <div>
          <FormRow
            rowLabel={"Valuta"}
            className={"border-b-0"}
            subHeading="Kies de valuta voor uw werkruimte. Alle ISO 4217-valuta's worden ondersteund."
          >
            <InnerLabel hideLg>Valuta</InnerLabel>
            <CurrencySelector
              defaultValue={currency || "EUR"}
              name={zo.fields.currency()}
            />
          </FormRow>
        </div>

        <div>
          <FormRow
            rowLabel={"QR-code weergave"}
            className={"border-b-0"}
            subHeading={
              <p>
                Kies welke ID wordt weergegeven op QR-codelabels. U kunt ofwel de QR-code-ID of de SAM-ID van de asset weergeven.
              </p>
            }
          >
            <InnerLabel hideLg>QR-code weergave</InnerLabel>
            <QrIdDisplayPreferenceSelector
              name={zo.fields.qrIdDisplayPreference()}
              defaultValue={qrIdDisplayPreference || "QR_ID"}
            />
          </FormRow>
        </div>

        <LabelBrandingRow
          zo={zo}
          organization={organization}
        />

        <div className="text-right">
          <Button
            type="submit"
            disabled={disabled}
            value="general"
            name="intent"
          >
            {disabled ? <Spinner /> : "Opslaan"}
          </Button>
        </div>
      </Card>
    </fetcher.Form>
  );
};

export const EditWorkspacePermissionsSettingsFormSchema = () =>
  z.object({
    id: z.string(),
    selfServiceCanSeeCustody: z
      .string()
      .transform((val) => val === "on")
      .default("false"),
    selfServiceCanSeeBookings: z
      .string()
      .transform((value) => value === "on")
      .default("false"),
    baseUserCanSeeCustody: z
      .string()
      .transform((value) => value === "on")
      .default("false"),
    baseUserCanSeeBookings: z
      .string()
      .transform((value) => value === "on")
      .default("false"),
  });

const WorkspacePermissionsEditForm = ({ className }: Props) => {
  const { organization } = useLoaderData<typeof loader>();
  const fetcher = useFetcher({ key: "permissions" });
  const schema = EditWorkspacePermissionsSettingsFormSchema();
  const zo = useZorm("NewQuestionWizardScreen", schema);
  const disabled = useDisabled(fetcher);

  return organization.type === OrganizationType.TEAM ? (
    <fetcher.Form ref={zo.ref} method="post" className="flex flex-col gap-2">
      <Card className={tw("my-0 w-full", className)}>
        <div className="border-b pb-5">
          <h3 className="text-text-lg font-semibold">Machtigingen</h3>
          <p className="text-sm text-gray-600">
            Pas specifieke machtigingen aan voor <b>Self Service</b>- en <b>Basis</b>{" "}
            gebruikers.
          </p>
        </div>
        <input type="hidden" value={organization.id} name="id" />

        <h4 className="mt-5 text-text-md">Self service-gebruikers</h4>
        <FormRow
          rowLabel={`Bewaring bekijken`}
          subHeading={
            <div>
              Sta <b>self service</b>-gebruikers toe om de bewaring van assets en kits te <b>zien</b> die niet aan hen zijn toegewezen. Standaard kunnen ze alleen de beheerder zien voor assets waarvan zij de beheerder zijn.
            </div>
          }
          className="border-b-0 pb-[10px]"
          required
        >
          <div className="flex flex-col items-center gap-2">
            <Switch
              name={zo.fields.selfServiceCanSeeCustody()}
              id="selfServiceCustody"
              disabled={disabled}
              defaultChecked={organization.selfServiceCanSeeCustody}
            />
            <label
              htmlFor={`selfServiceCustody`}
              className=" hidden text-gray-500"
            >
              Toestaan
            </label>
          </div>
        </FormRow>

        <FormRow
          rowLabel={`Reserveringen bekijken`}
          subHeading={
            <div>
              Sta <b>self service</b>-gebruikers toe om reserveringen te <b>zien</b> die niet aan hen zijn toegewezen. Standaard kunnen ze alleen reserveringen zien waarvan zij de beheerder zijn.
            </div>
          }
          className="border-b-0 pb-[10px]"
          required
        >
          <div className="flex flex-col items-center gap-2">
            <Switch
              name={zo.fields.selfServiceCanSeeBookings()}
              id="selfServiceBookings"
              disabled={disabled}
              defaultChecked={organization.selfServiceCanSeeBookings}
            />
            <label
              htmlFor={`selfServiceBookings`}
              className=" hidden text-gray-500"
            >
              Toestaan
            </label>
          </div>
        </FormRow>

        <h4 className="border-t pt-5 text-text-md">Basis-gebruikers</h4>
        <FormRow
          rowLabel={`Bewaring bekijken`}
          subHeading={
            <div>
              Sta <b>basis</b>-gebruikers toe om de bewaring van assets en kits te <b>zien</b> die niet aan hen zijn toegewezen. Standaard kunnen ze alleen de beheerder zien voor assets waarvan zij de beheerder zijn.
            </div>
          }
          className="border-b-0 pb-[10px]"
          required
        >
          <div className="flex flex-col items-center gap-2">
            <Switch
              name={zo.fields.baseUserCanSeeCustody()}
              id="baseUserCustody"
              disabled={disabled}
              defaultChecked={organization.baseUserCanSeeCustody}
            />
            <label
              htmlFor={`baseUserCustody`}
              className=" hidden text-gray-500"
            >
              Toestaan
            </label>
          </div>
        </FormRow>

        <FormRow
          rowLabel={`Reserveringen bekijken`}
          subHeading={
            <div>
              Sta <b>basis</b>-gebruikers toe om reserveringen te <b>zien</b> die niet aan hen zijn toegewezen. Standaard kunnen ze alleen reserveringen zien waarvan zij de beheerder zijn.
            </div>
          }
          className="border-b-0 pb-[10px]"
          required
        >
          <div className="flex flex-col items-center gap-2">
            <Switch
              name={zo.fields.baseUserCanSeeBookings()}
              id="baseUserBookings"
              disabled={disabled}
              defaultChecked={organization.baseUserCanSeeBookings}
            />
            <label
              htmlFor={`baseUserBookings`}
              className=" hidden text-gray-500"
            >
              Toestaan
            </label>
          </div>
        </FormRow>

        <div className="text-right">
          <Button
            type="submit"
            disabled={disabled}
            name="intent"
            value="permissions"
          >
            {disabled ? <Spinner /> : "Opslaan"}
          </Button>
        </div>
      </Card>
    </fetcher.Form>
  ) : null;
};

export const EditWorkspaceSSOSettingsFormSchema = (sso: boolean = false) =>
  z.object({
    id: z.string(),
    selfServiceGroupId: sso
      ? z.string().min(1, "Self service groep id is vereist")
      : z.string().optional(),
    baseUserGroupId: sso
      ? z.string().min(1, "Basisgebruiker groep id is vereist")
      : z.string().optional(),
    adminGroupId: sso
      ? z.string().min(1, "Beheerder groep id is vereist")
      : z.string().optional(),
  });

const WorkspaceSSOEditForm = ({ className }: Props) => {
  const { organization } = useLoaderData<typeof loader>();
  const { isOwner } = useUserRoleHelper();
  const fetcher = useFetcher({ key: "sso" });
  const schema = EditWorkspaceSSOSettingsFormSchema(organization.enabledSso);
  const zo = useZorm("NewQuestionWizardScreen", schema);
  const disabled = useDisabled(fetcher);

  return isOwner && organization.enabledSso && organization.ssoDetails ? (
    <fetcher.Form ref={zo.ref} method="post" className="flex flex-col gap-2">
      <Card className={tw("my-0 ", className)}>
        <div className=" border-b pb-5">
          <h2 className=" text-[18px] font-semibold">SSO-gegevens</h2>
          <p>
            Voor deze werkruimte is SSO ingeschakeld, dus u kunt uw SSO-instellingen bekijken.
          </p>
        </div>
        <input type="hidden" value={organization.id} name="id" />

        <FormRow
          rowLabel={"SSO Domein"}
          className="border-b-0 pb-[10px]"
          subHeading={
            "Het domein waaraan deze werkruimte is gekoppeld. Neem contact op met support als u dit wilt wijzigen."
          }
          required
        >
          <Input
            label="SSO Domein"
            hideLabel
            disabled={true}
            className="disabled w-full"
            defaultValue={organization.ssoDetails.domain}
            required
          />
        </FormRow>

        <FormRow
          rowLabel={`Groep-ID voor beheerdersrol`}
          subHeading={
            <div>
              Plaats de ID van de groep die moet worden toegewezen aan de rol <b>Beheerder</b>.
            </div>
          }
          className="border-b-0 pb-[10px]"
          required
        >
          <Input
            label={"Groep-ID voor beheerdersrol"}
            hideLabel
            className="w-full"
            name={zo.fields.adminGroupId()}
            error={zo.errors.adminGroupId()?.message}
            defaultValue={organization.ssoDetails.adminGroupId || undefined}
            required
          />
        </FormRow>

        <FormRow
          rowLabel={`Groep-ID voor self service-rol`}
          subHeading={
            <div>
              Plaats de ID van de groep die moet worden toegewezen aan de rol <b>Self service</b>.
            </div>
          }
          className="border-b-0 pb-[10px]"
          required
        >
          <Input
            label={"Groep-ID voor self service-rol"}
            hideLabel
            name={zo.fields.selfServiceGroupId()}
            error={zo.errors.selfServiceGroupId()?.message}
            defaultValue={
              organization.ssoDetails.selfServiceGroupId || undefined
            }
            className="w-full"
            required
          />
        </FormRow>
        <FormRow
          rowLabel={`Groep-ID voor basisgebruikersrol`}
          subHeading={
            <div>
               Plaats de ID van de groep die moet worden toegewezen aan de rol <b>Basis</b>.
            </div>
          }
          className="border-b-0 pb-[10px]"
          required
        >
          <Input
            label={"Groep-ID voor basisgebruikersrol"}
            hideLabel
            name={zo.fields.baseUserGroupId()}
            error={zo.errors.baseUserGroupId()?.message}
            defaultValue={organization.ssoDetails.baseUserGroupId || undefined}
            className="w-full"
            required
          />
        </FormRow>
        <div className="text-right">
          <Button type="submit" disabled={disabled} name="intent" value="sso">
            {disabled ? <Spinner /> : "Opslaan"}
          </Button>
        </div>
      </Card>
    </fetcher.Form>
  ) : null;
};

/** Label branding row with live toggle preview */
function LabelBrandingRow({
  zo,
  organization,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zo: any;
  organization: { showShelfBranding: boolean; imageId?: string | null };
}) {
  const [showLogo, setShowLogo] = useState(organization.showShelfBranding ?? false);
  const logoSrc = organization.imageId ? `/api/image/${organization.imageId}` : null;

  return (
    <FormRow
      rowLabel={"Logo op labels"}
      className={"border-b-0"}
      subHeading={
        <p>
          Toon het logo van uw werkruimte op QR- en streepjescodelabels. Stel
          de hoofdafbeelding in via het veld hierboven.
        </p>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="hidden"
            name={zo.fields.showShelfBranding()}
            value="off"
          />
          <Switch
            id="showShelfBranding"
            name={zo.fields.showShelfBranding()}
            defaultChecked={showLogo}
            onCheckedChange={setShowLogo}
            aria-labelledby="showShelfBranding-label"
          />
          <label
            id="showShelfBranding-label"
            htmlFor="showShelfBranding"
            className="cursor-pointer text-[14px] font-medium text-gray-700"
          >
            Werkruimte-logo op labels weergeven
          </label>
        </div>

        {/* Live preview */}
        <div>
          <p className="mb-2 text-xs text-gray-500">Voorbeeldweergave label:</p>
          <div className="inline-block scale-75 origin-top-left">
            <QrLabel
              title="Voorbeeld asset"
              data={{ qr: { id: "QR-PREVIEW", src: "/static/images/qr-placeholder.png" } }}
              showShelfBranding={showLogo}
              orgLogoSrc={logoSrc}
              layout="square"
            />
          </div>
          {!logoSrc && showLogo && (
            <p className="mt-1 text-xs text-amber-600">
              Upload een hoofdafbeelding hierboven om het logo op labels te tonen.
            </p>
          )}
        </div>
      </div>
    </FormRow>
  );
}
