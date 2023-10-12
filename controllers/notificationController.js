const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Staff = require('../models/staffModel');


exports.createNotification = catchAsync( async (req, res) => {
  try {
    let{
      message,
      type,
      departments,
      year,
      role,
    }=req.body;

    if(
      !message||
      !departments||
      !year||
      !type||
      !role){
        throw new AppError("All fields are required", 400);
      }
      
      departments = departments.toString();

    const facultyId = req.user.id; // Assuming you have user authentication and you get faculty ID from user

    const notification = await Notification.forge({
      message,
      type,
      departments,
      year,
      role,
      faculty_id: facultyId,
    }).save();

    res.status(201).json({
      status: 'success',
      data: {
        notification,
      },
    });
  } catch (err) {
    console.error(err);
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
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications',
    });
  }
});

exports.updateNotifications = catchAsync(async(req,res) =>{
    try{
        const facultyId = req.user.id;
        const id = req.params.id;
        const notifications = await Notification.where({faculty_id:facultyId}).fetchAll();
        if (!notifications|| notifications.length === 0) {
            // If the staff with the provided ID is not found, return an error response
            return res.status(404).json({
              status: 'fail',
              message: 'No Notification found for the faculty',
            });
          }
        const {message}= req.body;

        const updatedData = {
            message,
        };
        const updatedNotifications = await Notification.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true, // Run the validation on the updated fields
            tableName: 'notification' // Specify the table name
          });
          res.status(200).json({
            status: 'success',
            message: ' Notification updated successfully',
            result: updatedNotifications,
          });
    }
    catch(err){
        console.error(err);
        // res.status(500).json({
        //     status: 'error',
        //     message: 'Failed to update notifications',
        //   });
        if (err.message === "EmptyResponse"){
            const error = new AppError("Notification Not Found", 404);
            error.sendResponse(res);
        }
        else {
            const error = new AppError(err.message, 500);
            error.sendResponse(res);
        }
    }
});

exports.deleteNotification = catchAsync(async (req,res)=> {
  try {
      const msg_id = req.params.id;
      const facultyId= req.user.id;

      // Find the internship in the database based on the provided ID
      await Notification.findByIdAndDelete(msg_id, facultyId);

      // Send a success response
      res.status(200).json({
          status: 'success',
          message: 'Notification deleted successfully',

      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete the notification.',
    });
  }

});


// // Schedule a job to run daily
// schedule.scheduleJob('0 0 * * *', async () => {
//   try {
//     // Calculate the date 1 month ago
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//     // Fetch notifications older than 1 month
//     const notificationsToDelete = await Notification.where('created_at', '<', oneMonthAgo).fetchAll();

//     // Delete the fetched notifications
//     for (const notification of notificationsToDelete.models) {
//       await notification.destroy();
//     }

//     console.log('Automatic deletion of notifications completed.');
//   } catch (err) {
//     console.error('Error during automatic deletion:', err);
//   }
// });




