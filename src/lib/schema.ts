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

export type CalendarDay = {
  day: number;
  type: "Reels" | "Carrossel" | "Story" | "Feed";
  theme: string;
  hook: string;
  caption: string;
  hashtags: string[];
};
