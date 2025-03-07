import { Request, Response } from 'express';
import { Prisma } from '../../lib/prisma/prismaClinet';

export async function addToVisitedLoation(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { uid, locationId, date, userLatitude, userLongitude } = req.body;
    console.log("add location", uid, locationId, date, userLatitude, userLongitude);
    const user = await Prisma.salesMan.findUnique({
      where: {
        uid
      }
    })
    if (!user) {
      return res.status(400).json({ msg: "salesman doesn't exists" });
    }

    // calcutate distance
    const location = await Prisma.managedLocation.findUnique({
      where: {
        id: locationId
      }
    })
    if (!location) {
      return res.status(400).json({ msg: "location doesn't exists" });
    }
    // euclidean distance formula- does not work for large distance, as it does not consider the curvature of the earth, better to use haversine formula
    const toMeterScale = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const latDiff = (lat1 - lat2) * 111000; // Scale latitude to meters (111 km -> 111,000 meters)
      const lonDiff = (lon1 - lon2) * 111000 * Math.cos(((lat1 + lat2) / 2) * Math.PI / 180); // Scale longitude to meters
      return Math.sqrt(Math.pow(latDiff, 2) + Math.pow(lonDiff, 2)); // Result in meters
    };

    const distance = toMeterScale(
      userLatitude,
      userLongitude,
      location.latitude,
      location.longitude
    );

    // check if location already exists for todays date
    const visitedLocationCheck = await Prisma.visitedLocation.findFirst({
      where: {
        locationId,
        salesManId: user.id,
        date: date
      }
    })
    if (visitedLocationCheck) {
      const visitedLocation = await Prisma.visitedLocation.update({
        where: {
          id: visitedLocationCheck.id
        },
        data: {
          visitCount: visitedLocationCheck.visitCount + 1
        }
      })
      return res.status(200).json({ visitedLocation });
    }

    const visitedLocation = await Prisma.visitedLocation.create({
      data: {
        date,
        locationId,
        UserLatitude: userLatitude,
        UserLongitude: userLongitude,
        salesManId: user.id,
        visitCount: 1,
        scanDistance: distance
      }
    })
    return res.status(200).json({ visitedLocation });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'add location failed', log: err });
  }

}

export async function getVisitedLocation(
  req: Request,
  res: Response,
): Promise<Response> {
  try {
    const { uid } = req.body;
    console.log("get visited location", uid);
    const user = await Prisma.salesMan.findUnique({
      where: {
        uid
      }
    })
    if (!user) {
      return res.status(400).json({ msg: "salesman doesn't exists" });
    }
    const today = new Date();
    const startofDay = new Date(today.setHours(0, 0, 0, 0));
    const endofDay = new Date(today.setHours(23, 59, 59, 999));
    const visitedLocation = await Prisma.visitedLocation.findMany({
      where: {
        salesManId: user.id,
        date:{
          gte: startofDay,
          lte: endofDay
        }
      },
      include: {
        Location: {
          select: {
            name: true,
            market_name: true,
            address: true,
            latitude: true,
            longitude: true,
          }
        }
      }
    })
    return res.status(200).json({ visitedLocation });
  } catch (err) {
    return res.status(500).json({ msg: 'get visited location failed', log: err });
  }
}