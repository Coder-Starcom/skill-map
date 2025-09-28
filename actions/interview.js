"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  // Check if API key is available
  if (!process.env.GEMINI_API_KEY) {
    console.log("❌ Gemini API key not found, using fallback questions");
    return getFallbackQuestions(user.industry, user.skills);
  }

  const prompt = `
    Generate 10 relevant interview questions for a ${user.industry} professional${user.skills?.length ? ` with skills in ${user.skills.join(", ")}` : ""}.
    
    Focus on practical, industry-specific scenarios and technical knowledge.
    Each question should be multiple choice with 4 realistic options.
    
    Return JSON format:
    {
      "questions": [
        {
          "question": "Question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Correct option",
          "explanation": "Why this answer is correct"
        }
      ]
    }
  `;

  try {
    console.log("🚀 Generating interview questions for:", user.industry);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    console.log("✅ Interview questions generated successfully");
    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    console.log("Using fallback questions for:", user.industry);
    return getFallbackQuestions(user.industry, user.skills);
  }
}

// Generate industry-specific fallback questions
function getFallbackQuestions(industry, skills) {
  const industryLower = industry?.toLowerCase() || 'general';
  
  if (industryLower.includes('technology') || industryLower.includes('software') || industryLower.includes('tech')) {
    return [
      {
        question: "What is the difference between a stack and a queue in data structures?",
        options: ["Stack is LIFO, Queue is FIFO", "Stack is FIFO, Queue is LIFO", "Both are the same", "Stack uses arrays, Queue uses linked lists"],
        correctAnswer: "Stack is LIFO, Queue is FIFO",
        explanation: "A stack follows Last In First Out (LIFO) principle, while a queue follows First In First Out (FIFO) principle."
      },
      {
        question: "Which HTTP method is used to retrieve data from a server?",
        options: ["POST", "PUT", "GET", "DELETE"],
        correctAnswer: "GET",
        explanation: "GET is used to retrieve data from a server without modifying it."
      },
      {
        question: "What does API stand for?",
        options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface", "Application Process Integration"],
        correctAnswer: "Application Programming Interface",
        explanation: "API stands for Application Programming Interface, which allows different software applications to communicate."
      },
      {
        question: "What is the purpose of version control systems like Git?",
        options: ["To store passwords", "To track changes in code", "To compile programs", "To debug applications"],
        correctAnswer: "To track changes in code",
        explanation: "Version control systems track changes in code, allowing multiple developers to collaborate and maintain code history."
      },
      {
        question: "Which of the following is NOT a programming paradigm?",
        options: ["Object-Oriented Programming", "Functional Programming", "Procedural Programming", "Database Programming"],
        correctAnswer: "Database Programming",
        explanation: "Database Programming is not a programming paradigm. The main paradigms are OOP, Functional, and Procedural programming."
      }
    ];
  }
  
  if (industryLower.includes('healthcare') || industryLower.includes('medical')) {
    return [
      {
        question: "What is HIPAA and why is it important in healthcare?",
        options: ["A medical procedure", "Health Insurance Portability and Accountability Act", "A type of medication", "A hospital department"],
        correctAnswer: "Health Insurance Portability and Accountability Act",
        explanation: "HIPAA protects patient health information and ensures privacy and security of medical records."
      },
      {
        question: "What is the primary purpose of electronic health records (EHR)?",
        options: ["To reduce costs", "To improve patient care coordination", "To replace doctors", "To store billing information"],
        correctAnswer: "To improve patient care coordination",
        explanation: "EHRs improve patient care coordination by providing comprehensive patient information to healthcare providers."
      },
      {
        question: "Which of the following is a key principle of patient safety?",
        options: ["Cost reduction", "Patient identification", "Speed of service", "Technology use"],
        correctAnswer: "Patient identification",
        explanation: "Proper patient identification is crucial for patient safety to prevent medical errors and ensure correct treatment."
      },
      {
        question: "What does 'evidence-based practice' mean in healthcare?",
        options: ["Using only technology", "Making decisions based on research evidence", "Following patient preferences only", "Using traditional methods"],
        correctAnswer: "Making decisions based on research evidence",
        explanation: "Evidence-based practice involves making clinical decisions based on the best available research evidence."
      },
      {
        question: "What is the role of healthcare informatics?",
        options: ["Patient care only", "Managing healthcare information and technology", "Financial management", "Administrative tasks only"],
        correctAnswer: "Managing healthcare information and technology",
        explanation: "Healthcare informatics focuses on managing healthcare information and technology to improve patient care."
      }
    ];
  }
  
  if (industryLower.includes('finance') || industryLower.includes('banking')) {
    return [
      {
        question: "What is the primary purpose of financial risk management?",
        options: ["To increase profits", "To identify and mitigate potential losses", "To reduce taxes", "To expand business"],
        correctAnswer: "To identify and mitigate potential losses",
        explanation: "Financial risk management aims to identify, assess, and mitigate potential financial losses."
      },
      {
        question: "What does ROI stand for in finance?",
        options: ["Return on Investment", "Rate of Interest", "Revenue on Income", "Risk of Investment"],
        correctAnswer: "Return on Investment",
        explanation: "ROI measures the efficiency of an investment by comparing the return to the cost."
      },
      {
        question: "What is the difference between assets and liabilities?",
        options: ["Assets are debts, Liabilities are resources", "Assets are resources, Liabilities are debts", "They are the same", "Assets are income, Liabilities are expenses"],
        correctAnswer: "Assets are resources, Liabilities are debts",
        explanation: "Assets are resources owned by a company, while liabilities are debts or obligations."
      },
      {
        question: "What is the purpose of financial forecasting?",
        options: ["To predict the past", "To predict future financial performance", "To calculate taxes", "To audit records"],
        correctAnswer: "To predict future financial performance",
        explanation: "Financial forecasting helps predict future financial performance for planning and decision-making."
      },
      {
        question: "What does 'liquidity' mean in finance?",
        options: ["The ability to pay debts", "The ability to convert assets to cash quickly", "The amount of profit", "The cost of borrowing"],
        correctAnswer: "The ability to convert assets to cash quickly",
        explanation: "Liquidity refers to how quickly assets can be converted to cash without significant loss of value."
      }
    ];
  }
  
  // Generic fallback for other industries
  return [
    {
      question: "What is the most important skill for professional success?",
      options: ["Technical expertise only", "Communication skills", "Working alone", "Avoiding challenges"],
      correctAnswer: "Communication skills",
      explanation: "Communication skills are essential for collaboration, leadership, and professional success across all industries."
    },
    {
      question: "What does 'continuous learning' mean in a professional context?",
      options: ["Learning only in school", "Staying updated with industry trends and skills", "Avoiding new technology", "Working the same way always"],
      correctAnswer: "Staying updated with industry trends and skills",
      explanation: "Continuous learning involves staying updated with industry trends, new skills, and professional development."
    },
    {
      question: "What is the primary goal of project management?",
      options: ["To increase costs", "To complete projects on time, within budget, and meeting requirements", "To avoid planning", "To work alone"],
      correctAnswer: "To complete projects on time, within budget, and meeting requirements",
      explanation: "Project management aims to deliver projects successfully within constraints of time, budget, and scope."
    },
    {
      question: "What is the importance of teamwork in the workplace?",
      options: ["It's not important", "It improves productivity and innovation", "It slows down work", "It's only for managers"],
      correctAnswer: "It improves productivity and innovation",
      explanation: "Teamwork enhances productivity, fosters innovation, and leads to better problem-solving and results."
    },
    {
      question: "What does 'professional ethics' refer to?",
      options: ["Making more money", "Following moral principles in professional conduct", "Avoiding work", "Working longer hours"],
      correctAnswer: "Following moral principles in professional conduct",
      explanation: "Professional ethics involves following moral principles and standards in professional behavior and decision-making."
    }
  ];
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}
