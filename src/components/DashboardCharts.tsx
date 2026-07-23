'use client';

import { DailyActivity, Deal } from '@/lib/types';
import { useMemo } from 'react';
import styles from './DashboardCharts.module.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface DashboardChartsProps {
  activities: DailyActivity[];
  deals: Deal[];
  isAdmin?: boolean;
}

// Map to modern, elegant theme colors
const COLORS = [
  'hsl(215, 85%, 45%)', // Primary
  'hsl(260, 70%, 55%)', // Accent
  'hsl(198, 85%, 48%)', // Info
  'hsl(145, 65%, 42%)', // Success
  'hsl(38, 92%, 50%)',  // Warning
];

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color, margin: 0, fontSize: '0.9rem' }}>
            {entry.name}: <span style={{ fontWeight: 600 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
    <div className={styles.chartsGrid}>
      
      {trendData.length > 0 && (
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Activity Trend</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                <Line type="monotone" dataKey="leads" stroke="hsl(215, 85%, 45%)" name="Leads" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="meetings" stroke="hsl(145, 65%, 42%)" name="Meetings" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {isAdmin && sourceMixData.length > 0 && (
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Leads by Source</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={6}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sourceMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {isAdmin && dealPipelineData.length > 0 && (
        <div className={styles.chartCard}>
          <h2 className={styles.chartTitle}>Active Pipeline</h2>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealPipelineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-hover)', opacity: 0.5 }} />
                <Bar dataKey="value" fill="hsl(38, 92%, 50%)" name="Deals" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
