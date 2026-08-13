import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check route
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Assistant endpoint using Gemini API
  app.post("/api/ai/ask", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured in environment settings.",
        });
      }

      const { prompt, context, pharmacyData } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const activeContext = context || pharmacyData;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `
You are an expert AI Pharmacy Operations Specialist and Business Intelligence Assistant named "PharmaAI".
You assist pharmacy managers, pharmacists, cashiers, and store administrators with operational insights, inventory optimization, sales analysis, drug safety guidance, and stock alerts.

Context of the pharmacy currently:
${activeContext ? JSON.stringify(activeContext, null, 2) : "No context provided."}

Guidelines for your response:
1. Provide concise, professional, clear, and actionable advice tailored to pharmacy staff.
2. If the user asks about low stock, expiring medicines, top revenue items, or customer trends, use the provided context metrics directly.
3. Keep clinical advice clear: always state that clinical advice must be verified by a licensed pharmacist.
4. Format response nicely using Markdown (bullet points, bold highlights, concise summary tables if applicable).
5. Suggest relevant follow-up actions (e.g. "Draft purchase order", "Contact supplier", "Check batch number").
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const answerText = response.text || "No response generated.";
      return res.json({ text: answerText, answer: answerText });
    } catch (error: any) {
      console.error("AI Assistant API Error:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate AI response.",
      });
    }
  });

  // Vite middleware for development vs static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pharmacy Management System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
