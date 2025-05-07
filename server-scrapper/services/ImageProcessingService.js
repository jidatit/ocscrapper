// services/ImageProcessingService.js
require("dotenv").config();

const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class ImageProcessingService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY must be set in your environment");
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async extractPartiesAddresses(source) {
    // 1) Load file
    let buffer;
    if (source.startsWith("http")) {
      const resp = await fetch(source);
      if (!resp.ok)
        throw new Error(`Failed to fetch ${source}: ${resp.statusText}`);
      buffer = await resp.arrayBuffer();
    } else {
      buffer = fs.readFileSync(source);
    }

    // 2) Prepare model
    const model = this.genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash-lite",
    });

    // 3) Build imagePart
    const imagePart = {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType: source.endsWith(".tiff") ? "image/tiff" : "application/pdf",
      },
    };

    // 4) Prompt
    const prompt = `
      Analyze the attached document.
      1. Extract the Plaintiff's address.
      2. Extract the Defendant's address.
      Output only JSON with keys "plaintiff_address" and "defendant_address".
    `;

    // 5) Call Gemini
    const result = await model.generateContent([prompt, imagePart]);
    let text = result.response.text();

    // 6) Clean up markdown fences if present
    //    remove ```json or ``` wrappers
    text = text
      .trim()
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    // 7) Parse JSON
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON from Gemini: ${text}`);
    }
  }
}

module.exports = ImageProcessingService;
