import { useZorm } from "react-zorm";
import z from "zod";
import { BulkUpdateDialogContent } from "../bulk-update-dialog/bulk-update-dialog";
import { Button } from "../shared/button";

export const BulkRemoveFromKitsSchema = z.object({
  assetIds: z.string().array().min(1),
});

export default function BulkRemoveFromKits() {
  const zo = useZorm("BulkRemoveFromKits", BulkRemoveFromKitsSchema);

  return (
    <BulkUpdateDialogContent
      ref={zo.ref}
      type="remove-from-kit"
      title="Assets uit kits verwijderen"
      description="Deze actie verwijdert de geselecteerde assets uit hun kits. Weet u zeker dat u ze wilt verwijderen?"
      actionUrl="/api/assets/bulk-remove-from-kits"
      arrayFieldId="assetIds"
    >
      {({ disabled, handleCloseDialog, fetcherError }) => (
        <div className="modal-content-wrapper">
          {fetcherError ? (
            <p className="mb-2 text-sm text-error-500">{fetcherError}</p>
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
            >
              Bevestigen
            </Button>
          </div>
        </div>
      )}
    </BulkUpdateDialogContent>
  );
}
