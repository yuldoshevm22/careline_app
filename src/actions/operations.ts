'use server';

import { prisma } from '@/lib/prisma';
import { createSaleSchema, createPaymentSchema, createExpenseSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

// ─── Create Sale Operation ──────────────────────────────────────────────────

export async function createSale(data: unknown, userId: string) {
  const parsed = createSaleSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Ошибка валидации' };
  }

  const { items, clientId, comment } = parsed.data;

  try {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const operation = await prisma.$transaction(async (tx) => {
      // Create operation
      const op = await tx.operation.create({
        data: {
          type: 'SALE',
          totalAmount,
          clientId,
          comment: comment || null,
          createdById: userId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            })),
          },
        },
        include: { items: true, client: true },
      });

      // Update client balance (increase debt)
      await tx.client.update({
        where: { id: clientId },
        data: { balance: { decrement: totalAmount } },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Operation',
          entityId: op.id,
          newData: JSON.parse(JSON.stringify(op)),
          userId,
        },
      });

      return op;
    });

    revalidatePath('/operations');
    revalidatePath('/clients');
    return { success: true, data: operation };
  } catch (error) {
    console.error('Create sale error:', error);
    return { success: false, error: 'Ошибка при создании продажи' };
  }
}

// ─── Create Client Payment ──────────────────────────────────────────────────

export async function createClientPayment(data: unknown, userId: string) {
  const parsed = createPaymentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Ошибка валидации' };
  }

  const { clientId, amount, paymentMethod, cashHolderId, paymentCardId, cardRecipient, comment } = parsed.data;

  try {
    const operation = await prisma.$transaction(async (tx) => {
      const op = await tx.operation.create({
        data: {
          type: 'CLIENT_PAYMENT',
          totalAmount: amount,
          clientId,
          paymentMethod,
          cashHolderId: cashHolderId || null,
          paymentCardId: paymentCardId || null,
          cardRecipient: cardRecipient || null,
          comment: comment || null,
          createdById: userId,
        },
        include: { client: true },
      });

      // Update client balance (reduce debt)
      await tx.client.update({
        where: { id: clientId },
        data: { balance: { increment: amount } },
      });

      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Operation',
          entityId: op.id,
          newData: JSON.parse(JSON.stringify(op)),
          userId,
        },
      });

      return op;
    });

    revalidatePath('/operations');
    revalidatePath('/clients');
    return { success: true, data: operation };
  } catch (error) {
    console.error('Create payment error:', error);
    return { success: false, error: 'Ошибка при создании оплаты' };
  }
}

// ─── Create Cash Expense ────────────────────────────────────────────────────

export async function createCashExpense(data: unknown, userId: string) {
  const parsed = createExpenseSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Ошибка валидации' };
  }

  const { amount, employeeId, expenseTypeId, comment } = parsed.data;

  try {
    const operation = await prisma.$transaction(async (tx) => {
      const op = await tx.operation.create({
        data: {
          type: 'CASH_EXPENSE',
          totalAmount: amount,
          employeeId,
          expenseTypeId,
          comment: comment || null,
          createdById: userId,
        },
        include: { employee: true, expenseType: true },
      });

      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entity: 'Operation',
          entityId: op.id,
          newData: JSON.parse(JSON.stringify(op)),
          userId,
        },
      });

      return op;
    });

    revalidatePath('/operations');
    return { success: true, data: operation };
  } catch (error) {
    console.error('Create expense error:', error);
    return { success: false, error: 'Ошибка при создании расхода' };
  }
}

// ─── Get Operations ─────────────────────────────────────────────────────────

export async function getOperations(params: {
  type?: string;
  clientId?: string;
  employeeId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const { type, clientId, employeeId, dateFrom, dateTo, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (clientId) where.clientId = clientId;
  if (employeeId) where.employeeId = employeeId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(`${dateFrom}T00:00:00+05:00`);
    if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(`${dateTo}T23:59:59+05:00`);
  }

  const [operations, total] = await Promise.all([
    prisma.operation.findMany({
      where,
      include: {
        client: true,
        employee: true,
        expenseType: true,
        items: { include: { product: true } },
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.operation.count({ where }),
  ]);

  return {
    operations: JSON.parse(JSON.stringify(operations)),
    total,
    pages: Math.ceil(total / limit),
  };
}
