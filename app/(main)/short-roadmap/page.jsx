import { generateShortRoadmap, getRoadmapTemplates } from "@/actions/short-roadmap";
import ShortRoadmapView from "./_components/short-roadmap-view";

export default async function ShortRoadmapPage({ searchParams }) {
  const params = await searchParams;
  const skill = params?.skill;
  const experienceLevel = params?.level || "beginner";
  
  let roadmap = null;
  let templates = [];
  
  try {
    templates = await getRoadmapTemplates();
    
    if (skill) {
      roadmap = await generateShortRoadmap(skill, experienceLevel);
    }
  } catch (error) {
    console.error("Error loading roadmap data:", error);
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI-Generated Learning Roadmaps</h1>
        <p className="text-muted-foreground">
          Get personalized, concise learning paths (30-40 steps) for any skill
        </p>
      </div>
      
      <ShortRoadmapView 
        roadmap={roadmap}
        templates={templates}
        initialSkill={skill}
        initialLevel={experienceLevel}
      />
    </div>
  );
}
