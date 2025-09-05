import { App, TFile, normalizePath, Vault} from "obsidian";
import { BaseNote } from 'BaseNote'
import Event from "Event";

//Classes for managing files in the Obsidian vault

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
    settings: any
    vault: Vault

    constructor(app: App, settings: any | {}) {
        this.app = app
        this.settings = settings
        this.vault = app.vault
    }

    //Create a new file in the vault with the specified type and metadata
     createFile(options: any): any{
        const { type, metadata, onCreate } = options
        if(!onCreate) return {status: "error", message: "ERROR: No onCreate callback provided in FileManager createFile"}
        const newFile = this.getFileFromType(type, null)
        this.vault.create(newFile.path(), "").then((tFile) => {
            newFile.tFile = tFile
            newFile.setMetadata(metadata)
            this.app.fileManager.processFrontMatter(tFile, (frontmatter) => {
                Object.keys(newFile.metadata).forEach((key) => {
                    frontmatter[key] = newFile.metadata[key];
                });
            })
            newFile.metadataIsLoaded = true
            newFile.isSaved = true
            onCreate({status: "ok", message: `Created new ${type}`})
        }).catch((error) => {
            if(error == "Error: File already exists."){
                onCreate({status: "ok", message: `${type} already exists`})
            } else {
                onCreate({status: "error", message: `Error creating ${type}: ${error}`})
            }
        });
        return {status: "pending", message:""}  
    }

    updateFile(file: BaseNote){
        if(!(file.tFile instanceof TFile)) return;
        if(!file.metadata) return
        this.app.fileManager.processFrontMatter(file.tFile, (frontMatter) => {
            Object.keys(file.metadata).forEach((key) => {
                frontMatter[key] = file.metadata[key];
            })
        })
    }

    // Return an instance of a file based on its type
    getFileFromType(type: string, file: TFile | null): any {
        const types: { [key: string]: (file: TFile | null) => any } = {
            "Event": (file: TFile | null) => { return new Event(file, this.settings) }
        }
        const requestedType = types[type]
        return requestedType ? requestedType(file) : new BaseNote(file)
    }

    // Get a file from the vault and return an instance of the correct class based on its type
    getFile(filePath: string): any | null {
        const vault = this.app.vault;   
        const normalizedFilePath = normalizePath(filePath)
        let baseFile = vault.getFileByPath(normalizedFilePath);
        if(baseFile){
            const fileCache = this.app.metadataCache.getFileCache(baseFile)
            const metadata = fileCache? 
            fileCache.frontmatter? 
                fileCache.frontmatter : {}
            : {}
            const newFile = this.getFileFromType(metadata.type, baseFile)
            newFile.metadata = metadata
            newFile.metadataIsLoaded = fileCache? true : false
            newFile.isSaved = true
            return newFile
        } 
        return false
    }

    // Get a Promise to return the contents of a Note
    async getNoteContents(Note: BaseNote): Promise<string | null> {
        if(Note.tFile instanceof TFile){
            return this.app.vault.cachedRead(Note.tFile)
        }
        return null
    }

    //Check if a file exists in the vault
    fileExists(filePath: string): boolean {
        const vault = this.app.vault;
        const normalizedFilePath = normalizePath(filePath)
        let file = vault.getAbstractFileByPath(normalizedFilePath);
        return file instanceof TFile;
    }

    saveNote(note: BaseNote): void {

        if(!(note.tFile instanceof TFile)) return;
        if(!note.metadata) return
        this.app.fileManager.processFrontMatter(note.tFile, (existingMetadata) => {
            Object.keys(note.metadata).forEach((key) => {
                existingMetadata[key] = note.metadata[key];
                console.log(existingMetadata)
            })
        });
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

    //
    private formattedValue(value: any): string {
        // if (typeof value === 'string') {
        //     return `${value}`;
        // }
        return `${String(value)}`;
    }

    //
    private formattedArray(value: any[]): string {
        if(value.length == 0) return "";
        const arrayString: Array<string> = value.map((v: any) => `  - ${v}`);
        return `\n${arrayString.join('\n')}`;
    }

    // Do formatting
    private formatters: Array<(value: any) => string | undefined> = [
        (v) => Array.isArray(v) ? this.formattedArray(v) : undefined,
        (v) => typeof v === 'string' && this.isObsidianLink(v) ? this.formattedLink(v) : undefined,
        (v) => typeof v === 'string' ? this.formattedValue(v) : undefined,
        (v) => this.formattedValue(v) // fallback
    ];

    // Formats a value based on its type
    public formatValue(value: any): string {
        for (const fn of this.formatters) {
            const result = fn(value);
            if (result !== undefined) return result;
        }
        return ""; // if nothing matches
    }
}