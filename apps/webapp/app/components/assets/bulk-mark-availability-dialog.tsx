import { useZorm } from "react-zorm";
import { z } from "zod";
import { BulkUpdateDialogContent } from "../bulk-update-dialog/bulk-update-dialog";
import { Button } from "../shared/button";

export const BulkMarkAvailabilitySchema = z.object({
  assetIds: z.string().array().min(1),
  type: z.enum(["available", "unavailable"]),
});

export default function BulkMarkAvailabilityDialog({
  type,
}: {
  type: z.infer<typeof BulkMarkAvailabilitySchema>["type"];
}) {
  const zo = useZorm("BulkMarkAvailability", BulkMarkAvailabilitySchema);

  return (
    <BulkUpdateDialogContent
      ref={zo.ref}
      type={type}
      title={`Assets markeren als ${type === "available" ? "beschikbaar" : "onbeschikbaar"}`}
      description={`Alle geselecteerde assets markeren als ${
        type === "available" ? "beschikbaar" : "onbeschikbaar"
      }. Assets die al ${
        type === "available" ? "beschikbaar" : "onbeschikbaar"
      } zijn, worden overgeslagen.`}
      actionUrl="/api/assets/bulk-mark-availability"
      arrayFieldId="assetIds"
    >
      {({ fetcherError, disabled, handleCloseDialog }) => (
        <div className="modal-content-wrapper">
          <input type="hidden" name="type" value={type} />

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
            >
              Bevestigen
            </Button>
          </div>
        </div>
      )}
    </BulkUpdateDialogContent>
  );
}
