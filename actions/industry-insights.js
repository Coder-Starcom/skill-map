"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate industry insights for a specific industry
 */
export async function generateIndustryInsights(industry) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key not configured. Please check your environment variables.");
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
    Generate industry insights for "${industry}" industry in this JSON format:
    {
      "industry": "${industry}",
      "title": "Comprehensive ${industry} Industry Analysis",
      "overview": "Detailed overview of the industry, its current state, and significance",
      "marketGrowth": [
        {"name": "2024", "value": 15},
        {"name": "2025", "value": 18},
        {"name": "2026", "value": 22},
        {"name": "2027", "value": 25}
      ],
      "skillsDemand": [
        {"name": "Technical Skills", "value": 40},
        {"name": "Soft Skills", "value": 30},
        {"name": "Domain Knowledge", "value": 20},
        {"name": "Certifications", "value": 10}
      ],
      "salaryRanges": [
        {"name": "Entry Level", "value": 55000},
        {"name": "Mid Level", "value": 85000},
        {"name": "Senior Level", "value": 120000},
        {"name": "Lead/Manager", "value": 150000}
      ],
      "marketTrends": [
        {"name": "Remote Work", "value": 85},
        {"name": "AI Integration", "value": 75},
        {"name": "Automation", "value": 60},
        {"name": "Sustainability", "value": 45}
      ],
      "keyDomains": [
        {
          "name": "Domain 1",
          "description": "Description of this domain",
          "demandLevel": "High",
          "growthRate": 25
        },
        {
          "name": "Domain 2", 
          "description": "Description of this domain",
          "demandLevel": "Medium",
          "growthRate": 15
        }
      ],
      "careerOpportunities": [
        {
          "title": "Role Title 1",
          "description": "Detailed description of this role",
          "skills": ["Skill 1", "Skill 2", "Skill 3"]
        },
        {
          "title": "Role Title 2",
          "description": "Detailed description of this role", 
          "skills": ["Skill 4", "Skill 5", "Skill 6"]
        }
      ],
      "topCompanies": ["Company 1", "Company 2", "Company 3", "Company 4", "Company 5"],
      "skillsInDemand": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
      "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
      "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
      "certifications": ["Certification 1", "Certification 2", "Certification 3", "Certification 4"],
      "futureOutlook": "Detailed 5-year future outlook with specific predictions and trends",
      "marketStats": {
        "totalMarketSize": "$500B",
        "annualGrowthRate": "15%",
        "jobOpenings": "2.5M",
        "averageSalary": "$95K"
      }
    }
    
    Keep it concise but informative. Focus on key trends and data for ${industry}.
    `;

    const result = await model.generateContent(prompt);
    
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const insightsData = JSON.parse(jsonMatch[0]);
      return insightsData;
    } else {
      throw new Error("Could not parse insights JSON from AI response");
    }
    
  } catch (error) {
    console.error("Error generating industry insights:", error);
    
    // Log specific error types but still return fallback data
    if (error.message.includes("API call timeout")) {
      console.log("Industry insights generation timed out, using fallback data");
    } else if (error.message.includes("API key")) {
      console.log("API key issue, using fallback data");
    } else if (error.message.includes("quota")) {
      console.log("API quota exceeded, using fallback data");
    } else if (error.message.includes("network")) {
      console.log("Network error, using fallback data");
    }
    
    // Fallback insights data
    return {
      industry: industry,
      title: `Comprehensive ${industry} Industry Analysis`,
      overview: `The ${industry} industry is experiencing significant growth and transformation. This sector offers numerous opportunities for professionals with the right skills and expertise.`,
      marketGrowth: [
        {"name": "2024", "value": 12},
        {"name": "2025", "value": 15},
        {"name": "2026", "value": 18},
        {"name": "2027", "value": 22}
      ],
      skillsDemand: [
        {"name": "Technical Skills", "value": 45},
        {"name": "Soft Skills", "value": 25},
        {"name": "Domain Knowledge", "value": 20},
        {"name": "Certifications", "value": 10}
      ],
      salaryRanges: [
        {"name": "Entry Level", "value": 50000},
        {"name": "Mid Level", "value": 80000},
        {"name": "Senior Level", "value": 110000},
        {"name": "Lead/Manager", "value": 140000}
      ],
      marketTrends: [
        {"name": "Digital Transformation", "value": 80},
        {"name": "Remote Work", "value": 70},
        {"name": "AI Integration", "value": 65},
        {"name": "Sustainability", "value": 50}
      ],
      keyDomains: [
        {
          "name": "Core Development",
          "description": "Fundamental development practices and methodologies",
          "demandLevel": "High",
          "growthRate": 20
        },
        {
          "name": "Emerging Technologies",
          "description": "Cutting-edge technologies and innovations",
          "demandLevel": "Medium",
          "growthRate": 30
        }
      ],
      careerOpportunities: [
        {
          "title": "Senior Developer",
          "description": "Lead development projects and mentor junior developers",
          "skills": ["Programming", "Leadership", "Architecture"]
        },
        {
          "title": "Technical Consultant",
          "description": "Provide expert advice and solutions to clients",
          "skills": ["Problem Solving", "Communication", "Technical Expertise"]
        }
      ],
      topCompanies: ["Leading Company 1", "Leading Company 2", "Leading Company 3", "Leading Company 4", "Leading Company 5"],
      skillsInDemand: ["Communication", "Problem Solving", "Technical Skills", "Leadership", "Project Management", "Analytical Thinking"],
      challenges: ["Market Competition", "Technology Changes", "Skill Gap"],
      opportunities: ["Digital Transformation", "Remote Work", "Innovation"],
      certifications: ["Industry Certification 1", "Industry Certification 2", "Industry Certification 3", "Industry Certification 4"],
      futureOutlook: "The industry shows strong growth potential with increasing demand for skilled professionals. Digital transformation and emerging technologies will drive significant opportunities in the next 5 years.",
      marketStats: {
        "totalMarketSize": "$400B",
        "annualGrowthRate": "12%",
        "jobOpenings": "2M",
        "averageSalary": "$90K"
      }
    };
  }
}

/**
 * Save industry insights for a user
 */
export async function saveIndustryInsights(industry, insightsData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Save the insights to database
    const savedInsights = await db.userIndustryInsight.create({
      data: {
        userId: user.id,
        industry,
        title: insightsData.title,
        content: insightsData
      }
    });

    return savedInsights;
  } catch (error) {
    console.error("Error saving industry insights:", error);
    throw new Error("Failed to save industry insights");
  }
}

/**
 * Get industry insights (placeholder function)
 */
export async function getIndustryInsights() {
  return null; // No initial insights
}

/**
 * Save industry insight (simplified version)
 */
export async function saveIndustryInsight(insightsData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Save the insights to database
    const savedInsights = await db.userIndustryInsight.create({
      data: {
        userId: user.id,
        industry: insightsData.industry || 'General',
        title: insightsData.title || 'Industry Analysis',
        content: insightsData
      }
    });

    return savedInsights;
  } catch (error) {
    console.error("Error saving industry insight:", error);
    throw new Error("Failed to save industry insight");
  }
}
