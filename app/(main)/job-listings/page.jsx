import JobListingsView from "./_components/job-listings-view";

export default async function JobListingsPage({ searchParams }) {
  const params = await searchParams;
  const skill = params?.skill || "software developer";
  const location = params?.location || "us";

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Listings & Skills Analysis</h1>
        <p className="text-muted-foreground">
          Find jobs for your skills and get personalized skills checklists
        </p>
      </div>
      
      <JobListingsView 
        initialSkill={skill}
        initialLocation={location}
      />
    </div>
  );
}
