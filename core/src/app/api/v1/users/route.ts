// demo api endpoint

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { logError } from '@/zap/errors/logger/server';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const users: User[] = [];

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

export function GET() {
  return NextResponse.json({
    data: users,
    meta: {
      total: users.length,
      page: 1,
      limit: 20,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: validation.data.name,
      email: validation.data.email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    logError(error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'GET, POST' } }
  );
}

// Note: For demo purposes, we're not implementing PUT, DELETE here
// In a real application, you would implement those methods as well
