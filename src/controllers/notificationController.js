import { Notification } from "../models/index.js";

/**
 * USER fetch notifications
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * USER mark notification as read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    await Notification.update(
      { is_read: true },
      {
        where: {
          notification_id: id,
          user_id: userId,
        },
      }
    );

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
