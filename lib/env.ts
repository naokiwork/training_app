export function getEnv(name: string): string | undefined {
  return process.env[name];
}

export function requireEnvRuntime(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV !== "production") {
    console.warn(`${name} is not set (build phase safe mode).`);
  }
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required.`);
  }
  return value!;
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_ID_MONTHLY_100JPY: getEnv("STRIPE_PRICE_ID_MONTHLY_100JPY"),
  NEXT_PUBLIC_APP_URL: getEnv("NEXT_PUBLIC_APP_URL"),
};

export function requireDatabaseUrl() {
  return requireEnvRuntime("DATABASE_URL");
}

export function requireStripeSecretKey() {
  return requireEnvRuntime("STRIPE_SECRET_KEY");
}

export function requireStripeWebhookSecret() {
  return requireEnvRuntime("STRIPE_WEBHOOK_SECRET");
}

export function requireStripePriceIdMonthly100JPY() {
  return requireEnvRuntime("STRIPE_PRICE_ID_MONTHLY_100JPY");
}

export function requireNextPublicAppUrl() {
  return requireEnvRuntime("NEXT_PUBLIC_APP_URL");
}

