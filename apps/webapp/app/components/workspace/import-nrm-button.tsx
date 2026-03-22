import { UpgradeMessage } from "../marketing/upgrade-message";
import { Button } from "../shared/button";

export const ImportNrmButton = ({
  canImportNRM,
}: {
  canImportNRM: boolean;
}) => (
  <Button
    to={`import-members`}
    variant="secondary"
    role="link"
    className="whitespace-nowrap"
    disabled={
      !canImportNRM
        ? {
            reason: (
              <>
                Importeren is niet beschikbaar in de gratis versie van TechOps.{" "}
                <UpgradeMessage />
              </>
            ),
          }
        : false
    }
    title="Importeren"
  >
    NRM importeren
  </Button>
);
