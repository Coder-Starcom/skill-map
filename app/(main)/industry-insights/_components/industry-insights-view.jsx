"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Sparkles, 
  Download, 
  BarChart3, 
  PieChart,
  Target,
  Users,
  Calendar,
  AlertCircle,
  ChevronDown,
  Award
} from "lucide-react";
import { generateIndustryInsights, saveIndustryInsight } from "@/actions/industry-insights";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const PREDEFINED_INDUSTRIES = [
  "Software Development",
  "Data Science & Analytics", 
  "Digital Marketing",
  "Cybersecurity",
  "Cloud Computing",
  "Artificial Intelligence & Machine Learning",
  "Web Development",
  "Mobile App Development",
  "DevOps & Infrastructure",
  "UI/UX Design",
  "Product Management",
  "Project Management",
  "Sales & Business Development",
  "Human Resources",
  "Finance & Banking",
  "Healthcare Technology",
  "E-commerce",
  "Content Creation & Media",
  "Consulting",
  "Education Technology",
  "Blockchain & Cryptocurrency",
  "Game Development",
  "Robotics & Automation",
  "Biotechnology",
  "Renewable Energy",
  "Real Estate Technology",
  "Supply Chain & Logistics",
  "Customer Success",
  "Quality Assurance",
  "Technical Writing"
];

export default function IndustryInsightsView({ initialInsights }) {
  const [insights, setInsights] = useState(initialInsights);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [savedInsights, setSavedInsights] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const handleGenerateInsights = async (industry) => {
    setIsGenerating(true);
    setError(null);
    setInsights(null); // Clear previous insights
    
    try {
      const newInsights = await generateIndustryInsights(industry);
      setInsights(newInsights);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveInsight = async () => {
    if (!insights) return;
    
    try {
      const insightToSave = {
        ...insights,
        industry: selectedIndustry || insights.industry || 'General'
      };
      await saveIndustryInsight(insightToSave);
      setSavedInsights(prev => [...prev, insightToSave]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadReport = (insight) => {
    const dataStr = JSON.stringify(insight, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `industry-insight-${insight.industry || 'report'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderChart = (data, type) => {
    if (!data || !Array.isArray(data)) return null;

    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Generate Industry Insights
          </CardTitle>
          <CardDescription>
            Get AI-powered analysis of industry trends, skills demand, and career opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an industry to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => {
                  if (selectedIndustry) {
                    handleGenerateInsights(selectedIndustry);
                  }
                }}
                disabled={isGenerating || !selectedIndustry}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {selectedIndustry || insights.industry || 'Industry'} Insights
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleSaveInsight} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Save Insight
                </Button>
                <Button onClick={() => handleDownloadReport(insights)} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Industry Overview */}
            {insights.overview && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Industry Overview
                </h3>
                <p className="text-muted-foreground">{insights.overview}</p>
              </div>
            )}

            {/* Market Growth Chart */}
            {insights.marketGrowth && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Growth & Trends
                </h3>
                {renderChart(insights.marketGrowth, 'bar')}
              </div>
            )}

            {/* Skills Demand Chart */}
            {insights.skillsDemand && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Skills Demand Distribution
                </h3>
                {renderChart(insights.skillsDemand, 'pie')}
              </div>
            )}

            {/* Salary Ranges Chart */}
            {insights.salaryRanges && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Salary Ranges by Role
                </h3>
                {renderChart(insights.salaryRanges, 'bar')}
              </div>
            )}

            {/* Market Trends Chart */}
            {insights.marketTrends && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Trends Analysis
                </h3>
                {renderChart(insights.marketTrends, 'bar')}
              </div>
            )}

            {/* Key Domains */}
            {insights.keyDomains && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Key Domains & Specializations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights.keyDomains.map((domain, index) => (
                    <Card key={index} className="p-4">
                      <h4 className="font-semibold mb-2">{domain.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{domain.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {domain.demandLevel} Demand
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {domain.growthRate}% Growth
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Career Opportunities */}
            {insights.careerOpportunities && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Career Opportunities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.careerOpportunities.map((opportunity, index) => (
                    <Card key={index} className="p-4">
                      <h4 className="font-semibold mb-2">{opportunity.title}</h4>
                      <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                      {opportunity.skills && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {opportunity.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Top Companies */}
            {insights.topCompanies && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Top Companies in {selectedIndustry || insights.industry}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {insights.topCompanies.map((company, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {company}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Skills in Demand */}
            {insights.skillsInDemand && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Skills in High Demand
                </h3>
                <div className="flex flex-wrap gap-2">
                  {insights.skillsInDemand.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges & Opportunities */}
            {(insights.challenges || insights.opportunities) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.challenges && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Industry Challenges
                    </h3>
                    <ul className="space-y-2">
                      {insights.challenges.map((challenge, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insights.opportunities && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Growth Opportunities
                    </h3>
                    <ul className="space-y-2">
                      {insights.opportunities.map((opportunity, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-muted-foreground">{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Certifications */}
            {insights.certifications && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Recommended Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Future Outlook */}
            {insights.futureOutlook && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Future Outlook (Next 5 Years)
                </h3>
                <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-800 rounded-lg shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2">5-Year Industry Forecast</h4>
                      <p className="text-blue-100 leading-relaxed">{insights.futureOutlook}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Statistics */}
            {insights.marketStats && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Market Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(insights.marketStats).map(([key, value]) => (
                    <Card key={key} className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{value}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Saved Insights */}
      {savedInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Saved Insights
            </CardTitle>
            <CardDescription>
              Your previously generated industry insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedInsights.map((insight, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{insight.industry || 'Industry Report'}</h4>
                    <Button 
                      onClick={() => handleDownloadReport(insight)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generated insights with trends and opportunities
                  </p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
