const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- MySQL Connection ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "user", // your MySQL password
  database: "ecommerce",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});

// ======================= AUTH ROUTES =========================

// Signup
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkSql = "SELECT id FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, rows) => {
    if (err) {
      console.error("❌ Error checking user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error("❌ Error hashing password:", err);
        return res.status(500).json({ message: "Server error" });
      }

      const insertSql =
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
      db.query(insertSql, [name, email, hash], (err, result) => {
        if (err) {
          console.error("❌ Error inserting user:", err);
          return res.status(500).json({ message: "Database error" });
        }

        return res.status(201).json({ message: "Signup successful" });
      });
    });
  });
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, rows) => {
    if (err) {
      console.error("❌ Error finding user:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error("❌ Error comparing password:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!match) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  });
});

// Existing routes
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      console.error("❌ Error getting products:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
