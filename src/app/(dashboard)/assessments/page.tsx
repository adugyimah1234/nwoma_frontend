'use client';

import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from '@/components/layout/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import Link from 'next/link';

export default function AssessmentsPage() {
  const stats = [
    {
      title: 'Total Candidates',
      value: '2,856',
      icon: Users,
      trend: { value: 12.5, label: 'registered for assessments' },
    },
    {
      title: 'Pass Rate',
      value: '78.3%',
      icon: CheckCircle2,
      trend: { value: 5.2, label: 'average success rate' },
    },
    {
      title: 'Upcoming Assessments',
      value: 12,
      icon: Calendar,
      description: '3 this week',
    },
    {
      title: 'Results Pending',
      value: 234,
      icon: Clock,
      description: 'Awaiting processing',
    },
  ];

  const upcomingAssessments = [
    {
      id: 'AS001',
      title: 'Mathematics Advanced',
      date: '2024-05-20',
      time: '09:00 AM',
      candidates: 120,
      venue: 'Hall A',
      capacity: 150,
    },
    {
      id: 'AS002',
      title: 'English Language',
      date: '2024-05-22',
      time: '10:00 AM',
      candidates: 98,
      venue: 'Hall B',
      capacity: 130,
    },
    {
      id: 'AS003',
      title: 'Basic Science',
      date: '2024-05-24',
      time: '09:00 AM',
      candidates: 75,
      venue: 'Hall C',
      capacity: 100,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
        <PageHeader
          title="Assessment Portal"
          description="Manage and monitor entrance assessment activities"
          breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Assessments' }]}
          tabs={[
            { title: 'Overview', href: '/assessments' },
            { title: 'Results & Placement', href: '/assessments/results' },
            { title: 'Admitted Students', href: '/assessments/shortlisted' },
          ]}
        >
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </PageHeader>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              description={stat.description}
            />
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Assessments</TabsTrigger>
            <TabsTrigger value="recent">Recent Results</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold leading-tight">{assessment.title}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {new Date(assessment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {assessment.time}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">{assessment.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Candidates</span>
                      <span className="font-medium">{assessment.candidates} / {assessment.capacity}</span>
                    </div>
                    <Progress value={(assessment.candidates / assessment.capacity) * 100} className="h-1.5" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Venue</span>
                      <span className="font-medium">{assessment.venue}</span>
                    </div>
                    <div className="pt-1">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/assessments/results">View Results</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No recent results</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Results will appear here after assessments are graded</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/assessments/results">View Placement Results</Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}

