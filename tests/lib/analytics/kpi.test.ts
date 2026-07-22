import { describe, it, expect } from 'vitest';
import { calculateKPIs } from '../../../src/lib/analytics/kpi';
import { DailyActivity, Deal } from '../../../src/lib/types';

describe('KPI Calculation Library', () => {
  it('should handle empty arrays without throwing errors', () => {
    const result = calculateKPIs([], []);
    expect(result.totalLeads).toBe(0);
    expect(result.leadToResponseRate).toBe(0);
    expect(result.overallConversionRate).toBe(0);
    expect(result.totalDeals).toBe(0);
    expect(result.winRate).toBe(0);
  });

  it('should correctly sum activity metrics', () => {
    const activities = [
      { leads: 10, responses: 5, meetings: 2 } as DailyActivity,
      { leads: 20, responses: 10, meetings: 4 } as DailyActivity,
    ];
    
    const result = calculateKPIs(activities, []);
    
    expect(result.totalLeads).toBe(30);
    expect(result.totalResponses).toBe(15);
    expect(result.totalMeetings).toBe(6);
    expect(result.leadToResponseRate).toBe(15 / 30);
    expect(result.responseToMeetingRate).toBe(6 / 15);
  });

  it('should prevent divide-by-zero errors in funnel rates', () => {
    const activities = [
      { leads: 0, responses: 0, meetings: 0 } as DailyActivity,
    ];
    
    const result = calculateKPIs(activities, []);
    
    expect(result.leadToResponseRate).toBe(0);
    expect(result.responseToMeetingRate).toBe(0);
    expect(result.meetingToDealRate).toBe(0);
  });

  it('should calculate deal metrics correctly', () => {
    const deals = [
      { dealState: 'won' } as Deal,
      { dealState: 'won' } as Deal,
      { dealState: 'lost' } as Deal,
      { dealState: 'negotiating' } as Deal,
      { dealState: 'archived' } as Deal,
    ];
    
    const result = calculateKPIs([], deals);
    
    expect(result.totalDeals).toBe(5);
    expect(result.wonDeals).toBe(2);
    expect(result.lostDeals).toBe(1);
    expect(result.openDeals).toBe(1); // negotiating
    expect(result.winRate).toBe(2 / 3); // 2 won out of 3 closed
  });
});
