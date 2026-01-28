// controllers/bookingController.js
import crypto from "crypto";
import { Booking, Hostel, User } from "../models/index.js";

// ✅ Create new booking (temporary, before payment)
export const newBooking = async (req, res) => {
  try {
    const {
      hostelId,
      sharing,
      priceType,
      numDays,
      date,
      rentAmount,
      totalAmount,
      deposit,
    } = req.body;

    const userId = req.user.user_id;

 
        if(!userId){
          return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    
        }


    if ( !hostelId || !sharing || !totalAmount || !numDays || !date || !rentAmount || !priceType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });

        
    }


    // ============================
    // 🔹 hostelId → integer only
    // ============================
    if (!Number.isInteger(Number(hostelId))) {
      return res.status(400).json({
        success: false,
        message: "hostelId must be a valid integer",
      });
    }

    // ============================
    // 🔹 numDays → integer & > 0
    // ============================
    if (!Number.isInteger(Number(numDays)) || Number(numDays) <= 0) {
      return res.status(400).json({
        success: false,
        message: "numDays must be a positive integer",
      });
    }

    // ============================
    // 🔹 priceType → daily | monthly
    // ============================
    const allowedPriceTypes = ["daily", "monthly"];
    if (!allowedPriceTypes.includes(priceType)) {
      return res.status(400).json({
        success: false,
        message: "priceType must be either 'daily' or 'monthly'",
      });
    }

    // ============================
    // 🔹 rentAmount & totalAmount → > 0
    // ============================
    if (isNaN(rentAmount) || Number(rentAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "rentAmount must be a positive number",
      });
    }

    if (isNaN(totalAmount) || Number(totalAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "totalAmount must be a positive number",
      });
    }

    // ============================
    // 🔹 date → future date only
    // ============================
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "Booking date must be a future date",
      });
    }



    const allowedSharingValues = [
  "single",
  "double",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

const normalizedSharing = String(sharing).toLowerCase().trim();

if (!allowedSharingValues.includes(normalizedSharing)) {
  return res.status(400).json({
    success: false,
    message:
      "sharing must be one of: single, double, three, four, five, six, seven, eight, nine, ten",
  });
}


    const bookingId = `BOOK_${Date.now()}`;

    const booking = await Booking.create({
      bookingId,
      user_id: userId,
      hostel_id: hostelId,
      sharing:normalizedSharing,
      priceType,
      numDays,
      date,
      rentAmount,
      deposit,
      totalAmount,
      status: "pending_payment",
    });

        // ✅ Send response to frontend
    res.status(201).json({ success: true, bookingId });


  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Confirm booking after payment
export const confirmBooking = async (req, res) => {
  try {
    const {
      hostelId,
      bookingData,
      payment: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment details" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Signature mismatch" });
    }

    // TODO: update booking status in DB
    // await Booking.update({ status: "confirmed" }, { where: { bookingId: bookingData.bookingId } });

    res.json({
      success: true,
      message: "Payment verified and booking confirmed",
    });
  } catch (err) {
    console.error("Payment confirmation failed:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
};
export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User not identified",
      });
    }

    const bookings = await Booking.findAll({
      where: { user_id },
      include: [
        {
          model: Hostel,
          as: "hostel",
          attributes: ["hostel_name", "city", "area", "price"],
        },
      ],
      order: [["date", "DESC"]],
    });

    const plainBookings = bookings.map((b) => ({
      id: b.id,
      bookingId: b.bookingId,
      hostelId: b.hostel_id,
      sharing: b.sharing,
      priceType: b.priceType,
      numDays: b.numDays,
      date: b.date,
      rentAmount: b.rentAmount,
      deposit: b.deposit,
      totalAmount: b.totalAmount,
      status: b.status,

      // Hostel details
      hostelName: b.hostel?.hostel_name,
      city: b.hostel?.city,
      area: b.hostel?.area,
      price: b.hostel?.price,
    }));

    res.json({
      success: true,
      bookings: plainBookings,
    });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ✅ Get bookings (members) by hostel ID
export const getBookingsByHostelId = async (req, res) => {
  try {
    const { hostelId } = req.params;

    if (!hostelId) {
      return res.status(400).json({
        success: false,
        members: [],
        message: "Hostel ID required",
      });
    }

    const bookings = await Booking.findAll({
      where: { hostel_id: hostelId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const members = bookings.map((b) => ({
      booking_id: b.bookingId,
      name: b.user ? b.user.name : "Unknown",
      phone: b.user ? b.user.phone : "",
      sharing: b.sharing,
      joiningDate: b.date,
      rentAmount: b.rentAmount,
      status: b.status,
    }));

    return res.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    console.error("❌ PG members error:", error);
    return res.status(500).json({
      success: false,
      members: [],
      message: "Server error",
    });
  }
};
