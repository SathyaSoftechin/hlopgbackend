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

// ✅ Register User
export const registerUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const data = req.body.formData || req.body;
    const { name, email, phone, password, gender } = data;

    // 1️⃣ Required fields
    if (!name || !email || !phone || !password ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Name validation
    const nameRegex = /^[A-Za-z ]{3,22}$/;
    if (!nameRegex.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Name must be 3–22 characters and contain only letters",
      });
    }

    // 3️⃣ Email validation
    if (email.length > 32) {
      return res.status(400).json({
        success: false,
        message: "Email must not exceed 32 characters",
      });
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Only gmail.com, yahoo.com, outlook.com emails are allowed",
      });
    }

    // 4️⃣ Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Indian phone number",
      });
    }

    // 5️⃣ Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,12}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 5–12 characters and include uppercase, lowercase, and a number",
      });
    }

    // 6️⃣ Duplicate check (User table)
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email already registered"
            : "Phone number already registered",
      });
    }

    // 7️⃣ Hash password AFTER validation
    const hashedPassword = await bcrypt.hash(password, 10);

    // 8️⃣ Create User + Visitor (transaction)
    const user = await User.create(
      {
        name,
        email,
        phone,
        password: hashedPassword,
        gender,
        user_type : "user",
        is_verified: false,
      },
      { transaction }
    );

    await Visitor.create(
      {
        name,
        email,
        phone,
        password: hashedPassword,
        gender,
        user_type: "user",
        is_verified: false,
      },
      { transaction }
    );

    // 9️⃣ Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create(
      {
        identifier: phone,
        purpose: "registration",
        otp_code: otp,
        expires_at: expiresAt,
        attempts: 0,
      },
      { transaction }
    );

    await transaction.commit();

    console.log("OTP for", phone, ":", otp); // DEV ONLY

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to phone.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// / ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const formData = req.body.formData;
    if (!formData) {
      return res.status(400).json({ error: "Form data is required" });
    }

    const { email, password } = formData;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });
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

// ✅ Register Owner
export const registerOwner = async (req, res) => {
  try {
    const { name, email, phone, password, user_type } = req.body.formData;


    // 1️⃣ Required fields check
    if (!name || !email || !phone || !password  || !user_type) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2️⃣ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // 3️⃣ Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Indian phone number",
      });
    }
 

    // 5️⃣ User type validation
    const allowedUserTypes = [ "owner"];
    if (!allowedUserTypes.includes(user_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "User type must be  owner",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);


   const usercheck = await Visitor.findOne({
          where: {
            [Op.or]: [{ email }, { phone }],
          },
          });
          
        if (usercheck) {
          if (usercheck.email === email) {
            return res.status(400).json({ message: "Email already registered" });
          } else if (usercheck.phone === phone) {
            return res.status(400).json({ message: "Phone number already registered" });
          }
          }

    // 1️⃣ Create owner
    const owner = await Owner.create({
      name,
      email,
      phone,
      password: hashedPassword,
      user_type: user_type || "owner",
      is_verified: false,
    });

     const visitor = await Visitor.create({
      name,
      email,
      phone,
      password: hashedPassword,
      user_type: user_type || "user",
      is_verified: false,
    });

    




    // 2️⃣ Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 3️⃣ Store OTP
    await Otp.create({
      identifier: phone, // use phone as identifier
      purpose: "registration",
      otp_code: otp,
      expires_at: expiresAt,
      attempts: 0,
    });

        console.log("Generated OTP for", phone, "is", otp); 

    // 4️⃣ Respond
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

      return res.status(400).json({ success: false, message });
    }
    res.status(500).json({ error: err.message });
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
  try {
    const { identifier, otp_code, purpose } = req.body; // phone/email + OTP + purpose

    // 1️⃣ Fetch OTP from DB
    const otpRecord = await Otp.findOne({ 
      where: { identifier, purpose } 
    });

         
      // Increment attempts
   

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP not found. Please request a new OTP." });
    }

    // 2️⃣ Check if OTP already verified
    if (otpRecord.verified_at) {
      return res.status(400).json({ success: false, message: "OTP already verified." });
    }

    // 3️⃣ Check expiry
    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    // 4️⃣ Check attempts limit
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ success: false, message: "Maximum OTP attempts exceeded." });
    }

    // 5️⃣ Verify OTP
    if (otpRecord.otp_code !== otp_code) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // 6️⃣ Mark OTP verified and user as verified
    otpRecord.verified_at = new Date();
    await otpRecord.save();

    const user = await User.findOne({ where: { phone: identifier } }); // or email
    if (user) {
      user.is_verified = true;
      await user.save();
    }

    return res.json({ success: true, message: "OTP verified successfully." });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
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
