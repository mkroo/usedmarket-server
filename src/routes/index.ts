import { Router } from 'express';

import carriers from './carriers';

import getItemList from '../controller/getItemList';

const route = Router();

route.use('/carriers', carriers);

route.get('/items/:keyword', getItemList);
route.post('/sales');

export default route;
