import { Request, Response } from 'express';
import Crawler from '../util/Crawler';
import { crawlerAccount } from '../../config.json';

const getItemList = async (req: Request, res: Response) => {
  const { keyword } = req.params;
  const { limit, offset } = req.query;
  const { username, password } = crawlerAccount;

  const crawler = new Crawler();
  await crawler.init();
  await crawler.login(username, password);
  console.time('run');
  const posts = await crawler.run(keyword);
  console.timeEnd('run');

  return res.json({ posts });
};

export default getItemList;
