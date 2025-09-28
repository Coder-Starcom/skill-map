import { getIndustryInsights } from "@/actions/industry-insights";
import IndustryInsightsView from "./_components/industry-insights-view";

export default async function IndustryInsightsPage() {
  const insights = await getIndustryInsights();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Industry Insights</h1>
        <p className="text-muted-foreground">
          Get AI-powered insights about your industry, including trends, skills, and opportunities.
        </p>
      </div>
      
      <IndustryInsightsView initialInsights={insights} />
    </div>
  );
}
