'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todaySales,
    todayPayments,
    todayExpenses,
    monthSales,
    monthPayments,
    monthExpenses,
    clientCount,
    totalDebt,
  ] = await Promise.all([
    prisma.operation.aggregate({
      where: { type: 'SALE', createdAt: { gte: today } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.operation.aggregate({
      where: { type: 'CLIENT_PAYMENT', createdAt: { gte: today } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.operation.aggregate({
      where: { type: 'CASH_EXPENSE', createdAt: { gte: today } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.operation.aggregate({
      where: { type: 'SALE', createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    prisma.operation.aggregate({
      where: { type: 'CLIENT_PAYMENT', createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    prisma.operation.aggregate({
      where: { type: 'CASH_EXPENSE', createdAt: { gte: monthStart } },
      _sum: { totalAmount: true },
    }),
    prisma.client.count({ where: { isActive: true } }),
    prisma.client.aggregate({
      where: { isActive: true, balance: { lt: 0 } },
      _sum: { balance: true },
    }),
  ]);

  return {
    today: {
      sales: { total: Number(todaySales._sum.totalAmount || 0), count: todaySales._count },
      payments: { total: Number(todayPayments._sum.totalAmount || 0), count: todayPayments._count },
      expenses: { total: Number(todayExpenses._sum.totalAmount || 0), count: todayExpenses._count },
    },
    month: {
      sales: Number(monthSales._sum.totalAmount || 0),
      payments: Number(monthPayments._sum.totalAmount || 0),
      expenses: Number(monthExpenses._sum.totalAmount || 0),
    },
    clients: clientCount,
    totalDebt: Math.abs(Number(totalDebt._sum.balance || 0)),
  };
}
