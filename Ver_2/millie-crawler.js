console.log('✅ millie-crawler 시작됨');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.millie.co.kr/v3/login', { waitUntil: 'networkidle2' });

    // ✅ 입력창 로딩 대기
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', process.env.MILLIE_ID);
    await page.type('input[type="password"]', process.env.MILLIE_PASSWORD);

    // ✅ 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // ✅ 로그인 완료 후 URL 확인 or 쿠키 저장
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 로그인이 잘 되었는지 확인
    console.log('✅ 로그인 후 URL:', page.url());

    await page.goto('https://www.millie.co.kr/my-library/highlight', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.highlight-box', { timeout: 10000 });

    const highlights = await page.$$eval('.highlight-box', boxes => {
    return boxes.map(box => {
        const bookTitle = box.querySelector('.book-title')?.innerText.trim();
        const quote = box.querySelector('.highlight-content')?.innerText.trim();
        const date = box.querySelector('.highlight-date')?.innerText.trim();
        return { bookTitle, quote, date };
    });
    });

// Group highlights by book title
const grouped = {};
highlights.forEach(({ bookTitle, quote, date }) => {
    if (!bookTitle || !quote) return;
    if (!grouped[bookTitle]) grouped[bookTitle] = [];
    grouped[bookTitle].push(`- ${quote} (${date})`);
  });

// Save to markdown
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  for (const [title, entries] of Object.entries(grouped)) {
    const sanitized = title.replace(/[\/\\:*?"<>|]/g, '_');
    const content = `# ${title}\n\n## Highlights\n${entries.join('\n')}\n`;
    const filePath = path.join(outputDir, `${sanitized}.md`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✔ Saved: ${filePath}`);
  }
    await browser.close();
    console.log('📄 추출된 하이라이트 수:', highlights.length);
    console.log(highlights.slice(0, 3)); // 일부 확인
})();
