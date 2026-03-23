import { Button } from "~/components/shared/button";
import type { parseScanData } from "~/modules/scan/utils.server";
import { tw } from "~/utils/tw";
import { ShelfMap } from "./map";
import { MapPlaceholder } from "./map-placeholder";
import { HelpIcon } from "../icons/library";
import { DateS } from "../shared/date";
import { InfoTooltip } from "../shared/info-tooltip";

export function ScanDetails({
  lastScan,
}: {
  lastScan?: ReturnType<typeof parseScanData> | null;
}) {
  let latitude, longitude;

  const hasLocation = lastScan?.coordinates !== "Unknown location";

  if (hasLocation) {
    latitude = lastScan?.coordinates.split(",")[0];
    longitude = lastScan?.coordinates.split(",")[1];
  }

  return (
    <div className="mt-4 rounded-md border lg:mb-0">
      {lastScan ? (
        <>
          {" "}
          <div className="overflow-hidden border-b">
            {hasLocation ? (
              <ShelfMap
                latitude={parseFloat(latitude as string)}
                longitude={parseFloat(longitude as string)}
              />
            ) : (
              <MapPlaceholder />
            )}
          </div>
          <div
            className={tw(
              "border-b-[1.1px] p-4 text-text-xs text-gray-600",
              "[&>div>p:first-child]:text-xs [&>div>p:first-child]:font-medium [&>div>p:first-child]:text-gray-900", // Styles for left column
              "[&>div>p:last-child]:text-right [&>div>p:last-child]:text-sm [&>div>p:last-child]:font-normal [&>div>p:last-child]:text-gray-600" // Styles for right column
            )}
          >
            <div className="flex justify-between py-2">
              <p>Datum/Tijd</p>
              <p>
                <DateS date={lastScan.dateTime} includeTime />
              </p>
            </div>
            <div className="flex justify-between py-2">
              <p>Coördinaten</p>
              <p>{lastScan.coordinates}</p>
            </div>
            <div className="flex justify-between py-2">
              <p>Apparaat</p>
              <p>
                {lastScan.ua.device.model && lastScan.ua.device.vendor
                  ? `${lastScan.ua.device.vendor} - ${lastScan.ua.device.model}`
                  : "Unknown device"}
              </p>
            </div>
            <div className="flex justify-between py-2">
              <p>Browser</p>
              <p>{lastScan.ua.browser.name}</p>
            </div>
            <div className="flex justify-between py-2">
              <p>Besturingssysteem</p>
              <p>{lastScan.ua.os.name}</p>
            </div>
            <div className="flex justify-between py-2">
              <p>Gescand door</p>
              <p>{lastScan.scannedBy}</p>
            </div>
            <div className="flex justify-between pt-2">
              <p>Bron</p>
              <p>
                {lastScan.manuallyGenerated
                  ? "Handmatig bijgewerkt"
                  : "QR-code scan"}{" "}
                <InfoTooltip
                  icon={<HelpIcon />}
                  content={
                    <>
                      <h6 className="mb-1 text-sm font-semibold text-gray-700">
                        Bron van locatiegegevens
                      </h6>
                      <p className="text-xs font-medium text-gray-500">
                        De locatiegegevens kunnen op 2 verschillende manieren worden gegenereerd:
                      </p>
                      <ul className="text-xs font-medium text-gray-500 ">
                        <li>
                          <strong>1. Handmatig bijgewerkt:</strong> Gebruiker
                          heeft de locatiegegevens handmatig bijgewerkt.
                        </li>
                        <li>
                          <strong>2. QR-code scan:</strong> Gebruiker gescand de
                          QR-code van de asset.
                        </li>
                      </ul>
                    </>
                  }
                />
              </p>
            </div>
          </div>
          {hasLocation ? (
            <div className="flex w-full justify-center px-4 py-3">
              <Button
                to={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&zoom=15&markers=${latitude},${longitude}`}
                variant="secondary"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="w-full"
              >
                Bekijken in Google Maps
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <MapPlaceholder
          title="Wachten op eerste QR-code scan"
          description="Scan de QR-code van uw asset met een telefoon, verleen locatiepermissies. Wacht een paar seconden en zie de eerste scanlocatie op een kaart!"
        />
      )}
    </div>
  );
}
