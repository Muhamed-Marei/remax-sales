import { DailyActivity, Deal } from '../types';

export function calculateChartData(activities: DailyActivity[], deals: Deal[], isAdmin: boolean = false) {
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

  const trendData = Array.from(dateMap.values());

  let sourceMixData: { name: string; value: number }[] = [];
  let dealPipelineData: { name: string; value: number }[] = [];

  if (isAdmin) {
    const sourceMap = new Map<string, number>();
    activities.forEach(act => {
      if (!act.primarySource) return;
      const count = sourceMap.get(act.primarySource) || 0;
      sourceMap.set(act.primarySource, count + (act.leads || 0));
    });
    sourceMixData = Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }));

    const stateMap = new Map<string, number>();
    deals.forEach(deal => {
      if (deal.dealState === 'won' || deal.dealState === 'lost' || deal.dealState === 'archived') return;
      const count = stateMap.get(deal.dealState) || 0;
      stateMap.set(deal.dealState, count + 1);
    });
    dealPipelineData = Array.from(stateMap.entries()).map(([name, value]) => ({ name, value }));
  }

  return { trendData, sourceMixData, dealPipelineData };
}
