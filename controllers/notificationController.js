const Notification = require('../models/notificationModel');

exports.createNotification = async (req, res) => {
  try {
    const { message, batch, department } = req.body;
    const facultyId = req.user.id; // Assuming you have user authentication and you get faculty ID from user

    const notification = await Notification.forge({
      message,
      batch,
      department,
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
};

exports.viewNotifications = async (req, res) => {
  try {
    const studentBatch = req.user.batch; // Assuming you have user authentication and you get student batch from user
    const studentDepartment = req.user.department; // Assuming you have user authentication and you get student department from user

    const notifications = await Notification.where({
      batch: studentBatch,
      department: studentDepartment,
    }).fetchAll();

    res.status(200).json({
      status: 'success',
      data: {
        notifications,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
    });
  }
};
