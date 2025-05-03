import { UserRole } from "@shared/schema";
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { fileURLToPath } from 'url';
import path from 'path';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    console.log("Checking if admin already exists...");
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (existingAdmin) {
      console.log("Admin user already exists with ID:", existingAdmin.id);
      return;
    }
    
    console.log("Creating admin user...");
    const hashedPassword = await hashPassword("Admin123!");
    
    const admin = await storage.createUser({
      username: "admin",
      password: hashedPassword,
      name: "System Administrator",
      email: "admin@storeratings.com",
      address: "123 Admin Street",
      role: UserRole.ADMIN
    });
    
    console.log("Created admin user with ID:", admin.id);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the function if this file is executed directly
const currentFileUrl = import.meta.url;
const currentFilePath = fileURLToPath(currentFileUrl);
const mainModulePath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (currentFilePath === mainModulePath) {
  createAdminUser().then(() => process.exit(0));
}

export { createAdminUser };