import { FoodMenu } from "../models/index.js";

export const foodMenu = async (req, res) => {
  const { hostelId } = req.params;
  try {
    const menu = await FoodMenu.findOne({
      where: { hostel_id: hostelId },
      raw: true,
    });

    if (!menu) {
      return res.json({
        ok: false,
        message: "Menu not found for this hostel",
      });
    }

    // Define proper weekday order
    const weekdays = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

    // Function to sort meal object by weekdays
    const sortByWeekdays = (mealObj) => {
      const sorted = {};
      weekdays.forEach(day => {
        if (mealObj[day]) sorted[day] = mealObj[day];
      });
      return sorted;
    };

    const sortedMenu = {
      breakfast: sortByWeekdays(menu.breakfast || {}),
      lunch: sortByWeekdays(menu.lunch || {}),
      dinner: sortByWeekdays(menu.dinner || {}),
    };

    console.log("✅ Sorted Menu:", sortedMenu);

    res.json({
      ok: true,
      data: sortedMenu,
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({
      ok: false,
      message: "Error fetching food menu",
    });
  }
};
