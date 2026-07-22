import { DailyActivity, Deal } from '../types';

export interface KPISummary {
  totalLeads: number;
  totalFollowUps: number;
  totalResponses: number;
  totalCalls: number;
  totalMeetings: number;
  totalSiteVisits: number;
  totalViewings: number;
  
  // Funnel Conversions
  leadToResponseRate: number; // responses / leads
  responseToMeetingRate: number; // meetings / responses
  meetingToDealRate: number; // deals / meetings
  overallConversionRate: number; // deals / leads
  
  // Deal metrics
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  openDeals: number;
  winRate: number; // wonDeals / (wonDeals + lostDeals)
  
  // Custom metrics
  totalPortfolioAdded: number;
}

export function calculateKPIs(activities: DailyActivity[], deals: Deal[]): KPISummary {
  let totalLeads = 0;
  let totalFollowUps = 0;
  let totalResponses = 0;
  let totalCalls = 0;
  let totalMeetings = 0;
  let totalSiteVisits = 0;
  let totalViewings = 0;
  let totalPortfolioAdded = 0;

  for (const activity of activities) {
    totalLeads += activity.leads || 0;
    totalFollowUps += activity.followUps || 0;
    totalResponses += activity.responses || 0;
    totalCalls += activity.calls || 0;
    totalMeetings += activity.meetings || 0;
    totalSiteVisits += activity.siteVisits || 0;
    totalViewings += activity.viewings || 0;
    totalPortfolioAdded += activity.portfolioCount || 0;
  }

  const totalDeals = deals.length;
  let wonDeals = 0;
  let lostDeals = 0;
  let openDeals = 0;

  for (const deal of deals) {
    if (deal.dealState === 'won') {
      wonDeals++;
    } else if (deal.dealState === 'lost') {
      lostDeals++;
    } else if (deal.dealState !== 'archived') {
      openDeals++;
    }
  }

  const safeDivide = (numerator: number, denominator: number): number => {
    if (denominator === 0) return 0;
    return numerator / denominator;
  };

  const closedDeals = wonDeals + lostDeals;

  return {
    totalLeads,
    totalFollowUps,
    totalResponses,
    totalCalls,
    totalMeetings,
    totalSiteVisits,
    totalViewings,

    leadToResponseRate: safeDivide(totalResponses, totalLeads),
    responseToMeetingRate: safeDivide(totalMeetings, totalResponses),
    meetingToDealRate: safeDivide(totalDeals, totalMeetings),
    overallConversionRate: safeDivide(totalDeals, totalLeads),

    totalDeals,
    wonDeals,
    lostDeals,
    openDeals,
    winRate: safeDivide(wonDeals, closedDeals),

    totalPortfolioAdded,
  };
}
