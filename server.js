const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Middleware
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));;

// Connect to MongoDB database
mongoose
  .connect("mongodb://localhost:27017/tracking")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Routes
const ordersRouter = require("./routes/orders");
app.use("/api", ordersRouter);

app.get("/", (req, res) => {
  res.send(`<h1>This is HOMEPAGE 🙌👻🏡</h1>`);
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
