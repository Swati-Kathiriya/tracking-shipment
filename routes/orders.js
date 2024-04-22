//routes/orders.js
const express = require('express');
const router = express.Router();
const {
  createOrder,
  logStatusChange,
  getAllOrdersWithStatusLogs,
  deleteOrderById,
  getOrdersWithStatusLogsById,
  getOrderDetailsByPhoneNumber
} = require('../controllers/ordersController');

// Route to create an order
router.post('/order', createOrder);

// Route to log status update
router.put('/status-log', logStatusChange);

// Route to fetch orders with their status logs
router.post('/status-logs', getOrdersWithStatusLogsById);

// Route for deleting an order
router.delete('/orders/:id', deleteOrderById);

// Route for getting all orders with status logs
router.get('/orders', getAllOrdersWithStatusLogs);

// Route to get order details by phone number
router.post('/orders/phoneNumber', getOrderDetailsByPhoneNumber);

module.exports = router;
