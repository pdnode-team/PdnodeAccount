// routes/api/register.ts
import { define } from "@/utils.ts";
import { count, eq } from "drizzle-orm";
import { db } from "@/db.ts";
import { users } from "@/schema.ts";
import bcrypt from "bcryptjs";
import { z } from "npm:zod@4.6.7";

const registerSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, "Nickname must be at least 3 characters")
    .max(30, "Nickname must be at most 30 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const handler = define.handlers({
  async POST(ctx) {
    try {
      let body: unknown;
      try {
        body = await ctx.req.json();
      } catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
      }

      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        return Response.json(
          {
            error: "Validation failed",
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }

      const { nickname, email, password } = parsed.data;

      const [{ count: isRegistered }] = await db
        .select({ count: count() })
        .from(users)
        .where(eq(users.email, email));

      if (isRegistered > 0) {
        return Response.json(
          { error: "Email already registered" },
          { status: 409 },
        );
      }

      const hashed = await bcrypt.hash(password, 10);

      const [newUser] = await db
        .insert(users)
        .values({
          nickname,
          password: hashed,
          email,
          status: "unverified",
          role: "user",
        })
        .returning({ id: users.id, email: users.email });

      // TODO: 5. 生成邮箱验证 Token 并发送验证邮件
      // await sendVerificationEmail(newUser.email, verificationToken);

      return Response.json(
        { message: "Created", user: newUser },
        { status: 201 },
      );
    } catch (err) {
      console.error("Register error:", err);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
});
