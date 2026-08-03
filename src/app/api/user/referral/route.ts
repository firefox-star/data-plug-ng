import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userAuth } from '@/lib/user-auth';

// GET /api/user/referral — Get referral stats for current user
export async function GET(req: NextRequest) {
  const { error, user } = await userAuth(req);
  if (error) return error;

  try {
    const fullUser = await db.user.findUnique({
      where: { id: user!.id },
      select: {
        referralCode: true,
        referralCount: true,
        referralReward: true,
        whatsappShareCount: true,
        referralCompleted: true,
        balance: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const REQUIRED_SHARES = 3;
    const REWARD_AMOUNT = 3000;
    const SHORT_LINK = 'https://ln.run/gfciL';

    return NextResponse.json({
      referralCode: fullUser.referralCode,
      referralLink: SHORT_LINK,
      whatsappShareCount: fullUser.whatsappShareCount,
      referralCompleted: fullUser.referralCompleted,
      requiredShares: REQUIRED_SHARES,
      rewardAmount: REWARD_AMOUNT,
      totalRewardEarned: fullUser.referralReward,
      totalReferrals: fullUser.referralCount,
      balance: fullUser.balance,
    });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral data' }, { status: 500 });
  }
}

// POST /api/user/referral — Record a WhatsApp share
export async function POST(req: NextRequest) {
  const { error, user } = await userAuth(req);
  if (error) return error;

  try {
    const fullUser = await db.user.findUnique({
      where: { id: user!.id },
      select: {
        whatsappShareCount: true,
        referralCompleted: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If already completed, don't allow more shares
    if (fullUser.referralCompleted) {
      return NextResponse.json({
        whatsappShareCount: fullUser.whatsappShareCount,
        referralCompleted: true,
        message: 'You have already completed your shares!',
      });
    }

    const REQUIRED_SHARES = 3;
    const REWARD_AMOUNT = 3000;
    const newCount = fullUser.whatsappShareCount + 1;

    // Update share count
    const updated = await db.user.update({
      where: { id: user!.id },
      data: { whatsappShareCount: newCount },
    });

    // Check if they've completed the required shares
    if (newCount >= REQUIRED_SHARES) {
      // Grant reward and mark as completed
      await db.user.update({
        where: { id: user!.id },
        data: {
          referralCompleted: true,
          balance: { increment: REWARD_AMOUNT },
          referralReward: { increment: REWARD_AMOUNT },
        },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId: user!.id,
          title: 'Reward Earned! 🎉',
          message: `You have completed your WhatsApp shares! ₦${REWARD_AMOUNT.toLocaleString()} has been credited to your wallet. Keep using DataPlug.ng for the cheapest data!`,
        },
      });

      console.log(`[referral] User ${user!.id} completed ${newCount} shares, rewarded ₦${REWARD_AMOUNT}`);

      return NextResponse.json({
        whatsappShareCount: newCount,
        referralCompleted: true,
        rewardGranted: true,
        rewardAmount: REWARD_AMOUNT,
        message: 'Congratulations! You earned ₦3,000 wallet credit!',
      });
    }

    const remaining = REQUIRED_SHARES - newCount;

    return NextResponse.json({
      whatsappShareCount: newCount,
      referralCompleted: false,
      remainingShares: remaining,
      message: `Share recorded! ${remaining} more share${remaining === 1 ? '' : 's'} to earn your reward.`,
    });
  } catch (error) {
    console.error('Referral share error:', error);
    return NextResponse.json({ error: 'Failed to record share' }, { status: 500 });
  }
}
