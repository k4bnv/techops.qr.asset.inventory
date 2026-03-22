import { useState } from "react";
import { Roles } from "@prisma/client";
import { Form, useActionData } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { useCurrentOrganization } from "~/hooks/use-current-organization";
import { useDisabled } from "~/hooks/use-disabled";
import { useUserData } from "~/hooks/use-user-data";
import { useUserRoleHelper } from "~/hooks/user-user-role-helper";
import { getValidationErrors } from "~/utils/http";
import type { DataOrErrorResponse } from "~/utils/http.server";
import type { OwnerSubscriptionInfo } from "~/utils/stripe.server";
import { tw } from "~/utils/tw";
import { resolveTeamMemberName } from "~/utils/user";
import { InnerLabel } from "../forms/inner-label";
import Input from "../forms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../forms/select";
import Icon from "../icons/icon";
import { Button } from "../shared/button";
import { Card } from "../shared/card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../shared/modal";
import { WarningBox } from "../shared/warning-box";
import When from "../when/when";

type Admin = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

type TransferOwnershipCardProps = {
  className?: string;
  /** Form action URL. Defaults to "/settings/general" */
  action?: string;
  /** Organization name for confirmation input. If not provided, uses currentOrganization from context */
  organizationName?: string;
  /** List of admins eligible to become the new owner */
  admins: Admin[];
  /** Subscription info for the current workspace owner */
  ownerSubscriptionInfo: OwnerSubscriptionInfo;
  /** Number of other team workspaces the owner has */
  ownerOtherTeamWorkspacesCount: number;
  /** Whether premium/subscription features are enabled */
  premiumIsEnabled: boolean;
};

export const TransferOwnershipSchema = z.object({
  newOwner: z.string().min(1, "Nieuwe eigenaar is vereist"),
  agreeConditions: z
    .string({
      required_error: "U moet akkoord gaan met het wijzigen van de eigenaar van de werkruimte",
    })
    .transform((value) => value === "on")
    .pipe(
      z.boolean().refine((value) => value, {
        message: "U moet akkoord gaan met het wijzigen van de eigenaar van de werkruimte",
      })
    ),
  transferSubscription: z
    .string()
    .optional()
    .transform((value) => value === "on"),
});

export default function TransferOwnershipCard({
  className,
  action = "/settings/general",
  organizationName,
  admins,
  ownerSubscriptionInfo,
  ownerOtherTeamWorkspacesCount,
  premiumIsEnabled,
}: TransferOwnershipCardProps) {
  const { isOwner } = useUserRoleHelper();
  const user = useUserData();
  const [confirmationInput, setConfirmationInput] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<Admin | null>(null);
  const [transferSubscription, setTransferSubscription] = useState(false);
  const disabled = useDisabled();
  const currentOrganization = useCurrentOrganization();

  // Use provided organizationName or fall back to currentOrganization
  const confirmationOrgName = organizationName ?? currentOrganization?.name;

  const zo = useZorm("TransferOwnership", TransferOwnershipSchema);
  const actionData = useActionData<DataOrErrorResponse>();

  /** This handles server side errors in case client side validation fails */
  const validationErrors = getValidationErrors<typeof TransferOwnershipSchema>(
    actionData?.error
  );

  const isShelfAdmin = user?.roles?.some((role) => role.name === Roles.ADMIN);

  // Check if current owner has subscriptions that could be transferred
  const ownerHasSubscription =
    premiumIsEnabled && ownerSubscriptionInfo?.hasActiveSubscription;

  const subscriptionCount = ownerSubscriptionInfo?.subscriptions?.length ?? 0;

  // Get general server error (non-validation errors like "user already has subscription")
  const serverError =
    actionData?.error?.message && !validationErrors
      ? actionData.error.message
      : null;

  if (!isOwner && !isShelfAdmin) {
    return null;
  }

  return (
    <Card className={tw(className)}>
      <h4 className="mb-1 text-text-lg font-semibold">
        Eigendom van werkruimte overdragen
      </h4>
      <p className="mb-2 text-sm text-gray-600">
        Draag de werkruimte over aan een andere gebruiker. Om de werkruimte over te dragen, moet de nieuwe eigenaar al deel uitmaken van de werkruimte als beheerder.
      </p>

      <When
        truthy={admins.length > 0}
        fallback={
          <Button
            type="button"
            disabled={{
              reason:
                "Geen beheerders gevonden in deze werkruimte. Voeg een beheerder toe voordat u het eigendom overdraagt.",
            }}
          >
            Eigendom overdragen
          </Button>
        }
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="secondary">
              Eigendom overdragen
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent aria-describedby="Eigendom overdragen">
            <AlertDialogHeader>
              <AlertDialogTitle>Eigendom van werkruimte overdragen</AlertDialogTitle>
              <AlertDialogDescription>
                Draag de werkruimte over aan een andere gebruiker. Om de werkruimte over te dragen, moet de nieuwe eigenaar al deel uitmaken van de werkruimte als beheerder.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Form
              method="POST"
              encType="multipart/form-data"
              ref={zo.ref}
              action={action}
            >
              <input type="hidden" name="intent" value="transfer-ownership" />

              {/* Server error display */}
              <When truthy={!!serverError}>
                <p className="mb-4 text-sm text-error-500">{serverError}</p>
              </When>

              <InnerLabel>Nieuwe eigenaar</InnerLabel>
              <Select
                name={zo.fields.newOwner()}
                onValueChange={(value) => {
                  const newOwner = admins.find((admin) => admin.id === value);
                  setSelectedOwner(newOwner ?? null);
                  // Reset subscription transfer checkbox when changing owner
                  setTransferSubscription(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer nieuwe eigenaar" />
                </SelectTrigger>

                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {resolveTeamMemberName({ name: "", user: admin }, true)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <When
                truthy={
                  !!(
                    validationErrors?.newOwner?.message ||
                    zo.errors?.newOwner()?.message
                  )
                }
              >
                <p className="text-sm text-error-500">
                  {validationErrors?.newOwner?.message ||
                    zo.errors?.newOwner()?.message}
                </p>
              </When>

              <When truthy={!!selectedOwner}>
                {/* Subscription Info Section */}
                <When truthy={ownerHasSubscription}>
                  <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Icon icon="coins" />
                      <span>Abonnementsinformatie</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      U heeft de volgende actieve{" "}
                      {subscriptionCount === 1
                        ? "abonnement"
                        : "abonnementen"}
                      :
                    </p>
                    <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                      {ownerSubscriptionInfo.subscriptions.map((sub) => (
                        <li key={`${sub.subscriptionId}-${sub.type}`}>
                          <span className="font-semibold">
                            {sub.subscriptionName}
                          </span>
                          {sub.type === "addon" ? " (add-on)" : ""}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3">
                      <div className="flex cursor-pointer select-none items-start gap-2 py-2 text-sm">
                        <input
                          id="transferSubscription"
                          name="transferSubscription"
                          type="checkbox"
                          checked={transferSubscription}
                          onChange={(e) =>
                            setTransferSubscription(e.target.checked)
                          }
                          aria-describedby="transferSubscription-description"
                          className="mt-0.5 rounded-sm checked:bg-primary focus-within:ring-primary checked:hover:bg-primary checked:focus:bg-primary"
                        />
                        <div>
                          <label
                            htmlFor="transferSubscription"
                            className="font-medium"
                          >
                            Draag mijn{" "}
                            {subscriptionCount === 1
                              ? "abonnement"
                              : "abonnementen"}{" "}
                            over aan de nieuwe eigenaar
                          </label>
                          <p
                            id="transferSubscription-description"
                            className="mt-1 text-gray-500"
                          >
                            De nieuwe eigenaar gaat door met de huidige facturerings
                            {subscriptionCount === 1 ? "cyclus" : "cycli"}. Ze
                            moeten hun eigen betaalmethode toevoegen voor de
                            volgende factuurdatum.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning for multiple workspaces */}
                  <When
                    truthy={
                      transferSubscription && ownerOtherTeamWorkspacesCount > 0
                    }
                  >
                    <WarningBox className="mt-3">
                      <span className="font-semibold">
                        Meerdere werkruimtes beïnvloed
                      </span>
                      <p className="mt-1 text-sm">
                        U bezit {ownerOtherTeamWorkspacesCount} andere team{" "}
                        {ownerOtherTeamWorkspacesCount === 1
                          ? "werkruimte"
                          : "werkruimtes"}
                        . Als u uw abonnement overdraagt, verliezen die werkruimtes premiumfuncties totdat u zich opnieuw abonneert.
                      </p>
                    </WarningBox>
                  </When>
                </When>

                <p className="mb-2 mt-4">
                  U staat op het punt het eigendom van deze werkruimte over te dragen aan
                  <span className="ml-1 font-semibold">
                    {resolveTeamMemberName(
                      { name: "", user: selectedOwner },
                      true
                    )}
                  </span>
                  . Deze actie kan niet ongedaan worden gemaakt.
                </p>
                <p>Waarschuwing - U zult:</p>
                <ul className="mb-2 list-inside list-disc">
                  <li>Eigendomsrechten van deze werkruimte verliezen</li>
                  <li>Niet langer facturering kunnen beheren</li>
                  <li>Een beheerderslid worden</li>
                  <When truthy={transferSubscription}>
                    <li>
                      Uw{" "}
                      {subscriptionCount === 1
                        ? "abonnement"
                        : "abonnementen"}{" "}
                      overdragen aan{" "}
                      {resolveTeamMemberName(
                        { name: "", user: selectedOwner },
                        true
                      )}
                    </li>
                  </When>
                </ul>

                <div className="mb-2">
                  <p>
                    Typ de werkruimtenaam exact zoals weergegeven om deze overdracht te bevestigen:
                  </p>
                  <Input
                    label=""
                    placeholder="Voer werkruimtenaam in om te bevestigen"
                    value={confirmationInput}
                    onChange={(event) => {
                      setConfirmationInput(event.target.value);
                    }}
                  />
                  <p className="text-sm text-gray-500">
                    Verwachte invoer: {confirmationOrgName}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor={zo.fields.agreeConditions()}
                    className={tw(
                      "flex cursor-pointer select-none items-center gap-2 py-2 text-sm"
                    )}
                  >
                    <input
                      id={zo.fields.agreeConditions()}
                      name={zo.fields.agreeConditions()}
                      type="checkbox"
                      className="rounded-sm checked:bg-primary focus-within:ring-primary checked:hover:bg-primary checked:focus:bg-primary"
                    />

                    <span>Ik begrijp dat deze actie niet ongedaan kan worden gemaakt.</span>
                  </label>
                  <When
                    truthy={
                      !!(
                        validationErrors?.agreeConditions?.message ||
                        zo.errors?.agreeConditions()?.message
                      )
                    }
                  >
                    <p className="text-sm text-error-500">
                      {validationErrors?.agreeConditions?.message ||
                        zo.errors?.agreeConditions()?.message}
                    </p>
                  </When>
                </div>
              </When>

              <AlertDialogFooter className="mt-4 flex items-center gap-2">
                <AlertDialogCancel asChild>
                  <Button
                    disabled={disabled}
                    className="flex-1"
                    variant="secondary"
                    type="button"
                  >
                    Annuleren
                  </Button>
                </AlertDialogCancel>

                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    !selectedOwner
                      ? { reason: "Selecteer een nieuwe eigenaar." }
                      : confirmationInput !== confirmationOrgName
                      ? {
                          reason: "Typ de werkruimtenaam om te bevestigen.",
                        }
                      : disabled
                  }
                >
                  Eigendom overdragen
                </Button>
              </AlertDialogFooter>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
      </When>
    </Card>
  );
}
