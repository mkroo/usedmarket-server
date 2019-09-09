import puppeteer from 'puppeteer';
import axios, { AxiosRequestConfig } from 'axios';
import * as qs from 'querystring';
import cheerio from 'cheerio';

export interface Post {
  title: string;
  price: number;
  url: string;
  createdAt: Date;
  soldOut: boolean;
}

export default class Crawler {
  private cookiesObject: puppeteer.Cookie[];
  private browser: puppeteer.Browser;
  private page: puppeteer.Page;

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
    this.cookiesObject = await this.page.cookies();
  }

  public async run(keyword: string) {
    const posts: Post[] = [];
    const postUrls = await this.getPostList(keyword);
    for (const url of postUrls) {
      const post = await this.getPostWithPuppeteer(url);
      posts.push(post);
    }
    await this.browser.close();
    return posts;
  }

  private async getPostList(keyword: string) {
    const query = qs.escape(keyword);
    const url = `https://m.cafe.naver.com/ArticleSearchList.nhn?search.query=${query}&search.searchBy=1&search.sortBy=date&search.clubid=10050146&search.option=0`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const list = $('#articleList > ul > li').get();
    const baseURL = 'https://m.cafe.naver.com';
    return list.map(post => baseURL.concat($(post).children('a').attr('href')));
  }

  private async getPostWithPuppeteer(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    const element = await this.page.$('.product_name');
    const { title, price } = await this.page.evaluate(
      (element: HTMLElement) => {
        const text = element.textContent.split('\n');
        const title = text[2].trim();
        const price = Number(text[3].trim().replace(/[,원]/gi, ''));
        return { title, price };
      },
      element,
    );
    return { title, price, url, createdAt: new Date(), soldOut: false }; // createdAt, soldOut 추가해야함
  }

  private async getPostWithAxios(url: string) {
    const config: AxiosRequestConfig = {
      headers: {
        Cookie: this.cookiesObject.map(cookie => `${cookie.name}: ${cookie.value};`).join(' '),
      },
      withCredentials: true,
    };
    try {
      const res = await axios.get(url, config);
      const $ = cheerio.load(res.data);
      const title = $('title').text();
      console.log(title);
    } catch (err) {
      console.log('!');
    }
  }
}
