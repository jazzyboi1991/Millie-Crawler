// millie-crawler.js
module.exports = async function fetchHighlights() {
  const puppeteer = require('puppeteer');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://www.millie.co.kr/v3/login', { waitUntil: 'networkidle0' });

  await page.waitForSelector('input[placeholder="이메일"]');
  await page.type('input[placeholder="이메일"]', process.env.MILLIE_ID);
  await page.type('input[placeholder="비밀번호"]', process.env.MILLIE_PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  await page.goto('https://www.millie.co.kr/my-library/highlight', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.highlight-box');

  const highlights = await page.$$eval('.highlight-box', boxes => {
    return boxes.map(box => ({
      bookTitle: box.querySelector('.book-title')?.innerText.trim(),
      quote: box.querySelector('.highlight-content')?.innerText.trim(),
      date: box.querySelector('.highlight-date')?.innerText.trim(),
    }));
  });

  await browser.close();
  return highlights;
};
