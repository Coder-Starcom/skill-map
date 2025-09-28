"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  Circle,
  Clock,
  Target,
  Award,
  Sparkles,
  FileText,
  Video,
  Code,
  Database,
  Globe,
  Zap,
  Shield,
  Cpu,
  Palette,
  Settings
} from "lucide-react";
import Link from "next/link";
import { generateStepQuiz } from "@/actions/step-quiz";
import { completeRoadmap } from "@/actions/roadmap-completion";
import { saveRoadmapProgress, getRoadmapProgress } from "@/actions/roadmap-progress";
import ReactMarkdown from "react-markdown";

export default function RoadmapDetail({ roadmap }) {
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [currentStep, setCurrentStep] = useState(0);
  const [showStepQuiz, setShowStepQuiz] = useState(false);
  const [stepQuiz, setStepQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  const progress = roadmap.steps.length > 0 ? (completedSteps.size / roadmap.steps.length) * 100 : 0;

  // Debug logging for AI roadmaps
  console.log('Roadmap Debug:', {
    roadmapId: roadmap.id,
    roadmapType: roadmap.type,
    totalSteps: roadmap.steps.length,
    completedSteps: completedSteps.size,
    progress: progress,
    stepIds: roadmap.steps.map(step => step.id),
    completedStepIds: Array.from(completedSteps)
  });

  // Load progress on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await getRoadmapProgress(roadmap.id);
        if (savedProgress) {
          setCurrentStep(savedProgress.currentStep);
          setCompletedSteps(new Set(savedProgress.completedSteps));
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setIsLoadingProgress(false);
      }
    };
    
    loadProgress();
  }, [roadmap.id]);

  // Save progress whenever it changes
  useEffect(() => {
    if (!isLoadingProgress) {
      const saveProgress = async () => {
        try {
          await saveRoadmapProgress(
            roadmap.id,
            roadmap.name,
            currentStep,
            completedSteps
          );
        } catch (error) {
          console.error("Error saving progress:", error);
        }
      };
      
      saveProgress();
    }
  }, [currentStep, completedSteps, roadmap.id, roadmap.name, isLoadingProgress]);

  const toggleStepCompletion = (stepId) => {
    console.log('Toggling step completion:', stepId);
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
      console.log('Removed step from completed:', stepId);
    } else {
      newCompleted.add(stepId);
      console.log('Added step to completed:', stepId);
    }
    console.log('New completed steps:', Array.from(newCompleted));
    setCompletedSteps(newCompleted);
  };

  const goToNextStep = () => {
    if (currentStep < roadmap.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowStepQuiz(false);
      setStepQuiz(null);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  const handleGenerateStepQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const currentStepData = roadmap.steps[currentStep];
      const quiz = await generateStepQuiz(
        currentStepData.title,
        currentStepData.description,
        currentStepData.description
      );
      setStepQuiz(quiz);
      setShowStepQuiz(true);
      setQuizAnswers({});
      setQuizSubmitted(false);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    
    // Calculate score
    const correctAnswers = stepQuiz.questions.filter((question, index) => 
      quizAnswers[index] === question.correct
    ).length;
    const score = (correctAnswers / stepQuiz.questions.length) * 100;
    
    console.log('Quiz submitted:', {
      correctAnswers,
      totalQuestions: stepQuiz.questions.length,
      score,
      currentStepId: roadmap.steps[currentStep].id,
      willMarkComplete: score === 100
    });
    
    // Only mark step as completed if all answers are correct
    if (score === 100) {
      toggleStepCompletion(roadmap.steps[currentStep].id);
      
      // Auto-progress to next step after a short delay
      setTimeout(() => {
        if (currentStep < roadmap.steps.length - 1) {
          goToNextStep();
        }
      }, 2000);
    }
  };

  const checkRoadmapCompletion = async () => {
    if (completedSteps.size === roadmap.steps.length) {
      try {
        await completeRoadmap(roadmap.id, roadmap.name);
        // Show completion message
        alert(`🎉 Congratulations! You've completed the ${roadmap.name} roadmap and earned a badge!`);
      } catch (error) {
        console.error("Error completing roadmap:", error);
      }
    }
  };

  // Check completion whenever completedSteps changes
  useEffect(() => {
    checkRoadmapCompletion();
  }, [completedSteps.size, roadmap.steps.length]);

  // Get appropriate icon for resource type
  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video': return Video;
      case 'course': return BookOpen;
      case 'article': return FileText;
      case 'opensource': return Code;
      case 'documentation': return Database;
      case 'website': return Globe;
      default: return ExternalLink;
    }
  };

  // Get appropriate icon for step content
  const getStepIcon = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('basic') || titleLower.includes('fundamentals')) return BookOpen;
    if (titleLower.includes('api') || titleLower.includes('rest')) return Globe;
    if (titleLower.includes('database') || titleLower.includes('sql')) return Database;
    if (titleLower.includes('security') || titleLower.includes('auth')) return Shield;
    if (titleLower.includes('deploy') || titleLower.includes('production')) return Settings;
    if (titleLower.includes('design') || titleLower.includes('ui')) return Palette;
    if (titleLower.includes('performance') || titleLower.includes('optimization')) return Zap;
    if (titleLower.includes('machine learning') || titleLower.includes('ai')) return Cpu;
    return BookOpen;
  };

  if (isLoadingProgress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/roadmap">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Roadmaps
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{roadmap.name}</h1>
            <p className="text-muted-foreground">
              Sequential learning path with {roadmap.steps.length} topics
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <Target className="h-4 w-4 mr-1" />
            {roadmap.steps.length} Topics
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Progress</CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedSteps.size} of {roadmap.steps.length} completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mb-2" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Estimated completion: {Math.ceil((roadmap.steps.length - completedSteps.size) * 2)} weeks
          </div>
        </CardContent>
      </Card>

      {/* Roadmap Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Path Overview</CardTitle>
          <CardDescription>
            Follow the sequential learning path below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <img 
              src={`/roadmap-images/${roadmap.id}.png`} 
              alt={`${roadmap.name} roadmap`}
              className="max-w-full h-auto rounded-lg shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Topic Detail */}
      {roadmap.steps.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {completedSteps.has(roadmap.steps[currentStep].id) ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
                <CardTitle className="text-xl">
                  {roadmap.steps[currentStep].title}
                </CardTitle>
              </div>
            </div>
            <CardDescription>
              Topic {currentStep + 1} of {roadmap.steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description with Markdown */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{roadmap.steps[currentStep].description}</ReactMarkdown>
            </div>

            {/* Resources */}
            {roadmap.steps[currentStep].links && roadmap.steps[currentStep].links.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning Resources
                </h3>
                <div className="grid gap-3">
                  {roadmap.steps[currentStep].links.map((link, index) => {
                    const ResourceIcon = getResourceIcon(link.type);
                    return (
                      <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ResourceIcon className="h-5 w-5 text-blue-600" />
                              <div>
                                <h4 className="font-medium">{link.title}</h4>
                                <Badge variant="outline" className="mt-1">
                                  {link.type}
                                </Badge>
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                Open
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step Navigation */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {roadmap.steps.length}
                  </span>
                  {completedSteps.has(roadmap.steps[currentStep].id) && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Step Quiz */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Step Assessment
                </h3>
                {!showStepQuiz && (
                  <Button
                    onClick={handleGenerateStepQuiz}
                    disabled={isGeneratingQuiz}
                    variant="outline"
                    size="sm"
                  >
                    {isGeneratingQuiz ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Take Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>

              {showStepQuiz && stepQuiz && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quiz: {roadmap.steps[currentStep].title}</CardTitle>
                    <CardDescription>
                      Answer the question correctly to complete this step and proceed to the next topic
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {stepQuiz.questions.map((question, qIndex) => (
                      <div key={qIndex} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-4">{question.question}</h4>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <label
                              key={oIndex}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                quizSubmitted 
                                  ? oIndex === question.correct
                                    ? 'bg-green-50 border-green-300 text-green-800'
                                    : quizAnswers[qIndex] === oIndex
                                      ? 'bg-red-50 border-red-300 text-red-800'
                                      : 'bg-gray-50 border-gray-200 text-gray-600'
                                  : quizAnswers[qIndex] === oIndex
                                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                value={oIndex}
                                checked={quizAnswers[qIndex] === oIndex}
                                onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                disabled={quizSubmitted}
                                className="w-4 h-4"
                              />
                              <span className="flex-1">{option}</span>
                              {quizSubmitted && oIndex === question.correct && (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              )}
                            </label>
                          ))}
                        </div>
                        {quizSubmitted && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <div className="flex justify-center">
                        <Button
                          onClick={submitQuiz}
                          disabled={Object.keys(quizAnswers).length !== stepQuiz.questions.length}
                          className="px-8"
                        >
                          Submit Quiz
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        {stepQuiz.questions.filter((_, index) => quizAnswers[index] === stepQuiz.questions[index].correct).length === stepQuiz.questions.length ? (
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Perfect! Step Completed!</h4>
                            <p className="text-sm text-green-700">
                              Question answered correctly. Moving to next topic automatically...
                            </p>
                            <div className="mt-3">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-red-50 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-2">Try Again</h4>
                            <p className="text-sm text-red-700">
                              Incorrect answer. Please review the content and try again.
                            </p>
                            <div className="mt-3">
                              <Button
                                onClick={() => {
                                  setShowStepQuiz(false);
                                  setStepQuiz(null);
                                  setQuizAnswers({});
                                  setQuizSubmitted(false);
                                }}
                                variant="outline"
                                className="text-red-700 border-red-300 hover:bg-red-100"
                              >
                                Retake Quiz
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
