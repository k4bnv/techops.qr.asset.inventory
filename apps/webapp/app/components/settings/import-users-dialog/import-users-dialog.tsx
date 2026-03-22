import type { ChangeEvent, ReactElement } from "react";
import { cloneElement, useState } from "react";
import { UploadIcon } from "lucide-react";
import { useNavigate } from "react-router";
import type { z } from "zod";
import useFetcherWithReset from "~/hooks/use-fetcher-with-reset";
import { isFormProcessing } from "~/utils/form";
import { tw } from "~/utils/tw";
import ImportUsersSuccessContent from "./import-users-success-content";
import Input from "../../forms/input";
import { Dialog, DialogPortal } from "../../layout/dialog";
import { Button } from "../../shared/button";
import { WarningBox } from "../../shared/warning-box";
import When from "../../when/when";
import type { InviteUserFormSchema } from "../invite-user-dialog";

type ImportUsersDialogProps = {
  className?: string;
  trigger?: ReactElement<{ onClick: () => void }>;
};

type ImportUser = z.infer<typeof InviteUserFormSchema>;

export type FetcherData = {
  error?: { message?: string };
  success?: boolean;
  inviteSentUsers?: ImportUser[];
  skippedUsers?: ImportUser[];
  extraMessage?: string;
};

export default function ImportUsersDialog({
  className,
  trigger,
}: ImportUsersDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const fetcher = useFetcherWithReset<FetcherData>();
  const disabled = isFormProcessing(fetcher.state);

  function openDialog() {
    setIsDialogOpen(true);
  }

  function closeDialog() {
    fetcher.reset();
    setIsDialogOpen(false);
  }

  function handleSelectFile(event: ChangeEvent<HTMLInputElement>) {
    setError("");

    const file = event.target.files?.[0];
    if (file?.type !== "text/csv") {
      setError("Ongeldig bestandstype. Selecteer een CSV-bestand.");
      return;
    }

    setSelectedFile(file);
  }

  function goToInvites() {
    void navigate("/settings/team/invites");
    closeDialog();
  }

  return (
    <>
      {trigger ? (
        cloneElement(trigger, { onClick: openDialog })
      ) : (
        <Button
          type="button"
          variant="secondary"
          className="mt-2 w-full md:mt-0 md:w-max"
          onClick={openDialog}
        >
          <span className="whitespace-nowrap">Gebruikers importeren</span>
        </Button>
      )}

      <DialogPortal>
        <Dialog
          className={tw(
            "h-[calc(100vh_-_50px)] overflow-auto",
            !fetcher.data?.success && "md:w-[calc(100vw_-_200px)]",
            className
          )}
          open={isDialogOpen}
          onClose={closeDialog}
          title={
            <div className="mt-4 inline-flex items-center justify-center rounded-full border-4 border-solid border-primary-50 bg-primary-100 p-1.5 text-primary">
              <UploadIcon />
            </div>
          }
        >
          {fetcher.data?.success ? (
            <ImportUsersSuccessContent
              data={fetcher.data}
              onClose={closeDialog}
              onViewInvites={goToInvites}
            />
          ) : (
            <div className="px-6 pb-4 pt-2">
              <h3>Gebruikers uitnodigen via CSV-upload</h3>
              <p>
                Nodig meerdere gebruikers uit voor uw organisatie door een CSV-bestand te uploaden. Om te beginnen,{" "}
                <Button
                  variant="link"
                  to="/static/shelf.nu-example-import-users-from-content.csv"
                  target="_blank"
                  download
                >
                  download ons CSV-sjabloon.
                </Button>
              </p>
              <WarningBox className="my-4">
                <>
                  <strong>BELANGRIJK</strong>: Gebruik het meegeleverde sjabloon om de juiste opmaak te garanderen. Het uploaden van verkeerd geformatteerde bestanden kan fouten veroorzaken.
                </>
              </WarningBox>
              <h4>Basisregels en beperkingen</h4>
              <ul className="list-inside list-disc">
                <li>
                  U moet <b>, (komma)</b> als scheidingsteken gebruiken in uw CSV-bestand.
                </li>
                <li>
                  Alleen de rollen <b>ADMIN</b>, <b>BASE</b> en{" "}
                  <b>SELF_SERVICE</b> zijn geldig. De rolkolom is hoofdlettergevoelig.
                </li>
                <li>
                  Elke rij vertegenwoordigt een nieuwe gebruiker die moet worden uitgenodigd. Zorg ervoor dat de e-mailkolom geldig is.
                </li>
                <li>
                  Uigenedodigde gebruikers ontvangen een e-mail met een link om lid te worden van de organisatie.
                </li>
                <li>
                  <b>Optioneel</b>: U kunt de kolom <b>teamMemberId</b>{" "}
                  invullen als u de gebruiker wilt koppelen aan een bestaande NRM.
                </li>
              </ul>

              <h4 className="mt-2">Extra overwegingen</h4>
              <ul className="mb-4 list-inside list-disc">
                <li>
                  De eerste rij van het blad wordt genegeerd. Gebruik deze voor kolomkoppen zoals in het meegeleverde sjabloon.
                </li>
              </ul>

              <p className="mb-4">
                Zodra u uw bestand heeft geüpload, wordt een overzicht van de verwerkte uitnodigingen weergegeven, samen met eventuele fouten.
              </p>

              <fetcher.Form
                action="/api/settings/import-users"
                method="POST"
                encType="multipart/form-data"
              >
                <Input
                  inputType="textarea"
                  label="Voer uw bericht aan de gebruiker in"
                  name="message"
                  className="mb-2"
                  disabled={disabled}
                  rows={5}
                />

                <Input
                  type="file"
                  name="file"
                  label="Selecteer een CSV-bestand"
                  required
                  accept=".csv"
                  className="mb-2"
                  error={error}
                  onChange={handleSelectFile}
                  disabled={disabled}
                />

                <When truthy={!!fetcher?.data?.error}>
                  <p className="mb-2 text-sm  text-error-500">
                    {fetcher.data?.error?.message}
                  </p>
                </When>

                <Button type="submit" disabled={!selectedFile || disabled}>
                  Nu importeren
                </Button>
              </fetcher.Form>
            </div>
          )}
        </Dialog>
      </DialogPortal>
    </>
  );
}
