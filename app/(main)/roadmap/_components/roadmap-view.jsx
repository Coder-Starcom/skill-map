"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Clock, ExternalLink, Filter, Sparkles, Star } from "lucide-react";
import Link from "next/link";

export default function RoadmapView({ epicRoadmaps, savedRoadmaps }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Combine epic roadmaps and saved roadmaps, prioritizing saved ones
  const allRoadmaps = useMemo(() => {
    const epic = epicRoadmaps.map(roadmap => ({
      ...roadmap,
      type: 'epic',
      id: roadmap.id,
      name: roadmap.name,
      description: roadmap.description
    }));
    
    const saved = savedRoadmaps.map(roadmap => ({
      ...roadmap,
      type: 'saved',
      id: roadmap.id,
      name: roadmap.title,
      description: roadmap.content?.description || 'AI-generated learning path'
    }));
    
    // Put saved roadmaps first, then epic roadmaps
    return [...saved, ...epic];
  }, [epicRoadmaps, savedRoadmaps]);

  // Group roadmaps by category (first word) and create categories, prioritizing "MY"
  const categories = useMemo(() => {
    const cats = [...new Set(allRoadmaps.map(r => r.name.split(' ')[0]))];
    // Sort categories with "MY" first, then alphabetically
    const sortedCats = cats.sort((a, b) => {
      if (a.toLowerCase() === 'my') return -1;
      if (b.toLowerCase() === 'my') return 1;
      return a.localeCompare(b);
    });
    return ["all", ...sortedCats];
  }, [allRoadmaps]);

  // Filter roadmaps based on search term and category
  const filteredRoadmaps = useMemo(() => {
    if (!allRoadmaps) return [];
    
    return allRoadmaps.filter(roadmap => {
      const matchesSearch = searchTerm === '' || 
        roadmap.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roadmap.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || roadmap.name.startsWith(selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [allRoadmaps, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search roadmaps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={category.toLowerCase() === 'my' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50' : ''}
            >
              {category.toLowerCase() === 'my' && <Star className="h-3 w-3 mr-1 fill-current" />}
              {category === "all" ? "All" : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Roadmaps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoadmaps.map((roadmap) => (
          <Card key={roadmap.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{roadmap.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className={roadmap.type === 'saved' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}>
                    {roadmap.type === 'saved' && <Star className="h-3 w-3 mr-1 fill-current" />}
                    {roadmap.type === 'saved' ? 'my' : roadmap.name.split(' ')[0]}
                  </Badge>
                  {roadmap.type === 'saved' && (
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>
                {roadmap.type === 'saved' 
                  ? roadmap.description 
                  : `Comprehensive learning path for ${roadmap.name.toLowerCase()}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Structured learning path
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  Self-paced learning
                </div>

                <Link href={`/roadmap/${roadmap.id}`}>
                  <Button className="w-full" variant="outline">
                    View Roadmap
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoadmaps.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No roadmaps found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or browse all categories.
          </p>
        </div>
      )}
    </div>
  );
}
