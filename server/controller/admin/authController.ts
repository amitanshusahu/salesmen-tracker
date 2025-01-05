import { Request, Response } from "express";
import { Prisma } from "../../lib/prisma/prismaClinet";
import { generateJwt } from "../../lib/jwt/jwt";
import { adminCookieName, cookieOption } from "../../lib/cookie/cookie";

export async function managerSignup(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { name, email, password } = req.body;
    const user = await Prisma.manager.findUnique({
      where: {
        email: email,
      }
    })
    if (user) {
      return res.status(400).json({ msg: "Manager already exists" });
    }
    const newUser = await Prisma.manager.create({
      data: {
        name, email, password
      }
    })
    if (!newUser) {
      return res.status(400).json({ msg: "Manager not created" });
    }
    res.cookie(adminCookieName, generateJwt({ email }), cookieOption);
    return res.status(201).json({ message: "Manager created" });
  } catch (err) {
    return res.status(500).json({ msg: 'signup failed', log: err });
  }
}

export async function managerLogin(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { email, password } = req.body;
    const user = await Prisma.manager.findUnique({
      where: {
        email, password
      }
    })
    if (!user) {
      return res.status(400).json({ msg: "Manager not found" });
    }
    res.cookie(adminCookieName, generateJwt({ email }), cookieOption);
    return res.status(200).json({ message: "Manager logged in" });
  } catch (err) {
    return res.status(500).json({ msg: 'login failed', log: err });
  }
}