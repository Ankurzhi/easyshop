
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json()); 

// --- MySQL Connection ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "user",
  database: "ecommerce",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});

// --- API Routes ---

// Get all products
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Start server
app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});

// --- ✅ Contact form route (store data) ---
app.post("/api/contacts", (req, res) => {
  console.log("📩 Contact request received:", req.body);

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error("❌ Error inserting contact:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json({ message: "✅ Thank you! Your message has been saved." });
  });
});

app.post("/api/checkout", (req, res) => {
  const cart = req.body.cart;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Insert all cart items into database
  const values = cart.map((item) => [item.id, item.name, item.price]);

  const sql = "INSERT INTO cart (id, name, price) VALUES ?";
  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error("❌ Error inserting cart:", err);
      return res.status(500).json({ message: "Failed to save cart" });
    }
    res.json({
      message: "✅ Cart saved successfully",
      inserted: result.affectedRows,
    });
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// buy now

app.delete("/api/cart", (req, res) => {
  const sql = "DELETE FROM cart";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("❌ Error clearing cart:", err);
      return res.status(500).json({ message: "Failed to clear cart" });
    }
    res.json({ message: "✅ Cart cleared successfully (Order Placed)" });
  });
});







