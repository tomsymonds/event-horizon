import { TFile } from "obsidian"
import { PropertyFormatter } from "fileManagement"

export class BaseNote {

    tFile: TFile | null
    settings: any
    folder: string = ""
    defaultName: string = "New Note"
    metadata: any = {
        type: "BaseNote",
        tags: []
    }
    contents: string = ""

    public setMetadata(metadata: any){
        console.log("setMetadata", metadata)
        console.log(this.metadata)
        this.mergeMetadata(this.metadata, metadata)
    }

    private mergeMetadata<T extends Record<string, any>>(defaultMetadata: T, suppliedMetadata: Partial<T>): T {
        const result = { ...defaultMetadata };
        (Object.keys(suppliedMetadata) as (keyof T)[]).forEach((key) => {
            if (key in defaultMetadata) {
                result[key] = suppliedMetadata[key] as T[keyof T];
            }
        });
        this.metadata = result;
        return result
    }

    public path(){
        const folder = this.folder.length > 0 ? `${this.folder}/` : ""
        const name = this.tFile ? this.tFile.basename : `${this.defaultName}`
        return `${folder}${name}.md`
    }

    //Formats the event as a markdown file
    public toString(){
        const formatter = new PropertyFormatter()
        const metadata: any = Object.keys(this.metadata).map((key) => {
            return `${key}: ${formatter.formatValue(this.metadata[key])}`
        })
        return `---\n${metadata.join("\n")}\n---\n`
    }    



}
