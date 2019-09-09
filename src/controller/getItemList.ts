import { Request, Response } from 'express';
import Crawler from '../util/Crawler';
import { username, password } from '../../accountConfig.json';

const getItemList = async (req: Request, res: Response) => {
  const { keyword } = req.params;
  const { limit, offset } = req.query;

  const crawler = new Crawler();
  await crawler.init();
  await crawler.login(username, password);
  const posts = await crawler.run(keyword);

  return res.json({ posts });
};

export default getItemList;
