export type EventName = 'dashboard_viewed' | 'report_exported' | 'filter_applied';

export function logProductEvent(eventName: EventName, properties?: Record<string, string | number | boolean>) {
  // Ensure no PII is included in the logged properties
  // In a real implementation, this would send data to Google Analytics or Firebase Analytics
  if (typeof window !== 'undefined') {
    console.log(`[Analytics Event] ${eventName}`, properties || {});
    // e.g. window.gtag('event', eventName, properties);
  }
}
