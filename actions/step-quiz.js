"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimitedApiCall } from "@/lib/rate-limiter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateStepQuiz(stepTitle, stepDescription, stepContent) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    Generate a quiz for the following learning step:
    
    Title: ${stepTitle}
    Description: ${stepDescription}
    Content: ${stepContent}
    
    Create 1 multiple choice question that tests understanding of this specific step.
    The question should have 4 options with only one correct answer.
    
    Return ONLY a JSON object with this exact structure:
    {
      "questions": [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct": 0,
          "explanation": "Explanation of why this answer is correct"
        }
      ]
    }
    
    IMPORTANT: Return ONLY the JSON object. No additional text or explanations.
    `;

    const result = await rateLimitedApiCall(async () => {
      return await model.generateContent(prompt);
    });
    
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const cleanedResponse = text.replace(/```(?:json)?\n?/g, "").trim();
    const quizData = JSON.parse(cleanedResponse);

    return quizData;
  } catch (error) {
    console.error("Error generating step quiz:", error);
    
    // Return a fallback quiz instead of throwing
    return {
      questions: [
        {
          question: `What is the main focus of "${stepTitle}"?`,
          options: [
            "Learning the fundamentals",
            "Advanced techniques",
            "Practical application",
            "Theory only"
          ],
          correct: 0,
          explanation: "This step focuses on learning the fundamental concepts and basics."
        }
      ]
    };
  }
}
