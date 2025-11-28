import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());
const router = express.Router();


// --------------------------------
// 1️⃣ PostgreSQL Connection Setup
// --------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g. postgres://user:pass@localhost:5432/dbname
});

// --------------------------------
// 2️⃣ Create Tables (API Endpoint)
// --------------------------------
app.get("/create-tables", async (req, res) => {
  const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS users (
    user_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Not Provided',
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    user_type VARCHAR(50) DEFAULT 'user',
    aadhar_no BIGINT UNIQUE DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS owners (
    owner_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL DEFAULT 'Not Provided',
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    user_type VARCHAR(50) DEFAULT 'owner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aadhar_no BIGINT UNIQUE DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS hostels (
    hostel_id BIGSERIAL PRIMARY KEY,
    hostel_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    amenities JSONB DEFAULT '{}'::JSONB,
    price NUMERIC(10,2) NOT NULL,
    owner_id INTEGER REFERENCES owners(owner_id) ON DELETE CASCADE,
    popular INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS food_menus (
    food_menu_id BIGSERIAL PRIMARY KEY,
    hostel_id INTEGER NOT NULL REFERENCES hostels(hostel_id) ON DELETE CASCADE,
    breakfast JSONB NOT NULL,
    lunch JSONB NOT NULL,
    dinner JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS otps (
    id BIGSERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('registration', 'login', 'booking', 'reset_password')),
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP DEFAULT NULL,
    attempts INT DEFAULT 0 CHECK (attempts <= 5),
    CONSTRAINT unique_identifier_purpose UNIQUE (identifier, purpose)
  );
  `;

  try {
    await pool.query(createTablesQuery);
    res.json({ message: "✅ All tables created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ Error creating tables", details: error.message });
  }
});

// --------------------------------
// 3️⃣ Insert Data Routes
// --------------------------------

// ➕ Add User
app.post("/users", async (req, res) => {
  const { name, email, phone, password, gender, aadhar_no } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, gender, aadhar_no)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, email, phone, password, gender, aadhar_no]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add Owner
app.post("/owners", async (req, res) => {
  const { name, phone, email, password, aadhar_no } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO owners (name, phone, email, password, aadhar_no)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, phone, email, password, aadhar_no]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add Hostel
app.post("/hostels", async (req, res) => {
  const { hostel_name, city, area, address, rating, amenities, price, owner_id, popular } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO hostels (hostel_name, city, area, address, rating, amenities, price, owner_id, popular)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [hostel_name, city, area, address, rating, amenities, price, owner_id, popular]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add Food Menu
app.post("/food-menus", async (req, res) => {
  const { hostel_id, breakfast, lunch, dinner } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO food_menus (hostel_id, breakfast, lunch, dinner)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [hostel_id, breakfast, lunch, dinner]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add OTP
app.post("/otps", async (req, res) => {
  const { identifier, purpose, otp_code, expires_at } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO otps (identifier, purpose, otp_code, expires_at)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [identifier, purpose, otp_code, expires_at]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------
// 4️⃣ Get Data Routes
// --------------------------------
app.get("/users", async (req, res) => {
  const data = await pool.query("SELECT * FROM users");
  res.json(data.rows);
});

app.get("/owners", async (req, res) => {
  const data = await pool.query("SELECT * FROM owners");
  res.json(data.rows);
});

app.get("/hostels", async (req, res) => {
  const data = await pool.query("SELECT * FROM hostels");
  res.json(data.rows);
});

app.get("/food-menus", async (req, res) => {
  const data = await pool.query("SELECT * FROM food_menus");
  res.json(data.rows);
});

app.get("/otps", async (req, res) => {
  const data = await pool.query("SELECT * FROM otps");
  res.json(data.rows);
});

// -------------------------------- 
export default router;
