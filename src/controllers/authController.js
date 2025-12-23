import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import { User, Owner, Otp, Visitor, sequelize } from "../models/index.js";

import { Op } from "sequelize";


// Generate 4-digit OTP
function generateOtp(length = 4) {
  const digits = "0123456789";
  return Array.from({ length }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
}

const withRetry = async (fn, retries = 3, delay = 500) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }

  throw lastError;
};




export const registerUser = async (req, res) => {
  try {
    const data = req.body.formData || req.body;
    let { name, email, phone, password, gender } = data;

    if(email){
    email = email.toLowerCase();
    }

    // validations (outside transaction)
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }


     // 🔹 Name validation (3–12 chars)
    if (name.length < 3 || name.length > 32) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 3 and 12 characters",
      });
    }


    const phoneRegex = /^[6-9]\d{9}$/;
if (!phoneRegex.test(phone)) {
  return res.status(400).json({
    success: false,
    message: "Phone number must be exactly 10 digits",
  });
}


    // 🔹 Email validation (gmail, yahoo, outlook only)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email must be gmail, yahoo, or outlook only",
      });
    }

    // 🔹 Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,12}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 5–12 characters, include uppercase, lowercase, and number",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const user = await withRetry(() =>
      sequelize.transaction(async (t) => {

        const createdUser = await User.create({
          name,
          email,
          phone,
          password: hashedPassword,
          gender,
          user_type: "user",
          is_verified: false,
        }, { transaction: t });

        await Visitor.create({
          name,
          email,
          phone,
          password: hashedPassword,
          gender,
          user_type: "user",
          is_verified: false,
        }, { transaction: t });

        await Otp.upsert({
          identifier: phone,
          purpose: "registration",
          otp_code: otp,
          expires_at: expiresAt,
          attempts: 0,
        }, { transaction: t });

        return createdUser;
      })
    );

    return res.status(201).json({
      success: true,
      message: "Registered. OTP sent to  given phone.",
      user: {
        id: user.user_id,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (err) {
    console.error("Register error:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered",
      });
    }

    return res.status(500).json({ success: false, message: "Server busy, try again" });
  }
};



// / ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const formData = req.body.formData || req.body;
    if (!formData) {
      return res.status(400).json({ error: "Form data is required" });
    }

    const { identifier, password } = formData;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Email or phone and password are required" });
    }

       let whereCondition = {};

if (/^\d{10}$/.test(identifier)) {
  whereCondition.phone = identifier;
} else if (/^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/.test(identifier)) {
  whereCondition.email = identifier.toLowerCase();
} else {
  return res.status(400).json({
    success: false,
    message: "Enter valid email or 10-digit phone number",
  });
}

const user = await User.findOne({
  where: whereCondition   // ✅ FIX IS HERE
});

    if (!user) return res.status(401).json({ error: "User not registered" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid password" });

    // Generate JWT token
        const token = jwt.sign(
          { user_id: user.user_id, user_type: user.user_type },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

    // Send response
    return res.status(200).json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const registerOwner = async (req, res) => {
  try {
    const data = req.body.formData || req.body;
    let { name, email, phone, password } = data;
    email = email.toLowerCase();

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid Indian phone number" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Transaction + Upsert for high concurrency
    const owner = await sequelize.transaction(async (t) => {
      const createdOwner = await Owner.create({
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: "owner",
        is_verified: false,
      }, { transaction: t });

      await Visitor.create({
        name,
        email,
        phone,
        password: hashedPassword,
        user_type: "owner",
        is_verified: false,
      }, { transaction: t });

      // Use upsert to avoid OTP duplicates
      await Otp.upsert({
        identifier: phone,
        purpose: "registration",
        otp_code: otp,
        expires_at: expiresAt,
        attempts: 0,
      }, { transaction: t });

      return createdOwner;
    });

    console.log("Generated OTP for", phone, "is", otp);

    res.status(201).json({
      message: "Owner registered. OTP sent to phone.",
      user: { id: owner.id, name: owner.name, email: owner.email, phone: owner.phone, user_type: owner.user_type, otp },
    });

  } catch (err) {
    console.error("Register Owner Error:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      const field = err.errors[0]?.path;
      let message = "Duplicate entry found.";
      if (field === "email") message = "Email already exists. Please use another email.";
      else if (field === "phone") message = "Phone number already exists. Please use another number.";

      return res.status(409).json({ success: false, message });
    }

    res.status(500).json({ error: "Server busy, try again." });
  }
};


// ✅ Login Owner
export const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body.formData;
    const owner = await Owner.findOne({ where: { email } });

    if (!owner) return res.status(400).json({ error: "Owner Not Registered yet" });

    const validPassword = await bcrypt.compare(password, owner.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid Password" });

 // 3️⃣ Generate JWT
    const token = jwt.sign(
      { user_id: owner.owner_id, user_type: owner.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4️⃣ Respond with token + owner info
    res.json({
      token,
      owner: {
        id: owner.owner_id,
        name: owner.name, 
        email: owner.email,
        user_type: owner.user_type,
      },
    });
  } catch (err) {
    console.error("Login Owner Error:", err);
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};


export const verifyOtp = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { identifier, otp_code, purpose } = req.body;

    if (!identifier || !otp_code || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Identifier, OTP and purpose are required"
      });
    }

    // 1️⃣ Fetch OTP with lock
    const otpRecord = await Otp.findOne({
      where: { identifier, purpose },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!otpRecord) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP."
      });
    }

    // 2️⃣ Already verified
    if (otpRecord.verified_at) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "OTP already verified."
      });
    }

    // 3️⃣ Expired
    if (new Date() > otpRecord.expires_at) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one."
      });
    }

    // 4️⃣ Attempt limit
    if (otpRecord.attempts >= 5) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Maximum OTP attempts exceeded."
      });
    }

    // 5️⃣ Compare OTP (hashed)
    const isOtpValid = await bcrypt.compare(
      otp_code.toString(),
      otpRecord.otp_code
    );

    if (!isOtpValid) {
      otpRecord.attempts += 1;
      await otpRecord.save({ transaction });

      await transaction.commit();
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again."
      });
    }

    // 6️⃣ Mark OTP verified
    otpRecord.verified_at = new Date();
    otpRecord.attempts += 1;
    await otpRecord.save({ transaction });

    // 7️⃣ Verify user (phone OR email)
    const user = await User.findOne({
      where: {
        [sequelize.Op.or]: [
          { phone: identifier },
          { email: identifier }
        ]
      },
      transaction
    });

    if (user) {
      user.is_verified = true;
      await user.save({ transaction });
    }

    await transaction.commit();

    return res.json({
      success: true,
      message: "OTP verified successfully."
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


export const resendOTP = async (req, res) => {
  try {
    const { identifier, purpose } = req.body;

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Update or insert OTP in database
    const existingOtp = await Otp.findOne({ where: { identifier, purpose } });
    if (existingOtp) {
      await existingOtp.update({ otp_code: otp, expires_at: expiresAt, attempts: 0, verified_at: null });
    } else {
      await Otp.create({ identifier, purpose, otp_code: otp, expires_at: expiresAt, attempts: 0 });
    }

    // Optionally send SMS here

    res.json({ success: true, message: "OTP resent successfully.", otp });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ success: false, message: "Failed to resend OTP." });
  }
};



// ✅ Verify Token and User Type
export const verifyUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user_type !== "user") {
      return res.status(403).json({ success: false, message: "Access restricted to users only" });
    }

    return res.json({ success: true, message: "User verified", user: decoded });
  } catch (error) {
     return res.status(401).json({ success: false, message: error.message });
  }
};
 


// ✅ Get User by ID
export const getUserById = async (req, res) => {
  try {
      const userId = req.user?.user_id; // ⚡ use user_id 
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    const user = await User.findByPk(userId, {
      attributes: ["user_id", "name", "email", "user_type", "phone", "gender"], // select only needed fields
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("getUserById Error:", error);
    res.status(500).json({ error: "Server error fetching user" });
  }
};



// ✅ Verify Token and User Type
export const verifyOwner = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.user_type !== "owner") {
      return res.status(403).json({ success: false, message: "Access restricted to owners only" });
    }

    return res.json({ success: true, message: "User verified", user: decoded });
  } catch (error) {
     return res.status(401).json({ success: false, message: error.message });
  }
};

// ✅ Get User by ID
export const getOwnerById = async (req, res) => {
  try {
      const userId = req.user?.user_id; // ⚡ use user_id 
    if (!userId) {
      return res.status(400).json({ error: "User ID not found in token" });
    }

    const user = await Owner.findByPk(userId, {
      attributes: ["owner_id", "name", "email", "user_type", "phone"], // select only needed fields
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("getUserById Error:", error);
    res.status(500).json({ error: "Server error fetching user" });
  }
};


// ✅ Login apk User
export const apploginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // ✅ Directly get from req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // ✅ Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "User not registered" });
    }

    // ✅ Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Send response
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
