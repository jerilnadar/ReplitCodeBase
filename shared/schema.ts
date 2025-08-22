import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("member"), // member, pastor
  instrumentRole: varchar("instrument_role"), // singer, guitarist, bassist, keyboard, drums, pa, melody
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serviceTypeEnum = pgEnum('service_type', ['wednesday', 'saturday', 'sunday']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected', 'needs_changes']);

// Monthly availability submissions
export const availabilities = pgTable("availabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: varchar("month").notNull(), // YYYY-MM format
  availableDates: text("available_dates").array(), // Array of date strings
  submittedAt: timestamp("submitted_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service schedules
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceType: serviceTypeEnum("service_type").notNull(),
  serviceDate: date("service_date").notNull(),
  serviceTime: varchar("service_time").notNull(),
  title: varchar("title").notNull(),
  approvalStatus: approvalStatusEnum("approval_status").notNull().default('pending'),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service member assignments
export const serviceAssignments = pgTable("service_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull(), // singer, guitarist, bassist, keyboard, drums, pa, melody
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type").notNull().default('info'), // info, warning, success, error
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  availabilities: many(availabilities),
  serviceAssignments: many(serviceAssignments),
  notifications: many(notifications),
  approvedServices: many(services),
}));

export const availabilitiesRelations = relations(availabilities, ({ one }) => ({
  user: one(users, { fields: [availabilities.userId], references: [users.id] }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  approver: one(users, { fields: [services.approvedBy], references: [users.id] }),
  assignments: many(serviceAssignments),
}));

export const serviceAssignmentsRelations = relations(serviceAssignments, ({ one }) => ({
  service: one(services, { fields: [serviceAssignments.serviceId], references: [services.id] }),
  user: one(users, { fields: [serviceAssignments.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// Insert schemas
export const insertAvailabilitySchema = createInsertSchema(availabilities).omit({
  id: true,
  submittedAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export const insertServiceAssignmentSchema = createInsertSchema(serviceAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availabilities.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertServiceAssignment = z.infer<typeof insertServiceAssignmentSchema>;
export type ServiceAssignment = typeof serviceAssignments.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
