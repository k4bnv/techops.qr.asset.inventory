import type { WorkingHoursOverride } from "@prisma/client";
import { tw } from "~/utils/tw";
import { NewOverrideDialog } from "./override-dialog";
import { OverridePreview } from "./override-preview";
import { Card } from "../../shared/card";

export function Overrides({
  overrides,
}: {
  overrides: WorkingHoursOverride[];
}) {
  return (
    <Card className={tw("my-0")}>
      <div className="flex w-full items-start justify-between border-b pb-4">
        <div className="">
          <h3 className="text-text-lg font-semibold">Uitzonderingen op data</h3>
          <p className="text-sm text-gray-600">
            Voeg datums toe waarop de werktijden afwijken van uw dagelijkse uren.
          </p>
        </div>
        <NewOverrideDialog />
      </div>

      {/* Override List */}
      <div className="">
        {overrides.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>Geen uitzonderingen op data geconfigureerd.</p>
            <p className="text-sm">
              Klik op "Uitzondering toevoegen" om uw eerste aan te maken.
            </p>
          </div>
        ) : (
          overrides.map((override) => (
            <OverridePreview key={override.id} override={override} />
          ))
        )}
      </div>
    </Card>
  );
}
