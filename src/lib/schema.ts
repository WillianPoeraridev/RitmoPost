import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  plan: text("plan").notNull().default("free"),
  generationsUsed: integer("generations_used").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planExpiresAt: timestamp("plan_expires_at"),
  // WhatsApp delivery (Pro): número em formato internacional (5551999998888) + opt-in explícito.
  whatsappNumber: text("whatsapp_number"),
  whatsappOptIn: boolean("whatsapp_opt_in").notNull().default(false),
  // Chaves dos e-mails de retenção já enviados (ex: ["d3","d7"]) — evita reenvio.
  sentEmails: jsonb("sent_emails").$type<string[]>().notNull().default([]),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const businessProfile = pgTable("business_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  niche: text("niche").notNull(),
  services: jsonb("services").$type<BusinessService[]>().notNull().default([]),
  tone: text("tone").$type<BusinessTone>().notNull().default("descontraido"),
  differentials: text("differentials").notNull().default(""),
  city: text("city").notNull().default(""),
  neighborhood: text("neighborhood").notNull().default(""),
  recurringPromos: text("recurring_promos"),
  instagramHandle: text("instagram_handle"),
  // URL pública da logo no R2 — renderizada nos carrosséis. Nullable: perfil sem logo continua válido.
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export type BusinessService = { name: string; price?: string };
export type BusinessTone = "descontraido" | "profissional" | "premium";
export type BusinessProfileRow = typeof businessProfile.$inferSelect;

export const calendar = pgTable("calendar", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // Nullable: calendários antigos (pré-perfil) continuam abrindo normalmente.
  profileId: text("profile_id").references(() => businessProfile.id, {
    onDelete: "set null",
  }),
  niche: text("niche").notNull(),
  businessName: text("business_name").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  content: jsonb("content").$type<CalendarDay[]>().notNull(),
  createdAt: timestamp("created_at").notNull(),
});

// Função estratégica do post no método MoneyBranding (ver ROADMAP / ref):
// atracao = para o scroll de quem não te conhece (tese/posicionamento, traz seguidor);
// conexao = bastidor/relato que gera confiança em quem já segue;
// conversao = convite leve pra agir (agendar/pedir/aproveitar promo).
export type ContentPillar = "atracao" | "conexao" | "conversao";

export const PILLAR_LABELS: Record<ContentPillar, string> = {
  atracao: "Atração",
  conexao: "Conexão",
  conversao: "Conversão",
};

export type CalendarDay = {
  day: number;
  type: "Reels" | "Carrossel" | "Story" | "Feed";
  // Opcionais: calendários gerados antes do método não têm esses campos e
  // continuam abrindo/renderizando normalmente (jsonb é schemaless — sem migration).
  pillar?: ContentPillar;
  theme: string;
  hook: string;
  caption: string;
  hashtags: string[];
  // Camada diária de Conexão: uma ideia curta de Story pra aquele dia.
  story?: string;
};
