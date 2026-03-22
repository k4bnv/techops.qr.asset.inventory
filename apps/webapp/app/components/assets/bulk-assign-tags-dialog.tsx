import { useEffect, useMemo } from "react";
import { useFetcher } from "react-router";
import { useZorm } from "react-zorm";
import { z } from "zod";
import { BulkUpdateDialogContent } from "../bulk-update-dialog/bulk-update-dialog";
import { Button } from "../shared/button";
import { TagsAutocomplete } from "../tag/tags-autocomplete";

/**
 * Schema for bulk tag update validation
 * Ensures at least one asset and one tag are selected
 */
export const BulkUpdateTagsSchema = z.object({
  // Validate array of asset IDs
  assetIds: z.array(z.string()).min(1, "Minstens één asset moet geselecteerd zijn"),
  // Transform comma-separated string to array and validate
  tags: z
    .string()
    .transform((str) => str.split(",").filter(Boolean))
    .pipe(
      z.array(z.string()).min(1, {
        message: "Minstens één tag moet geselecteerd zijn",
      })
    ),
});

export type TagsFetcherData = { filters: Array<{ name: string; id: string }> };

export default function BulkAssignTagsDialog() {
  const zo = useZorm("BulkAssignTags", BulkUpdateTagsSchema);

  const fetcher = useFetcher<TagsFetcherData>();

  // Transform API response to TagSuggestion format
  const suggestions = useMemo(() => {
    if (!fetcher.data?.filters) {
      return [];
    }

    return fetcher.data.filters.map((tagResponse) => ({
      label: tagResponse.name,
      value: tagResponse.id,
    }));
  }, [fetcher.data]);

  useEffect(() => {
    void fetcher.submit(
      {
        name: "tag",
        queryKey: "name",
        queryValue: "",
        useFor: "ASSET",
      },
      {
        method: "GET",
        action: "/api/model-filters",
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle validation errors
  const validationErrors = useMemo(() => {
    const tagsError = zo.errors.tags()?.message;
    const assetIdsError = zo.errors.assetIds()?.message;
    return {
      tags: tagsError,
      assetIds: assetIdsError,
    };
  }, [zo.errors]);

  return (
    <BulkUpdateDialogContent
      ref={zo.ref}
      type="tag-add"
      title="Tags aan assets toewijzen"
      description="Tags aan geselecteerde assets toewijzen. Assets die al een van de geselecteerde tags hebben, worden overgeslagen."
      actionUrl="/api/assets/bulk-assign-tags"
      arrayFieldId="assetIds"
    >
      {({ disabled, handleCloseDialog, fetcherError }) => (
        <div className="modal-content-wrapper">
          <div className="relative z-50 mb-8">
            <TagsAutocomplete existingTags={[]} suggestions={suggestions} />

            {validationErrors.tags && (
              <p className="text-sm text-error-500">{validationErrors.tags}</p>
            )}
            {validationErrors.assetIds && (
              <p className="text-sm text-error-500">
                {validationErrors.assetIds}
              </p>
            )}
            {fetcherError && (
              <p className="text-sm text-error-500">{fetcherError}</p>
            )}
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
