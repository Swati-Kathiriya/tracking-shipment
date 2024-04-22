// models/StatusLog.js
const mongoose = require('mongoose');

const StatusLogSchema = new mongoose.Schema({
  orderId: String,
  status: String,
  updateTime: { type: Date, default: Date.now }
});

const StatusLog = mongoose.model('StatusLog', StatusLogSchema);

module.exports = StatusLog;


// async function getOrderDetailsByPhoneNumber(req, res) {
//   try {
//     const { phoneNumber } = req.body;

//     // Find orders associated with the provided phone number
//     const order = await Order.findOne({ phoneNumber });

//     if (!order) {
//       return res
//         .status(404)
//         .json({ error: "No orders found for the provided phone number" });
//     }

//     // Find status logs for each order and sort by created time
//     const statusLogs = await StatusLog.find({ orderId: order.orderId }).sort({
//       createdTime: "asc",
//     });

//     let orderStatus = "shipped";
//     // Update status with time
//     const allStatusLogs = statusLogs.map((log) => {
//       const updateTime = log.updateTime
//         ? log.updateTime.toISOString()
//         : null;
//       return {
//         status: log.status, 
//         time: updateTime,
//       };
//     });

//     // Add the current order status to the status logs
//     allStatusLogs.unshift({
//       status: orderStatus,
//       time: new Date().toISOString(),
//     });

//     // Update orderStatus dynamically based on the latest status log
//     orderStatus = statusLogs;
    
//   // Construct order detail object with updated status logs
//   const orderDetail = {
//     orderId: order.orderId,
//     trackingId: order.trackingId,
//     address: order.address,
//     ordertype: order.ordertype,
//     createdTime: order.createdTime,
//     orderStatus,
//     // allStatusLogs,
//   };
//   // If the current order status is the same as the last status log, keep only one entry in allStatusLogs array
//   if (statusLogs.length > 0 && statusLogs[0].status === orderStatus) {
//     response.allStatusLogs = [response.allStatusLogs[0]];
//   }

//   res.json(orderDetail); // Send response with order details, status logs, and GPS data
// } catch (error) {
//   console.error(error);
//   res.status(500).json({ error: "Internal server error" });
// }
// }