function getEnv(name: string) {
  return process.env[name] ?? "";
}

export const env = {
  DATABASE_URL: getEnv("DATABASE_URL"),
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_ID_MONTHLY_100JPY: getEnv("STRIPE_PRICE_ID_MONTHLY_100JPY"),
  NEXT_PUBLIC_APP_URL: getEnv("NEXT_PUBLIC_APP_URL"),
};

export function requireDatabaseUrl() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
}

export function requireStripeSecretKey() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is required.");
  }
}

export function requireStripeWebhookSecret() {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required.");
  }
}

export function requireStripePriceIdMonthly100JPY() {
  if (!env.STRIPE_PRICE_ID_MONTHLY_100JPY) {
    throw new Error("STRIPE_PRICE_ID_MONTHLY_100JPY is required.");
  }
}

export function requireNextPublicAppUrl() {
  if (!env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is required.");
  }
}

