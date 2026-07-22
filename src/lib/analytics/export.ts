import { DailyActivity, Deal } from '../types';

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if there's a comma or quote
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function downloadCsv(filename: string, content: string) {
  // Prepend UTF-8 BOM for Excel to recognize Arabic characters correctly
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportActivitiesToCsv(activities: DailyActivity[]) {
  const headers = [
    'Date', 'Sales ID', 'Source', 'Leads', 'Follow Ups', 'Responses', 
    'Calls', 'Meetings', 'Site Visits', 'Viewings', 'Attendance'
  ];

  const rows = activities.map(act => [
    act.activityDate,
    act.salesId,
    act.primarySource,
    act.leads || 0,
    act.followUps || 0,
    act.responses || 0,
    act.calls || 0,
    act.meetings || 0,
    act.siteVisits || 0,
    act.viewings || 0,
    act.attendance || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(','))
  ].join('\n');

  downloadCsv(`activities_export_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}

export function exportDealsToCsv(deals: Deal[]) {
  const headers = [
    'ID', 'Sales ID', 'Deal Type', 'Deal State', 'Unit Type', 
    'Location', 'Asking Price', 'Cooperative', 'Created At'
  ];

  const rows = deals.map(deal => [
    deal.id,
    deal.assignedSalesId,
    deal.dealType,
    deal.dealState,
    deal.unitType,
    deal.location,
    deal.askingPrice || 0,
    deal.ownerCooperative,
    deal.createdAt instanceof Date ? deal.createdAt.toISOString() : (deal.createdAt || '')
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(','))
  ].join('\n');

  downloadCsv(`deals_export_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
}
