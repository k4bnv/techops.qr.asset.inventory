import {
  Button,
  Container,
  Head,
  Html,
  Link,
  render,
  Text,
} from "@react-email/components";
import { AUDIT_ADDON } from "~/config/addon-copy";
import { config } from "~/config/shelf.config";
import { SERVER_URL, SUPPORT_EMAIL } from "~/utils/env";
import { ShelfError } from "~/utils/error";
import { Logger } from "~/utils/logger";
import { LogoForEmail } from "../logo";
import { sendEmail } from "../mail.server";
import { styles } from "../styles";

interface AuditTrialWelcomeProps {
  firstName?: string | null;
  email: string;
  hasPaymentMethod?: boolean;
}

export const sendAuditTrialWelcomeEmail = async ({
  firstName,
  email,
  hasPaymentMethod,
}: AuditTrialWelcomeProps) => {
  try {
    const subject = "Uw proefperiode van 7 dagen voor Audits is nu actief!";
    const html = await auditTrialWelcomeEmailHtml({
      firstName,
      hasPaymentMethod,
    });
    const text = auditTrialWelcomeEmailText({ firstName, hasPaymentMethod });

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
          "Er is iets misgegaan bij het verzenden van de welkomst-e-mail voor de proefperiode van Audits",
        additionalData: { email },
        label: "User",
      })
    );
  }
};

export const auditTrialWelcomeEmailText = ({
  firstName,
  hasPaymentMethod,
}: {
  firstName?: string | null;
  hasPaymentMethod?: boolean;
}) => `Hoi${firstName ? ` ${firstName}` : ""},

Goed nieuws - uw proefperiode van 7 dagen voor Audits is nu actief! U heeft vanaf vandaag volledige toegang tot alle auditfuncties.

Dit is wat u kunt doen met Audits:

${AUDIT_ADDON.features.map((f) => `- ${f}`).join("\n")}

Begin nu: ${SERVER_URL}/audits
${
  hasPaymentMethod
    ? `\nBelangrijk: Omdat u al een betalingsmethode heeft geregistreerd, wordt uw abonnement automatisch voortgezet na afloop van de proefperiode van 7 dagen. Als u besluit dat Audits niets voor u is, kunt u op elk moment voordat de proefperiode eindigt annuleren via uw abonnementsinstellingen om kosten te voorkomen.\n\nBeheer uw abonnement: ${SERVER_URL}/account-details/subscription`
    : ""
}

Als u vragen heeft, neem dan gerust contact met ons op via ${SUPPORT_EMAIL}. We helpen u graag!

Veel plezier met auditen,
Het TechOps Team
`;

function AuditTrialWelcomeEmailTemplate({
  firstName,
  hasPaymentMethod,
}: {
  firstName?: string | null;
  hasPaymentMethod?: boolean;
}) {
  const { emailPrimaryColor } = config;

  return (
    <Html>
      <Head>
        <title>Uw proefperiode van 7 dagen voor Audits is nu actief!</title>
      </Head>

      <Container style={{ padding: "32px 16px", maxWidth: "100%" }}>
        <LogoForEmail />

        <div style={{ paddingTop: "8px" }}>
          <Text style={{ ...styles.p }}>
            Hoi{firstName ? ` ${firstName}` : ""},
          </Text>

          <Text style={{ ...styles.p }}>
            Goed nieuws - uw <strong>proefperiode van 7 dagen voor Audits</strong> is nu actief!
            U heeft vanaf vandaag volledige toegang tot alle auditfuncties.
          </Text>

          <Text style={{ ...styles.h2 }}>
            Dit is wat u kunt doen met Audits:
          </Text>

          <ul style={{ ...styles.li, paddingLeft: "20px" }}>
            {AUDIT_ADDON.features.map((feature) => (
              <li key={feature} style={{ marginBottom: "8px" }}>
                {feature}
              </li>
            ))}
          </ul>

          <Button
            href={`${SERVER_URL}/audits`}
            style={{
              ...styles.button,
              textAlign: "center" as const,
              maxWidth: "200px",
              marginBottom: "24px",
            }}
          >
            Start uw eerste audit
          </Button>

          {hasPaymentMethod ? (
            <Text
              style={{
                ...styles.p,
                backgroundColor: "#FFF8E1",
                border: "1px solid #FFE082",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <strong>Belangrijk:</strong> Omdat u al een betalingsmethode heeft
              geregistreerd, wordt uw abonnement automatisch voortgezet na
              afloop van de proefperiode van 7 dagen. Als u besluit dat Audits
              niets voor u is, kunt u op elk moment voordat de proefperiode
              eindigt annuleren via uw{" "}
              <Link
                href={`${SERVER_URL}/account-details/subscription`}
                style={{ color: emailPrimaryColor }}
              >
                abonnementsinstellingen
              </Link>{" "}
              om kosten te voorkomen.
            </Text>
          ) : null}

          <Text style={{ marginTop: "24px", ...styles.p }}>
            Als u vragen heeft, neem dan gerust contact met ons op via{" "}
            {SUPPORT_EMAIL}. We helpen u graag!
          </Text>

          <Text style={{ marginTop: "24px", ...styles.p }}>
            Veel plezier met auditen, <br />
            Het TechOps Team
          </Text>
        </div>
      </Container>
    </Html>
  );
}

export const auditTrialWelcomeEmailHtml = ({
  firstName,
  hasPaymentMethod,
}: {
  firstName?: string | null;
  hasPaymentMethod?: boolean;
}) =>
  render(
    <AuditTrialWelcomeEmailTemplate
      firstName={firstName}
      hasPaymentMethod={hasPaymentMethod}
    />
  );
