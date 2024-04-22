// Import necessary modules
const Order = require("../models/Order");
const StatusLog = require("../models/StatusLog");

// Function to generate a random tracking ID
function generateTrackingId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 10;
  let trackingId = "";
  for (let i = 0; i < length; i++) {
    trackingId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return trackingId;
}

// Function to generate a unique order ID
function generateOrderId() {
  // const timestamp = Date.now().toString(36);
  const randomChars = Math.random().toString(36).substring(2, 8);
  // return timestamp + randomChars;
  return randomChars;
}

// Controller function to create an order
async function createOrder(req, res) {
  try {
    const { phoneNumber, address } = req.body;

    // Validate required fields
    if (!phoneNumber || !address) {
      return res
        .status(400)
        .json({ error: "Please provide phoneNumber, address" });
    }

    // Additional validation for phoneNumber (you can customize this based on your requirements)
    if (typeof phoneNumber !== "string" || phoneNumber.trim() === "") {
      return res.status(400).json({ error: "Invalid phoneNumber" });
    }

    // Generate unique orderId and trackingId
    const orderId = generateOrderId();
    const trackingId = generateTrackingId();

    // Create a new Order instance
    const order = new Order({
      orderId,
      trackingId,
      phoneNumber,
      address
    });

    // Save the order to the database
    await order.save();

    // Respond with the created order
    res.status(201).json(order); // Use status 201 (Created) for successful creation
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Controller function to log status changes
async function logStatusChange(req, res) {
  try {
    const { trackingId, status } = req.body;

    // Validate tracking ID and status
    if (!trackingId || typeof trackingId !== "string") {
      return res.status(400).json({ error: "Invalid tracking ID" });
    }

    const validStatuses = [
      "out for delivery",
      "shipped",
      "delivered",
      "In Transit",
      "Warehouse Handover",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Find the order with the provided tracking ID
    const order = await Order.findOne({ trackingId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update the status log entry associated with the order
    const statusLog = await StatusLog.findOneAndUpdate(
      { orderId: order.orderId },
      { status },
      { new: false, upsert:true }
    );
    
    // Respond with the updated status log entry
    res.status(200).json(statusLog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Controller function to fetch orders with their status logs
async function getOrdersWithStatusLogsById(req, res) {
  try {
    const { trackingId } = req.body;
    // Find the order by tracking ID
    const order = await Order.findOne({ trackingId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // Find all status log entries associated with the order and sort by created time
    let statusLogs = await StatusLog.find({ orderId: order.orderId }).sort({
      createdTime: "desc",
    });
    // If there are no status logs, set default status to "shipped"
    let orderStatus = "shipped";
    if (statusLogs.length > 0) {
      // Use the latest status log entry's status
      orderStatus = statusLogs[0].status;
    }
    // Update status with time
    const allStatusLogs = statusLogs.map((log) => ({
      status: log.status,
      time: log.createdTime,
    }));
    // Add the current order status to the status logs
    allStatusLogs.unshift({ status: orderStatus, time: new Date() });
    // Construct response object with updated status logs and order status
    const response = {
      orderStatus,
      allStatusLogs,
    };
    // If the current order status is the same as the last status log, keep only one entry in allStatusLogs array
    if (statusLogs.length > 0 && statusLogs[0].status === orderStatus) {
      response.allStatusLogs = [response.allStatusLogs[0]];
    }
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Controller function to get all orders along with status logs
async function getAllOrdersWithStatusLogs(req, res) {
  try {
    // Find all orders
    const orders = await Order.find();
    // Array to hold orders with status logs
    const ordersWithStatusLogs = [];
    // Iterate over each order
    for (const order of orders) {
      // Find status logs for the current order and sort by created time
      let statusLogs = await StatusLog.find({ orderId: order.orderId }).sort({
        createdTime: "desc",
      });
      // If no status logs exist, add a default status log with "shipped" status
      if (statusLogs.length === 0) {
        statusLogs = [{ status: "shipped", time: new Date() }];
      }
      // Construct object containing order details and its status logs
      const orderWithStatusLogs = {
        orderDetails: order,
        statusLogs: statusLogs.map((log) => ({
          status: log.status,
          time: log.createdTime,
        })),
      };
      // Push the object to the array
      ordersWithStatusLogs.push(orderWithStatusLogs);
    }
    res.status(200).json(ordersWithStatusLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Controller function to fetch all orders with status logs
async function getAllOrdersWithStatusLogs(req, res) {
  try {
    // Find all orders
    const orders = await Order.find();

    // Array to hold orders with status logs
    const ordersWithStatusLogs = [];

    // Iterate over each order
    for (const order of orders) {
      // Find status logs for the current order and sort by created time
      let statusLogs = await StatusLog.find({ orderId: order.orderId }).sort({
        createdTime: "desc",
      });

      // If no status logs exist, add a default status log with "shipped" status
      if (statusLogs.length === 0) {
        statusLogs = [{ status: "shipped", time: new Date() }];
      }

      // Construct object containing order details and its status logs
      const orderWithStatusLog = {
        orderDetails: order,
        statusLogs: statusLogs.map((log) => ({
          status: log.status,
          time: log.createdTime,
        })),
      };

      // Push the object to the array
      ordersWithStatusLogs.push(orderWithStatusLog);
    }

    // Send a successful response with the array of orders and status logs
    res.status(200).json(ordersWithStatusLogs);
  } catch (error) {
    console.error("Error in getAllOrdersWithStatusLogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Controller function to delete an order by ID
async function deleteOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete({ _id: id });
    res.status(200).json({ message: "Order deleted Successfully", order });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

// Controller function to get all details of order by phone number
async function getOrderDetailsByPhoneNumber(req, res) {
  try {
    const { phoneNumber } = req.body;

    // Find orders associated with the provided phone number
    const order = await Order.findOne({ phoneNumber });

    if (!order) {
      return res
        .status(404)
        .json({ error: "No orders found for the provided phone number" });
    }

    // Find status logs for each order and sort by created time
    const statusLogs = await StatusLog.find({ orderId: order.orderId }).sort({
      createdTime: "asc",
    });

    let orderStatus = "shipped";
    // Update status with time
    const allStatusLogs = statusLogs.map((log) => {
      const updateTime = log.updateTime
        ? log.updateTime.toISOString()
        : null;
      return {
        status: log.status, 
        time: updateTime,
      };
    });

    // Add the current order status to the status logs
    allStatusLogs.unshift({
      status: orderStatus,
      time: new Date().toISOString(),
    });

    // Update orderStatus dynamically based on the latest status log
    orderStatus = statusLogs;
    
  // Construct order detail object with updated status logs
  const orderDetail = {
    orderId: order.orderId,
    trackingId: order.trackingId,
    address: order.address,
    ordertype: order.ordertype,
    createdTime: order.createdTime,
    orderStatus,
    // allStatusLogs,
  };
  // If the current order status is the same as the last status log, keep only one entry in allStatusLogs array
  if (statusLogs.length > 0 && statusLogs[0].status === orderStatus) {
    response.allStatusLogs = [response.allStatusLogs[0]];
  }

  res.json(orderDetail); // Send response with order details, status logs, and GPS data
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}
}

// Export the controller functions
module.exports = {
  createOrder,
  logStatusChange,
  getOrdersWithStatusLogsById,
  getAllOrdersWithStatusLogs,
  deleteOrderById,
  getOrderDetailsByPhoneNumber
}
