'use server';

import { prisma } from '@/lib/prisma';
import { createProductSchema, createExpenseTypeSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

// ─── Products ───────────────────────────────────────────────────────────────

export async function getProducts() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  return JSON.parse(JSON.stringify(products));
}

export async function createProduct(data: unknown) {
  const parsed = createProductSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        dimensions: parsed.data.dimensions || null,
        defaultPrice: parsed.data.defaultPrice || 0,
      },
    });
    revalidatePath('/products');
    return { success: true, data: JSON.parse(JSON.stringify(product)) };
  } catch (error) {
    console.error('Create product error:', error);
    return { success: false, error: 'Ошибка при создании товара' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    revalidatePath('/products');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Ошибка' };
  }
}

// ─── Expense Types ──────────────────────────────────────────────────────────

export async function getExpenseTypes() {
  const types = await prisma.expenseType.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return JSON.parse(JSON.stringify(types));
}

export async function createExpenseType(data: unknown) {
  const parsed = createExpenseTypeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const type = await prisma.expenseType.create({ data: { name: parsed.data.name } });
    revalidatePath('/expense-types');
    return { success: true, data: JSON.parse(JSON.stringify(type)) };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Ошибка при создании типа расхода' };
  }
}

// ─── Cash Holders ───────────────────────────────────────────────────────────

export async function getCashHolders() {
  const holders = await prisma.cashHolder.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return JSON.parse(JSON.stringify(holders));
}

export async function createCashHolder(name: string) {
  try {
    const holder = await prisma.cashHolder.create({ data: { name } });
    return { success: true, data: JSON.parse(JSON.stringify(holder)) };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Ошибка' };
  }
}

// ─── Payment Cards ──────────────────────────────────────────────────────────

export async function getPaymentCards() {
  const cards = await prisma.paymentCard.findMany({
    where: { isActive: true },
    orderBy: { holderName: 'asc' },
  });
  return JSON.parse(JSON.stringify(cards));
}

export async function createPaymentCard(cardNumber: string, holderName: string) {
  try {
    const card = await prisma.paymentCard.create({ data: { cardNumber, holderName } });
    return { success: true, data: JSON.parse(JSON.stringify(card)) };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Ошибка' };
  }
}
