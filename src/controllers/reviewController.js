import { Review, Hostel } from "../models/index.js";

export const getReviewsByHostel = async (req, res) => {
  const { hostel_id } = req.params;
  console.log("🔹 Requested reviews for hostel ID:", hostel_id);

  if (!hostel_id) {
    return res.status(400).json({ ok: false, message: "Hostel ID is required" });
  }

  try {
    const reviews = await Review.findAll({
      where: { hostel_id },
      order: [['created_at', 'DESC']],
      raw: true
    });

    // ✅ Calculate average rating
    let avgRating = 0;
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0);
      avgRating = (total / reviews.length).toFixed(1);
    }

    console.log(`⭐ Average rating for hostel ${hostel_id}: ${avgRating}`);

    // Update hostels table with new average rating 
    // its need to be removed after user profile section review submited if review submits automatically updates 
        await Hostel.update(
          { rating: avgRating },
          { where: { hostel_id } }
        );

    return res.json({
      ok: true,
      data: {
        reviews,
        avgRating,
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};