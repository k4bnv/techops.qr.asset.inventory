import { useAtomValue } from "jotai";
import { useLoaderData } from "react-router";
import { useZorm } from "react-zorm";
import z from "zod";
import { selectedBulkItemsCountAtom } from "~/atoms/list";
import { BulkUpdateDialogContent } from "../bulk-update-dialog/bulk-update-dialog";
import { Button } from "../shared/button";

export const BulkRemoveAssetsAndKitSchema = z.object({
  assetOrKitIds: z
    .array(z.string())
    .min(1, "Selecteer ten minste één asset of kit."),
});

export default function BulkRemoveAssetAndKitDialog() {
  const zo = useZorm("BulkRemoveAssetAndKit", BulkRemoveAssetsAndKitSchema);
  const totalSelectedItems = useAtomValue(selectedBulkItemsCountAtom);
  const { booking } = useLoaderData<{ booking: { id: string } }>();

  return (
    <BulkUpdateDialogContent
      ref={zo.ref}
      type="trash"
      title={`Geselecteerde items verwijderen (${totalSelectedItems})`}
      arrayFieldId="assetOrKitIds"
      description={`Weet u zeker dat u de ${totalSelectedItems} geselecteerde item(s) wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`}
      actionUrl={`/bookings/${booking.id}/overview`}
    >
      {({ fetcherError, disabled, handleCloseDialog }) => (
        <>
          <input type="hidden" name="intent" value="bulk-remove-asset-or-kit" />

          {fetcherError ? (
            <p className="text-sm text-error-500">{fetcherError}</p>
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              width="full"
              disabled={disabled}
              onClick={handleCloseDialog}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              variant="primary"
              width="full"
              disabled={disabled}
              className="border-error-600 bg-error-600 hover:border-error-800 hover:!bg-error-800"
            >
              Bevestigen
            </Button>
          </div>
        </>
      )}
    </BulkUpdateDialogContent>
  );
}
