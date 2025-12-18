import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './src/models/index.js'; // path to your index.js

async function syncDB() {
  
const [currentUser] = await sequelize.query('SELECT current_user;');
console.log('PostgreSQL current user:', currentUser);

try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync({ alter: true }); // or { force: true } to drop & recreate
    console.log("✅ All models synced");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  } finally {
    await sequelize.close();
  }
}

syncDB();
