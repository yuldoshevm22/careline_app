'use server';

import { prisma } from '@/lib/prisma';
import { createEmployeeSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function getEmployees(search?: string) {
  const where = search
    ? { isActive: true, fullName: { contains: search, mode: 'insensitive' as const } }
    : { isActive: true };

  const employees = await prisma.employee.findMany({ where, orderBy: { fullName: 'asc' } });
  return JSON.parse(JSON.stringify(employees));
}

export async function createEmployee(data: unknown) {
  const parsed = createEmployeeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const employee = await prisma.employee.create({
      data: { fullName: parsed.data.fullName, phone: parsed.data.phone || null },
    });
    revalidatePath('/employees');
    return { success: true, data: JSON.parse(JSON.stringify(employee)) };
  } catch (error) {
    console.error('Create employee error:', error);
    return { success: false, error: 'Ошибка при создании сотрудника' };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.employee.update({ where: { id }, data: { isActive: false } });
    revalidatePath('/employees');
    return { success: true };
  } catch (error) {
    console.error('Delete employee error:', error);
    return { success: false, error: 'Ошибка' };
  }
}
