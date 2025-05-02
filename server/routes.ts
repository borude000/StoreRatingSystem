import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertStoreSchema, insertRatingSchema, UserRole } from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user has admin role
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user?.role === UserRole.ADMIN) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

// Middleware to check if user is a store owner
const isStoreOwner = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user?.role === UserRole.STORE_OWNER) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Admin Routes
  // Get dashboard stats
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const totalUsers = await storage.getTotalUsers();
      const totalStores = await storage.getTotalStores();
      const totalRatings = await storage.getTotalRatings();
      res.json({ totalUsers, totalStores, totalRatings });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  
  // Get all stores with ratings
  app.get("/api/admin/stores", isAdmin, async (req, res) => {
    try {
      const stores = await storage.getStoresWithRatings();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stores" });
    }
  });
  
  // Get all users
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  // Create a new store
  app.post("/api/admin/stores", isAdmin, async (req, res) => {
    try {
      const validation = insertStoreSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.message });
      }
      
      const existingStore = await storage.getStoreByName(req.body.name);
      if (existingStore) {
        return res.status(400).json({ message: "Store name already exists" });
      }
      
      const store = await storage.createStore(req.body);
      
      // If ownerEmail is provided, link the store to the owner
      if (req.body.ownerEmail) {
        const owner = await storage.getUserByEmail(req.body.ownerEmail);
        if (owner && owner.role === UserRole.STORE_OWNER) {
          await storage.linkStoreToOwner(owner.id, store.id);
        }
      }
      
      res.status(201).json(store);
    } catch (error) {
      res.status(500).json({ message: "Error creating store" });
    }
  });
  
  // Delete a store
  app.delete("/api/admin/stores/:id", isAdmin, async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      await storage.deleteStore(storeId);
      res.status(200).json({ message: "Store deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting store" });
    }
  });
  
  // Delete a user
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user" });
    }
  });
  
  // User Routes
  // Get all stores with ratings
  app.get("/api/stores", isAuthenticated, async (req, res) => {
    try {
      const stores = await storage.getStoresWithRatings();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Error fetching stores" });
    }
  });
  
  // Get a specific store with ratings
  app.get("/api/stores/:id", isAuthenticated, async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const store = await storage.getStore(storeId);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      const averageRating = await storage.getStoreAverageRating(storeId);
      const ratingCount = await storage.getStoreRatingCount(storeId);
      
      // Get user's rating for this store if exists
      let userRating = null;
      if (req.user) {
        const rating = await storage.getUserRating(req.user.id, storeId);
        if (rating) {
          userRating = rating.rating;
        }
      }
      
      res.json({
        ...store,
        averageRating,
        ratingCount,
        userRating
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching store" });
    }
  });
  
  // Rate a store
  app.post("/api/stores/:id/rate", isAuthenticated, async (req, res) => {
    try {
      const storeId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      const ratingData = {
        userId,
        storeId,
        rating: req.body.rating
      };
      
      const validation = insertRatingSchema.safeParse(ratingData);
      if (!validation.success) {
        return res.status(400).json({ message: validation.error.message });
      }
      
      const store = await storage.getStore(storeId);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      const rating = await storage.rateStore(ratingData);
      const averageRating = await storage.getStoreAverageRating(storeId);
      
      res.status(200).json({ rating, averageRating });
    } catch (error) {
      res.status(500).json({ message: "Error rating store" });
    }
  });
  
  // Store Owner Routes
  // Get store owner dashboard data
  app.get("/api/owner/dashboard", isStoreOwner, async (req, res) => {
    try {
      const userId = req.user!.id;
      const store = await storage.getStoreByOwner(userId);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found for this owner" });
      }
      
      const averageRating = await storage.getStoreAverageRating(store.id);
      const ratingCount = await storage.getStoreRatingCount(store.id);
      const usersWithRatings = await storage.getUsersWhoRatedStore(store.id);
      
      res.json({
        store,
        averageRating,
        ratingCount,
        usersWithRatings
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
