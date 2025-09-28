import { getRoadmapContent, getAvailableRoadmaps, getRoadmaps } from "@/actions/roadmap";
import { notFound } from "next/navigation";
import RoadmapDetail from "../_components/roadmap-detail";

export async function generateStaticParams() {
  const epicRoadmaps = await getAvailableRoadmaps();
  const savedRoadmaps = await getRoadmaps();
  
  const allRoadmaps = [
    ...epicRoadmaps.map((roadmap) => ({ id: roadmap.id })),
    ...savedRoadmaps.map((roadmap) => ({ id: roadmap.id }))
  ];
  
  return allRoadmaps;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const roadmap = await getRoadmapContent(id);
  
  return {
    title: `${roadmap.name} Learning Roadmap`,
    description: `Comprehensive learning roadmap for ${roadmap.name}`,
  };
}

export default async function RoadmapDetailPage({ params }) {
  try {
    const { id } = await params;
    const roadmap = await getRoadmapContent(id);
    
    return (
      <div className="container mx-auto py-8">
        <RoadmapDetail roadmap={roadmap} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
