"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  BookOpen, 
  Clock, 
  Target,
  Sparkles,
  Circle,
  ExternalLink,
  ArrowRight,
  Zap
} from "lucide-react";
import { generateShortRoadmap, saveAIRoadmap } from "@/actions/short-roadmap";

export default function ShortRoadmapView({ roadmap, templates, initialSkill, initialLevel }) {
  const [skill, setSkill] = useState(initialSkill || "");
  const [experienceLevel, setExperienceLevel] = useState(initialLevel || "beginner");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(roadmap);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const handleGenerateRoadmap = async () => {
    if (!skill.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateShortRoadmap(skill, experienceLevel);
      setGeneratedRoadmap(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!generatedRoadmap) return;
    
    setIsSaving(true);
    setSavedMessage("");
    try {
      await saveAIRoadmap(generatedRoadmap);
      setSavedMessage("✅ Roadmap saved to 'My Roadmaps' section! You can now complete it there with quizzes to earn badges.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'theory': return BookOpen;
      case 'practice': return Target;
      case 'project': return Zap;
      default: return Circle;
    }
  };

  const getStepColor = (type) => {
    switch (type) {
      case 'theory': return 'text-blue-600';
      case 'practice': return 'text-green-600';
      case 'project': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate AI Roadmap
          </CardTitle>
          <CardDescription>
            Create a personalized learning path with 30-40 focused steps for ANY skill you want to learn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Enter any skill (e.g., React, Python, Machine Learning, Digital Marketing, Photography, Cooking, etc.)"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && skill.trim()) {
                    handleGenerateRoadmap();
                  }
                }}
              />
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Button 
                onClick={handleGenerateRoadmap} 
                disabled={isGenerating || !skill.trim()}
                className="px-6"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Roadmap
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Roadmaps */}
      {!generatedRoadmap && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Popular Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="secondary">{template.difficulty}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {template.estimatedDuration}
                  </div>
                  <Button 
                    className="w-full mt-3"
                    onClick={() => {
                      setSkill(template.name);
                      setExperienceLevel(template.difficulty);
                    }}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Generated Roadmap */}
      {generatedRoadmap && (
        <div className="space-y-6">
          {/* Roadmap Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{generatedRoadmap.name}</CardTitle>
                  <CardDescription className="mt-2">{generatedRoadmap.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{generatedRoadmap.difficulty}</Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {generatedRoadmap.estimatedDuration}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Roadmap Steps */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Learning Steps ({generatedRoadmap.steps.length} steps)</h3>
            
            <div className="grid gap-4">
              {generatedRoadmap.steps.map((step, index) => {
                const StepIcon = getStepIcon(step.type);
                return (
                  <Card key={step.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <StepIcon className={`h-5 w-5 ${getStepColor(step.type)}`} />
                            <h4 className="text-lg font-semibold">{step.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {step.type}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {step.duration}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-4">{step.description}</p>
                          
                          {/* Resources */}
                          {step.resources && step.resources.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Resources:</h5>
                              <div className="space-y-2">
                                {step.resources.map((resource, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <ExternalLink className="h-4 w-4 text-blue-600" />
                                    <a 
                                      href={resource.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      {resource.title}
                                    </a>
                                    <Badge variant="outline" className="text-xs">
                                      {resource.type}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {savedMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">{savedMessage}</p>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button onClick={() => setGeneratedRoadmap(null)} variant="outline">
                Generate New Roadmap
              </Button>
              <Button onClick={handleSaveRoadmap} disabled={isSaving} variant="secondary">
                {isSaving ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Save to My Roadmaps
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
