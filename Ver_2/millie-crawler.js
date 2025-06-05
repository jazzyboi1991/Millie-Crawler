const puppeteer = require('puppeteer');
const fs = reuqire('fs');
const path = require('path');
require('dotenv').config();

(async() => {
    const browser = await puppeteer.launch({ headless : false });
    const page = await browser.newPage();

    await page.goto('https://www.millie.co.kr/login');

    // Login
    await page.type('input[name="email"]', process.env.MILLIE_ID);
    await page.type('input[name="password"]', process.env.MILLIE_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Go To Highlight Page
    await page.goto('https://www.millie.co.kr/my-library/highlight');å

    await page.waitForSelector('.highlight-box');

    const highlights = await page.$$eval('.hightlight-box', boxes => {
        return boxes.map(box => {
            const bookTitle = box.querySelector('.book-title')?.innerText.trim();
            const quote = box.querySelector('.highlight-content')?.innerText.trim();
            const date = box.querySelector('.highlight-date')?.innerText.trim();
            return { bookTitle, quote, date };
        });
    });

    const grouped = {};
    highlights.forEach(({ bookTitle, quote, date }) => {
        if(!grouped[bookTitle]) grouped[bookTitle] = [];
        grouped[bookTitle].push(`- ${quote} (${date})`);
    });

    for(const [title, entries] of Object.entries(grouped)) {
        const content = `# ${title}\n\n## Highlights\n${entries.join('\n')}\n`;
        const filePath = path.join(__dirname, 'output', `${title}.md`);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Saved: ${title}.md`);
    }

    await browser.close();
    console.log('📄 추출된 하이라이트 수:', highlights.length);
    console.log(highlights.slice(0, 3)); // 일부 확인
})();