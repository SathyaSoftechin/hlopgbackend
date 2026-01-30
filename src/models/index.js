// src/models/index.js

import dotenv from "dotenv";
import { Sequelize } from "sequelize";

import UserModel from "./user.js";
import OwnerModel from "./owner.js";
import HostelModel from "./hostel.js";
import FoodMenuModel from "./foodMenu.js";
import OtpModel from "./otp.js";
import VisitorModel from "./visitor.js";
import ReviewModel from "./review.js";
import BookingModel from "./booking.js";
import RoomModel from "./room.js";
import LikedHostelModel from "./likedHostel.js"; 
import HostelRoomModel from "./HostelRoom.js";
import PgUpdateModel from "./pgUpdate.js";
import NotificationModel from "./notification.js";





dotenv.config();

// ✅ Initialize Sequelize instanceyes
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    
  },
  logging: false,
  pool: {
    max: 25,        // IMPORTANT (default is 5)
    min: 2, 
    acquire: 60000, // wait up to 60s
    idle: 10000
  }
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);


sequelize.authenticate()
  .then(() => console.log("✅ Connected to PostgreSQL Sequlize"))
  .catch(err => console.error("❌ Sequelize connection error:", err));

// ✅ Initialize models
const User = UserModel(sequelize, Sequelize.DataTypes);
const Owner = OwnerModel(sequelize, Sequelize.DataTypes);
const Hostel = HostelModel(sequelize, Sequelize.DataTypes);
const FoodMenu = FoodMenuModel(sequelize, Sequelize.DataTypes);
const Otp = OtpModel(sequelize, Sequelize.DataTypes);
const Visitor = VisitorModel(sequelize, Sequelize.DataTypes);
const Review = ReviewModel(sequelize, Sequelize.DataTypes);
const Booking = BookingModel(sequelize, Sequelize.DataTypes);
const Room = RoomModel(sequelize, Sequelize.DataTypes);
const LikedHostel = LikedHostelModel(sequelize, Sequelize.DataTypes);  
const HostelRoom = HostelRoomModel(sequelize, Sequelize.DataTypes);

const PgUpdate = PgUpdateModel(sequelize, Sequelize.DataTypes);
const Notification = NotificationModel(sequelize, Sequelize.DataTypes);


// ✅ Define relationships
Hostel.belongsTo(Owner, { foreignKey: "owner_id", as: "owner" });
FoodMenu.belongsTo(Hostel, { foreignKey: "hostel_id", as: "hostel" });




// ✅ New relationship for reviews
Hostel.hasMany(Review, { foreignKey: "hostel_id", as: "reviews" });  // Hostel → Review
Review.belongsTo(Hostel, { foreignKey: "hostel_id", as: "hostel" }); // Review → Hostel



User.hasMany(Booking, { foreignKey: "user_id", as: "bookings" });
Booking.belongsTo(User, { foreignKey: "user_id", as: "user" });


Hostel.hasMany(Booking, { foreignKey: "hostel_id", as: "bookings" });
Booking.belongsTo(Hostel, { foreignKey: "hostel_id", as: "hostel" });

// Relationships
Hostel.hasMany(Room, { foreignKey: "hostel_id", as: "rooms" });
Room.belongsTo(Hostel, { foreignKey: "hostel_id", as: "hostel" });




// =====================
// ❤️ User ↔ LikedHostel
// =====================
User.hasMany(LikedHostel, {
  foreignKey: "user_id",
  as: "likedHostels",
  onDelete: "CASCADE",
});

LikedHostel.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// Hostel ↔ LikedHostel
Hostel.hasMany(LikedHostel, {
  foreignKey: "hostel_id",
  as: "likes",
  onDelete: "CASCADE",
});

LikedHostel.belongsTo(Hostel, {
  foreignKey: "hostel_id",
  as: "hostel",
});


// =====================
// 🏠 PG Updates
// =====================
Hostel.hasMany(PgUpdate, {
  foreignKey: "hostel_id",
  as: "updates",
  onDelete: "CASCADE",
});

PgUpdate.belongsTo(Hostel, {
  foreignKey: "hostel_id",
  as: "hostel",
});

Owner.hasMany(PgUpdate, {
  foreignKey: "owner_id",
  as: "pgUpdates",
  onDelete: "CASCADE",
});

PgUpdate.belongsTo(Owner, {
  foreignKey: "owner_id",
  as: "owner",
});
 


// =====================
// 🔔 Notifications
// =====================
User.hasMany(Notification, {
  foreignKey: "user_id",
  as: "notifications",
  onDelete: "CASCADE",
});

Notification.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Hostel.hasMany(Notification, {
  foreignKey: "hostel_id",
  as: "notifications",
  onDelete: "CASCADE",
});

Notification.belongsTo(Hostel, {
  foreignKey: "hostel_id",
  as: "hostel",
});

export {
  sequelize,
  Sequelize,
  User,
  Owner,
  Hostel,
  FoodMenu,
  Otp,
  Visitor,
  Review,
  Booking,
  Room,
  HostelRoom,
  LikedHostel,
  PgUpdate,
  Notification
};

export default {
  sequelize,
  Sequelize,
  User,
  Owner,
  Hostel,
  FoodMenu,
  Otp,
  Visitor,
  Review,
  Booking,
  Room,
  HostelRoom,
  LikedHostel,
  PgUpdate,
  Notification
};
