import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const DEFAULT_MODEL_CANDIDATES = [
  "gemini-2.0-flash",
];

const GEMINI_MAX_RETRIES = parseInt(process.env.GEMINI_MAX_RETRIES || "4", 10);
const GEMINI_RETRY_BASE_MS = parseInt(process.env.GEMINI_RETRY_BASE_MS || "600", 10);

const getModelCandidates = () => {
  const configured = (process.env.GEMINI_MODEL || "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  return [...new Set([...configured, ...DEFAULT_MODEL_CANDIDATES])];
};

const isModelNotFoundError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return error?.status === 404 || message.includes("not found") || message.includes("listmodels");
};

const isRetryableError = (error) => {
  const status = error?.status;
  const message = String(error?.message || "").toLowerCase();
  
  // Retry on rate limit, service unavailable, or transient errors
  if (status === 429 || status === 503 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  
  // Retry on network-related messages
  if (message.includes("econnrefused") || message.includes("etimedout") || message.includes("enotfound")) {
    return true;
  }
  
  return false;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (attempt) => {
  // Exponential backoff: base * 2^attempt, with jitter
  const exponential = GEMINI_RETRY_BASE_MS * Math.pow(2, attempt);
  const capped = Math.min(exponential, 8000); // Cap at 8 seconds
  const jitter = Math.random() * 0.3 * capped; // 0-30% jitter
  return capped + jitter;
};

const generateWithModelFallback = async (payload) => {
  const models = getModelCandidates();
  let lastError;

  for (const modelName of models) {
    let lastModelError;
    
    for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(payload);
        const response = await result.response;
        return response.text();
      } catch (error) {
        lastModelError = error;
        
        // If model not found, break and try next model
        if (isModelNotFoundError(error)) {
          lastError = error;
          break;
        }
        
        // If retryable and attempts remain, wait and retry
        if (isRetryableError(error) && attempt < GEMINI_MAX_RETRIES) {
          const delay = getRetryDelay(attempt);
          console.warn(`[Retry ${attempt + 1}/${GEMINI_MAX_RETRIES}] Model: ${modelName}, Wait: ${delay.toFixed(0)}ms`);
          await sleep(delay);
          continue;
        }
        
        // Not retryable or out of attempts, throw
        lastError = error;
        break;
      }
    }
  }

  // All models exhausted; provide user-friendly message
  if (lastError?.status === 429) {
    throw new Error("AI service is temporarily busy due to rate limiting. Please wait 30-60 seconds and try again.");
  }

  throw lastError || new Error("No compatible Gemini model was found for this API key");
};

const normalizeExtractedText = (text) => text.replace(/\s+\n/g, "\n").trim();

const extractTextWithLocalFallback = async (fileBuffer, mimeType) => {
  if (!mimeType) return "";

  if (mimeType.startsWith("text/")) {
    return normalizeExtractedText(fileBuffer.toString("utf8"));
  }

  if (mimeType === "application/pdf") {
    try {
      const parser = new PDFParse({ data: fileBuffer });
      const parsed = await parser.getText();
      await parser.destroy();
      return normalizeExtractedText(parsed.text || "");
    } catch (pdfError) {
      console.warn("PDF parsing failed, returning empty string:", pdfError.message);
      return "";
    }
  }

  return "";
};

const buildFallbackFlashcards = (content) => {
  const safeContent = (content || "").trim();
  const clipped = safeContent.slice(0, 500);
  const paragraphs = safeContent
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 3);

  const cards = [
    {
      question: "What is the main topic of this note?",
      answer: clipped ? `${clipped}${safeContent.length > 500 ? "..." : ""}` : "No content provided.",
    },
    {
      question: "What are the key takeaways?",
      answer: paragraphs.length
        ? paragraphs.join("\n\n")
        : "Review the note and identify 3-5 core ideas in your own words.",
    },
    {
      question: "How would you explain this topic to someone else?",
      answer: "Use simple language, define terms, and give one practical example.",
    },
  ];

  return cards;
};

export const generateFlashcards = async (content) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return buildFallbackFlashcards(content);
    }

    const prompt = `
      You are an expert tutor. Create a set of concise, high-quality study flashcards from the following text.
      Return the response ONLY as a valid JSON array of objects, each with "question" and "answer" fields.
      Keep questions under 300 characters and answers under 1200 characters.
      Limit to 5-10 cards.
      Text: ${content}
    `;

    const text = await generateWithModelFallback(prompt);
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    
    // Validate and sanitize parsed cards
    if (Array.isArray(parsed)) {
      return parsed.map((card) => ({
        question: String(card?.question || "").slice(0, 300).trim() || "Q",
        answer: String(card?.answer || "").slice(0, 1200).trim() || "A",
      }));
    }
    
    return buildFallbackFlashcards(content);
  } catch (error) {
    console.error("AI Generation Error:", error?.message);
    return buildFallbackFlashcards(content);
  }
};

export const extractTextFromFile = async (fileBuffer, mimeType) => {
  try {
    const fallbackText = await extractTextWithLocalFallback(fileBuffer, mimeType);

    if (!process.env.GEMINI_API_KEY) {
      if (fallbackText) return fallbackText;
      throw new Error("AI extraction is not configured. Add GEMINI_API_KEY or upload a text/PDF file.");
    }

    const text = await generateWithModelFallback([
      "Extract all text from this file and summarize it as a study note. Keep the structure organized with headings if possible.",
      {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType: mimeType
        }
      }
    ]);
    const aiText = normalizeExtractedText(text);

    if (aiText) return aiText;
    if (fallbackText) return fallbackText;

    throw new Error("No text could be extracted from the uploaded file");
  } catch (error) {
    console.error("AI File Extraction Error:", error?.message);

    try {
      const fallbackText = await extractTextWithLocalFallback(fileBuffer, mimeType);
      if (fallbackText) return fallbackText;
    } catch (fallbackError) {
      console.error("Local Fallback Extraction Error:", fallbackError?.message);
    }

    throw new Error(error?.message || "Failed to extract text from file");
  }
};
