import { Plugin, Notice, TFile } from 'obsidian';

export default class BookHilighterPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id:'import-book-highlights',
            name: 'Import Book Highlights',
            callback: () => this.importHighlights(),
        });
    }

    async importHighlights() {
        const folderPath = 'Book Highlights';
        const files = this.app.vault.getMarkdownFiles().filter(file => file.path.startsWith(folderPath));
        for (const file of files) {
            const content = await this.app.vault.read(file);
            const noteTitle = file.basename;
            const newNotePath = 'Books/${noteTitle}.md';
            const existingFile = this.app.vault.getAbstractFileByPath(newNotePath);
            if (existingFile instanceof TFile) {
                await this.app.vault.modify(existingFile, content); // 📌 파일 덮어쓰기
            } else {
                await this.app.vault.create(newNotePath, content); // 📌 새 파일 생성
            }
        }
        new Notice('Book highlights imported successfully!');
    }
}