import { PgUpdate, Booking, Notification , Hostel} from "../models/index.js";

/**
 * OWNER creates PG update
 * → notify ONLY booked users of that hostel
 */
export const createPgUpdate = async (req, res) => {
  try {
    const ownerId = req.owner.owner_id; // this comes from verifyOwnerToken middleware
    const { hostel_id, message } = req.body;

    if (!hostel_id || !message) {
      return res.status(400).json({
        success: false,
        message: "hostel_id and message are required",
      });
    }

    // 1️⃣ Save PG update
    const update = await PgUpdate.create({
      hostel_id,
      owner_id: ownerId,
      message,
    });

    // 2️⃣ Get ACTIVE bookings for this hostel
    const bookings = await Booking.findAll({
      where: {
        hostel_id,
      },
      attributes: ["user_id"],
    });

    if (bookings.length === 0) {
      return res.json({
        success: true,
        message: "Update saved. No active bookings found.",
      });
    }

    // 3️⃣ Remove duplicate users
    const uniqueUserIds = [
      ...new Set(bookings.map(b => b.user_id)),
    ];

    // 4️⃣ Create notifications
    const notificationsData = uniqueUserIds.map(userId => ({
      user_id: userId,
      hostel_id,
      title: "PG Update",
      message,
    }));

    await Notification.bulkCreate(notificationsData);

    res.json({
      success: true,
      message: "PG update sent to booked users",
      notifiedUsers: uniqueUserIds.length,
    });

  } catch (error) {
    console.error("PG update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const getUserPgUpdates = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // 1️⃣ Get user's active bookings
    const bookings = await Booking.findAll({
      where: {
        user_id: userId,
      },
      attributes: ["hostel_id"],
    });

    if (!bookings.length) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const hostelIds = bookings.map(b => b.hostel_id);

    // 2️⃣ Fetch PG updates
    const updates = await PgUpdate.findAll({
      where: { hostel_id: hostelIds },
      include: [
  {
    model: Hostel,
    as: "hostel", // 🔥 MUST MATCH ASSOCIATION ALIAS
    attributes: ["hostel_id", "hostel_name"],
  },
],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: updates,
    });
  } catch (error) {
    console.error("User PG updates error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};