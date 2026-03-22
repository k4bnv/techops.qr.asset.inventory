import type { Asset } from "@prisma/client";
import { useLoaderData } from "react-router";
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
import { useBookingStatusHelpers } from "~/hooks/use-booking-status";
import { useDisabled } from "~/hooks/use-disabled";
import type { BookingWithCustodians } from "~/modules/booking/types";
import { tw } from "~/utils/tw";
import { Form } from "../custom-form";
import { TrashIcon } from "../icons/library";

export const RemoveAssetFromBooking = ({ asset }: { asset: Asset }) => {
  const { booking } = useLoaderData<{ booking: BookingWithCustodians }>();
  const { isArchived, isCompleted } = useBookingStatusHelpers(booking.status);
  const disabled = useDisabled();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          data-test-id="deleteBookingButton"
          icon="trash"
          className={tw(
            "justify-start rounded-sm px-2 py-1.5 text-sm font-medium text-gray-700 outline-none   hover:bg-slate-100 hover:text-gray-700"
          )}
          title={
            isArchived || isCompleted
              ? "Assets kunnen niet worden verwijderd uit voltooide boekingen"
              : undefined
          }
          width="full"
          disabled={disabled || isArchived || isCompleted}
        >
          Verwijder
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto md:m-0">
            <span className="flex size-12 items-center justify-center rounded-full bg-error-50 p-2 text-error-600">
              <TrashIcon />
            </span>
          </div>
          <AlertDialogTitle>
            Verwijder "{asset.title}" uit boeking
          </AlertDialogTitle>
          <AlertDialogDescription>
            Weet u zeker dat u dit asset uit de boeking wilt verwijderen?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex justify-center gap-2">
            <AlertDialogCancel asChild>
              <Button type="button" variant="secondary" disabled={disabled}>
                Annuleren
              </Button>
            </AlertDialogCancel>

            <Form method="post">
              <input type="hidden" name="assetId" value={asset.id} />
              <Button
                type="submit"
                name="intent"
                value="removeAsset"
                disabled={disabled}
              >
                Verwijderen
              </Button>
            </Form>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
