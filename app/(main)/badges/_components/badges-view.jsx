"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Calendar, 
  Clock, 
  Target,
  Trophy,
  Star,
  CheckCircle2,
  Sparkles,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";

export default function BadgesView({ roadmapBadges, aiRoadmapBadges }) {
  // Ensure total badges calculation is always correct
  const totalBadges = (roadmapBadges?.length || 0) + (aiRoadmapBadges?.length || 0);

  if (totalBadges === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Badges Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete learning roadmaps to earn badges!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>Complete all steps in a roadmap to earn a completion badge</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Total Badges</p>
                <p className="text-2xl font-bold">{totalBadges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Epic Roadmaps</p>
                <p className="text-2xl font-bold">{roadmapBadges?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">AI Roadmaps</p>
                <p className="text-2xl font-bold">{aiRoadmapBadges?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Epic Roadmap Badges */}
      {displayRoadmapBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Epic Roadmap Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayRoadmapBadges.map((badge) => (
              <Card key={badge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {badge.badgeUrl ? (
                        <img 
                          src={badge.badgeUrl} 
                          alt={badge.badgeName}
                          className="h-12 w-12 rounded-lg"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Award className="h-6 w-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{badge.badgeName}</CardTitle>
                        <CardDescription>{badge.roadmapName}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Completed on {format(new Date(badge.completedAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>Roadmap Completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Roadmap Badges */}
      {displayAIRoadmapBadges.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            AI-Generated Roadmap Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayAIRoadmapBadges.map((badge) => (
              <Card key={badge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {badge.badgeUrl ? (
                        <img 
                          src={badge.badgeUrl} 
                          alt={badge.badgeName}
                          className="h-12 w-12 rounded-lg"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{badge.badgeName}</CardTitle>
                        <CardDescription>{badge.roadmapName}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                    {badge.id === 'test-completed-ai-course' && (
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                        🧪 Test Badge
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Completed on {format(new Date(badge.completedAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>AI Roadmap Completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}