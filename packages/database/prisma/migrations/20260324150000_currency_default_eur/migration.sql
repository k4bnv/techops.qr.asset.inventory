-- Change default currency from USD to EUR for new organizations
ALTER TABLE "Organization" ALTER COLUMN "currency" SET DEFAULT 'EUR';
