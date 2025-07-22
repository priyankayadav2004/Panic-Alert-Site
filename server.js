const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // for serving index.html if needed

// Nodemailer setup (Gmail example - use app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "priyanka290108@gmail.com", // 🔁 Replace with your Gmail
    pass: "uazuxnmdnoxvmxbv", // 🔁 Replace with Gmail App Password (not your login password)
  },
});

// POST endpoint to send email
app.post("/send-email", (req, res) => {
  const { to, name } = req.body;

  const mailOptions = {
    from: '"project always" <your_email@gmail.com>',
    to: to,
    subject: "🚨 Panic Alert!",
    text: `Hi ${name}, someone needs you! Please check on them immediately.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Email failed:", error);
      return res.status(500).send("Email failed to send.");
    }
    console.log("✅ Email sent:", info.response);
    res.send("Email sent successfully.");
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
