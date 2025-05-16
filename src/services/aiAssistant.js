import axios from "axios";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebase";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getDoubtClarification(doubt) {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) throw new Error("API key not configured");

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        messages: [
          {
            role: "system",
            content:
              "You are a helpful study assistant. Provide a clear, concise summary to clarify the student's doubt. Keep it under 50 words.",
          },
          {
            role: "user",
            content: `Clarify this doubt: ${doubt}`,
          },
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 100,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 10000,
      }
    );

    const clarification = response.data.choices[0]?.message?.content;
    if (!clarification) throw new Error("No clarification in response");

    return clarification;
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      config: error.config,
    });
    throw error;
  }
}

export async function getCachedDoubtClarification(doubt, userId) {
  const cacheRef = doc(db, "doubtCache", `${userId}_${doubt}`);

  try {
    // Check cache first
    const docSnap = await getDoc(cacheRef);
    if (docSnap.exists()) {
      const cacheData = docSnap.data();
      const isExpired =
        Date.now() - cacheData.timestamp?.toMillis() > 24 * 60 * 60 * 1000;
      if (!isExpired) return cacheData.content;
    }

    // Fetch fresh clarification
    const clarification = await getDoubtClarification(doubt);

    // Update cache
    await setDoc(
      cacheRef,
      {
        content: clarification,
        timestamp: serverTimestamp(),
        doubt: doubt,
      },
      { merge: true }
    );

    return clarification;
  } catch (error) {
    console.error("Cache Error:", error);
    throw error;
  }
}
