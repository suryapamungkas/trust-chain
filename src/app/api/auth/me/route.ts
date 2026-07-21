import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserById, getNotifications, getWallet } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("tc_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Token invalid" }, { status: 401 });

  const user = await getUserById(payload.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const notifications = await getNotifications(payload.userId);
  const wallet = await getWallet(payload.userId);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      walletAddress: user.wallet_address,
      balanceIdr: wallet?.balance_idr || 0,
      balanceUsd: wallet?.balance_usd || 0,
      themePreference: user.theme_preference,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    },
    notifications,
    unreadCount: notifications.filter((n) => !n.is_read).length,
  });
}
