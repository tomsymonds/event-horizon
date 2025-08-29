import { App, TFile, normalizePath, MarkdownView, getFrontMatterInfo } from "obsidian";

/**
 * Save a text file into the Obsidian vault.
 * If the file exists, it will be overwritten.
 *
 * @param app - The Obsidian App instance
 * @param filePath - Path inside the vault (e.g. "Notes/MyFile.md")
 * @param content - The text to write into the file
 */
export async function saveTextFile(app: App, filePath: string, content: string): Promise<TFile> {
    const vault = app.vault;
    const normalizedPath = normalizePath(filePath);

    // Check if the file already exists
    let file = vault.getAbstractFileByPath(normalizedPath);

    if (file instanceof TFile) {
        // If it exists, overwrite it
        await vault.modify(file, content);
        return file;
    } else {
        // If not, create a new file
        return await vault.create(normalizedPath, content);
    }
}
