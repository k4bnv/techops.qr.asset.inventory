import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import useFetcherWithReset from "~/hooks/use-fetcher-with-reset";
import type { DuplicateBarcode } from "~/modules/barcode/service.server";
import type { QRCodePerImportedAsset } from "~/modules/qr/service.server";
import type { action } from "~/routes/_layout+/assets.import";
import { isFormProcessing } from "~/utils/form";
import { useBarcodePermissions } from "~/utils/permissions/use-barcode-permissions";
import Input from "../forms/input";
import { Button } from "../shared/button";
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
import { Table, Td, Th, Tr } from "../table";
import When from "../when/when";

export const ImportContent = () => {
  const { canUseBarcodes } = useBarcodePermissions();

  return (
    <div className="text-left">
      <h3>Eigen inhoud importeren</h3>
      <p>
        Importeer uw eigen inhoud door deze in het csv-bestand te plaatsen. Hier
        kunt u{" "}
        <Button
          variant="link"
          to={
            canUseBarcodes
              ? "/static/shelf.nu-example-asset-import-from-content-with-barcodes.csv"
              : "/static/shelf.nu-example-asset-import-from-content.csv"
          }
          target="_blank"
          download
        >
          onze CSV-sjabloon downloaden.
        </Button>{" "}
      </p>
      <WarningBox className="my-4">
        <>
          <strong>BELANGRIJK</strong>: Gebruik geen gegevens die zijn
          geëxporteerd uit een asset-back-up om assets te importeren. U moet de
          hierboven verstrekte sjabloon gebruiken, anders krijgt u corrupte
          gegevens.
        </>
      </WarningBox>
      <h4>Basisregels en beperkingen</h4>
      <ul className="list-inside list-disc">
        <li>
          U moet <b>, (komma)</b> of <b>; (puntkomma)</b> gebruiken als
          scheidingsteken in uw csv-bestand
        </li>
        <li>Elke rij vertegenwoordigt een nieuw asset dat zal worden aangemaakt</li>
        <li>
          Kolommen zoals <b>kit, categorie, locatie & beheerder</b>{" "}
          vertegenwoordigen alleen de naam van de gerelateerde invoer. Als
          voorbeeld: als u de categorie <b>Laptops</b> invult, zoeken we naar
          een bestaande categorie met die naam en koppelen we het asset daaraan.
          Als deze niet bestaat, maken we deze aan.
        </li>
        <li>
          Kolommen zoals <b>tags</b> vertegenwoordigen de namen van een
          verzameling vermeldingen. Om meerdere tags toe te wijzen, scheidt u
          hun namen gewoon met komma's. Als de tag niet bestaat, maken we deze
          aan.
        </li>
        <li>
          De inhoud die u importeert zal <b>NIET</b> worden samengevoegd met
          bestaande assets. Er wordt een nieuw asset aangemaakt voor elke
          geldige rij in het blad.
        </li>
      </ul>

      <h4 className="mt-2">Aangepaste velden importeren</h4>
      <div>
        Om aangepaste velden te importeren, laat u de kolomkop voorafgaan door{" "}
        <b>"cf: "</b>, <br />
        voeg het type toe gevolgd door een komma uit een van de toegestane
        types:
        <ul className="list-inside list-disc pl-4">
          <li>
            <b>text</b> - standaard als er geen type wordt doorgegeven
          </li>
          <li>
            <b>boolean</b> - kies een ja of nee waarde
          </li>
          <li>
            <b>option</b> - u hoeft de opties niet aangemaakt te hebben, wij
            maken de optie (zowel het veld als de optie) aan tijdens het
            importeren als de optie niet bestaat.
          </li>
          <li>
            <b>multiline text</b> - tekst met meerdere regels
          </li>
          <li>
            <b>date</b> - moet in het formaat <b>JJJJ-MM-DD</b> zijn
          </li>
          <li>
            <b>amount</b> - voor valutawaarden (bijv. 1234.56 - geen
            valutasymbolen)
          </li>
          <li>
            <b>number</b> - voor numerieke waarden inclusief negatieven (bijv.
            -123.45)
          </li>
        </ul>
        Als er geen type wordt vermeld, wordt <b>"text"</b> als standaardtype
        gebruikt.
      </div>
      <div>
        Dit is hoe een voorbeeldkop eruit ziet voor een aangepast veld met de
        naam <b>"purchase date"</b> en type <b>"date"</b> :{" "}
        <b>"cf:purchase date, type:date"</b>
      </div>

      <h4 className="mt-2">Importeren met QR-codes</h4>
      <div>
        U heeft ook de optie om een TechOps QR-code te gebruiken voor elk
        asset. Dit is zeer waardevol als u al TechOps QR-codes heeft geprint en
        u deze wilt koppelen aan de assets die u importeert.
        <br />
        Deze functie heeft de volgende beperkingen:
        <ul className="list-inside list-disc pl-4">
          <li>
            <b>Bestaande code</b> - de QR-code moet al aanwezig zijn in het systeem
          </li>
          <li>
            <b>Geen dubbele codes</b> - de qrId moet uniek zijn voor elk asset
          </li>
          <li>
            <b>Geen gekoppelde codes</b> - de qrId mag niet gekoppeld zijn aan
            een asset of kit
          </li>
          <li>
            <b>QR-eigendom</b> - de QR-code moet ofwel niet-geclaimd zijn,
            ofwel behoren tot de organisatie waarnaar u deze probeert te
            importeren.
          </li>
        </ul>
        Als er geen <b>"qrId"</b> wordt gebruikt, wordt er een nieuwe QR-code
        gegenereerd.
        <br />
        Als u geïnteresseerd bent in het ontvangen van niet-geclaimde of
        niet-gekoppelde codes, neem dan gerust contact op met de ondersteuning
        en wij kunnen deze voor u verstrekken.
      </div>

      <When truthy={canUseBarcodes}>
        <h4 className="mt-2">Importeren met barcodes</h4>
        <div>
          U kunt ook assets importeren met barcodes via de barcode-kolommen.
          Deze functie ondersteunt drie barcode-types: <b>Code128</b>,{" "}
          <b>Code39</b> en <b>DataMatrix</b>.
          <br />
          <br />
          <b>Formaat barcode-kolom:</b>
          <ul className="list-inside list-disc pl-4">
            <li>
              <b>barcode_Code128</b> - Voor Code128-barcodes (4-40 tekens,
              ondersteunt letters, cijfers en symbolen zoals streepjes)
            </li>
            <li>
              <b>barcode_Code39</b> - Voor Code39-barcodes (4-43 tekens)
            </li>
            <li>
              <b>barcode_DataMatrix</b> - Voor DataMatrix-barcodes (4-100
              tekens)
            </li>
            <li>
              <b>barcode_ExternalQR</b> - Voor externe QR-codes (1-2048 tekens,
              URL's, tekst of enige externe QR-inhoud)
            </li>
            <li>
              <b>barcode_EAN13</b> - Voor retail-barcodes (13-cijferige
              productidentificatiecodes))
            </li>
          </ul>
          <br />
          <b>Belangrijke regels:</b>
          <ul className="list-inside list-disc pl-4">
            <li>
              <b>Meerdere barcodes</b> - Gebruik komma-scheiding voor meerdere
              barcodes van hetzelfde type (bijv. "ABC123,DEF456")
            </li>
            <li>
              <b>Unieke waarden</b> - Elke barcodewaarde moet uniek zijn binnen
              uw organisatie
            </li>
            <li>
              <b>Tekenbeperkingen</b> - Code39 en DataMatrix staan alleen
              letters en cijfers toe, Code128 ondersteunt de meeste symbolen
            </li>
            <li>
              <b>Niet hoofdlettergevoelig</b> - Waarden worden automatisch
              omgezet naar hoofdletters
            </li>
          </ul>
          Laat barcode-kolommen leeg als u geen barcodes wilt toewijzen aan
          specifieke assets.
        </div>
      </When>

      <div>
        <h4 className="mt-2">Extra overwegingen</h4>
        <ul className="list-inside list-disc pl-4">
          <li>
            De eerste rij van het blad wordt genegeerd. Gebruik deze om de
            kolommen te beschrijven zoals in het voorbeeldblad.
          </li>
          <li>
            Als gegevens in het bestand ongeldig zijn, zal de hele import
            mislukken
          </li>
        </ul>
      </div>

      <div className="mt-2 w-full">
        Voor meer hulp kunt u onze{" "}
        <Button
          variant="link"
          to="https://www.shelf.nu/csv-helper"
          target="_blank"
        >
          CSV-hulpmiddel
        </Button>
        .
      </div>

      <FileForm intent={"content"} />
    </div>
  );
};

export const FileForm = ({ intent, url }: { intent: string; url?: string }) => {
  const [agreed, setAgreed] = useState<"IK GA AKKOORD" | "">("");
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcherWithReset<typeof action>();

  const { data, state } = fetcher;
  const disabled = isFormProcessing(state) || agreed !== "IK GA AKKOORD";
  const isSuccessful = data && !data.error;
  //

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
      className="mt-4 w-full"
      method="post"
      ref={formRef}
      encType="multipart/form-data"
      action={url ? url : undefined}
    >
      <Input
        type="file"
        name="file"
        label="Selecteer een csv-bestand"
        required
        onChange={handleFileSelect}
        accept=".csv"
      />
      <input type="hidden" name="intent" value={intent} />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            // Reset form state when dialog is closed
            setAgreed("");
            fetcher.reset();
          }
        }}
      >
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            title={"Asset-import bevestigen"}
            disabled={!selectedFile}
            className="my-4"
          >
            Asset-import bevestigen
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-[600px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Asset-import bevestigen</AlertDialogTitle>
            {!isSuccessful ? (
              <>
                <AlertDialogDescription>
                  U moet <b>"IK GA AKKOORD"</b> typen in het onderstaande veld om de import
                  te accepteren. Hiermee gaat u akkoord dat u de vereisten heeft
                  gelezen en de beperkingen en gevolgen van het gebruik van deze
                  functie begrijpt.
                </AlertDialogDescription>
                <Input
                  type="text"
                  label={"Bevestiging"}
                  autoFocus
                  name="agree"
                  value={agreed}
                  onChange={(e) =>
                    setAgreed(e.target.value.toUpperCase() as any)
                  }
                  placeholder="IK GA AKKOORD"
                  pattern="^IK GA AKKOORD$" // We use a regex to make sure the user types the exact string
                  required
                  onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      e.preventDefault();
                      // Because we use a Dialog the submit buttons is outside of the form so we submit using the fetcher directly
                      if (!disabled) {
                        void fetcher.submit(formRef.current);
                      }
                    }
                  }}
                />
              </>
            ) : null}
          </AlertDialogHeader>

          <When truthy={!!data?.error}>
            <div className="overflow-y-scroll">
              <h5 className="text-red-500">{data?.error?.title}</h5>
              <p className="text-red-500">{data?.error?.message}</p>
              {data?.error?.additionalData?.duplicateCodes ? (
                <BrokenQrCodesTable
                  title="Dubbele codes"
                  data={
                    data.error.additionalData
                      .duplicateCodes as QRCodePerImportedAsset[]
                  }
                />
              ) : null}
              {data?.error?.additionalData?.nonExistentCodes ? (
                <BrokenQrCodesTable
                  title="Niet-bestaande codes"
                  data={
                    data.error.additionalData
                      .nonExistentCodes as QRCodePerImportedAsset[]
                  }
                />
              ) : null}
              {data?.error?.additionalData?.linkedCodes ? (
                <BrokenQrCodesTable
                  title="Al gekoppelde codes"
                  data={
                    data.error.additionalData
                      .linkedCodes as QRCodePerImportedAsset[]
                  }
                />
              ) : null}
              {data?.error?.additionalData?.connectedToOtherOrgs ? (
                <BrokenQrCodesTable
                  title="Sommige codes behoren niet tot deze organisatie"
                  data={
                    data.error.additionalData
                      .connectedToOtherOrgs as QRCodePerImportedAsset[]
                  }
                />
              ) : null}

              {data?.error?.additionalData?.duplicateBarcodes ? (
                <DuplicateBarcodesTable
                  data={
                    data.error.additionalData
                      .duplicateBarcodes as DuplicateBarcode[]
                  }
                />
              ) : null}

              {data?.error?.additionalData?.kitCustodyConflicts ? (
                <table className="mt-4 w-full rounded-md border text-left text-sm">
                  <thead className="bg-error-100 text-xs">
                    <tr>
                      <th scope="col" className="px-2 py-1">
                        Asset
                      </th>
                      <th scope="col" className="px-2 py-1">
                        Beheerder
                      </th>
                      <th scope="col" className="px-2 py-1">
                        Kit
                      </th>
                      <th scope="col" className="px-2 py-1">
                        Probleem
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      data.error.additionalData.kitCustodyConflicts as Array<{
                        asset: string;
                        custodian: string;
                        kit: string;
                        issue: string;
                      }>
                    ).map((conflict, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="px-2 py-1">{conflict.asset}</td>
                        <td className="px-2 py-1">{conflict.custodian}</td>
                        <td className="px-2 py-1">{conflict.kit}</td>
                        <td className="px-2 py-1">{conflict.issue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}

              {Array.isArray(data?.error?.additionalData?.defectedHeaders) ? (
                <table className="mt-4 w-full rounded-md border text-left text-sm">
                  <thead className="bg-error-100 text-xs">
                    <tr>
                      <th scope="col" className="px-2 py-1">
                        Onjuiste kop
                      </th>
                      <th scope="col" className="px-2 py-1">
                        Fout
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.error?.additionalData?.defectedHeaders?.map(
                      (data: {
                        incorrectHeader: string;
                        errorMessage: string;
                      }) => (
                        <tr key={data.incorrectHeader}>
                          <td className="px-2 py-1">{data.incorrectHeader}</td>
                          <td className="px-2 py-1">{data.errorMessage}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : null}

              <p className="mt-2">
                Herstel uw CSV-bestand en probeer het opnieuw. Als het probleem
                aanhoudt, aarzel dan niet om contact met ons op te nemen.
              </p>
            </div>
          </When>

          <When truthy={isSuccessful}>
            <div>
              <b className="text-green-500">Succes!</b>
              <p>Uw assets zijn geïmporteerd.</p>
            </div>
          </When>

          <AlertDialogFooter>
            {isSuccessful ? (
              <div className="flex gap-2">
                <AlertDialogCancel asChild>
                  <Button type="button" variant="secondary" width="full">
                    Sluiten
                  </Button>
                </AlertDialogCancel>
                <Button to="/assets" width="full" className="whitespace-nowrap">
                  Nieuwe assets bekijken
                </Button>
              </div>
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
};

function BrokenQrCodesTable({
  title,
  data,
}: {
  title: string;
  data: QRCodePerImportedAsset[];
}) {
  return (
    <div className="mt-3">
      <h5>{title}</h5>
      <Table className="mt-1 [&_td]:p-1 [&_th]:p-1">
        <thead>
          <Tr>
            <Th>Asset-titel</Th>
            <Th>QR-ID</Th>
          </Tr>
        </thead>
        <tbody>
          {data.map((code: { title: string; qrId: string }) => (
            <Tr key={code.title}>
              <Td>{code.title}</Td>
              <Td>{code.qrId}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function DuplicateBarcodesTable({ data }: { data: DuplicateBarcode[] }) {
  return (
    <div className="mt-3">
      <h5>Dubbele barcodes</h5>
      <Table className="mt-1 [&_td]:p-1 [&_th]:p-1">
        <thead>
          <Tr>
            <Th>Barcode</Th>
            <Th>Gebruikt door assets</Th>
          </Tr>
        </thead>
        <tbody>
          {data.map((barcode) => (
            <Tr key={barcode.value}>
              <Td className="align-top">{barcode.value}</Td>
              <Td className="whitespace-normal">
                <ul className="list-disc pl-4">
                  {barcode.assets.map((asset, i) => (
                    <li key={i}>
                      {asset.title} ({asset.type}): Regel {asset.row}
                    </li>
                  ))}
                </ul>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
