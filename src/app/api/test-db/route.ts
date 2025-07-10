import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Test Prisma connection
    const usersCount = await prisma.user.count();
    
    // Test direct Neon connection
    const rawResult = await sql`SELECT COUNT(*) FROM "User"`;
    
    return NextResponse.json({
      success: true,
      prismaConnection: 'Successful',
      usersCount,
      neonConnection: 'Successful',
      rawResult,
      message: 'Database connections working correctly'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to connect to database'
    }, { status: 500 });
  }
}
