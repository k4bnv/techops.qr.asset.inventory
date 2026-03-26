import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";

export const meta: MetaFunction = () => [
  { title: appendToMetaTitle("Privacybeleid") },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm text-primary hover:underline"
          >
            ← Terug naar TechOps
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-gray-900">Privacybeleid</h1>
        <p className="mb-8 text-sm text-gray-500">
          Laatst bijgewerkt: 26 maart 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-semibold text-gray-900">1. Wie zijn wij?</h2>
            <p className="mt-2">
              TechOps is een SaaS-platform voor activabeheer. Wij zijn verantwoordelijk
              voor de verwerking van uw persoonsgegevens zoals beschreven in dit
              privacybeleid.
            </p>
            <p className="mt-2">
              <strong>Contactgegevens:</strong><br />
              TechOps<br />
              Nederland<br />
              E-mail:{" "}
              <a href="mailto:privacy@techops.nl" className="text-primary hover:underline">
                privacy@techops.nl
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">2. Welke gegevens verzamelen wij?</h2>
            <p className="mt-2">Wij verwerken de volgende persoonsgegevens:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Naam en e-mailadres (bij registratie)</li>
              <li>Wachtwoord (versleuteld opgeslagen)</li>
              <li>Profielfoto (optioneel)</li>
              <li>Organisatiegegevens en instellingen</li>
              <li>Activagegevens die u invoert in het platform</li>
              <li>Gebruiksgegevens en sessie-informatie</li>
              <li>IP-adres en browserinformatie (voor beveiliging)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">3. Waarom verwerken wij uw gegevens?</h2>
            <div className="mt-2 space-y-3">
              <div>
                <strong>Uitvoering van de overeenkomst (art. 6 lid 1 sub b AVG)</strong>
                <p>Om u toegang te geven tot het platform en de dienst te verlenen.</p>
              </div>
              <div>
                <strong>Gerechtvaardigd belang (art. 6 lid 1 sub f AVG)</strong>
                <p>Voor beveiliging, fraudepreventie en verbetering van de dienst.</p>
              </div>
              <div>
                <strong>Wettelijke verplichting (art. 6 lid 1 sub c AVG)</strong>
                <p>Voor het voldoen aan boekhoudkundige en fiscale verplichtingen.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">4. Hoe lang bewaren wij uw gegevens?</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Accountgegevens: zolang uw account actief is</li>
              <li>Na verwijdering van uw account: binnen 30 dagen definitief verwijderd</li>
              <li>Financiële gegevens: 7 jaar (wettelijke bewaarplicht)</li>
              <li>Logbestanden: maximaal 90 dagen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">5. Delen wij uw gegevens?</h2>
            <p className="mt-2">
              Wij verkopen uw gegevens nooit. Wij delen gegevens alleen met:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>
                <strong>Supabase</strong> — authenticatie en opslag van bestanden.
                Servers in de EU. Privacybeleid:{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  supabase.com/privacy
                </a>
              </li>
              <li>
                <strong>Hetzner</strong> — serverhosting in de EU (Finland).
                Privacybeleid:{" "}
                <a
                  href="https://www.hetzner.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  hetzner.com/legal/privacy-policy
                </a>
              </li>
              <li>
                <strong>Stripe</strong> — betalingsverwerking (indien van toepassing).
                Gegevens worden verwerkt conform PCI-DSS.
              </li>
            </ul>
            <p className="mt-3">
              Met alle verwerkers hebben wij een verwerkersovereenkomst (DPA) gesloten.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">6. Uw rechten (AVG)</h2>
            <p className="mt-2">Op grond van de AVG heeft u de volgende rechten:</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Recht op inzage</strong> — u kunt opvragen welke gegevens wij van u hebben</li>
              <li><strong>Recht op rectificatie</strong> — u kunt onjuiste gegevens laten corrigeren</li>
              <li><strong>Recht op verwijdering</strong> — u kunt uw account en gegevens laten verwijderen (zie hieronder)</li>
              <li><strong>Recht op beperking</strong> — u kunt de verwerking laten beperken</li>
              <li><strong>Recht op dataportabiliteit</strong> — u kunt uw gegevens exporteren (CSV-export beschikbaar in het platform)</li>
              <li><strong>Recht van bezwaar</strong> — u kunt bezwaar maken tegen de verwerking</li>
            </ul>
            <p className="mt-3">
              Om uw rechten uit te oefenen, kunt u contact opnemen via{" "}
              <a href="mailto:privacy@techops.nl" className="text-primary hover:underline">
                privacy@techops.nl
              </a>
              . Wij reageren binnen 30 dagen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">7. Account verwijderen</h2>
            <p className="mt-2">
              U kunt op elk moment een verzoek indienen om uw account en alle
              bijbehorende gegevens te verwijderen. Dit kan via:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>
                In het platform:{" "}
                <Link to="/account-details/general" className="text-primary hover:underline">
                  Accountinstellingen → Account verwijderen
                </Link>
              </li>
              <li>
                Per e-mail:{" "}
                <a href="mailto:privacy@techops.nl" className="text-primary hover:underline">
                  privacy@techops.nl
                </a>
              </li>
            </ul>
            <p className="mt-2">
              Uw verzoek wordt binnen 72 uur verwerkt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">8. Cookies</h2>
            <p className="mt-2">
              Wij gebruiken uitsluitend functionele cookies die noodzakelijk zijn
              voor het functioneren van het platform (sessiecookies). Wij gebruiken
              geen tracking- of advertentiecookies. Er is daarom geen cookiebanner
              vereist voor het gebruik van het platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">9. Beveiliging</h2>
            <p className="mt-2">
              Wij treffen passende technische en organisatorische maatregelen om
              uw gegevens te beschermen, waaronder:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li>Versleutelde verbindingen (HTTPS/TLS)</li>
              <li>Versleutelde wachtwoorden (bcrypt)</li>
              <li>Toegangscontrole op basis van rollen</li>
              <li>Regelmatige beveiligingsupdates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">10. Klachten</h2>
            <p className="mt-2">
              Als u van mening bent dat wij uw gegevens niet correct verwerken,
              heeft u het recht om een klacht in te dienen bij de{" "}
              <a
                href="https://www.autoriteitpersoonsgegevens.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Autoriteit Persoonsgegevens
              </a>{" "}
              (AP), de Nederlandse toezichthouder voor gegevensbescherming.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900">11. Wijzigingen</h2>
            <p className="mt-2">
              Wij kunnen dit privacybeleid van tijd tot tijd bijwerken. Wij
              informeren u over wezenlijke wijzigingen via e-mail of een melding
              in het platform.
            </p>
          </section>

        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} TechOps · Nederland ·{" "}
          <a href="mailto:privacy@techops.nl" className="hover:underline">
            privacy@techops.nl
          </a>
        </div>
      </div>
    </div>
  );
}
