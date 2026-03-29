import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";

export const meta: MetaFunction = () => [
  { title: appendToMetaTitle("Verwerkersovereenkomst") },
];

export default function Verwerkingsovereenkomst() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <Link to="/privacy-policy" className="text-sm text-primary hover:underline">
            ← Terug naar Privacybeleid
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Verwerkersovereenkomst (DPA)
        </h1>
        <p className="mb-2 text-sm text-gray-500">Versie 1.0 — maart 2026</p>
        <p className="mb-8 text-sm text-gray-500">
          Deze verwerkersovereenkomst is van toepassing wanneer TechOps
          persoonsgegevens verwerkt namens uw organisatie als verwerkingsverantwoordelijke.
        </p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 1 — Definities</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Verwerkingsverantwoordelijke:</strong> de klant die TechOps gebruikt en bepaalt voor welke doeleinden en met welke middelen persoonsgegevens worden verwerkt.</li>
              <li><strong>Verwerker:</strong> TechOps, de aanbieder van het platform die persoonsgegevens verwerkt ten behoeve van de Verwerkingsverantwoordelijke.</li>
              <li><strong>Betrokkene:</strong> de natuurlijke persoon op wie de persoonsgegevens betrekking hebben.</li>
              <li><strong>AVG:</strong> Verordening (EU) 2016/679 (Algemene Verordening Gegevensbescherming).</li>
              <li><strong>Persoonsgegevens:</strong> alle informatie over een geïdentificeerde of identificeerbare natuurlijke persoon.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 2 — Onderwerp en duur</h2>
            <p className="mt-2">
              TechOps verwerkt persoonsgegevens uitsluitend ten behoeve van het leveren
              van het activabeheer-platform en aanverwante diensten. De overeenkomst
              loopt zolang de klant gebruik maakt van de diensten van TechOps.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 3 — Aard en doel van de verwerking</h2>
            <p className="mt-2">TechOps verwerkt persoonsgegevens voor de volgende doeleinden:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Gebruikersbeheer en authenticatie</li>
              <li>Activabeheer (registratie van eigenaren, custodians)</li>
              <li>Reserveringen en uitleenbeheer</li>
              <li>Onderhoud en reparatiebeheer</li>
              <li>Meldingen en e-mailcommunicatie</li>
              <li>Beveiligingslogging en -monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 4 — Categorieën persoonsgegevens en betrokkenen</h2>
            <p className="mt-2">TechOps verwerkt de volgende categorieën persoonsgegevens:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Identificatiegegevens (naam, e-mailadres, gebruikersnaam)</li>
              <li>Contactgegevens (telefoonnummer, adres)</li>
              <li>Accountgegevens (profielfoto, organisatierol)</li>
              <li>Gebruiksgegevens (activiteitenlog, sessie-informatie)</li>
            </ul>
            <p className="mt-3">Betrokkenen zijn medewerkers en gebruikers van de Verwerkingsverantwoordelijke.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 5 — Verplichtingen van de Verwerker</h2>
            <p className="mt-2">TechOps verplicht zich tot het volgende:</p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Persoonsgegevens uitsluitend verwerken op basis van gedocumenteerde instructies van de Verwerkingsverantwoordelijke.</li>
              <li>Vertrouwelijkheid waarborgen van alle betrokken medewerkers.</li>
              <li>Passende technische en organisatorische beveiligingsmaatregelen treffen conform artikel 32 AVG.</li>
              <li>De Verwerkingsverantwoordelijke onverwijld (binnen 72 uur) informeren bij een inbreuk in verband met persoonsgegevens.</li>
              <li>Bijstand verlenen bij het uitoefenen van rechten van betrokkenen.</li>
              <li>Persoonsgegevens na beëindiging van de dienst te verwijderen of terug te geven conform de instructies.</li>
              <li>Alle informatie beschikbaar stellen die noodzakelijk is om de naleving van de verplichtingen aan te tonen.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 6 — Sub-verwerkers</h2>
            <p className="mt-2">TechOps maakt gebruik van de volgende sub-verwerkers:</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 pr-4 text-left font-semibold">Sub-verwerker</th>
                    <th className="py-2 pr-4 text-left font-semibold">Doel</th>
                    <th className="py-2 text-left font-semibold">Locatie</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Supabase</td>
                    <td className="py-2 pr-4">Authenticatie, bestandsopslag</td>
                    <td className="py-2">EU</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Hetzner</td>
                    <td className="py-2 pr-4">Serverhosting</td>
                    <td className="py-2">EU (Finland)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Stripe</td>
                    <td className="py-2 pr-4">Betalingsverwerking</td>
                    <td className="py-2">EU/VS (adequaatheidsbesluit)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              TechOps informeert de Verwerkingsverantwoordelijke vooraf over
              wijzigingen in sub-verwerkers zodat bezwaar gemaakt kan worden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 7 — Beveiliging</h2>
            <p className="mt-2">
              TechOps treft passende technische en organisatorische maatregelen waaronder:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Versleutelde verbindingen via HTTPS/TLS 1.2+</li>
              <li>Versleutelde wachtwoordopslag (bcrypt)</li>
              <li>Rolgebaseerde toegangscontrole (RBAC)</li>
              <li>Regelmatige beveiligingsupdates en -monitoring</li>
              <li>Toegangsbeperking op need-to-know basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 8 — Rechten van betrokkenen</h2>
            <p className="mt-2">
              TechOps biedt functionaliteit om de Verwerkingsverantwoordelijke te
              ondersteunen bij het beantwoorden van verzoeken van betrokkenen:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Inzage: beschikbaar via het gebruikersprofiel</li>
              <li>Rectificatie: beschikbaar via accountinstellingen</li>
              <li>Verwijdering: verwijderverzoek via accountinstellingen</li>
              <li>Dataportabiliteit: gegevensexport in JSON-formaat beschikbaar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 9 — Aansprakelijkheid</h2>
            <p className="mt-2">
              Iedere partij is aansprakelijk voor haar eigen verplichtingen uit deze
              overeenkomst. TechOps is als Verwerker niet aansprakelijk voor
              verwerkingen die buiten de overeengekomen instructies vallen of die
              door de Verwerkingsverantwoordelijke worden opgedragen in strijd met
              de AVG.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Artikel 10 — Toepasselijk recht</h2>
            <p className="mt-2">
              Op deze overeenkomst is Nederlands recht van toepassing. Geschillen
              worden voorgelegd aan de bevoegde rechter te Nederland.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">Contact</h2>
            <p className="mt-2">
              Voor vragen over deze verwerkersovereenkomst of om een ondertekend
              exemplaar te ontvangen, neem contact op via{" "}
              <a
                href="mailto:privacy@techops.nl"
                className="text-primary hover:underline"
              >
                privacy@techops.nl
              </a>
              .
            </p>
          </section>

        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} TechOps · Nederland ·{" "}
          <a href="mailto:privacy@techops.nl" className="hover:underline">
            privacy@techops.nl
          </a>
          {" · "}
          <Link to="/privacy-policy" className="hover:underline">
            Privacybeleid
          </Link>
        </div>
      </div>
    </div>
  );
}
