import { useZorm } from "react-zorm";
import { z } from "zod";
import { BulkUpdateDialogContent } from "../bulk-update-dialog/bulk-update-dialog";
import { Button } from "../shared/button";

export const BulkReleaseCustodySchema = z.object({
  assetIds: z.array(z.string()).min(1),
});

export default function BulkReleaseCustodyDialog() {
  const zo = useZorm("BulkReleaseCustody", BulkReleaseCustodySchema);

  return (
    <BulkUpdateDialogContent
      ref={zo.ref}
      type="release-custody"
      title="Beheer van assets vrijgeven"
      description="Weet u zeker dat u het beheer van alle geselecteerde assets wilt vrijgeven?"
      actionUrl="/api/assets/bulk-release-custody"
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
