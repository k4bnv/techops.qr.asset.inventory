import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { parseFormData } from "@remix-run/form-data-parser";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, useFetcher } from "react-router";
import Input from "~/components/forms/input";
import { UserIcon } from "~/components/icons/library";
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
import { WarningBox } from "~/components/shared/warning-box";
import type { CreateAssetFromContentImportPayload } from "~/modules/asset/types";
import { createTeamMemberIfNotExists } from "~/modules/team-member/service.server";
import styles from "~/styles/layout/custom-modal.css?url";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { makeShelfError } from "~/utils/error";
import { isFormProcessing } from "~/utils/form";
import { payload, error } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";
import { assertUserCanImportNRM } from "~/utils/subscription.server";

export const meta = () => [{ title: appendToMetaTitle("Teamleden importeren") }];

export async function loader({ context, request }: LoaderFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId, organizations } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.teamMember,
      action: PermissionAction.create,
    });
    await assertUserCanImportNRM({ organizationId, organizations });

    return payload({
      showModal: true,
    });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export async function action({ context, request }: ActionFunctionArgs) {
  const authSession = context.getSession();
  const { userId } = authSession;

  try {
    const { organizationId, organizations } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.teamMember,
      action: PermissionAction.create,
    });

    await assertUserCanImportNRM({ organizationId, organizations });

    // Files are automatically stored in memory with parseFormData
    const formData = await parseFormData(request);

    const csvFile = formData.get("file") as File;
    const text = await csvFile.text();
    const memberNames = text.split(",").map((name) => name.trim());

    // Transform member names into format expected by createTeamMemberIfNotExists
    const importData: CreateAssetFromContentImportPayload[] = memberNames.map(
      (name) => ({
        key: "", // Required by type but unused
        title: "", // Required by type but unused
        tags: [], // Required by type but unused
        custodian: name,
      })
    );

    await createTeamMemberIfNotExists({
      data: importData,
      organizationId,
    });

    return payload({ success: true });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function ImportNRMs() {
  return (
    <>
      <div className="modal-content-wrapper">
        <div className="mb-4 inline-flex size-8 items-center justify-center  rounded-full bg-primary-100 p-2 text-primary-600">
          <UserIcon />
        </div>
        <div className="mb-5">
          <h4>Teamleden importeren</h4>
          <p>
            Teamleden hebben slechts 1 veld en dat is een naamveld. Het importeren van
            teamleden vereist alleen het uploaden van een txt-bestand met lidnamen
            gescheiden door komma's.
            <br />
            <ul className="list-inside list-disc pl-4">
              <li>Namen die al in het systeem staan, worden genegeerd.</li>
              <li>Duplicaten worden overgeslagen.</li>
            </ul>
            <WarningBox className="my-2">
              De import is definitief en kan niet ongedaan worden gemaakt. Als u later teamleden wilt bewerken, kunt u dit doen via de pagina Teaminstellingen.
            </WarningBox>
          </p>
        </div>
        <ImportForm />
      </div>
    </>
  );
}

function ImportForm() {
  const [agreed, setAgreed] = useState<"IK GA AKKOORD" | "">("");
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<typeof action>();

  const { data, state } = fetcher;
  const disabled = isFormProcessing(state) || agreed !== "IK GA AKKOORD";
  const isSuccessful = data && !data.error && data.success;

  /** We use a controlled field for the file, because of the confirmation dialog we have.
   * That way we can disabled the confirmation dialog button until a file is selected
   */
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event?.target?.files?.[0];
    if (selectedFile) {
      setSelectedFile(selectedFile);
    }
  };
  return (
    <fetcher.Form
      className="mt-4"
      method="post"
      ref={formRef}
      encType="multipart/form-data"
    >
      <Input
        type="file"
        name="file"
        label="Selecteer een txt-bestand"
        required
        onChange={handleFileSelect}
        accept=".txt"
      />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            title={"Bevestig NRM-import"}
            disabled={!selectedFile}
            className="mt-4 w-full"
          >
            Bevestig import van niet-geregistreerde leden
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bevestig import van niet-geregistreerde leden
            </AlertDialogTitle>
            {!isSuccessful ? (
              <>
                <AlertDialogDescription>
                  U moet: <b>"IK GA AKKOORD"</b> typen in het onderstaande veld om de
                  import te accepteren. Hiermee gaat u akkoord dat u de vereisten heeft gelezen en de beperkingen en gevolgen van het gebruik van deze functie begrijpt.
                </AlertDialogDescription>
                <Input
                  type="text"
                  label={"Bevestiging"}
                  name="agree"
                  value={agreed}
                  onChange={(e) => setAgreed(e.target.value as any)}
                  placeholder="IK GA AKKOORD"
                  pattern="^IK GA AKKOORD$" // We use a regex to make sure the user types the exact string
                  required
                />
              </>
            ) : null}
          </AlertDialogHeader>
          {data?.error ? (
            <div>
              <b className="text-red-500">{data.error.message}</b>
              <p>
                Corrigeer uw txt-bestand en probeer het opnieuw. Als het probleem
                aanhoudt, aarzel dan niet om contact met ons op te nemen.
              </p>
            </div>
          ) : null}

          {isSuccessful ? (
            <div>
              <b className="text-green-500">Succes!</b>
              <p>Uw niet-geregistreerde leden zijn geïmporteerd.</p>
            </div>
          ) : null}

          <AlertDialogFooter>
            {isSuccessful ? (
              <Button to="/settings/team/nrm" variant="secondary">
                Sluiten
              </Button>
            ) : (
              <>
                <AlertDialogCancel asChild>
                  <Button type="button" variant="secondary">
                    Annuleren
                  </Button>
                </AlertDialogCancel>
                <Button
                  type="submit"
                  onClick={() => {
                    // Because we use a Dialog the submit buttons is outside of the form so we submit using the fetcher directly
                    void fetcher.submit(formRef.current);
                  }}
                  disabled={disabled}
                >
                  {isFormProcessing(fetcher.state) ? "Importeren..." : "Importeren"}
                </Button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </fetcher.Form>
  );
}
