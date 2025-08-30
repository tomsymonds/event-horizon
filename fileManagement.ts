import { App, TFile, normalizePath, MarkdownView, getFrontMatterInfo } from "obsidian";

/**
 * Save a text file into the Obsidian vault.
 * If the file exists, it will be overwritten.
 *
 * @param app - The Obsidian App instance
 * @param filePath - Path inside the vault (e.g. "Notes/MyFile.md")
 * @param content - The text to write into the file
 */
export async function createTextFile(app: App, filePath: string, content: string): Promise<TFile> {
    const vault = app.vault;
    const normalizedFilePath = normalizePath(filePath)

    // Check if the file already exists
    let file = vault.getAbstractFileByPath(normalizedFilePath);

    if (file instanceof TFile) {
        // If it exists, overwrite it
        console.log("overwrite")
        await vault.modify(file, content);
        return file;
    } else {
        console.log("create")
        // If not, create a new file
        return await vault.create(normalizedFilePath, content);
    }
}

export async function saveTextFile(app: App, filePath: string, content: string): Promise<TFile> {
    const vault = app.vault;
    const normalizedFilePath = normalizePath(filePath)

    // Check if the file already exists
    let file = vault.getAbstractFileByPath(normalizedFilePath);

    if (file instanceof TFile) {
        // If it exists, overwrite it
        console.log("overwrite")
        await vault.modify(file, content);
        return file;
    } else {
        console.log("create")
        // If not, create a new file
        return await vault.create(normalizedFilePath, content);
    }
}

export class FileManager {
    app: App

    constructor(app: App) {
        this.app = app
    }

    //Check if a file exists in the vault
    fileExists(filePath: string): boolean {
        const vault = this.app.vault;
        const normalizedFilePath = normalizePath(filePath)
        let file = vault.getAbstractFileByPath(normalizedFilePath);
        return file instanceof TFile;
    }

    


}

//Formats property values for Obsidian frontmatter
export class PropertyFormatter {
    //Checks if a string is an Obsidian link
    private isObsidianLink(value: string): boolean {
        return value.startsWith("[[") && value.endsWith("]]");
    }

    //Formats an Event property value as a string for frontmatter
    private formattedLink(value: string): string {
        return `"${value}"`;
    }

    private formattedValue(value: any): string {
        // if (typeof value === 'string') {
        //     return `${value}`;
        // }
        return String(value);
    }

    private formattedArray(value: any[]): string {
        const arrayString: Array<string> = value.map((v: any) => `  - ${v}\n`);
        return `\n${arrayString.join('')}`;
    }

    // Do formatting
    private formatters: Array<(value: any) => string | undefined> = [
        (v) => Array.isArray(v) ? this.formattedArray(v) : undefined,
        (v) => typeof v === 'string' && this.isObsidianLink(v) ? this.formattedLink(v) : undefined,
        (v) => typeof v === 'string' ? this.formattedValue(v) : undefined,
        (v) => this.formattedValue(v) // fallback
    ];

    public formatValue(value: any): string {
        for (const fn of this.formatters) {
            const result = fn(value);
            if (result !== undefined) return result;
        }
        return ""; // if nothing matches
    }
}