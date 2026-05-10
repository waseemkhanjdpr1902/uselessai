import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import Razorpay from "razorpay";
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "utilitynest-ai"
  });
}
const db = admin.firestore();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Payment Service (Lazy Init)
  const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys not configured");
    }
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Billing API
  app.post("/api/billing/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR" } = req.body;
      const rzp = getRazorpay();
      const order = await rzp.orders.create({
        amount: amount * 100, // amount in smallest currency unit
        currency,
        receipt: `receipt_${nanoid()}`,
      });
      res.json({ success: true, order });
    } catch (err) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Billing error" });
    }
  });

  // URL Shortener API
  app.post("/api/shorten", async (req, res) => {
    try {
      const { url, customSlug } = req.body;
      const slug = (customSlug || nanoid(6)).trim();
      
      // Check if slug exists
      const docRef = db.collection("shortUrls").doc(slug);
      const doc = await docRef.get();
      
      if (doc.exists && customSlug) {
        return res.status(400).json({ success: false, error: "Custom alias already taken" });
      }

      await docRef.set({
        slug,
        targetUrl: url,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Use the actual protocol and host if available
      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol;
      const shortUrl = `${protocol}://${host}/s/${slug}`;

      res.json({ success: true, slug, shortUrl });
    } catch (err) {
      res.status(500).json({ success: false, error: "Shortening failed" });
    }
  });

  // Redirect Route for Short URLs
  app.get("/s/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const docRef = db.collection("shortUrls").doc(slug);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).send("Link expired or doesn't exist");
      }

      const data = doc.data();
      res.redirect(data?.targetUrl);
    } catch (err) {
      res.status(500).send("Redirection error");
    }
  });

  // QR Code Generation API
  app.post("/api/qrcode", async (req, res) => {
    const { text, options } = req.body;
    try {
      const qrDataUrl = await QRCode.toDataURL(text, options);
      res.json({ success: true, qrDataUrl });
    } catch (err) {
      res.status(500).json({ success: false, error: "QR generation failed" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UtilityNest AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
