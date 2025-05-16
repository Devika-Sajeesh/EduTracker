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

export async function getStudyTips(topic) {
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
              "You are a helpful study assistant. Provide exactly 3 concise bullet-point study tips in markdown format:\n- Tip 1\n- Tip 2\n- Tip 3\nKeep each tip under 15 words.",
          },
          {
            role: "user",
            content: `Provide study tips for: ${topic}`,
          },
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 10000,
      }
    );

    const tips = response.data.choices[0]?.message?.content;
    if (!tips) throw new Error("No tips in response");

    return tips;
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      response: error.response?.data,
      config: error.config,
    });
    throw error;
  }
}

export async function getCachedStudyTips(topic, userId) {
  const cacheRef = doc(db, "studyCache", `${userId}_${topic}`);

  try {
    // Check cache first
    const docSnap = await getDoc(cacheRef);
    if (docSnap.exists()) {
      const cacheData = docSnap.data();
      const isExpired =
        Date.now() - cacheData.timestamp?.toMillis() > 24 * 60 * 60 * 1000;
      if (!isExpired) return cacheData.content;
    }

    // Fetch fresh tips
    const tips = await getStudyTips(topic);

    // Update cache
    await setDoc(
      cacheRef,
      {
        content: tips,
        timestamp: serverTimestamp(),
        topic: topic,
      },
      { merge: true }
    );

    return tips;
  } catch (error) {
    console.error("Cache Error:", error);
    throw error;
  }
}
