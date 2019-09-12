import { Request, Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import { sweettracker } from '../../config.json';

const getCarriers = async (req: Request, res: Response) => {
  const { baseurl, apikey } = sweettracker;

  const axiosUrl = `${baseurl}/api/v1/companylist`;
  const axiosConfig: AxiosRequestConfig = {
    params: {
      t_key: apikey,
    },
  };
  const t = await axios.get(axiosUrl, axiosConfig);
  return res.json(t.data);
};

export default getCarriers;
