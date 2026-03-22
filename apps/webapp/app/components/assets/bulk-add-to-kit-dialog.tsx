import type { Kit } from "@prisma/client";
import { useAtomValue } from "jotai";
import { useZorm } from "react-zorm";
import z from "zod";
import { bulkDialogAtom } from "~/atoms/bulk-update-dialog";
import { selectedBulkItemsCountAtom } from "~/atoms/list";
import useApiQuery from "~/hooks/use-api-query";
import { BulkUpdateDialogContent } from "../bulk-update-dialog/bulk-update-dialog";
import KitSelector from "../kits/kit-selector";
import { Button } from "../shared/button";

export const BulkAddToKitSchema = z.object({
  assetIds: z.string().array().min(1),
  kit: z.string().min(1),
});

export default function BulkAddToKitDialog() {
  const zo = useZorm("BulkAddToKit", BulkAddToKitSchema);

  const selectedAssets = useAtomValue(selectedBulkItemsCountAtom);
  const bulkDialogOpenState = useAtomValue(bulkDialogAtom);

  const isOpen = bulkDialogOpenState["add-to-kit"] === true;

  const { data, isLoading, error } = useApiQuery<{
    kits: Array<Pick<Kit, "id" | "name">>;
  }>({
    api: "/api/assets/bulk-add-to-kit",
    enabled: isOpen,
  });

  return (
    <BulkUpdateDialogContent
      ref={zo.ref}
      type="add-to-kit"
      title="Assets toevoegen aan een kit"
      description={`${selectedAssets} asset${
        selectedAssets > 1 ? "s" : ""
      } ${
        selectedAssets > 1 ? "worden" : "wordt"
      } toegevoegd aan de kit. Selecteer een kit om de assets aan toe te voegen`}
      actionUrl="/api/assets/bulk-add-to-kit"
      arrayFieldId="assetIds"
    >
      {({ fetcherError, disabled, handleCloseDialog }) => (
        <div className="modal-content-wrapper">
          <div className="relative z-50 mb-8">
            <KitSelector
              name={zo.fields.kit()}
              kits={data?.kits || []}
              placeholder={isLoading ? "Laden..." : "Selecteer een kit"}
              isLoading={isLoading}
              error={zo.errors.kit()?.message || error || fetcherError}
            />
          </div>

          <div className="mb-6 rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              <strong>Locatie-update bericht:</strong> Het toevoegen van assets
              aan een kit zal automatisch de locaties van de assets bijwerken
              naar de locatie van de kit (als de kit er een heeft).
            </p>
          </div>

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
