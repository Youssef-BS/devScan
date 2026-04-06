import {prisma} from "../db.js" ;
import { Request, Response } from "express";

export const getListUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc"
      }
    });

    const totalUsers = await prisma.user.count();

    res.status(200).json({
      data: users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        repos: {
          include: {
            commits: {
              include: {
                files: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const banUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { isBanned: true }
    });

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};


export const unbanUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { isBanned: false }
    });

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, email, avatarUrl } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        username,
        email,
        avatarUrl
      }
    });

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
};
