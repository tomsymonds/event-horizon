import { App, TFile, normalizePath, Vault} from "obsidian";
import { BaseNote } from 'BaseNote'
import Event from "Event";

//Classes for managing files in the Obsidian vault
export class FileManager {
    app: App
    settings: any
    vault: Vault
    currentFile: BaseNote | null = null

    constructor(app: App, settings: any | {}) {
        this.app = app
        this.settings = settings
        this.vault = app.vault
    }

    //Create a new file in the vault with the specified type and metadata
    //Type: the type of file to create (e.g., "Event")
    //Name: the name of the file (without extension)
    //Metadata: an object containing metadata to add to the file frontmatter
    //onCreate: a callback function to call when the file is created or if there is an error
     createFile(options: any): any{
        const { type, path, metadata, parent, onCreate} = options
        if(!onCreate) return {status: "error", message: "ERROR: No onCreate callback provided in FileManager createFile"}
        const { fullPath, name, folder } = this.pathParts(path)
        if(this.fileExists(fullPath)){
            onCreate({status: "error", message: `File exists`})
            return
        }
        const newFile = this.getFileFromType(type)
        this.vault.create(fullPath, "").then((tFile) => {
            newFile.tFile = tFile
            newFile.setMetadata(metadata)
            if(newFile.parentMetadataKeys && Object.keys(newFile.parentMetadataKeyslength > 0)){
                const parentMetadata = this.getActiveFileMetadata()
                if(parentMetadata){
                    this.addMatchingKeys(parentMetadata, newFile.parentMetadataKeys, newFile.metadata)
                }
            }
            this.app.fileManager.processFrontMatter(tFile, (frontmatter) => {
                Object.keys(newFile.metadata).forEach((key) => {
                    frontmatter[key] = newFile.metadata[key];
                });
            })
            onCreate({status: "ok", message: `Created new ${type}: ${name} in ${folder}`, file: newFile})
        }).catch((error) => {
            onCreate({status: "error", message: `Error creating ${type}: ${error}`})
        });
        return {status: "pending", message:""}  
    }

    // Update the metadata of the current file. Does not update the file contents.
    updateFile(path: string, metadata: any, onUpdate: any): any{
        if(!onUpdate) return {status: "error", message: "No onUpdate callback provided"}
        const { fullPath, name } = this.pathParts(path)
        const fileResult = this.getFile(fullPath)
        if(fileResult.status === "error") {
            onUpdate({status: "error", message: fileResult.message})
            return
        }
        const file = fileResult.file
        if(!file) onUpdate({status: "error", message: "No file to update"})
        if(!(file.tFile instanceof TFile)) onUpdate({status: "error", message: "File has no TFile"});
        if(!file.metadata) onUpdate({status: "error", message: "File has no metadata"})
        if(!metadata || Object.keys(metadata).length === 0) onUpdate({status: "error", message: "No metadata to update"})
        
        file.setMetadata(metadata)
        this.app.fileManager.processFrontMatter(file.tFile, (frontMatter) => {
            Object.keys(file.metadata).forEach((key) => {
                frontMatter[key] = file.metadata[key];
            })
        })
        onUpdate({status: "ok", message: `Updated ${name}`, file: file})
        return
    }

    //Get the current active file in the workspace as a file object
    getActiveFile(): BaseNote | null {
        const currentTFile =  this.app.workspace.getActiveFile()
        if(!currentTFile) return null
        return this.getFileFromTFile(currentTFile)
    }

    // Get a file from the vault based on its path and return a file object
    getFile(filePath: string): any {
        if(!filePath) return {status: "error", message: "No file path provided"}
        const { fullPath, name } = this.pathParts(filePath)
        const tFile = this.getTFile(filePath)
        if(!tFile) return {status: "error", message: `File not found: ${fullPath}`}
        return this.getFileFromTFile(tFile as TFile)
    }

    // Get a TFile from the vault based on a path
    getTFile(filePath: string): any {
        const vault = this.app.vault;   
        if(filePath) {
            const { fullPath, name } = this.pathParts(filePath)
            return vault.getAbstractFileByPath(fullPath);
        }
    }

    //Convert a TFile to a file object with metadata
    getFileFromTFile(baseFile: TFile): any {
         if(baseFile && baseFile instanceof TFile){
            const fileCache = this.app.metadataCache.getFileCache(baseFile)
            const metadata = fileCache? 
            fileCache.frontmatter? 
                fileCache.frontmatter : {}
            : {}
            const newFile = this.getFileFromType(metadata.type)
            newFile.metadata = metadata
            newFile.tFile = baseFile
            this.currentFile = newFile
            return newFile
        } 
    }

    getActiveFileMetadata(): any {
        const activeFile = this.getActiveFile();
        if(!activeFile) return {}
		const name = activeFile.tFile ? `[[${activeFile.tFile.basename}]]` : null
        if(!(activeFile && activeFile.tFile instanceof TFile)){
            return {} 
        } else {
            return {
                name,
                ...activeFile.metadata
            }    
        }
    }
        
    
    // Get the path of the current file
    getCurrentFilePath(): string | null {
        if(!this.currentFile) return null
        return this.currentFile?.path()
    }

    // Return an instance of a file based on its type
    private getFileFromType(type: string): any {
        const types: { [key: string]: () => any } = {
            "Event": () => { return new Event(this.settings) }
        }
        const requestedType = types[type]
        return requestedType ? requestedType() : new BaseNote()
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
            })
        });
    }

    pathParts(filePath: string): {folder: string, name: string, fullPath: string} {
        const parts = filePath.split("/")
        const nameWithExt = parts.pop() || ""
        const folder = parts.join("/")
        const name = nameWithExt.endsWith(".md") ? nameWithExt.slice(0, -3) : nameWithExt
        const fullPath = filePath.endsWith(".md") ? filePath : `${filePath}.md`
        return {folder, name, fullPath}
    }

    addMatchingKeys(obj1: any, keys: any, obj2: any) {
        Object.keys(keys).forEach((key: string) => {
            if (obj1.hasOwnProperty(key)) {
                obj2[keys[key]] = obj1[key];
            }
        });
        return obj2;
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