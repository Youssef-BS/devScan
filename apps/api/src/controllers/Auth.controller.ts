import { Request, Response } from 'express';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { prisma } from '../db';
import { generateToken } from '../utils/jwt';
import { AuthRequest } from 'src/middleware/auth';
import bcrypt from 'bcrypt';

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

  const jwtToken = generateToken({
  userId: dbUser.id,
  role: "USER",
});

    res.cookie("token", jwtToken, {
      httpOnly: true,
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

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    console.log("updateProfile called with body:", req.body);
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { firstName, lastName, password } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (password) updateData.password = await bcrypt.hash(password, 10); 

    const user = await prisma.user.update({
      where: { id: Number(req.user.userId) }, 
      data: updateData,
    });

    res.json(user);
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");

  return res.json({
    message: "Logged out successfully",
  });
};