import { Request, Response } from "express";
import { Prisma } from "../../lib/prisma/prismaClinet";

export async function createLocation(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { name, marketName, address, latitude, longitude, uid, region, state, storeType } = req.body;
    console.log({ name, address, latitude, longitude, uid, storeType });

    //get manager id
    const manager = await Prisma.manager.findUnique({
      where: {
        email: uid
      }
    });
    if (!manager) {
      return res.status(400).json({ msg: "Manager not found" });
    }

    const location = await Prisma.managedLocation.findFirst({
      where: {
        name, managerId: manager.id, address, latitude, longitude, region, state
      }
    })
    if (location) {
      return res.status(400).json({ msg: "Location already exists" });
    }
    const newLocation = await Prisma.managedLocation.create({
      data: {
        name, market_name: marketName, address, managerId: manager.id , latitude, longitude, region, state, storeType
      }
    })
    if (!newLocation) {
      return res.status(400).json({ msg: "Location not created" });
    }
    return res.status(201).json({ message: "Location created", data: newLocation });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ msg: 'create location failed', log: err });
  }
}

export async function getAllLocations(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const locations = await Prisma.managedLocation.findMany();
    return res.status(200).json({ data: locations });
  } catch (err) {
    return res.status(500).json({ msg: 'get locations failed', log: err });
  }
}

export async function getLocationsByMannagerId(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { uid } = req.body;
    const locations = await Prisma.managedLocation.findMany({
      where: {
        Manager: {
          email: uid
        }
      }
    });
    return res.status(200).json({ data: locations });
  } catch (err) {
    return res.status(500).json({ msg: 'get locations failed', log: err });
  }
}