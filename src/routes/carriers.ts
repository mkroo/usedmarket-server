import { Router } from 'express';

import getTrack from '../controller/getTrack';
import getCarriers from '../controller/getCarriers';

const carriers = Router();

carriers.get('/', getCarriers);
carriers.get('/:carrier_id');
carriers.get('/:carrier_id_id/tracks/:track_id', getTrack);

export default carriers;
