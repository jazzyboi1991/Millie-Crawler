// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

// GET 요청 시 Puppeteer로 밀리의 서재 하이라이트 크롤링
app.get('/fetch-highlights', async (req, res) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 봇 차단 회피를 위한 User-Agent 설정
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

  // 로그인 페이지 접속
  await page.goto('https://www.millie.co.kr/v3/login', { waitUntil: 'networkidle0' });

  // 로그인 입력
  await page.waitForSelector('input[placeholder="이메일"]');
  await page.type('input[placeholder="이메일"]', process.env.MILLIE_ID);
  await page.type('input[placeholder="비밀번호"]', process.env.MILLIE_PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  // 하이라이트 페이지 접속
  await page.goto('https://www.millie.co.kr/my-library/highlight', { waitUntil: 'networkidle0' });

  // 하이라이트 박스 로딩 대기
  await page.waitForSelector('.highlight-box');

  // 하이라이트 내용 추출
  const highlights = await page.$$eval('.highlight-box', boxes => {
    return boxes.map(box => ({
      bookTitle: box.querySelector('.book-title')?.innerText.trim(),
      quote: box.querySelector('.highlight-content')?.innerText.trim(),
      date: box.querySelector('.highlight-date')?.innerText.trim(),
    }));
  });

  await browser.close();
  res.json(highlights); // JSON으로 반환
});

// 서버 시작
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
