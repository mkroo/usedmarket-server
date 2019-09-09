import { Router } from 'express';

const carriers = Router();

carriers.get('/');
carriers.get('/:carrier_id');
carriers.get('/:carrier_id_id/tracks/:track_id');

export default carriers;
