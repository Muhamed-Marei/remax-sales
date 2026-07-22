'use client';

import { DailyActivity, Deal } from '@/lib/types';
import { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface DashboardChartsProps {
  activities: DailyActivity[];
  deals: Deal[];
  isAdmin?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a288e0'];

export function DashboardCharts({ activities, deals, isAdmin }: DashboardChartsProps) {
  const trendData = useMemo(() => {
    // Group activities by date
    const dateMap = new Map<string, { date: string; leads: number; meetings: number }>();
    
    // Sort activities by date ascending for the chart
    const sortedActivities = [...activities].sort((a, b) => a.activityDate.localeCompare(b.activityDate));
    
    sortedActivities.forEach(act => {
      const existing = dateMap.get(act.activityDate) || { date: act.activityDate, leads: 0, meetings: 0 };
      existing.leads += act.leads || 0;
      existing.meetings += act.meetings || 0;
      dateMap.set(act.activityDate, existing);
    });

    return Array.from(dateMap.values());
  }, [activities]);

  const sourceMixData = useMemo(() => {
    if (!isAdmin) return [];
    
    const sourceMap = new Map<string, number>();
    activities.forEach(act => {
      if (!act.primarySource) return;
      const count = sourceMap.get(act.primarySource) || 0;
      sourceMap.set(act.primarySource, count + (act.leads || 0));
    });
    
    return Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }));
  }, [activities, isAdmin]);

  const dealPipelineData = useMemo(() => {
    if (!isAdmin) return [];
    
    const stateMap = new Map<string, number>();
    deals.forEach(deal => {
      if (deal.dealState === 'won' || deal.dealState === 'lost' || deal.dealState === 'archived') return;
      const count = stateMap.get(deal.dealState) || 0;
      stateMap.set(deal.dealState, count + 1);
    });
    
    return Array.from(stateMap.entries()).map(([name, value]) => ({ name, value }));
  }, [deals, isAdmin]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
      
      {trendData.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Activity Trend</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke="#8884d8" name="Leads" strokeWidth={2} />
              <Line type="monotone" dataKey="meetings" stroke="#82ca9d" name="Meetings" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {isAdmin && sourceMixData.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Leads by Source</h2>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceMixData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {sourceMixData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {isAdmin && dealPipelineData.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Active Pipeline</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dealPipelineData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ffc658" name="Deals" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}
