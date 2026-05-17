'use server';

import { prisma } from '@/lib/prisma';
import { createClientSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function getClients(search?: string) {
  const where = search
    ? {
        isActive: true,
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : { isActive: true };

  const clients = await prisma.client.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  return JSON.parse(JSON.stringify(clients));
}

export async function getClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      operations: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          items: { include: { product: true } },
          expenseType: true,
        },
      },
    },
  });

  return client ? JSON.parse(JSON.stringify(client)) : null;
}

export async function createClient(data: unknown) {
  const parsed = createClientSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const client = await prisma.client.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        comment: parsed.data.comment || null,
      },
    });

    revalidatePath('/clients');
    return { success: true, data: JSON.parse(JSON.stringify(client)) };
  } catch (error) {
    console.error('Create client error:', error);
    return { success: false, error: 'Ошибка при создании клиента' };
  }
}

export async function updateClient(id: string, data: unknown) {
  const parsed = createClientSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const client = await prisma.client.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath('/clients');
    return { success: true, data: JSON.parse(JSON.stringify(client)) };
  } catch (error) {
    console.error('Update client error:', error);
    return { success: false, error: 'Ошибка при обновлении клиента' };
  }
}

export async function deleteClient(id: string) {
  try {
    await prisma.client.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    console.error('Delete client error:', error);
    return { success: false, error: 'Ошибка при удалении клиента' };
  }
}
