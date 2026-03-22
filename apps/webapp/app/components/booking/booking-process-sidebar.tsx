import { Close } from "@radix-ui/react-dialog";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight, ClockIcon, InfoIcon } from "lucide-react";
import { tw } from "~/utils/tw";
import { XIcon } from "../icons/library";
import { Button } from "../shared/button";
import { Sheet, SheetContent, SheetTrigger } from "../shared/sheet";

type BookingProcessSidebarProps = {
  className?: string;
};

type ProcessItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName: string;
};

const ITEMS: Array<ProcessItem> = [
  {
    icon: ClockIcon,
    title: "Aanvraag indienen",
    description: `Vul alle vereiste informatie in en selecteer de assets die u nodig heeft. Klik op "Reservering aanvragen" om uw aanvraag in te dienen.`,
    iconClassName: "bg-blue-100 text-blue-500",
  },
  {
    icon: InfoIcon,
    title: "Behandeling door beheerder",
    description:
      "Uw boeking wordt als gereserveerd weergegeven, maar de beheerder kan deze te allen tijde terugzetten naar concept of annuleren als er conflicten zijn met andere boekingen.",
    iconClassName: "bg-warning-100 text-warning-500",
  },
  {
    icon: ArrowRight,
    title: "Uitchecken",
    description:
      "Op de startdatum van uw boeking zal een beheerder de apparatuur namens u uitchecken. U bent verantwoordelijk voor de apparatuur tijdens uw boekingsperiode.",
    iconClassName: "bg-violet-100 text-violet-500",
  },
  {
    icon: ArrowLeft,
    title: "Inchecken",
    description:
      "Aan het einde van uw boekingsperiode levert u de apparatuur in bij de beheerder, die de incheckactie zal uitvoeren.",
    iconClassName: "bg-indigo-100 text-indigo-500",
  },
];

export default function BookingProcessSidebar({
  className,
}: BookingProcessSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="block-link-gray" className={"mt-0"}>
          <div className="flex items-center gap-2">
            <InfoIcon className="size-4" />
            Hoe boekingen werken
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent
        hideCloseButton
        className={tw("border-l-0 bg-white p-0", className)}
      >
        <div className="flex items-center justify-between bg-blue-500 p-4 text-white">
          <div className="flex items-center gap-2 text-lg font-bold">
            <InfoIcon className="size-4" />
            Boekingsproces
          </div>

          <Close className="opacity-70 transition-opacity hover:opacity-100">
            <XIcon className="size-4" />
            <span className="sr-only">Sluiten</span>
          </Close>
        </div>

        <div className="p-4">
          <p className="mb-8 border-l-4 border-blue-500 bg-blue-50 p-2 text-blue-500">
            Basisgebruikers reserveren boekingen die goedkeuring van de beheerder vereisen en kunnen op elk moment worden geannuleerd als er conflicten zijn met andere boekingen. Beheerders regelen het uit- en inchecken van apparatuur.
          </p>

          <div className="mb-8 flex flex-col gap-4">
            {ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className={tw(
                    "flex items-center justify-center rounded-full p-4",
                    item.iconClassName
                  )}
                >
                  {}
                  <item.icon className="size-5" />
                </div>

                <div>
                  <h3 className="mb-1">
                    {i + 1}. {item.title}
                  </h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <h3 className="mb-1">Belangrijke opmerkingen</h3>

            <ul className="list-inside list-disc">
              <li>
                Apparatuur moet in dezelfde staat worden geretourneerd als waarin deze is uitgecheckt.
              </li>
              <li>
                Als u uw boeking wilt verlengen, neem dan contact op met een beheerder voor de einddatum van uw boeking.
              </li>
              <li>
                Beheerders hebben de laatste stem over de goedkeuring van boekingen op basis van beschikbaarheid van apparatuur en prioriteiten.
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
