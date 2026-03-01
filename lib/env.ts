function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export const env = {
  DATABASE_URL: requiredEnv("DATABASE_URL"),
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  STRIPE_PRICE_ID_MONTHLY_100JPY: process.env.STRIPE_PRICE_ID_MONTHLY_100JPY ?? "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export function assertBillingEnv() {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is required for billing.");
  if (!env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET is required for billing.");
  if (!env.STRIPE_PRICE_ID_MONTHLY_100JPY) {
    throw new Error("STRIPE_PRICE_ID_MONTHLY_100JPY is required for billing.");
  }
}
