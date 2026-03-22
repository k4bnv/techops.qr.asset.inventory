import type { Booking } from "@prisma/client";
import { isBookingEarlyCheckout } from "~/modules/booking/helpers";
import type { ButtonProps } from "../shared/button";
import { Button } from "../shared/button";
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

export enum CheckoutIntentEnum {
  "with-adjusted-date" = "with-adjusted-date",
  "without-adjusted-date" = "without-adjusted-date",
}

type CheckoutDialogProps = {
  disabled?: ButtonProps["disabled"];
  booking: Pick<Booking, "id" | "name" | "from">;
  /** A container to render the AlertContent inside */
  portalContainer?: HTMLElement;
  /** Form ID for explicit form association when buttons render in a portal */
  formId?: string;
};

export default function CheckoutDialog({
  disabled,
  booking,
  portalContainer,
  formId,
}: CheckoutDialogProps) {
  const isEarlyCheckout = isBookingEarlyCheckout(booking.from);

  if (!isEarlyCheckout) {
    return (
      <Button
        disabled={disabled}
        className="grow"
        size="sm"
        type="submit"
        name="intent"
        value="checkOut"
      >
        Uitchecken
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled} className="grow" size="sm" type="button">
          Uitchecken
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent portalProps={{ container: portalContainer }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Waarschuwing voortijdig uitlenen</AlertDialogTitle>
          <AlertDialogDescription>
            U leent de boeking meer dan 15 minuten voor de startdatum uit. Als u doorgaat, wordt de startdatum aangepast naar nu:{" "}
            <span className="font-bold text-gray-700">
              <DateS date={new Date()} includeTime />
            </span>
            .
            <br />
            <br />
            Wilt u de startdatum aanpassen of de oorspronkelijke datum behouden?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" disabled={disabled} variant="secondary">
              Annuleren
            </Button>
          </AlertDialogCancel>

          <input type="hidden" name="intent" value="checkOut" form={formId} />
          <Button
            disabled={disabled}
            className="flex-1"
            type="submit"
            variant="secondary"
            name="checkoutIntentChoice"
            value={CheckoutIntentEnum["without-adjusted-date"]}
            form={formId}
          >
            Datum niet aanpassen
          </Button>

          <Button
            disabled={disabled}
            className="flex-1"
            type="submit"
            name="checkoutIntentChoice"
            value={CheckoutIntentEnum["with-adjusted-date"]}
            form={formId}
          >
            Datum aanpassen
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
