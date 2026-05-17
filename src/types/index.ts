// ─── CareLine Types ─────────────────────────────────────────────────────────

export type OperationType = 'SALE' | 'CLIENT_PAYMENT' | 'CASH_EXPENSE';
export type PaymentMethod = 'CASH' | 'CARD_TRANSFER';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export interface TelegramUser {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  role: UserRole;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  comment?: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  dimensions?: string;
  defaultPrice: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ExpenseType {
  id: string;
  name: string;
  isActive: boolean;
}

export interface PaymentCard {
  id: string;
  cardNumber: string;
  holderName: string;
  isActive: boolean;
}

export interface CashHolder {
  id: string;
  name: string;
  isActive: boolean;
}

export interface OperationItem {
  id?: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Operation {
  id: string;
  type: OperationType;
  totalAmount: number;
  clientId?: string;
  client?: Client;
  employeeId?: string;
  employee?: Employee;
  expenseTypeId?: string;
  expenseType?: ExpenseType;
  paymentMethod?: PaymentMethod;
  paymentCardId?: string;
  paymentCard?: PaymentCard;
  cashHolderId?: string;
  cashHolder?: CashHolder;
  cardRecipient?: string;
  comment?: string;
  receiptUrl?: string;
  items?: OperationItem[];
  createdBy?: TelegramUser;
  createdAt: string;
}

// ─── Form Types ─────────────────────────────────────────────────────────────

export interface SaleFormData {
  items: { productId: string; quantity: number; price: number }[];
  clientId: string;
  comment?: string;
}

export interface PaymentFormData {
  clientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  cashHolderId?: string;
  paymentCardId?: string;
  cardRecipient?: string;
  comment?: string;
}

export interface ExpenseFormData {
  amount: number;
  employeeId: string;
  expenseTypeId: string;
  comment?: string;
}

export interface FilterParams {
  dateFrom?: string;
  dateTo?: string;
  type?: OperationType;
  clientId?: string;
  employeeId?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}
