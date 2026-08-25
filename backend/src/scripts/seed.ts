import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import prisma from "../config/db";

const sampleProducts = [
  {
    name: "Classic Leather Sneakers",
    description:
      "Premium full-grain leather sneakers with a minimalist silhouette, cushioned insole, and durable rubber sole. Perfect for everyday wear.",
    price: 89.99,
    category: "Footwear",
    brand: "Urbanist",
    stock: 25,
    images: ["https://placehold.co/600x600/f4f4f5/3452FF?text=Sneakers"],
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: "Merino Wool Sweater",
    description:
      "Soft, breathable merino wool sweater with a relaxed fit. Naturally temperature-regulating, ideal for layering in any season.",
    price: 64.5,
    category: "Clothing",
    brand: "Northfield",
    stock: 40,
    images: ["https://placehold.co/600x600/f4f4f5/3452FF?text=Sweater"],
    rating: 4.7,
    numReviews: 8,
  },
  {
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Over-ear headphones with active noise cancellation, 30-hour battery life, and studio-grade sound quality.",
    price: 199.0,
    category: "Electronics",
    brand: "SoundBox",
    stock: 15,
    images: ["https://placehold.co/600x600/f4f4f5/3452FF?text=Headphones"],
    rating: 4.8,
    numReviews: 34,
  },
  {
    name: "Ceramic Pour-Over Coffee Set",
    description:
      "Hand-glazed ceramic pour-over dripper with matching mug. Brews a clean, full-flavored cup every time.",
    price: 42.0,
    category: "Home & Kitchen",
    brand: "Brewhouse",
    stock: 30,
    images: ["https://placehold.co/600x600/f4f4f5/3452FF?text=Coffee+Set"],
    rating: 4.6,
    numReviews: 19,
  },
  {
    name: "Minimalist Canvas Backpack",
    description:
      'Water-resistant canvas backpack with a padded 15" laptop sleeve and multiple interior pockets for daily organization.',
    price: 75.0,
    category: "Accessories",
    brand: "Fieldbound",
    stock: 20,
    images: ["https://placehold.co/600x600/f4f4f5/3452FF?text=Backpack"],
    rating: 4.4,
    numReviews: 22,
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Double-walled, vacuum-insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 28.99,
    category: "Accessories",
    brand: "Fieldbound",
    stock: 60,
    images: ["https://placehold.co/600x600/f4f4f5/3452FF?text=Bottle"],
    rating: 4.3,
    numReviews: 15,
  },
  {
    name: "Smart Fitness Watch",
    description:
      "Track heart rate, sleep, and workouts with a bright always-on display and 7-day battery life.",
    price: 149.99,
    category: "Electronics",
    brand: "PulseTech",
    stock: 18,
    images: ["https://placehold.co/600x600/f4f4f5/3452FF?text=Smart+Watch"],
    rating: 4.2,
    numReviews: 27,
  },
  {
    name: "Linen Throw Pillow Cover",
    description:
      "Pre-washed European linen pillow cover with a hidden zipper closure. Adds texture and warmth to any room.",
    price: 22.0,
    category: "Home & Kitchen",
    brand: "Northfield",
    stock: 50,
    images: ["https://placehold.co/600x600/f4f4f5/3452FF?text=Pillow"],
    rating: 4.6,
    numReviews: 9,
  },
];

const seedDB = async () => {
  try {
    console.log("Connecting to Supabase PostgreSQL...");

    // Delete order matters because of foreign keys: children before parents
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("\ud83d\uddd1\ufe0f  Cleared existing data");

    const adminPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: adminPassword,
        role: "admin",
      },
    });
    console.log("\ud83d\udc51 Created admin account: admin@example.com / admin123");

    const customerPassword = await bcrypt.hash("user123", 10);
    await prisma.user.create({
      data: {
        name: "Test Customer",
        email: "user@example.com",
        password: customerPassword,
        role: "customer",
      },
    });
    console.log("\ud83d\udc64 Created customer account: user@example.com / user123");

    await prisma.product.createMany({ data: sampleProducts });
    console.log(`\ud83d\udce6 Created ${sampleProducts.length} sample products`);

    console.log("\n\u2705 Database seeded successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\u274c Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDB();
