const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const app = express();
const PORT = 5000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(bodyParser.json());

// ================= DATABASE =================
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
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
  user: "YOUR_REAL_GMAIL@gmail.com",
  pass: "YOUR_16_DIGIT_APP_PASSWORD"

  }
});

function sendVerificationEmail(email, token) {
  const link = `http://localhost:5000/api/verify/${token}`;

  transporter.sendMail({
    from: "your_email@gmail.com",
    to: email,
    subject: "Verify Your Email",
    html: `<h3>Click below to verify your email</h3>
           <a href="${link}">Verify Email</a>`
  });
}
// ================= RAZORPAY =================
const razorpay = new Razorpay({
  key_id: "rzp_test_SjOLtIibGvJDJ0",
  key_secret: "WtfjxDwv69ae5QCdoqMiRCqx"
});

// ================= AUTH =================

// Signup
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  const checkSql = "SELECT id FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, rows) => {

    if (rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    bcrypt.hash(password, 10, (err, hash) => {

      const token = crypto.randomBytes(32).toString("hex");

      const sql = `
        INSERT INTO users (name, email, password, verificationToken, isVerified) 
        VALUES (?, ?, ?, ?, false)
      `;

      db.query(sql, [name, email, hash, token], () => {

        sendVerificationEmail(email, token);

        res.json({ message: "Signup successful. Please verify your email." });
      });
    });
  });
});
app.get("/api/verify/:token", (req, res) => {
  const token = req.params.token;

  db.query(
    "SELECT * FROM users WHERE verificationToken = ?",
    [token],
    (err, rows) => {

      if (rows.length === 0) {
        return res.send("Invalid or expired token");
      }

      db.query(
        "UPDATE users SET isVerified = true, verificationToken = NULL WHERE id = ?",
        [rows[0].id],
        () => {
          res.send("Email verified successfully. You can now login.");
        }
      );
    }
  );
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], (err, rows) => {

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const user = rows[0];

    // ✅ ADD THIS CHECK
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first"
      });
    }

    bcrypt.compare(password, user.password, (err, match) => {

      if (!match) {
        return res.status(400).json({ message: "Wrong password" });
      }

      res.json({
        message: "Login success",
        user: user
      });
    });
  });
});
// ================= PRODUCTS =================
app.get("/api/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {

    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results); // 👈 must send JSON
  });
});
// ================= CONTACT =================
app.post("/api/contacts", (req, res) => {
  const { name, email, message } = req.body;

  db.query(
    "INSERT INTO contacts (name,email,message) VALUES (?,?,?)",
    [name, email, message],
    () => {
      res.json({ message: "Message saved" });
    }
  );
});

// ================= CART =================
app.post("/api/checkout", (req, res) => {
  const cart = req.body.cart;

  const values = cart.map(item => [item.id, item.name, item.price]);

  db.query(
    "INSERT INTO cart (id,name,price) VALUES ?",
    [values],
    () => {
      res.json({ message: "Cart saved" });
    }
  );
});

app.delete("/api/cart", (req, res) => {
  db.query("DELETE FROM cart", () => {
    res.json({ message: "Cart cleared" });
  });
});

// ================= PAYMENT =================
app.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR"
    });

    res.json(order);

  } catch (err) {
    console.log("ERROR:", err);   // 👈 IMPORTANT
    res.status(500).json({ error: "Payment failed" });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});