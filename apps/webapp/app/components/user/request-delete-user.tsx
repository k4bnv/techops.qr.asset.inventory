import { useEffect, useState } from "react";
import { useActionData } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { Button } from "~/components/shared/button";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/shared/modal";
import { useDisabled } from "~/hooks/use-disabled";
import { useUserData } from "~/hooks/use-user-data";
import type { action } from "~/routes/_layout+/account-details.general";
import { Form } from "../custom-form";
import Input from "../forms/input";
import { TrashIcon } from "../icons/library";

const ReasonSchema = z.object({
  email: z.string().email(),
  reason: z.string().min(3, "Reden is een verplicht veld"),
});

const CodeSchema = z.object({
  code: z.string().length(6, "Code moet 6 cijfers zijn"),
});

export const RequestDeleteUser = () => {
  const disabled = useDisabled();
  const user = useUserData();
  const actionData = useActionData<typeof action>();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"reason" | "code">("reason");
  const zoReason = useZorm("RequestDeleteReason", ReasonSchema);
  const zoCode = useZorm("RequestDeleteCode", CodeSchema);

  useEffect(() => {
    if (actionData && !actionData?.error) {
      if ((actionData as any).codeSent) {
        setStep("code");
      }
      if ((actionData as any).deleteRequestSent) {
        setOpen(false);
        setStep("reason");
      }
    }
  }, [actionData]);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) setStep("reason");
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          data-test-id="deleteUserButton"
          variant="danger"
          className="mt-3"
        >
          Verwijderverzoek verzenden
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        {step === "reason" ? (
          <Form method="post" className="" ref={zoReason.ref}>
            <AlertDialogHeader>
              <div className="mx-auto md:m-0">
                <span className="flex size-12 items-center justify-center rounded-full bg-error-50 p-2 text-error-600">
                  <TrashIcon />
                </span>
              </div>
              <AlertDialogTitle>
                Weet u zeker dat u uw account wilt verwijderen?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Om uw account te verwijderen, moet u een verzoek indienen dat
                binnen de volgende 72 uur wordt verwerkt. Het verwijderen van
                een account is definitief en kan niet ongedaan worden gemaakt.
                <br />
                <br />
                <strong className="text-gray-900">
                  Het verwijderen van de gebruiker verwijdert ook:
                </strong>
              </AlertDialogDescription>
              <ul className="!mt-0 list-inside list-disc">
                <li>Alle gegevens van de gebruiker</li>
                <li>Alle werkruimtes van de gebruiker</li>
              </ul>
              <Input
                inputType="textarea"
                name={zoReason.fields.reason()}
                label="Reden voor het verwijderen van uw account"
                required
                error={zoReason.errors.reason()?.message}
              />
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-3">
              <div className="flex justify-center gap-2">
                <AlertDialogCancel asChild>
                  <Button variant="secondary" disabled={disabled} type="button">
                    Annuleren
                  </Button>
                </AlertDialogCancel>
                <input
                  type="hidden"
                  name={zoReason.fields.email()}
                  value={user?.email}
                />
                <input
                  type="hidden"
                  name="intent"
                  value="initiateDeleteAccount"
                />
                <input
                  type="hidden"
                  name="type"
                  value="initiateDeleteAccount"
                />
                <Button
                  className="border-error-600 bg-error-600 hover:border-error-800 hover:bg-error-800"
                  type="submit"
                  data-test-id="confirmdeleteUserButton"
                  disabled={disabled}
                >
                  Doorgaan
                </Button>
              </div>
            </AlertDialogFooter>
          </Form>
        ) : (
          <Form method="post" className="" ref={zoCode.ref}>
            <AlertDialogHeader>
              <div className="mx-auto md:m-0">
                <span className="flex size-12 items-center justify-center rounded-full bg-error-50 p-2 text-error-600">
                  <TrashIcon />
                </span>
              </div>
              <AlertDialogTitle>Bevestig met verificatiecode</AlertDialogTitle>
              <AlertDialogDescription>
                Er is een 6-cijferige bevestigingscode verzonden naar{" "}
                <strong>{user?.email}</strong>. Voer de code hieronder in om uw
                verwijderverzoek te bevestigen.
              </AlertDialogDescription>
              <Input
                name={zoCode.fields.code()}
                label="Verificatiecode"
                placeholder="000000"
                maxLength={6}
                required
                error={zoCode.errors.code()?.message}
                autoFocus
              />
              {actionData?.error && (
                <p className="text-sm text-error-600">
                  {actionData.error.message}
                </p>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-3">
              <div className="flex justify-center gap-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setStep("reason")}
                  disabled={disabled}
                >
                  Terug
                </Button>
                <input type="hidden" name="email" value={user?.email} />
                <input
                  type="hidden"
                  name="intent"
                  value="verifyDeleteAccount"
                />
                <input type="hidden" name="type" value="verifyDeleteAccount" />
                <Button
                  className="border-error-600 bg-error-600 hover:border-error-800 hover:bg-error-800"
                  type="submit"
                  data-test-id="verifyDeleteUserButton"
                  disabled={disabled}
                >
                  Account verwijderen
                </Button>
              </div>
            </AlertDialogFooter>
          </Form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
