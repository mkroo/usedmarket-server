import { Request, Response } from 'express';

import { CJLogitics } from '../util/carriers';

const getTrack = async (req: Request, res: Response) => {
  const { carrier_id, track_id } = req.params;
  try {
    const r = await CJLogitics.getTrack(track_id);
    return res.json(r);
  } catch (err) {
    console.log(err);
    return res.json({ message: err.message });
  }
};

export default getTrack;
