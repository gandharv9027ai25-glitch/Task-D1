
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");
const formData = require("form-data");
const Mailgun = require("mailgun.js");

// Firebase Admin modular imports
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

// Load the private service-account key.
// Keep this file private and out of Git.
const serviceAccount = require("./firebase-service-account.json");

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

const app = express();
const PORT = 3000;

// Allow the React development server
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ]
}));

// Read incoming request data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Check environment variables without exposing credentials
console.log("API key loaded:", !!process.env.MAILGUN_API_KEY);
console.log("Domain loaded:", !!process.env.MAILGUN_DOMAIN);

// Create Mailgun client
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running"
  });
});

// Newsletter subscription endpoint
app.post("/api/subscribe", async (req, res) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim()
      : "";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address."
    });
  }

  if (
    !process.env.MAILGUN_API_KEY ||
    !process.env.MAILGUN_DOMAIN
  ) {
    console.error("Mailgun configuration is missing.");

    return res.status(500).json({
      success: false,
      message: "Email service is not configured."
    });
  }

  try {
    const response = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      {
        from: `DEV@Deakin <postmaster@${process.env.MAILGUN_DOMAIN}>`,
        to: [email],
        subject: "Welcome to DEV@Deakin!",
        text: "Welcome to DEV@Deakin! Thank you for subscribing.",
        html: `
          <h1>Welcome to DEV@Deakin!</h1>
          <p>
            Thank you for subscribing to our DEV@Deakin platform.
          </p>
          <p>
            We are happy to have you with us!
          </p>
        `
      }
    );

    console.log("Mailgun accepted the email request:", response.id);

    return res.status(200).json({
      success: true,
      message: "Subscription successful! Welcome email requested."
    });
  } catch (error) {
    console.error("Mailgun error:", error.message || "Unknown error");

    return res.status(502).json({
      success: false,
      message: "Unable to send the welcome email. Please try again."
    });
  }
});

// Upgrade subscription endpoint
app.post("/api/upgrade-plan", async (req, res) => {
  try {
    // 1. Verify the Firebase login token
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in first."
      });
    }

    const idToken = authHeader.substring("Bearer ".length);
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Validate demonstration form fields
    const { name, cardNumber, expiry, cvv } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof cardNumber !== "string" ||
      typeof expiry !== "string" ||
      typeof cvv !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all demonstration fields."
      });
    }

    const digits = cardNumber.replace(/\s/g, "");

    if (!/^\d{12,19}$/.test(digits)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid demonstration card number."
      });
    }

    const expiryMatch = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);

    if (!expiryMatch || !/^\d{3,4}$/.test(cvv)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid expiry date and demonstration CVV."
      });
    }

    const month = Number(expiryMatch[1]);
    const year = 2000 + Number(expiryMatch[2]);
    const now = new Date();

    if (
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "The expiry date must be in the future."
      });
    }

    // 3. Find the authenticated user's Firestore document
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User profile was not found."
      });
    }

    // 4. Prevent duplicate upgrades
    if (userDoc.data().plan === "Paid") {
      return res.status(409).json({
        success: false,
        message: "You are already on the Paid plan."
      });
    }

    // 5. Demonstration upgrade only.
    // No real payment is processed.
    // Never store card numbers or CVVs.
    await userRef.update({
      plan: "Paid"
    });

    return res.status(200).json({
      success: true,
      message: "Your demonstration upgrade was successful.",
      plan: "Paid"
    });
  } catch (error) {
    console.error(
      "Upgrade error:",
      error.code || error.message || "Unknown error"
    );

    if (
      error.code === "auth/argument-error" ||
      error.code === "auth/invalid-id-token" ||
      error.code === "auth/id-token-expired"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your login session is invalid or expired. Please log in again."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to complete the upgrade. Please try again."
    });
  }
});

// Start the backend
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
