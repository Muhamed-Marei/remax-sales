export type Language = 'ar' | 'en';

export const dictionaries = {
  ar: {
    app: {
      title: 'نظام تتبع المبيعات',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      dashboard: 'لوحة القيادة',
      deals: 'الصفقات',
      activity: 'النشاط اليومي',
      users: 'المستخدمين',
    },
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      edit: 'تعديل',
      delete: 'حذف',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
    }
  },
  en: {
    app: {
      title: 'SaleTrack',
      login: 'Login',
      logout: 'Logout',
      dashboard: 'Dashboard',
      deals: 'Deals',
      activity: 'Daily Activity',
      users: 'Users',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      loading: 'Loading...',
      error: 'An error occurred',
    }
  }
};

export type Dictionary = typeof dictionaries.ar;
