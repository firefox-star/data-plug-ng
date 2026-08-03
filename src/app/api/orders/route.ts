import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userAuth } from '@/lib/user-auth';
import { z } from 'zod';

const orderSchema = z.object({
  phone: z.string().min(1),
  networkId: z.string().min(1),
  planId: z.string().min(1),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const { error: authError, user } = await userAuth(req);
    if (authError) return authError;

    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    const { phone, networkId, planId, amount } = parsed.data;

    // Verify user has sufficient balance
    if (user!.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Verify plan exists
    const plan = await db.dataPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) {
      return NextResponse.json({ error: 'Plan not available' }, { status: 404 });
    }

    // Create order and deduct balance in transaction
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user!.id,
          phone,
          networkId,
          planId,
          amount,
          status: 'processing',
        },
      });

      await tx.user.update({
        where: { id: user!.id },
        data: { balance: { decrement: amount } },
      });

      return newOrder;
    });

    return NextResponse.json({ order, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
