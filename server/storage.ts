import { users, type User, type InsertUser, stores, type Store, type InsertStore, ratings, type Rating, type InsertRating, UserRole } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Define the storage interface
export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, hashedPassword: string): Promise<User>;
  getUsersByRole(role: UserRole): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // Store operations
  getStore(id: number): Promise<Store | undefined>;
  getStoreByName(name: string): Promise<Store | undefined>;
  getStoreByOwner(userId: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  linkStoreToOwner(userId: number, storeId: number): Promise<void>;
  getAllStores(): Promise<Store[]>;
  deleteStore(id: number): Promise<void>;
  
  // Rating operations
  rateStore(rating: InsertRating): Promise<Rating>;
  getStoreRatings(storeId: number): Promise<Rating[]>;
  getUserRating(userId: number, storeId: number): Promise<Rating | undefined>;
  getAllRatings(): Promise<Rating[]>;
  
  // Stats operations
  getStoreAverageRating(storeId: number): Promise<number>;
  getStoreRatingCount(storeId: number): Promise<number>;
  getTotalUsers(): Promise<number>;
  getTotalStores(): Promise<number>;
  getTotalRatings(): Promise<number>;
  
  // Advanced queries
  getStoresWithRatings(): Promise<(Store & { averageRating: number })[]>;
  getUsersWhoRatedStore(storeId: number): Promise<(User & { rating: number })[]>;
}

export class MemStorage implements IStorage {
  private userStore: Map<number, User>;
  private storeStore: Map<number, Store>;
  private ratingStore: Map<number, Rating>;
  public sessionStore: session.Store;
  
  private userIdCounter: number = 1;
  private storeIdCounter: number = 1;
  private ratingIdCounter: number = 1;

  constructor() {
    this.userStore = new Map();
    this.storeStore = new Map();
    this.ratingStore = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Create admin user with default credentials
    this.createUser({
      username: "admin",
      password: "Admin123!",
      name: "System Administrator",
      email: "admin@storeratings.com",
      address: "123 Admin Street",
      role: UserRole.ADMIN
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.userStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.userStore.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...userData, 
      id, 
      createdAt: new Date(),
      storeId: null
    };
    this.userStore.set(id, user);
    return user;
  }
  
  async updateUserPassword(id: number, hashedPassword: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, password: hashedPassword };
    this.userStore.set(id, updatedUser);
    return updatedUser;
  }
  
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.userStore.values()).filter(user => user.role === role);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.userStore.values());
  }
  
  async deleteUser(id: number): Promise<void> {
    this.userStore.delete(id);
    
    // Delete all ratings made by this user
    const userRatings = Array.from(this.ratingStore.values())
      .filter(rating => rating.userId === id);
      
    for (const rating of userRatings) {
      this.ratingStore.delete(rating.id);
    }
  }
  
  // Store methods
  async getStore(id: number): Promise<Store | undefined> {
    return this.storeStore.get(id);
  }
  
  async getStoreByName(name: string): Promise<Store | undefined> {
    return Array.from(this.storeStore.values()).find(
      (store) => store.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async getStoreByOwner(userId: number): Promise<Store | undefined> {
    const user = await this.getUser(userId);
    if (!user || !user.storeId) return undefined;
    return this.getStore(user.storeId);
  }
  
  async createStore(storeData: InsertStore): Promise<Store> {
    const id = this.storeIdCounter++;
    const store: Store = {
      ...storeData,
      id,
      createdAt: new Date()
    };
    this.storeStore.set(id, store);
    return store;
  }
  
  async linkStoreToOwner(userId: number, storeId: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const store = await this.getStore(storeId);
    if (!store) throw new Error("Store not found");
    
    const updatedUser = { ...user, storeId };
    this.userStore.set(userId, updatedUser);
  }
  
  async getAllStores(): Promise<Store[]> {
    return Array.from(this.storeStore.values());
  }
  
  async deleteStore(id: number): Promise<void> {
    this.storeStore.delete(id);
    
    // Update users who are owners of this store
    const storeOwners = Array.from(this.userStore.values())
      .filter(user => user.storeId === id);
      
    for (const owner of storeOwners) {
      const updatedOwner = { ...owner, storeId: null };
      this.userStore.set(owner.id, updatedOwner);
    }
    
    // Delete all ratings for this store
    const storeRatings = Array.from(this.ratingStore.values())
      .filter(rating => rating.storeId === id);
      
    for (const rating of storeRatings) {
      this.ratingStore.delete(rating.id);
    }
  }
  
  // Rating methods
  async rateStore(ratingData: InsertRating): Promise<Rating> {
    // Check if this user already rated this store
    const existingRating = await this.getUserRating(ratingData.userId, ratingData.storeId);
    
    if (existingRating) {
      // Update existing rating
      const updatedRating = { 
        ...existingRating, 
        rating: ratingData.rating,
        createdAt: new Date()
      };
      this.ratingStore.set(existingRating.id, updatedRating);
      return updatedRating;
    } else {
      // Create new rating
      const id = this.ratingIdCounter++;
      const rating: Rating = {
        ...ratingData,
        id,
        createdAt: new Date()
      };
      this.ratingStore.set(id, rating);
      return rating;
    }
  }
  
  async getStoreRatings(storeId: number): Promise<Rating[]> {
    return Array.from(this.ratingStore.values())
      .filter(rating => rating.storeId === storeId);
  }
  
  async getUserRating(userId: number, storeId: number): Promise<Rating | undefined> {
    return Array.from(this.ratingStore.values()).find(
      rating => rating.userId === userId && rating.storeId === storeId
    );
  }
  
  async getAllRatings(): Promise<Rating[]> {
    return Array.from(this.ratingStore.values());
  }
  
  // Stats methods
  async getStoreAverageRating(storeId: number): Promise<number> {
    const ratings = await this.getStoreRatings(storeId);
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return parseFloat((sum / ratings.length).toFixed(1));
  }
  
  async getStoreRatingCount(storeId: number): Promise<number> {
    const ratings = await this.getStoreRatings(storeId);
    return ratings.length;
  }
  
  async getTotalUsers(): Promise<number> {
    return this.userStore.size;
  }
  
  async getTotalStores(): Promise<number> {
    return this.storeStore.size;
  }
  
  async getTotalRatings(): Promise<number> {
    return this.ratingStore.size;
  }
  
  // Advanced queries
  async getStoresWithRatings(): Promise<(Store & { averageRating: number })[]> {
    const stores = await this.getAllStores();
    return Promise.all(
      stores.map(async (store) => {
        const averageRating = await this.getStoreAverageRating(store.id);
        return { ...store, averageRating };
      })
    );
  }
  
  async getUsersWhoRatedStore(storeId: number): Promise<(User & { rating: number })[]> {
    const ratings = await this.getStoreRatings(storeId);
    
    return Promise.all(
      ratings.map(async (rating) => {
        const user = await this.getUser(rating.userId);
        if (!user) throw new Error("User not found");
        return { ...user, rating: rating.rating };
      })
    );
  }
}

export const storage = new MemStorage();
