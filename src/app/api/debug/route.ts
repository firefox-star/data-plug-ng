import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const db = new PrismaClient();
    const result = await db.setting.findMany().catch(e => ({ error: e.message }));
    await db.\$disconnect();
    return NextResponse.json({
      cwd: process.cwd(),
      env_database_url: process.env.DATABASE_URL || 'NOT_SET',
      db_result: result,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message, stack: (error as Error).stack?.split('\n').slice(0, 5) }, { status: 500 });
  }
}
