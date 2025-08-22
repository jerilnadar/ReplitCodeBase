import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAvailabilitySchema, insertServiceSchema, insertServiceAssignmentSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user profile
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateSchema = z.object({
        role: z.string().optional(),
        instrumentRole: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...existingUser,
        ...validatedData,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Availability routes
  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAvailabilitySchema.parse({
        ...req.body,
        userId,
      });
      
      const availability = await storage.submitAvailability(validatedData);
      res.json(availability);
    } catch (error) {
      console.error("Error submitting availability:", error);
      res.status(500).json({ message: "Failed to submit availability" });
    }
  });

  app.get('/api/availability/:month', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { month } = req.params;
      
      const availability = await storage.getUserAvailability(userId, month);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.get('/api/availability/month/:month', isAuthenticated, async (req: any, res) => {
    try {
      const { month } = req.params;
      const availabilities = await storage.getAllAvailabilitiesForMonth(month);
      res.json(availabilities);
    } catch (error) {
      console.error("Error fetching month availability:", error);
      res.status(500).json({ message: "Failed to fetch month availability" });
    }
  });

  // Service routes
  app.post('/api/services', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.get('/api/services/week/:startDate/:endDate', isAuthenticated, async (req: any, res) => {
    try {
      const { startDate, endDate } = req.params;
      const services = await storage.getServicesForWeek(startDate, endDate);
      res.json(services);
    } catch (error) {
      console.error("Error fetching week services:", error);
      res.status(500).json({ message: "Failed to fetch week services" });
    }
  });

  app.get('/api/services/month/:month', isAuthenticated, async (req: any, res) => {
    try {
      const { month } = req.params;
      const services = await storage.getServicesForMonth(month);
      res.json(services);
    } catch (error) {
      console.error("Error fetching month services:", error);
      res.status(500).json({ message: "Failed to fetch month services" });
    }
  });

  app.get('/api/services/pending', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'pastor') {
        return res.status(403).json({ message: "Only pastors can view pending services" });
      }
      
      const services = await storage.getPendingServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching pending services:", error);
      res.status(500).json({ message: "Failed to fetch pending services" });
    }
  });

  app.patch('/api/services/:serviceId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== 'pastor') {
        return res.status(403).json({ message: "Only pastors can approve services" });
      }
      
      const { serviceId } = req.params;
      const service = await storage.approveService(serviceId, userId);
      
      // Create notification for service approval
      await storage.createNotification({
        userId: userId, // This should be sent to all assigned members
        title: "Schedule Approved",
        message: `${service.title} has been approved by Pastor`,
        type: "success",
      });
      
      res.json(service);
    } catch (error) {
      console.error("Error approving service:", error);
      res.status(500).json({ message: "Failed to approve service" });
    }
  });

  app.patch('/api/services/:serviceId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user?.role !== 'pastor') {
        return res.status(403).json({ message: "Only pastors can update service status" });
      }
      
      const { serviceId } = req.params;
      const { status } = req.body;
      
      const service = await storage.updateServiceStatus(serviceId, status);
      res.json(service);
    } catch (error) {
      console.error("Error updating service status:", error);
      res.status(500).json({ message: "Failed to update service status" });
    }
  });

  // Service assignment routes
  app.post('/api/services/:serviceId/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const { serviceId } = req.params;
      const validatedData = insertServiceAssignmentSchema.parse({
        ...req.body,
        serviceId,
      });
      
      const assignment = await storage.createServiceAssignment(validatedData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating service assignment:", error);
      res.status(500).json({ message: "Failed to create service assignment" });
    }
  });

  app.get('/api/services/:serviceId/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const { serviceId } = req.params;
      const assignments = await storage.getServiceAssignments(serviceId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching service assignments:", error);
      res.status(500).json({ message: "Failed to fetch service assignments" });
    }
  });

  app.delete('/api/assignments/:assignmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { assignmentId } = req.params;
      await storage.removeServiceAssignment(assignmentId);
      res.json({ message: "Assignment removed successfully" });
    } catch (error) {
      console.error("Error removing service assignment:", error);
      res.status(500).json({ message: "Failed to remove service assignment" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:notificationId/read', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationId } = req.params;
      await storage.markNotificationRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
