import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const configuredModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";

export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export const MODELS = {
  GENERAL: configuredModel, // Default gemini-3.8-flash
  FAST: "gemini-3.1-flash-lite",
  REASONING: "gemini-4-argon",
  LIVE: "gemini-3.8-live",
};

export { ThinkingLevel };
