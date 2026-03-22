import type { Booking } from "@prisma/client";
import { Zap } from "lucide-react";
import { isBookingEarlyCheckin } from "~/modules/booking/helpers";
import { tw } from "~/utils/tw";
import { Button, type ButtonProps } from "../shared/button";
import { DateS } from "../shared/date";
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

export enum CheckinIntentEnum {
  "with-adjusted-date" = "with-adjusted-date",
  "without-adjusted-date" = "without-adjusted-date",
}

type CheckinDialogProps = {
  disabled?: ButtonProps["disabled"];
  booking: Pick<Booking, "id" | "name" | "from" | "to">;
  /** A container to render the AlertContent inside */
  portalContainer?: HTMLElement;
  /** Form ID for explicit form association when buttons render in a portal */
  formId?: string;

  /** Callback to close parent dropdown/menu */
  onClose?: () => void;
  /** Custom label for the button */
  label?: string;
  /** Variant for different contexts */
  variant?: "default" | "dropdown" | "primary";
  /** Specific asset IDs for enhanced completion messaging */
  specificAssetIds?: string[];
};

export default function CheckinDialog({
  disabled,
  booking,
  portalContainer,
  formId,
  label = "Inchecken",
  variant = "default",
  specificAssetIds,
}: CheckinDialogProps) {
  const isEarlyCheckin = isBookingEarlyCheckin(booking.to);
  if (!isEarlyCheckin) {
    return (
      <Button
        disabled={disabled}
        type="submit"
        name="intent"
        value="checkIn"
        form={formId}
        className={tw(
          "whitespace-nowrap",
          variant === "dropdown"
            ? "w-full justify-start px-4 py-3 text-gray-700 hover:text-gray-700"
            : ""
        )}
        variant={variant === "dropdown" ? "link" : "primary"}
        width={variant === "dropdown" ? "full" : undefined}
      >
        {variant === "dropdown" ? (
          <span className="flex items-center gap-2">
            <Zap className="size-4" /> {label}
          </span>
        ) : (
          label
        )}
      </Button>
    );
  }

  /**
   * We have to make sure the current time is before the `from` date of the booking. See details: https://github.com/TechOps-nu/shelf.nu/issues/1839
   */
  const currentTimeIsBeforeFrom = new Date() < new Date(booking.from);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          className={tw(
            "whitespace-nowrap",
            variant === "dropdown"
              ? "w-full justify-start px-4 py-3 text-gray-700 hover:text-gray-700"
              : ""
          )}
          variant={variant === "dropdown" ? "link" : "primary"}
        >
          {variant === "dropdown" ? (
            <span className="flex items-center gap-2">
              <Zap className="size-4" /> {label}
            </span>
          ) : (
            label
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent portalProps={{ container: portalContainer }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Waarschuwing voortijdig inchecken</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          {currentTimeIsBeforeFrom ? (
            <>
              U checkt de boeking meer dan 15 minuten voor de einddatum in,
              u bent echter niet gemachtigd om de einddatum aan te passen
              omdat de huidige tijd (
              <span className="font-bold text-gray-700">
                <DateS date={new Date()} includeTime />
              </span>
              ) voor de startdatum (
              <span className="font-bold text-gray-700">
                <DateS date={booking.from} includeTime />
              </span>
              ) van de boeking ligt.
            </>
          ) : (
            <>
              U checkt de boeking meer dan 15 minuten voor de einddatum in. Als u doorgaat, wordt de einddatum aangepast naar nu:{" "}
              <span className="font-bold text-gray-700">
                <DateS date={new Date()} includeTime />
              </span>
              .
              <br />
              <br />
              Wilt u de einddatum aanpassen of de oorspronkelijke datum behouden?
            </>
          )}
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              disabled={disabled}
              variant="secondary"
              type="button"
              className={currentTimeIsBeforeFrom ? "flex-1" : ""}
            >
              Annuleren
            </Button>
          </AlertDialogCancel>

          <input type="hidden" name="intent" value="checkIn" form={formId} />

          {/* Pass specific asset IDs for enhanced completion messaging */}
          {specificAssetIds?.map((assetId) => (
            <input
              key={assetId}
              type="hidden"
              name="specificAssetIds[]"
              value={assetId}
              form={formId}
            />
          ))}

          <Button
            disabled={disabled}
            className="flex-1"
            type="submit"
            form={formId}
            variant={currentTimeIsBeforeFrom ? "primary" : "secondary"}
            name="checkinIntentChoice"
            value={CheckinIntentEnum["without-adjusted-date"]}
          >
            {currentTimeIsBeforeFrom ? "Inchecken" : "Datum niet aanpassen"}
          </Button>
          {!currentTimeIsBeforeFrom && (
            <Button
              disabled={disabled}
              className="flex-1"
              width={"full"}
              type="submit"
              form={formId}
              name="checkinIntentChoice"
              value={CheckinIntentEnum["with-adjusted-date"]}
            >
              Datum aanpassen
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
