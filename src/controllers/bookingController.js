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

    const bookingId = `BOOK_${Date.now()}`;

    const booking = await Booking.create({
      bookingId,
      user_id: userId,
      hostel_id: hostelId,
      sharing,
      priceType,
      numDays,
      date,
      rentAmount,
      deposit,
      totalAmount,
      status: "pending_payment",
    });

        // ✅ Send response to frontend
    res.status(201).json({ success: true, booking });


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

// ✅ Get bookings for a specific user
export const getUserBookings = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "User not identified" });
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
      userId: b.user_id,
      hostelId: b.hostel_id,
      sharing: b.sharing,
      priceType: b.priceType,
      numDays: b.numDays,
      date: b.date,
      rentAmount: b.rentAmount,
      deposit: b.deposit,
      totalAmount: b.totalAmount,
      status: b.status,
      hostelName: b.hostel?.hostel_name,
      city: b.hostel?.city,
      area: b.hostel?.area,
      price: b.hostel?.price,
    }));

    res.json({
      success: true,
      message: "User bookings fetched successfully",
      bookings: plainBookings,
    });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get bookings (members) by hostel ID
export const getBookingsByHostelId = async (req, res) => {
  try {
    const { hostelId } = req.params;

    const bookings = await Booking.findAll({
      where: { hostel_id: hostelId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "name", "phone"],
        },
      ],
      order: [["id", "DESC"]],
    });

    const members = bookings.map((b) => ({
      booking_id: b.bookingId,
      name: b.user?.name || "Unknown",
      phone: b.user?.phone || "",
      sharing: b.sharing,
      priceType: b.priceType,
      numDays: b.numDays,
      joiningDate: b.date,
      rentAmount: b.rentAmount,
      deposit: b.deposit,
      totalAmount: b.totalAmount,
      status: b.status,
      vacateDate: null, // optional: calculate if needed
    }));

    res.status(200).json({ success: true, members });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
