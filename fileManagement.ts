import { App, TFile, normalizePath, Vault} from "obsidian";
import { BaseNote } from 'BaseNote'
import Event from "Event";

//Managers files in the Obsidian vault. Handles Creating, Getting, and Updating text files.
//Naming: 
// A tFile is an instance of TFile, the standard Obsidian file type
// A File is a wrapper around a tFile that adds additional functionality, including metadata management
// File manager can:
// * Create a new Obsidian tFile from a File object and save it to the vault
// * Get an existing Obsidian tFile from the vault and return it as a File
// * Update an existing Obsidian tFile in the vault based on a File object
export class FileManager {
    app: App
    //Settings are from Obsidian plugin
    settings: any
    vault: Vault

    constructor(app: App, settings: any | {}) {
        this.app = app
        this.settings = settings
        this.vault = app.vault
    }

    //Create a new file in the vault based on a note object
    //Path - the path at which to save the object
    //noteObj - an instance of a noteObj class -- eg BaseNote, Event etc.
    //onCreate: a callback function to call when the file is created or if there is an error
     createFile(options: any): any{
        const { path, noteObj, onCreate } = options
        if(!onCreate) return {status: "error", message: "ERROR: No onCreate callback provided in FileManager createFile"}
        const { name, folder } = this.pathParts(path)
        const savePath = this.getPath(folder, noteObj.title ? noteObj.title : name)
        if(this.fileExists(savePath)){
            onCreate({status: "error", message: `File exists`})
            return
        }
        const newFile = noteObj
        //Create and update the tFile metadata
        this.vault.create(savePath, "").then((tFile) => {
            newFile.tFile = tFile
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
            onCreate({status: "ok", message: `Created new ${newFile.type}: ${name} in ${folder}`, file: newFile})
        }).catch((error) => {
            onCreate({status: "error", message: `Error creating ${newFile.type}: ${error}`})
        });
        return {status: "pending", message:""}  
    }

    // Update the metadata and title of the current file. Does not update the file contents.
    async updateFile(path: string, metadata: any, onUpdate: any): Promise<any>{
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
        //Set the object's metadata to the new values
        file.setMetadata(metadata)
        this.app.fileManager.processFrontMatter(file.tFile, (frontMatter) => {
            Object.keys(file.metadata).forEach((key) => {
                frontMatter[key] = file.metadata[key];
            })
        }).then(async () => {
            //Update the file name if it has changed
            if(file.status().isValid){
            if(file.title && file.tFile.basename !== file.title){
                await this.renameTFile(file.tFile, file.title).then(() => {
                    onUpdate({status: "ok", message: `Updated ${name}`, file: file})
                }).catch((error) => {
                    onUpdate({status: "error", message: `Error renaming ${name}: ${error}`, file: file})
                })
            }
            } else {
                onUpdate({status: "error", message: `Error updating ${name}`, file: file})  
            } 
        }).catch((error) => {
            onUpdate({status: "error", message: `Error updating ${name}: ${error}`, file: file})
        })              
    }

    //Rename a TFile in the vault
    async renameTFile(file: TFile, newTitle: string): Promise<void> {
        if(!(file instanceof TFile)) return
        const fileExtension = file.extension;
        const parentPath = file.parent && file.parent.path ? file.parent.path : "";
        const newPath = `${parentPath}/${newTitle}.${fileExtension}`;
        await this.app.fileManager.renameFile(file, newPath);
    }

    // Get a file from the vault based on its path and return a full file object
    getFile(filePath: string): any {
        if(!filePath) return {status: "error", message: "No file path provided"}
        const { fullPath,  } = this.pathParts(filePath)
        const tFile = this.getTFile(fullPath)
        if(!tFile) return {status: "error", message: `File not found: ${fullPath}`}
        const newFile = this.createFileFromTFile(tFile as TFile)
        return {status: "ok", file: newFile}
    }

    //Get the current active file in the workspace as a file object
    getActiveTFile(): BaseNote | null {
        const currentTFile =  this.app.workspace.getActiveFile()
        if(!currentTFile) return null
        return this.createFileFromTFile(currentTFile)
    }

    // Get a TFile from the vault based on a path
    getTFile(filePath: string): any {
        const vault = this.app.vault;   
        if(filePath) {
            const { fullPath } = this.pathParts(filePath)
            return vault.getAbstractFileByPath(fullPath);
        }
    }


    //Convert a TFile to a file object with metadata
    createFileFromTFile(baseFile: TFile): any {
         if(baseFile && baseFile instanceof TFile){
            const fileCache = this.app.metadataCache.getFileCache(baseFile)
            const metadata = fileCache? 
            fileCache.frontmatter? 
                fileCache.frontmatter : {}
            : {}
            const newFile = this.getFileFromType(metadata.type)
            newFile.metadata = metadata
            newFile.tFile = baseFile
            newFile.title = baseFile.basename
            return newFile
        } 
    }   

    //Get the active file and return its metadata, including its name as a link
    getActiveFileMetadata(): any {
        const activeFile = this.getActiveTFile();
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
        
    //Return an instance of a file based on its type
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

    //Construct a full path from a folder and name
    getPath(folder: string, name: string){
        return `${folder}/${name}.md`
    }

    //Returns parts of a path string - folder, name of file without extension, and full path with extension.
    //Takes a path and a noteObj. If the noteObj has a title, this is used as the name of the file.
    pathParts(filePath: string): {folder: string, name: string, fullPath: string} {
        const parts = filePath.split("/")
        const nameWithExt = parts.pop() || ""
        const folder = parts.join("/")
        const name = nameWithExt.endsWith(".md") ? nameWithExt.slice(0, -3) : nameWithExt
        const fullPath = filePath.endsWith(".md") ? filePath : `${filePath}.md`
        return {folder, name, fullPath}
    }

    //Add values in obj1 which are have keys included in the keys object, to obj 2 using the display name of each key, set as keys values
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

    //Returns array formatted for markdown metadata
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