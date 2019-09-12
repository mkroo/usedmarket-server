import axios, { AxiosRequestConfig } from 'axios';
import cheerio from 'cheerio';
import { Cookie } from 'tough-cookie';
import * as qs from 'querystring';

interface Test {
  r: string;
}

module CJLogitics {
  const getCSRF = async () => {
    const url = 'https://www.cjlogistics.com/ko/tool/parcel/tracking';
    const res = await axios.get(url);

    const $ = cheerio.load(res.data);

    const cookie = res.headers['set-cookie']
      .map(Cookie.parse)
      .map((c: any) => c.cookieString())
      .join('; ');
    const csrf = $('input[name=_csrf]').val();
    return { cookie, csrf };
  };

  export const getTrack = async (trackId: string) => {
    const { cookie, csrf } = await getCSRF();

    const url = 'https://www.cjlogistics.com/ko/tool/parcel/tracking-detail';
    const data = qs.stringify({
      paramInvcNo: trackId,
      _csrf: csrf,
    });
    const config: AxiosRequestConfig = {
      headers: {
        Cookie: cookie,
      },
    };

    const res = await axios.post(url, data, config);

    const process = res.data.parcelDetailResultMap.resultList.map((t: any) => {
      const { crgNm, dTime, regBranNm, scanNm, crgSt } = t;
      return {
        description: crgNm,
        time: dTime,
        location: regBranNm,
        status: scanNm,
        statusCode: crgSt,
      };
    });

    const rawInfo = res.data.parcelResultMap.resultList[0];
    console.log(rawInfo);
    if (!rawInfo) {
      throw new Error('해당 운송장이 존재하지 않습니다.');
    }
    const { sendrNm, itemNm, rcvrNm } = rawInfo;
    const info = {
      from: sendrNm,
      to: rcvrNm,
      title: itemNm,
    };

    return { info, process };
  };
}

export default CJLogitics;
