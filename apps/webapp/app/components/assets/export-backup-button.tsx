import { useLoaderData } from "react-router";
import type { AssetIndexLoaderData } from "~/routes/_layout+/assets._index";
import { Button } from "../shared/button";

export const ExportBackupButton = ({
  canExportAssets,
}: {
  canExportAssets: boolean;
}) => {
  const { totalItems } = useLoaderData<AssetIndexLoaderData>();
  return (
    <Button
      to={`/assets/export/assets-${new Date()
        .toISOString()
        .slice(0, 10)}-${new Date().getTime()}.csv`}
      variant="secondary"
      download
      reloadDocument
      disabled={
        !canExportAssets || totalItems === 0
          ? {
              reason:
                totalItems === 0
                  ? "U heeft geen assets om te exporteren"
                  : "Exporteren is niet beschikbaar in de gratis versie van shelf.",
            }
          : false
      }
      title={totalItems === 0 ? "Geen assets om te exporteren" : "Assets exporteren"}
    >
      CSV downloaden
    </Button>
  );
};
