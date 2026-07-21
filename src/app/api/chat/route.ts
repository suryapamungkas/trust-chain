import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getChatRooms, getChatMessages, sendChatMessage, getOrCreateChatRoom, getUnreadChatCount, RowDataPacket } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    const payload = token ? verifyToken(token) : null;
    const userId = payload?.userId || 999;

    const { searchParams } = new URL(req.url);
    const list = searchParams.get("list");
    const roomId = searchParams.get("roomId");
    const unread = searchParams.get("unread");
    const createRoom = searchParams.get("createRoom");

    if (unread === "true") {
      const count = await getUnreadChatCount(userId);
      return NextResponse.json({ unreadCount: count });
    }

    if (createRoom === "true") {
      const partnerId = Number(searchParams.get("partnerId") || 1);
      const productId = searchParams.get("productId") ? Number(searchParams.get("productId")) : undefined;
      const room = await getOrCreateChatRoom(userId, partnerId, productId);
      return NextResponse.json({ room });
    }

    if (list === "true") {
      const rooms = await getChatRooms(userId);
      return NextResponse.json({ rooms });
    }

    if (roomId) {
      const id = parseInt(roomId, 10);
      if (isNaN(id)) return NextResponse.json({ error: "Invalid room ID" }, { status: 400 });
      const messages = await getChatMessages(id, userId);
      return NextResponse.json({ messages });
    }

    return NextResponse.json({ error: "Specify list=true or roomId=X" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch chat data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("tc_token")?.value;
    const payload = token ? verifyToken(token) : null;
    const userId = payload?.userId || 999;

    const body = await req.json();
    const { to_user_id, message, product_id, room_id, message_type, attachment_url } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    let targetRoomId = room_id;
    if (!targetRoomId) {
      if (!to_user_id) {
        return NextResponse.json({ error: "to_user_id atau room_id diperlukan" }, { status: 400 });
      }
      const room = await getOrCreateChatRoom(userId, Number(to_user_id), product_id ? Number(product_id) : undefined);
      targetRoomId = room.id;
    }

    const newMsg = await sendChatMessage(
      Number(targetRoomId),
      userId,
      message.trim(),
      message_type || "text",
      attachment_url || null
    );

    // Auto-reply exactly 1 bubble when chatting Admin (User ID 1)
    if (userId !== 1) {
      const pool = await (await import("@/lib/db")).getDb();
      const [roomRows] = await pool.query<RowDataPacket[]>("SELECT user1_id, user2_id FROM chat_rooms WHERE id = ?", [targetRoomId]);
      const involvesAdmin = roomRows && roomRows.length > 0 && (roomRows[0].user1_id === 1 || roomRows[0].user2_id === 1);

      if (involvesAdmin || Number(to_user_id) === 1) {
        const [replyRows] = await pool.query<RowDataPacket[]>(
          "SELECT COUNT(*) as cnt FROM chat_messages WHERE room_id = ? AND sender_id = 1 AND message LIKE '%tim kami yang akan segera menjawab%'",
          [targetRoomId]
        );
        if (replyRows && replyRows[0].cnt === 0) {
          await sendChatMessage(
            Number(targetRoomId),
            1,
            "Halo! Terima kasih telah menghubungi Admin TrustChain. Mohon menunggu sebentar, tim kami yang akan segera menjawab pesan Anda.",
            "text",
            null
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: newMsg, roomId: targetRoomId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
