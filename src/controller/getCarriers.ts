import { Request, Response } from 'express';
import { Carriers } from '../util/carriers';

const enumToArray = (e: Object) => {
  type t = keyof typeof e;
  return Object.keys(e).map((k: t) => e[k]);
};

const getCarriers = async (req: Request, res: Response) => {
  const carriers = enumToArray(Carriers);
  return res.json({ carriers });
};

export default getCarriers;
