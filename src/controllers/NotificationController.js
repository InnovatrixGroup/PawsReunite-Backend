const { Notification } = require("../models/NotificationModel");

// Async function to retrieve all notifications
const getAllNotifications = async (request, response) => {
  try {
    const allNotifications = await Notification.find({ userId: request.headers.userId }).exec();
    response.json({
      data: allNotifications
    });
  } catch (error) {
    response.json({
      error: error.message
    });
  }
};

// Async function to create a new notification
const createNotification = async (request, response) => {
  try {
    const newNotification = new Notification({
      userId: request.body.userId,
      message: request.body.message,
      postId: request.body.postId
    });
    const savedNotification = await newNotification.save();
    response.json({
      data: savedNotification
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message
    });
  }
};

module.exports = { getAllNotifications, createNotification };
