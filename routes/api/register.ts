// routes/api/register.ts
import { define } from "@/utils.ts";
import { count, eq } from "drizzle-orm";
import { db } from "@/db.ts";
import { users } from "@/schema.ts";
import bcrypt from "bcryptjs";
import { z } from "npm:zod@4.6.7";

const registerSchema = z.object({
  nickname: z.string().min(3, "Nickname must be at least 3 long"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 long."),
});

export const handler = define.handlers({
  async POST(ctx) {
    const body = await ctx.req.json();
    const { nickname, email, password } = registerSchema.parse(body);

    if (!email || !password || !nickname) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const [{ count: isRegistered }] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.email, email));

    if (isRegistered > 0) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      nickname,
      password: hashed,
      email,
      status: "unverified",
      role: "user",
    });

    return Response.json({ message: "Created", email }, { status: 201 });
  },
});
