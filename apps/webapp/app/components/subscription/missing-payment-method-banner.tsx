import { CustomerPortalForm } from "./customer-portal-form";

export function MissingPaymentMethodBanner() {
  return (
    <div
      role="alert"
      className="-mx-4 bg-warning-600 px-4 py-3 text-center text-sm text-white"
    >
      Uw abonnement heeft geen betaalmethode. Voeg a.u.b.{" "}
      <CustomerPortalForm
        buttonText="een betaalmethode toe"
        className="inline"
        buttonProps={{
          variant: "link",
          className: "font-semibold text-white underline hover:text-white/80",
        }}
      />{" "}
      vóór uw volgende factuurdatum om onderbreking van de service te voorkomen.
    </div>
  );
}
