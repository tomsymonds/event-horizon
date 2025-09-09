import { TFile } from "obsidian"
import { PropertyFormatter } from "fileManagement"

export class BaseNote {

    //The text file in the vault containing the note's data
    tFile: TFile | null
    settings: any
    //The title of the note -- usually used for the tFile base name
    title: string = "New Note"
    metadata: any = {
        type: "BaseNote",
        tags: []
    }
    contents: string = ""

    public setMetadata(metadata: any){
        this.mergeMetadata(this.metadata, metadata)
    }

    public mergeMetadata<T extends Record<string, any>>(defaultMetadata: T, suppliedMetadata: Partial<T>): T {
        const result = { ...defaultMetadata };
        (Object.keys(suppliedMetadata) as (keyof T)[]).forEach((key) => {
            if (key in defaultMetadata) {
                result[key] = suppliedMetadata[key] as T[keyof T];
            }
        });
        this.metadata = result;
        return result
    }

    //Formats the event as a markdown text file
    public toString(){
        const formatter = new PropertyFormatter()
        const metadata: any = Object.keys(this.metadata).map((key) => {
            return `${key}: ${formatter.formatValue(this.metadata[key])}`
        })
        return `---\n${metadata.join("\n")}\n---\n`
    }    

    public isSaved(){
        return this.tFile instanceof TFile
    }

    //Returns the creation date of the note
    public createdAt(){
        if(this.tFile){
            return new Date(this.tFile.stat.ctime)
        }
    }

    //Returns the updated date of the note
    public updatedAt(){
        if(this.tFile){
            return new Date(this.tFile.stat.mtime)
        }
    }

    public getStatusObject(statusArray: any[]){
        const failed = statusArray.filter(s => !s.isValid)
        return {
            isValid: failed.length === 0,
            message: failed.map(f => f.message).join(" | ")
        }
    }


    status(){
        const title: any = {
                isValid: this.title && this.title.trim().length > 0,
                message: "Title is required"
        }
        return this.getStatusObject([title])
    }


}
