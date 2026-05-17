import { z } from 'zod';

// ─── Client ─────────────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(1, 'Имя обязательно').max(200),
  phone: z.string().max(20).optional().or(z.literal('')),
  comment: z.string().max(500).optional().or(z.literal('')),
});

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string().cuid(),
});

// ─── Employee ───────────────────────────────────────────────────────────────

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1, 'ФИО обязательно').max(200),
  phone: z.string().max(20).optional().or(z.literal('')),
});

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string().cuid(),
});

// ─── Product ────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(200),
  dimensions: z.string().max(50).optional().or(z.literal('')),
  defaultPrice: z.number().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid(),
});

// ─── Expense Type ───────────────────────────────────────────────────────────

export const createExpenseTypeSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(200),
});

// ─── Operation Items ────────────────────────────────────────────────────────

const operationItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1, 'Минимум 1'),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
});

// ─── Sale Operation ─────────────────────────────────────────────────────────

export const createSaleSchema = z.object({
  items: z.array(operationItemSchema).min(1, 'Добавьте хотя бы один товар'),
  clientId: z.string().cuid('Выберите клиента'),
  comment: z.string().max(500).optional().or(z.literal('')),
});

// ─── Client Payment Operation ───────────────────────────────────────────────

export const createPaymentSchema = z.object({
  clientId: z.string().cuid('Выберите клиента'),
  amount: z.number().positive('Сумма должна быть больше 0'),
  paymentMethod: z.enum(['CASH', 'CARD_TRANSFER']),
  cashHolderId: z.string().optional().or(z.literal('')),
  paymentCardId: z.string().optional().or(z.literal('')),
  cardRecipient: z.string().max(200).optional().or(z.literal('')),
  comment: z.string().max(500).optional().or(z.literal('')),
});

// ─── Cash Expense Operation ─────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  amount: z.number().positive('Сумма должна быть больше 0'),
  employeeId: z.string().cuid('Выберите сотрудника'),
  expenseTypeId: z.string().cuid('Выберите тип расхода'),
  comment: z.string().max(500).optional().or(z.literal('')),
});

// ─── Filters ────────────────────────────────────────────────────────────────

export const filterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  type: z.enum(['SALE', 'CLIENT_PAYMENT', 'CASH_EXPENSE']).optional(),
  clientId: z.string().optional(),
  employeeId: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ─── Type exports ───────────────────────────────────────────────────────────

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateExpenseTypeInput = z.infer<typeof createExpenseTypeSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
