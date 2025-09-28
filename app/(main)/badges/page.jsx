import { getUserRoadmapBadges } from "@/actions/roadmap-completion";
import BadgesView from "./_components/badges-view";

export default async function BadgesPage() {
  const allBadges = await getUserRoadmapBadges();
  
  // Separate badges into epic roadmaps and AI-generated roadmaps
  // AI roadmaps are those saved from the AI generation feature
  const epicRoadmapBadges = allBadges.filter(badge => 
    !badge.roadmapName.toLowerCase().includes('ai') && 
    !badge.roadmapName.toLowerCase().includes('generated')
  );
  
  const aiRoadmapBadges = allBadges.filter(badge => 
    badge.roadmapName.toLowerCase().includes('ai') || 
    badge.roadmapName.toLowerCase().includes('generated') ||
    badge.badgeName.toLowerCase().includes('ai')
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Badges</h1>
        <p className="text-muted-foreground">
          Showcase your achievements and completed roadmaps
        </p>
      </div>
      
      <BadgesView 
        roadmapBadges={epicRoadmapBadges} 
        aiRoadmapBadges={aiRoadmapBadges} 
      />
    </div>
  );
}
