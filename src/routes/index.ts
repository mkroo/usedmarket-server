import { Router } from 'express';
import getItemList from '../controller/getItemList';

const route = Router();

route.get('/items/:keyword', getItemList);
route.post('/sales');

export default route;
