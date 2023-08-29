const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Staff = require('../models/staffModel');

exports.createNotification = catchAsync( async (req, res) => {
  try {
    const { message, batch, department } = req.body;
    const facultyId = req.user.id; // Assuming you have user authentication and you get faculty ID from user

    const notification = await Notification.forge({
      message,
      faculty_id: facultyId,
    }).save();

    res.status(201).json({
      status: 'success',
      data: {
        notification,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to create notification',
    });
  }
});

exports.viewNotifications = catchAsync(async (req, res) => {
  try {

    const notifications = await Notification.fetchAll();
    const notificationsWithStaffNames = [];

    for (const notification of notifications.models){
    const message = notification.get("message");
    const staff_id = notification.get("faculty_id");
    const staff = await Staff.where({id:staff_id}).fetch();
    const staff_name = staff.get("name");

    notificationsWithStaffNames.push({ message, staff_name });
    }
    res.status(200).json({
      status: 'success',
      data: {
        notification: notificationsWithStaffNames,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
    });
  }
});
