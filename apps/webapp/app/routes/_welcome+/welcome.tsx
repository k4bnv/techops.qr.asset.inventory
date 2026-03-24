import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { BuildingIcon, UserIcon } from "lucide-react";
import { Button } from "~/components/shared/button";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";

export const meta: MetaFunction = () => [
  { title: appendToMetaTitle("Welkom bij TechOps") },
];

export default function Welcome() {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        Welkom bij TechOps Asset Inventory
      </h2>
      <p className="mb-8 max-w-md text-gray-500">
        Uw account is aangemaakt. Kies hoe u TechOps wilt gebruiken.
      </p>

      <div className="mb-8 grid w-full max-w-lg gap-4 sm:grid-cols-2">
        {/* Personal card */}
        <div className="flex flex-col items-center rounded-xl border-2 border-primary-200 bg-primary-25 p-6 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary-100">
            <UserIcon className="size-7 text-primary-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Persoonlijk
          </h3>
          <p className="text-sm text-gray-500">
            Beheer uw eigen assets, QR-codes en locaties voor persoonlijk gebruik.
          </p>
        </div>

        {/* Team card */}
        <div className="flex flex-col items-center rounded-xl border-2 border-gray-200 bg-gray-50 p-6 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-gray-100">
            <BuildingIcon className="size-7 text-gray-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Team</h3>
          <p className="text-sm text-gray-500">
            Werk samen met uw team. Maak een teamwerkruimte aan via de instellingen.
          </p>
        </div>
      </div>

      <Button
        to="/assets"
        variant="primary"
        width="auto"
        className="px-10"
      >
        Aan de slag
      </Button>

      <p className="mt-4 text-sm text-gray-400">
        U kunt later een teamwerkruimte aanmaken via{" "}
        <Link to="/settings/general" className="text-primary-600 underline">
          Instellingen
        </Link>
        .
      </p>
    </div>
  );
}
