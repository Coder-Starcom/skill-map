import { getAvailableRoadmaps, getRoadmaps } from "@/actions/roadmap";
import RoadmapView from "./_components/roadmap-view";

export default async function RoadmapPage() {
  const epicRoadmaps = await getAvailableRoadmaps();
  const savedRoadmaps = await getRoadmaps();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Roadmaps</h1>
        <p className="text-muted-foreground">
          Choose from our curated collection of learning roadmaps and your saved AI-generated roadmaps.
        </p>
      </div>
      
      <RoadmapView 
        epicRoadmaps={epicRoadmaps} 
        savedRoadmaps={savedRoadmaps} 
      />
    </div>
  );
}
