import { UpgradeMessage } from "../marketing/upgrade-message";
import { Button } from "../shared/button";

export const ImportButton = ({
  canImportAssets,
}: {
  canImportAssets: boolean;
}) => (
  <Button
    to={`import`}
    variant="secondary"
    role="link"
    disabled={
      !canImportAssets
        ? {
            reason: (
              <>
                Importeren is niet beschikbaar in de gratis versie van shelf.{" "}
                <UpgradeMessage />
              </>
            ),
          }
        : false
    }
    title="Assets importeren"
  >
    Importeren
  </Button>
);
