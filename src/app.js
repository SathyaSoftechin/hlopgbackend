import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"; 
import hostelRoutes from "./routes/hostelRoutes.js";
import foodMenu from "./routes/foodRoutes.js";
 import reviewRoutes from "./routes/reviewRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js"
import ownerRoutes from "./routes/ownerRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());


 
// Authentication Routes  for user, hostel owner login and signup
app.use("/api/auth", authRoutes);

//Routes for getting hostels in home page and5 individual pages

app.use("/api/hostel", hostelRoutes);

app.use("/api/food_menu", foodMenu);

 
app.use("/api/reviews", reviewRoutes);

app.use("/api/booking", bookingRoutes);

app.use("/api/owner", ownerRoutes);
app.use("/api/rooms", roomRoutes);

app.use("/uploads", express.static("uploads"));

 
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});
 
export default app;
