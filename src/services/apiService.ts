import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

export const apiService = {
  // Common logging
  async logUsage(tool: string, metadata: any) {
    const user = auth.currentUser;
    await addDoc(collection(db, "logs"), {
      userId: user?.uid || "anonymous",
      tool,
      timestamp: serverTimestamp(),
      metadata
    });
  },

  // QR Code
  async generateQR(text: string, options: any = {}) {
    const res = await fetch("/api/qrcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, options })
    });
    const data = await res.json();
    if (data.success) {
      await this.logUsage("qrcode", { text });
      return data.qrDataUrl;
    }
    throw new Error("QR Generation failed");
  },

  // URL Shortener
  async shortenUrl(url: string, customSlug?: string) {
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, customSlug })
    });
    const data = await res.json();
    if (data.success) {
      await this.logUsage("shortener", { url });
      return data;
    }
    throw new Error("Shortening failed");
  },

  // AI Email Writer
  async writeEmail(prompt: string, tone: string = "professional", language: string = "English") {
    // Deprecated: Now handled in frontend component directly
    console.warn("apiService.writeEmail is deprecated. Use frontend GoogleGenAI instead.");
    return "";
  },

  // CV Builder
  async saveResume(resumeData: any) {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required");
    const docRef = await addDoc(collection(db, "users", user.uid, "resumes"), {
      ...resumeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await this.logUsage("cv-builder", { resumeId: docRef.id });
    return docRef.id;
  },

  // Temp Mail replacement (using a free API for demo)
  async getTempEmail() {
    // This is a placeholder for a real 10min mail API integration
    // In a real app, you'd call a provider like GuerrillaMail, etc.
    return "demo-" + Math.random().toString(36).substring(7) + "@utilne.st";
  }
};
