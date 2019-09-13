import puppeteer from 'puppeteer';
import axios, { AxiosRequestConfig } from 'axios';
import querystring from 'querystring';
import cheerio from 'cheerio';
import qs from 'qs';

export interface Post {
  title: string;
  price: number;
  url: string;
  createdAt: Date;
  soldOut: boolean;
}

export interface SearchOption {
  include: string;
  exclude: string;
  sortBy: string;
  searchBy: number;
  page: number;
}

export default class Crawler {
  private browser: puppeteer.Browser;
  private page: puppeteer.Page;

  private NID_AUT: string; // 네이버 로그인 쿠키 value
  private NID_SES: string; // 네이버 로그인 쿠키 value

  constructor() {
    console.log('crwaler start!');
  }

  public async init() {
    this.browser = await puppeteer.launch();
    this.page = await this.browser.newPage();
  }

  public async login(username: string, password: string) {
    await this.page.goto('https://nid.naver.com/nidlogin.login');
    await this.page.evaluate(
      (username, password) => {
        (document.querySelector('#id') as HTMLInputElement).value = username;
        (document.querySelector('input#pw') as HTMLInputElement).value = password;
      },
      username, password,
    );
    await this.page.click('#frmNIDLogin > fieldset > input');
    await this.page.waitForNavigation();
    const cookies = await this.page.cookies();

    this.NID_AUT = cookies.filter(cookie => cookie.name === 'NID_AUT')[0].value;
    this.NID_SES = cookies.filter(cookie => cookie.name === 'NID_SES')[0].value;
  }

  public async run(keyword: string) {
    const posts: Post[] = [];
    const postUrls = await this.getPostList(keyword);
    for (const url of postUrls) {
      const post = await this.getPost(url);
      posts.push(post);
    }
    await this.browser.close();
    return posts;
  }

  private async getPostList(keyword: string, option?: SearchOption) {
    const url = 'https://m.cafe.naver.com/ArticleSearchList.nhn';
    const config: AxiosRequestConfig = {
      params: {
        search: {
          clubid: 10050146,
          include: option ? option.include : '',
          exclude: option ? option.exclude : '',
          sortBy: (option && option.sortBy) ? option.sortBy : 'date',
          searchBy: (option && option.searchBy) ? option.searchBy : 1, // 0: 제목 + 내용, 1: 제목
          query: querystring.escape(keyword),
          page: (option && option.page) ? option.page : 1,
        },
      },
      paramsSerializer: params => qs.stringify(params, { encode: false, allowDots: true }),
    };
    const res = await axios.get(url, config);
    const $ = cheerio.load(res.data);
    const list = $('#articleList > ul > li').get();
    const baseURL = 'https://m.cafe.naver.com';
    return list.map(post => baseURL.concat($(post).children('a').attr('href')));
  }

  private async getPost(url: string) {
    const config: AxiosRequestConfig = {
      headers: {
        Cookie: `NID_AUT=${this.NID_AUT}; NID_SES=${this.NID_SES};`,
      },
      withCredentials: true,
    };
    try {
      console.time('axios');
      const res = await axios.get(url, config);
      console.timeEnd('axios');
      console.time('cheerio load');
      const $ = cheerio.load(res.data);
      console.timeEnd('cheerio load');
      console.time('parse');
      const post = $('.post');
      const soldOut = post.children('strong.sale').attr('class').includes('sold_out');
      const text = post.children('.product_name').text().split('\n');
      const title = text[2].trim();
      const price = Number(text[3].trim().replace(/[,원]/gi, ''));
      const createdAt = new Date(post.children('.post_info .board_time span:first-child').text());
      console.timeEnd('parse');
      return { title, price, url, createdAt, soldOut };
    } catch (err) {
      console.log(err);
    }
  }
}