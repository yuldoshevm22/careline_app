import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateTelegramInitData, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let telegramId: number;
    let firstName: string;
    let lastName: string | undefined;
    let username: string | undefined;
    let photoUrl: string | undefined;

    if (body.devMode && process.env.NODE_ENV === 'development') {
      // Dev mode — bypass Telegram validation
      telegramId = body.user?.id || 123456789;
      firstName = body.user?.first_name || 'Dev';
      lastName = body.user?.last_name;
      username = body.user?.username;
    } else if (body.initData) {
      const validated = validateTelegramInitData(body.initData);
      if (!validated) {
        return NextResponse.json({ error: 'Invalid initData' }, { status: 401 });
      }

      const userData = JSON.parse(validated.user || '{}');
      telegramId = userData.id;
      firstName = userData.first_name;
      lastName = userData.last_name;
      username = userData.username;
      photoUrl = userData.photo_url;
    } else {
      return NextResponse.json({ error: 'No auth data provided' }, { status: 400 });
    }

    // Upsert user
    const user = await prisma.telegramUser.upsert({
      where: { telegramId: BigInt(telegramId) },
      create: {
        telegramId: BigInt(telegramId),
        firstName,
        lastName,
        username,
        photoUrl,
      },
      update: {
        firstName,
        lastName,
        username,
        photoUrl,
        lastLoginAt: new Date(),
      },
    });

    // Create JWT
    const token = await createToken({
      sub: user.id,
      telegramId: Number(user.telegramId),
      role: user.role,
    });

    return NextResponse.json({
      token,
      userId: user.id,
      user: {
        id: user.id,
        telegramId: Number(user.telegramId),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
