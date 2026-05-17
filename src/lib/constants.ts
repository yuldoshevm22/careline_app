// ─── App Constants ──────────────────────────────────────────────────────────

export const APP_NAME = 'CareLine';
export const APP_DESCRIPTION = 'Premium business operations management';

// Default products that come pre-loaded
export const DEFAULT_PRODUCTS = [
  { name: 'Детский', dimensions: '22x25', defaultPrice: 0, sortOrder: 1 },
  { name: 'Для лица', dimensions: '22x25', defaultPrice: 0, sortOrder: 2 },
  { name: 'Тахланган каробка', dimensions: '45x90', defaultPrice: 0, sortOrder: 3 },
  { name: 'Рулон каробка', dimensions: '35x70', defaultPrice: 0, sortOrder: 4 },
  { name: 'Рулон без каробки', dimensions: '35x70', defaultPrice: 0, sortOrder: 5 },
] as const;

// Default expense types
export const DEFAULT_EXPENSE_TYPES = [
  'Зарплата',
  'Транспорт',
  'Аренда',
  'Сырьё',
  'Ремонт',
  'Прочее',
] as const;

// Operation type labels
export const OPERATION_LABELS: Record<string, string> = {
  SALE: 'Продажа',
  CLIENT_PAYMENT: 'Оплата от клиента',
  CASH_EXPENSE: 'Выдача из кассы',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Наличные',
  CARD_TRANSFER: 'Перевод на карту',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Number formatting
export const CURRENCY_LOCALE = 'ru-RU';
export const CURRENCY = 'UZS';
