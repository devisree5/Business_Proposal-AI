import React from 'react';
import HeroBanner from './HeroBanner';
import MetricCards from './MetricCards';
import RecentEmailsList from './RecentEmailsList';
import TemplateShowcase from './TemplateShowcase';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';

export default function DashboardView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Banner */}
      <HeroBanner />

      {/* 4 Metric Cards */}
      <MetricCards />

      {/* Main Grid: Left (Emails + Templates) | Right (Actions + Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          <RecentEmailsList />
          <TemplateShowcase />
        </div>

        {/* Right 1 Column */}
        <div className="space-y-6">
          <QuickActions />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
