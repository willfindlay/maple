import * as Crypto from "expo-crypto";
import { getDatabase } from "./client";
import { categories } from "./schema";

interface SeedCategory {
  name: string;
  icon: string;
  color: string;
  isIncome: boolean;
  children?: { name: string; icon: string }[];
}

const DEFAULT_CATEGORIES: SeedCategory[] = [
  {
    name: "Housing",
    icon: "home",
    color: "#2D6A4F",
    isIncome: false,
    children: [
      { name: "Rent/Mortgage", icon: "building" },
      { name: "Property Tax", icon: "landmark" },
      { name: "Home Insurance", icon: "shield" },
      { name: "Maintenance", icon: "wrench" },
      { name: "Utilities", icon: "zap" },
    ],
  },
  {
    name: "Food",
    icon: "utensils",
    color: "#E07A5F",
    isIncome: false,
    children: [
      { name: "Groceries", icon: "shopping-cart" },
      { name: "Restaurants", icon: "utensils-crossed" },
      { name: "Coffee", icon: "coffee" },
    ],
  },
  {
    name: "Transport",
    icon: "car",
    color: "#3D5A80",
    isIncome: false,
    children: [
      { name: "Gas", icon: "fuel" },
      { name: "Public Transit", icon: "train" },
      { name: "Parking", icon: "square-parking" },
      { name: "Car Insurance", icon: "shield" },
      { name: "Car Maintenance", icon: "wrench" },
    ],
  },
  {
    name: "Entertainment",
    icon: "film",
    color: "#9B5DE5",
    isIncome: false,
    children: [
      { name: "Subscriptions", icon: "tv" },
      { name: "Hobbies", icon: "palette" },
      { name: "Events", icon: "ticket" },
    ],
  },
  {
    name: "Health",
    icon: "heart-pulse",
    color: "#EE6C4D",
    isIncome: false,
    children: [
      { name: "Medical", icon: "stethoscope" },
      { name: "Dental", icon: "smile" },
      { name: "Pharmacy", icon: "pill" },
      { name: "Fitness", icon: "dumbbell" },
    ],
  },
  {
    name: "Insurance",
    icon: "shield-check",
    color: "#457B9D",
    isIncome: false,
    children: [
      { name: "Life Insurance", icon: "heart" },
      { name: "Disability Insurance", icon: "shield" },
    ],
  },
  {
    name: "Personal",
    icon: "user",
    color: "#6D6875",
    isIncome: false,
    children: [
      { name: "Clothing", icon: "shirt" },
      { name: "Personal Care", icon: "sparkles" },
      { name: "Education", icon: "graduation-cap" },
      { name: "Gifts", icon: "gift" },
    ],
  },
  {
    name: "Debt Payments",
    icon: "credit-card",
    color: "#BC4749",
    isIncome: false,
    children: [
      { name: "Student Loans", icon: "graduation-cap" },
      { name: "Line of Credit", icon: "landmark" },
    ],
  },
  {
    name: "Savings",
    icon: "piggy-bank",
    color: "#1B4332",
    isIncome: false,
    children: [
      { name: "Emergency Fund", icon: "shield" },
      { name: "Investments", icon: "trending-up" },
      { name: "TFSA", icon: "landmark" },
      { name: "RRSP", icon: "landmark" },
    ],
  },
  {
    name: "Income",
    icon: "wallet",
    color: "#2B9348",
    isIncome: true,
    children: [
      { name: "Salary", icon: "briefcase" },
      { name: "Freelance", icon: "laptop" },
      { name: "Investment Income", icon: "trending-up" },
      { name: "Government Benefits", icon: "landmark" },
      { name: "Other Income", icon: "plus-circle" },
    ],
  },
  {
    name: "Other",
    icon: "circle-ellipsis",
    color: "#8D99AE",
    isIncome: false,
  },
];

/**
 * Seed default categories into the database.
 * Only runs if the categories table is empty.
 */
export async function seedCategories() {
  const db = getDatabase();
  const existing = db.select().from(categories).limit(1).all();
  if (existing.length > 0) return;

  let sortOrder = 0;
  for (const cat of DEFAULT_CATEGORIES) {
    const parentId = Crypto.randomUUID();
    db.insert(categories)
      .values({
        id: parentId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        isIncome: cat.isIncome,
        sortOrder: sortOrder++,
      })
      .run();

    if (cat.children) {
      for (const child of cat.children) {
        db.insert(categories)
          .values({
            id: Crypto.randomUUID(),
            name: child.name,
            parentId,
            icon: child.icon,
            color: cat.color,
            isIncome: cat.isIncome,
            sortOrder: sortOrder++,
          })
          .run();
      }
    }
  }
}
