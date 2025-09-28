"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimitedApiCall } from "@/lib/rate-limiter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Fetch job listings from Adzuna API
 */
export async function fetchJobListings(skill, location = "us", results = 20) {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    
    if (!appId || !appKey) {
      throw new Error("Adzuna API credentials not configured");
    }

    const url = `https://api.adzuna.com/v1/api/jobs/${location}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(skill)}&results_per_page=${results}&content-type=application/json`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching job listings:", error);
    throw new Error("Failed to fetch job listings");
  }
}

/**
 * Extract required skills from job description (simple text parsing)
 */
export async function extractRequiredSkills(jobTitle, jobDescription) {
  // Common technical skills keywords
  const technicalSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
    'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure', 'Docker', 'Kubernetes',
    'Git', 'Linux', 'HTML', 'CSS', 'TypeScript', 'PHP', 'C++', 'C#',
    'Machine Learning', 'AI', 'Data Science', 'Analytics', 'Tableau', 'Power BI',
    'Agile', 'Scrum', 'DevOps', 'CI/CD', 'REST API', 'GraphQL', 'Microservices'
  ];

  // Common soft skills keywords
  const softSkills = [
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Time Management',
    'Project Management', 'Customer Service', 'Analytical', 'Creative', 'Adaptable',
    'Detail-oriented', 'Self-motivated', 'Collaborative', 'Presentation', 'Negotiation'
  ];

  const allSkills = [...technicalSkills, ...softSkills];
  const foundSkills = [];

  // Convert to lowercase for case-insensitive matching
  const description = jobDescription.toLowerCase();
  const title = jobTitle.toLowerCase();

  // Check for skills in job description and title
  allSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (description.includes(skillLower) || title.includes(skillLower)) {
      foundSkills.push(skill);
    }
  });

  // If no skills found, return some generic ones based on common patterns
  if (foundSkills.length === 0) {
    if (description.includes('developer') || description.includes('programming')) {
      foundSkills.push('Programming', 'Problem Solving', 'Communication');
    } else if (description.includes('design') || description.includes('creative')) {
      foundSkills.push('Design', 'Creativity', 'Communication');
    } else if (description.includes('manager') || description.includes('lead')) {
      foundSkills.push('Leadership', 'Project Management', 'Communication');
    } else {
      foundSkills.push('Communication', 'Problem Solving', 'Teamwork');
    }
  }

  return foundSkills.slice(0, 8); // Limit to 8 skills max
}

/**
 * Get job listings with simple skills extraction
 */
export async function getJobListingsWithAnalysis(skill, location = "us") {
  try {
    // Validate inputs
    if (!skill || skill.trim() === "") {
      throw new Error("Skill parameter is required");
    }

    // Fetch job listings - limit to 3 jobs per page
    const jobs = await fetchJobListings(skill.trim(), location, 3);
    
    if (!Array.isArray(jobs)) {
      console.warn("Jobs data is not an array:", jobs);
      return [];
    }
    
    // Add simple skills extraction to each job
    const jobsWithSkills = await Promise.all(jobs.map(async (job, index) => {
      try {
        const requiredSkills = await extractRequiredSkills(
          job.title || `Job ${index + 1}`, 
          job.description || ""
        );
        
        return {
          ...job,
          id: job.id || `job-${index}`,
          requiredSkills
        };
      } catch (jobError) {
        console.error(`Error processing job ${index}:`, jobError);
        return {
          ...job,
          id: job.id || `job-${index}`,
          requiredSkills: ['Communication', 'Problem Solving']
        };
      }
    }));

    return jobsWithSkills;
  } catch (error) {
    console.error("Error getting job listings:", error);
    
    // Return a more specific error message
    if (error.message.includes("API credentials")) {
      throw new Error("Adzuna API credentials not configured. Please check your environment variables.");
    } else if (error.message.includes("API error")) {
      throw new Error("Adzuna API is currently unavailable. Please try again later.");
    } else {
      throw new Error(`Failed to get job listings: ${error.message}`);
    }
  }
}
