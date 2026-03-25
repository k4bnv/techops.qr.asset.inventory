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

interface AuditTrialEndsTomorrowProps {
  firstName?: string | null;
  email: string;
  hasPaymentMethod: boolean;
  trialEndDate: Date;
}

export const sendAuditTrialEndsTomorrowEmail = async ({
  firstName,
  email,
  hasPaymentMethod,
  trialEndDate,
}: AuditTrialEndsTomorrowProps) => {
  try {
    const subject = hasPaymentMethod
      ? "Uw proefperiode voor Audits eindigt morgen — herinnering voor automatische afschrijving"
      : "Uw proefperiode voor Audits eindigt morgen";
    const html = await auditTrialEndsTomorrowEmailHtml({
      firstName,
      hasPaymentMethod,
      trialEndDate,
    });
    const text = auditTrialEndsTomorrowEmailText({
      firstName,
      hasPaymentMethod,
      trialEndDate,
    });

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
        message:
          "Er is iets misgegaan bij het verzenden van de e-mail over de Audits-proefperiode die morgen afloopt",
        additionalData: { email },
        label: "User",
      })
    );
  }
};

export const auditTrialEndsTomorrowEmailText = ({
  firstName,
  hasPaymentMethod,
  trialEndDate,
}: {
  firstName?: string | null;
  hasPaymentMethod: boolean;
  trialEndDate: Date;
}) => {
  const dateStr = trialEndDate.toLocaleDateString("nl-NL", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (hasPaymentMethod) {
    return `Hoi${firstName ? ` ${firstName}` : ""},

ACTIE VEREIST: Kosten worden morgen in rekening gebracht. Uw proefperiode van 7 dagen voor Audits eindigt morgen (${dateStr}). Omdat u een betalingsmethode heeft geregistreerd, worden er automatisch kosten in rekening gebracht tegen het reguliere abonnementstarief. Om kosten te voorkomen, kunt u nu annuleren via uw abonnementsinstellingen: ${SERVER_URL}/account-details/subscription

Als u Audits wilt blijven gebruiken, is er geen actie vereist - alles wordt naadloos overgezet.

Als u vragen heeft, neem dan gerust contact met ons op via ${SUPPORT_EMAIL}. We helpen u graag!

Het TechOps Team
`;
  }

  return `Hoi${firstName ? ` ${firstName}` : ""},

Uw proefperiode van 7 dagen voor Audits eindigt morgen (${dateStr}). Omdat u geen betalingsmethode heeft geregistreerd, wordt uw toegang tot Audits gepauzeerd wanneer de proefperiode eindigt.

Om Audits zonder onderbreking te blijven gebruiken, voegt u een betalingsmethode toe voordat de proefperiode verloopt: ${SERVER_URL}/account-details/subscription

Maak u geen zorgen - uw auditgegevens worden niet verwijderd. Zodra u zich abonneert, staat alles weer precies waar u het heeft achtergelaten.

Als u vragen heeft, neem dan gerust contact met ons op via ${SUPPORT_EMAIL}. We helpen u graag!

Het TechOps Team
`;
};

function AuditTrialEndsTomorrowEmailTemplate({
  firstName,
  hasPaymentMethod,
  trialEndDate,
}: {
  firstName?: string | null;
  hasPaymentMethod: boolean;
  trialEndDate: Date;
}) {
  const { emailPrimaryColor } = config;

  const dateStr = trialEndDate.toLocaleDateString("nl-NL", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Html>
      <Head>
        <title>Uw proefperiode voor Audits eindigt morgen</title>
      </Head>

      <Container style={{ padding: "32px 16px", maxWidth: "100%" }}>
        <LogoForEmail />

        <div style={{ paddingTop: "8px" }}>
          <Text style={{ ...styles.p }}>
            Hoi{firstName ? ` ${firstName}` : ""},
          </Text>

          {hasPaymentMethod ? (
            <>
              <Text
                style={{
                  ...styles.p,
                  backgroundColor: "#FFF8E1",
                  border: "1px solid #FFE082",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <strong>Kosten worden morgen in rekening gebracht.</strong> Uw
                proefperiode van 7 dagen voor Audits eindigt morgen ({dateStr}).
                Omdat u een betalingsmethode heeft geregistreerd, worden er
                automatisch kosten in rekening gebracht tegen het reguliere
                abonnementstarief. Om kosten te voorkomen, kunt u nu annuleren
                via uw{" "}
                <Link
                  href={`${SERVER_URL}/account-details/subscription`}
                  style={{ color: emailPrimaryColor }}
                >
                  abonnementsinstellingen
                </Link>
                .
              </Text>

              <Button
                href={`${SERVER_URL}/account-details/subscription`}
                style={{
                  ...styles.button,
                  textAlign: "center" as const,
                  maxWidth: "250px",
                  marginBottom: "24px",
                }}
              >
                Abonnement beheren
              </Button>

              <Text style={{ ...styles.p }}>
                Als u Audits wilt blijven gebruiken, is er geen actie vereist —
                alles wordt naadloos overgezet.
              </Text>
            </>
          ) : (
            <>
              <Text style={{ ...styles.p }}>
                Uw <strong>proefperiode van 7 dagen voor Audits</strong> eindigt{" "}
                <strong>morgen</strong> ({dateStr}).
              </Text>

              <Text style={{ ...styles.p }}>
                Omdat u geen betalingsmethode heeft geregistreerd, wordt uw
                toegang tot Audits <strong>gepauzeerd</strong> wanneer de
                proefperiode eindigt.
              </Text>

              <Text style={{ ...styles.p }}>
                Om Audits zonder onderbreking te blijven gebruiken, voegt u een
                betalingsmethode toe voordat de proefperiode verloopt:
              </Text>

              <Button
                href={`${SERVER_URL}/account-details/subscription`}
                style={{
                  ...styles.button,
                  textAlign: "center" as const,
                  maxWidth: "250px",
                  marginBottom: "24px",
                }}
              >
                Betalingsmethode toevoegen
              </Button>

              <Text style={{ ...styles.p }}>
                Maak u geen zorgen — uw auditgegevens worden niet verwijderd.
                Zodra u zich abonneert, staat alles weer precies waar u het
                heeft achtergelaten.
              </Text>
            </>
          )}

          <Text style={{ marginTop: "24px", ...styles.p }}>
            Als u vragen heeft, neem dan gerust contact met ons op via{" "}
            {SUPPORT_EMAIL}. We helpen u graag!
          </Text>

          <Text style={{ marginTop: "24px", ...styles.p }}>Het TechOps Team</Text>
        </div>
      </Container>
    </Html>
  );
}

export const auditTrialEndsTomorrowEmailHtml = ({
  firstName,
  hasPaymentMethod,
  trialEndDate,
}: {
  firstName?: string | null;
  hasPaymentMethod: boolean;
  trialEndDate: Date;
}) =>
  render(
    <AuditTrialEndsTomorrowEmailTemplate
      firstName={firstName}
      hasPaymentMethod={hasPaymentMethod}
      trialEndDate={trialEndDate}
    />
  );
