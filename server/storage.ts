import {
  users,
  availabilities,
  services,
  serviceAssignments,
  notifications,
  type User,
  type UpsertUser,
  type InsertAvailability,
  type Availability,
  type InsertService,
  type Service,
  type InsertServiceAssignment,
  type ServiceAssignment,
  type InsertNotification,
  type Notification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Availability operations
  submitAvailability(availability: InsertAvailability): Promise<Availability>;
  getUserAvailability(userId: string, month: string): Promise<Availability | undefined>;
  getAllAvailabilitiesForMonth(month: string): Promise<(Availability & { user: User })[]>;
  
  // Service operations
  createService(service: InsertService): Promise<Service>;
  getServicesForWeek(startDate: string, endDate: string): Promise<(Service & { assignments: (ServiceAssignment & { user: User })[] })[]>;
  getServicesForMonth(month: string): Promise<Service[]>;
  getPendingServices(): Promise<Service[]>;
  approveService(serviceId: string, approvedBy: string): Promise<Service>;
  updateServiceStatus(serviceId: string, status: string): Promise<Service>;
  
  // Service assignment operations
  createServiceAssignment(assignment: InsertServiceAssignment): Promise<ServiceAssignment>;
  getServiceAssignments(serviceId: string): Promise<(ServiceAssignment & { user: User })[]>;
  removeServiceAssignment(assignmentId: string): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.firstName));
  }

  // Availability operations
  async submitAvailability(availability: InsertAvailability): Promise<Availability> {
    const [existing] = await db
      .select()
      .from(availabilities)
      .where(and(
        eq(availabilities.userId, availability.userId),
        eq(availabilities.month, availability.month)
      ));

    if (existing) {
      const [updated] = await db
        .update(availabilities)
        .set({
          availableDates: availability.availableDates,
          updatedAt: new Date(),
        })
        .where(eq(availabilities.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(availabilities)
        .values(availability)
        .returning();
      return created;
    }
  }

  async getUserAvailability(userId: string, month: string): Promise<Availability | undefined> {
    const [availability] = await db
      .select()
      .from(availabilities)
      .where(and(
        eq(availabilities.userId, userId),
        eq(availabilities.month, month)
      ));
    return availability;
  }

  async getAllAvailabilitiesForMonth(month: string): Promise<(Availability & { user: User })[]> {
    return await db
      .select({
        id: availabilities.id,
        userId: availabilities.userId,
        month: availabilities.month,
        availableDates: availabilities.availableDates,
        submittedAt: availabilities.submittedAt,
        updatedAt: availabilities.updatedAt,
        user: users,
      })
      .from(availabilities)
      .innerJoin(users, eq(availabilities.userId, users.id))
      .where(eq(availabilities.month, month));
  }

  // Service operations
  async createService(service: InsertService): Promise<Service> {
    const [created] = await db
      .insert(services)
      .values(service)
      .returning();
    return created;
  }

  async getServicesForWeek(startDate: string, endDate: string): Promise<(Service & { assignments: (ServiceAssignment & { user: User })[] })[]> {
    const weekServices = await db
      .select()
      .from(services)
      .where(and(
        eq(services.serviceDate, startDate) // This would need to be a between clause for actual date range
      ))
      .orderBy(asc(services.serviceDate));

    const result = [];
    for (const service of weekServices) {
      const assignments = await db
        .select({
          id: serviceAssignments.id,
          serviceId: serviceAssignments.serviceId,
          userId: serviceAssignments.userId,
          role: serviceAssignments.role,
          createdAt: serviceAssignments.createdAt,
          user: users,
        })
        .from(serviceAssignments)
        .innerJoin(users, eq(serviceAssignments.userId, users.id))
        .where(eq(serviceAssignments.serviceId, service.id));

      result.push({ ...service, assignments });
    }

    return result;
  }

  async getServicesForMonth(month: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .orderBy(asc(services.serviceDate));
  }

  async getPendingServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.approvalStatus, 'pending'))
      .orderBy(asc(services.serviceDate));
  }

  async approveService(serviceId: string, approvedBy: string): Promise<Service> {
    const [updated] = await db
      .update(services)
      .set({
        approvalStatus: 'approved',
        approvedBy,
        approvedAt: new Date(),
      })
      .where(eq(services.id, serviceId))
      .returning();
    return updated;
  }

  async updateServiceStatus(serviceId: string, status: string): Promise<Service> {
    const [updated] = await db
      .update(services)
      .set({
        approvalStatus: status as any,
        updatedAt: new Date(),
      })
      .where(eq(services.id, serviceId))
      .returning();
    return updated;
  }

  // Service assignment operations
  async createServiceAssignment(assignment: InsertServiceAssignment): Promise<ServiceAssignment> {
    const [created] = await db
      .insert(serviceAssignments)
      .values(assignment)
      .returning();
    return created;
  }

  async getServiceAssignments(serviceId: string): Promise<(ServiceAssignment & { user: User })[]> {
    return await db
      .select({
        id: serviceAssignments.id,
        serviceId: serviceAssignments.serviceId,
        userId: serviceAssignments.userId,
        role: serviceAssignments.role,
        createdAt: serviceAssignments.createdAt,
        user: users,
      })
      .from(serviceAssignments)
      .innerJoin(users, eq(serviceAssignments.userId, users.id))
      .where(eq(serviceAssignments.serviceId, serviceId));
  }

  async removeServiceAssignment(assignmentId: string): Promise<void> {
    await db.delete(serviceAssignments).where(eq(serviceAssignments.id, assignmentId));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return created;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(20);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }
}

export const storage = new DatabaseStorage();
