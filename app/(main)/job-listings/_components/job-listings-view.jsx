"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Star, 
  AlertCircle,
  Clock,
  Target,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { getJobListingsWithAnalysis } from "@/actions/job-listings";

export default function JobListingsView({ initialSkill, initialLocation }) {
  const [skill, setSkill] = useState(initialSkill);
  const [location, setLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getJobListingsWithAnalysis(skill, location);
      setJobs(result || []);
    } catch (err) {
      console.error("Job search error:", err);
      setError(err.message || "Failed to fetch job listings. Please check your API configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Jobs</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleSearch}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter skill (e.g., React Developer)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Location (e.g., us, uk, ca)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Jobs
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Fetching Job Listings...
                </h3>
                <p className="text-sm text-blue-600">
                  Searching for jobs and extracting required skills
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {jobs.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Search for Jobs</h3>
            <p className="text-muted-foreground">
              Enter a skill and location above to find relevant job listings with AI-powered skills analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Info about job limit */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Showing 3 jobs with required skills extraction
                </p>
                <p className="text-xs text-blue-600">
                  Skills are automatically extracted from job descriptions. 
                  Click "Search Jobs" to find different positions.
                </p>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Total Jobs Found</p>
                      <p className="text-2xl font-bold">{jobs.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Cards */}
            {jobs.map((job, index) => (
              <Card key={job.id || index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.company?.display_name || 'Company'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location?.display_name || 'Location'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.created ? format(new Date(job.created), 'MMM d, yyyy') : 'Recent'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.salary_min && job.salary_max && (
                        <Badge variant="secondary" className="text-sm">
                          ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </Badge>
                      )}
                      <Button asChild variant="outline" size="sm">
                        <a href={job.redirect_url} target="_blank" rel="noopener noreferrer">
                          Apply
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Job Description */}
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {job.description?.substring(0, 300)}...
                      </p>
                    </div>

                    {/* Required Skills */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Required Skills</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}