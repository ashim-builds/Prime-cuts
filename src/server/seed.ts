import { initializeDatabase } from "./db";

async function runSeed() {
  console.log("Starting database initialization and seed...");
  await initializeDatabase();
  console.log("Seed complete! Exiting.");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
