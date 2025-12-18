// src/sync-db.js
import { sequelize } from "./models/index.js";

const syncDB = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync all models
    await sequelize.sync({ alter: true }); // Use { force: true } to drop & recreate tables
    console.log("✅ All tables created or updated successfully");

    process.exit(0); // Exit script
  } catch (err) {
    console.error("❌ Failed to sync database:", err);
    process.exit(1);
  }
};

syncDB();
