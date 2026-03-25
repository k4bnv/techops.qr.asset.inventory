import {
  Button,
  Container,
  Head,
  Html,
  Link,
  render,
  Text,
} from "@react-email/components";
import { config } from "~/config/shelf.config";
import { SERVER_URL, SUPPORT_EMAIL } from "~/utils/env";
import { ShelfError } from "~/utils/error";
import { Logger } from "~/utils/logger";
import { LogoForEmail } from "../logo";
import { sendEmail } from "../mail.server";
import { styles } from "../styles";

interface TeamTrialWelcomeProps {
  firstName?: string | null;
  email: string;
}

export const sendTeamTrialWelcomeEmail = async ({
  firstName,
  email,
}: TeamTrialWelcomeProps) => {
  try {
    const subject = "Uw TechOps Team Trial is klaar - Volgende stappen";
    const html = await welcomeToTrialEmailHtml({ firstName });
    const text = welcomeToTrialEmailText({ firstName });

    void sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  } catch (cause) {
    Logger.error(
      new ShelfError({
        cause,
        message: "Er is iets misgegaan bij het verzenden van de welkomst-e-mail",
        additionalData: { email },
        label: "User",
      })
    );
  }
};

export const welcomeToTrialEmailText = ({
  firstName,
}: {
  firstName?: string | null;
}) => `Hoi${firstName ? ` ${firstName}` : ""},

Carlos Virreira hier, medeoprichter van TechOps Asset Management. Ik ben blij om je te laten weten dat je TechOps Team Trial is geactiveerd! Dit is een uitstekende stap naar efficiënter asset management voor je team.

Om aan de slag te gaan met je trial:

1. Maak je teamwerkruimte aan
Bezoek ${SERVER_URL}/account-details/workspace om al je werkruimtes te zien. Klik op "NIEUWE WERKRUIMTE" om je teamwerkruimte aan te maken.

2. Voeg je eerste assets toe
Begin met het vullen van je inventaris om TechOps in actie te zien. Probeer onze QR-codefunctie voor eenvoudige asset tracking.

3. Nodig teamleden uit
Samenwerking is de sleutel. Voeg je collega's toe om de kracht van TechOps echt te ervaren.

Ontdek de belangrijkste functies:
- Aangepaste velden: Pas TechOps aan je specifieke behoeften aan - https://www.techops.nl/knowledge-base/custom-field-types-in-shelf
- Boekingen: Beheer reserveringen van apparatuur efficiënt - https://www.techops.nl/knowledge-base/use-case-scenarios-explaing-our-bookings-feature
- Kits: Groepeer gerelateerde assets voor eenvoudiger beheer - https://www.techops.nl/features/kits

Hulp nodig? Bekijk onze Knowledge Base voor snelle antwoorden, of neem contact met ons op via ${SUPPORT_EMAIL}.

Vergeet niet dat je trial volledige toegang geeft tot alle premium functies. Haal er het meeste uit!

Veel plezier met asset tracking,
Het TechOps Team
`;

function WelcomeToTrialEmailTemplate({
  firstName,
}: {
  firstName?: string | null;
}) {
  const { emailPrimaryColor } = config;

  return (
    <Html>
      <Head>
        <title>Uw TechOps Team Trial is klaar - Volgende stappen</title>
      </Head>

      <Container style={{ padding: "32px 16px", maxWidth: "100%" }}>
        <LogoForEmail />

        <div style={{ paddingTop: "8px" }}>
          <Text style={{ ...styles.p }}>
            Hoi${firstName ? ` ${firstName}` : ""},
          </Text>

          <Text style={{ ...styles.p }}>
            Carlos Virreira hier, medeoprichter van TechOps Asset Management. Ik
            ben blij om je te laten weten dat je <strong>TechOps Team Trial</strong>{" "}
            is geactiveerd! Dit is een uitstekende stap naar efficiënter
            asset management voor je team.
          </Text>

          <Text style={{ ...styles.h2 }}>Om aan de slag te gaan met je trial:</Text>

          <ol style={{ ...styles.li, paddingLeft: "20px" }}>
            <li style={{ marginBottom: "12px" }}>
              <strong>Maak je teamwerkruimte aan:</strong> Bezoek je{" "}
              <Link
                href={`${SERVER_URL}/account-details/workspace`}
                style={{ color: emailPrimaryColor }}
              >
                werkruimte-instellingen
              </Link>{" "}
              en klik op "NIEUWE WERKRUIMTE" om je teamwerkruimte aan te maken.
            </li>
            <li style={{ marginBottom: "12px" }}>
              <strong>Voeg je eerste assets toe:</strong> Begin met het vullen van
              je inventaris om TechOps in actie te zien. Probeer onze
              QR-codefunctie voor eenvoudige asset tracking.
            </li>
            <li style={{ marginBottom: "12px" }}>
              <strong>Nodig teamleden uit:</strong> Samenwerking is de sleutel.
              Voeg je collega's toe om de kracht van TechOps echt te ervaren.
            </li>
          </ol>

          <Button
            href={`${SERVER_URL}/account-details/workspace`}
            style={{
              ...styles.button,
              textAlign: "center" as const,
              maxWidth: "250px",
              marginBottom: "24px",
            }}
          >
            Maak je werkruimte aan
          </Button>

          <Text style={{ ...styles.h2 }}>Ontdek de belangrijkste functies:</Text>

          <Text style={{ ...styles.p }}>
            <Link
              href="https://www.techops.nl/knowledge-base/custom-field-types-in-shelf"
              style={{ color: emailPrimaryColor }}
            >
              Aangepaste velden
            </Link>
            : Pas TechOps aan je specifieke behoeften aan
          </Text>

          <Text style={{ ...styles.p }}>
            <Link
              href="https://www.techops.nl/knowledge-base/use-case-scenarios-explaing-our-bookings-feature"
              style={{ color: emailPrimaryColor }}
            >
              Boekingen
            </Link>
            : Beheer reserveringen van apparatuur efficiënt
          </Text>

          <Text style={{ ...styles.p }}>
            <Link
              href="https://www.techops.nl/features/kits"
              style={{ color: emailPrimaryColor }}
            >
              Kits
            </Link>
            : Groepeer gerelateerde assets voor eenvoudiger beheer
          </Text>

          <Text style={{ marginTop: "24px", ...styles.p }}>
            Hulp nodig? Bekijk onze Knowledge Base voor snelle antwoorden, of
            neem contact met ons op via {SUPPORT_EMAIL}.
          </Text>

          <Text style={{ ...styles.p }}>
            Vergeet niet dat je trial volledige toegang geeft tot alle premium
            functies. Haal er het meeste uit!
          </Text>

          <Text style={{ marginTop: "24px", ...styles.p }}>
            Veel plezier met asset tracking, <br />
            Carlos Virreira <br />
            Medeoprichter, TechOps Asset Management
            <br />
            P.S. Heb je vragen of feedback? Ik hoor graag van je. Reageer
            direct op deze e-mail, en laten we praten!
          </Text>
        </div>
      </Container>
    </Html>
  );
}

export const welcomeToTrialEmailHtml = ({
  firstName,
}: {
  firstName?: string | null;
}) => render(<WelcomeToTrialEmailTemplate firstName={firstName} />);
