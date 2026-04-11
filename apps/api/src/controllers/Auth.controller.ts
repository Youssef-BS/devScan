import { Request, Response } from 'express';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { prisma } from '../db.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import { updateProfileSchema, changePasswordSchema, updateNameSchema , adminLoginSchema } from "@repo/validation";

export const githubLogin = async (req: Request, res: Response) => {
  try {
    const state = randomBytes(16).toString("hex");

    res.cookie("oauth_state", state, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
    });

    const redirectUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${process.env.GITHUB_CLIENT_ID}` +
      `&redirect_uri=${process.env.GITHUB_CALLBACK_URL}` +
      `&scope=user:email` +
      `&state=${state}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "OAuth Error" });
  }
};

export const githubCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const cookieState = req.cookies.oauth_state;

  if (!code || state !== cookieState) {
    return res.status(400).json({ message: "Invalid OAuth state" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = userResponse.data;

    let email = githubUser.email;

    if (!email) {
      const emailsResp = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const primary =
        emailsResp.data.find((e: any) => e.primary) ||
        emailsResp.data[0];

      email = primary?.email;
    }

    const dbUser = await prisma.user.upsert({
      where: { githubId: String(githubUser.id) },
      update: {
        username: githubUser.login,
        email,
        avatarUrl: githubUser.avatar_url,
        accessToken,
      },
      create: {
        githubId: String(githubUser.id),
        username: githubUser.login,
        email,
        avatarUrl: githubUser.avatar_url,
        accessToken,
      },
    });

    if (dbUser.isBanned) {
      return res.redirect(`${process.env.CLIENT_URL}/banned`);
    }

    // Check if user has active subscription
    if (dbUser.subscriptionStatus !== "ACTIVE") {
      // Redirect to pricing/payment page
      const jwtToken = generateToken({
        userId: dbUser.id,
        role: "USER",
        isBanned: dbUser.isBanned || false,
      });

      res.cookie("token", jwtToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Also set a non-httpOnly token for Socket.IO access
      res.cookie("socketToken", jwtToken, {
        httpOnly: false,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(`${process.env.CLIENT_URL}/pricing`);
    }

  const jwtToken = generateToken({
  userId: dbUser.id,
  role: "USER",
  isBanned: dbUser.isBanned || false,
});

    res.cookie("token", jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Also set a non-httpOnly token for Socket.IO access
    res.cookie("socketToken", jwtToken, {
      httpOnly: false,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (!dbUser.firstName || !dbUser.lastName) {
      return res.redirect(`${process.env.CLIENT_URL}/complete-profile`);
    }

    return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error(error);
    return res.redirect(process.env.CLIENT_URL!);
  }
};


export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return res.json(user);
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const LoginUserWithEmail = async (req: Request, res: Response) => {
    try {
        const result = adminLoginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation error",
                errors: result.error.flatten(),
            });
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });

        if (!user.password)
            return res.status(401).json({ message: "This user does not have a password." });

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken({
            userId: user.id,
            role: user.role,
            isBanned: user.isBanned
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({ message: "Admin Login successful" });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    console.log("updateProfile called with body:", req.body);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    const { firstName, lastName, password }  = result.data;

    const updateData: any = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: Number(req.user.userId) },
      data: updateData,
    });

    return res.json(user);

  } catch (err) {
    console.error("updateProfile error:", err);

    return res.status(500).json({
      message: "Profile update failed",
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    const { currentPassword, newPassword } = result.data;

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.userId) },
      select: { password: true },
    });

    if (!user || !user.password) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: Number(req.user.userId) },
      data: { password: hashedNewPassword },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Password change failed" });
  }
};

export const updateName = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = updateNameSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.flatten(),
      });
    }

    const { firstName, lastName } = result.data;

    const updatedUser = await prisma.user.update({
      where: { id: Number(req.user.userId) },
      data: { firstName, lastName },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error("updateName error:", error);
    return res.status(500).json({ message: "Failed to update name" });
  }
};


export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.clearCookie("socketToken");

  return res.json({
    message: "Logged out successfully",
  });
};