// obsidian-plugin.ts
import { Plugin, Notice } from "obsidian";
import axios from "axios";

export default class BookHighlighterPlugin extends Plugin {
  async onload() {
    this.addCommand({
      id: "import-book-highlights",
      name: "Import Book Highlights",
      callback: async () => this.fetchHighlightsAndSave(),
    });
  }

  async fetchHighlightsAndSave() {
    try {
      const res = await axios.get("http://localhost:3000/fetch-highlights");
      const highlights = res.data;

      // 책 제목별로 하이라이트 묶기
      const grouped: Record<string, string[]> = {};
      highlights.forEach(({ bookTitle, quote, date }) => {
        if (!grouped[bookTitle]) grouped[bookTitle] = [];
        grouped[bookTitle].push(`- ${quote} (${date})`);
      });

      // 각각의 책 제목에 대해 노트 생성
      for (const [title, entries] of Object.entries(grouped)) {
        const content = `# ${title}\n\n## Highlights\n${entries.join("\n")}`;
        const filePath = `Books/${title}.md`;

        await this.app.vault.create(filePath, content);
      }

      new Notice("📘 하이라이트 가져오기 완료!");
    } catch (e) {
      new Notice("❌ 하이라이트 불러오기 실패");
      console.error(e);
    }
  }
}
