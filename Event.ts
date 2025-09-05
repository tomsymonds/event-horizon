import EventParser from 'EventParser'
import { BaseNote } from 'BaseNote'
import { TFile } from 'obsidian'

//Class representing an event with date and description
export default class Event extends BaseNote {
    // day: number | null = null
    // month: number | null = null
    // year: number | null = null
    // hour: number | null = null
    // seconds: number | null = null
    // story: string
    // rawInput: string
    // oldFileName: string
    // currentFile
    // description: string
    // text: any
    // sourceNoteLink: string | null = null
    // projectLink: string | null = null
    // projectLinkName: string | "Project"
    propertyNames: any
    // type: string = "Event"
    // tags: Array<string> | []
    folder: "Events"
    metadata: any  = {
        type: "Event",
        tags: [],
        day: "",
        month: "",
        year: ""
    }

    constructor(file: TFile | null, settings: any | {}) {
        super(file, settings)
        this.propertyNames = {
            day: "day",
            month: "month",
            year: "year", 
            source: "source",
            project: "project",
        }

        // this.currentFile = currentFile
        // this.projectLinkName = settings.projectLinkName
        // this.tags = settings.tags ? settings.tags.split(" ") : []
        // console.log("settings", settings)
        // console.log("tags", this.tags)
        // if(Object.keys(parentMetadata).length > 0){
        //     this.sourceNoteLink = `[[${this.currentFile.basename}]]`
        //     this.projectLink = parentMetadata.frontmatter[this.projectLinkName]? `${parentMetadata.frontmatter[this.projectLinkName]}` : ""
        // }
        // if(parentMetadata.frontmatter.type === "Event" && isEditing){
        //     this.day = parentMetadata.frontmatter.Day
        //     this.month = parentMetadata.frontmatter.Month
        //     this.year = parentMetadata.frontmatter.Year               
        //     this.hour = parentMetadata.frontmatter.Hour
        //     this.seconds = parentMetadata.frontmatter.Second
        //     this.description = this.getDescriptionFromFileName(this.currentFile.basename) 
        // } else {
        //     this.rawInput = rawInput

        //     //Default description is the rawInput
        //     this.description = this.rawInput
        //     const parsed = new EventParser(rawInput) 
        //     if(parsed.results){
        //         this.day = parsed.results.day
        //         this.month = parsed.results.month
        //         this.year = parsed.results.year               
        //         this.hour = parsed.results.hour
        //         this.seconds = parsed.results.second
        //         //If there's a date, get an updated description
        //         this.description = parsed.results.description
        //     }
        // }
        // this.text = this.getDateText()
    }    

    // //Formats the description by removing date text if present
    // private getDescription(dateText: string){ 
    //     if (!dateText || dateText === "") return this.rawInput 
    //     const inputStrippedDate = this.rawInput.replace(dateText, '').trim()
    //     return inputStrippedDate.charAt(0).toUpperCase() + inputStrippedDate.slice(1)
    // }

    // //Returns date parts as strings, empty if null
    // private getDateText(){
    //     return {
    //         day: this.day ? this.day.toString() : "",
    //         month: this.month ? this.month.toString() : "", 
    //         year: this.year ? this.year.toString() : ""
    //     }
    // }
    // //Validates the event data
    // //Must have a year and a non-empty description
    // private valid(){
    //     return (this.year && this.year > 0) && (this.description && this.description.trim().length > 0) 
    // }

    // isObsidianLink(input: string) {
    //     const regex = /^\[\[([^[\]]+?)(\|([^[\]]+))?\]\]$/;
    //     return regex.test(input);
    // }
    
    // getDescriptionFromFileName(fileName: string) {
    //     const parts = fileName.split(' • ');
    //     return parts[1]
    // }

    //     //Generates a filename based on the event's date and description
    // fileName(){
    //     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    //     const monthName = this.month ? months[this.month - 1] : ""
    //     const dateParts = [this.day, monthName, this.year].filter(part => part !== null).map(part => String(part).padStart(2, '0'));
    //     const dateStr = dateParts.join('-');
    //     return `${dateStr} • ${this.description}.md`
    // }

    // //Formats the event as a markdown file
    // toFile(){
    //     const formatter = new PropertyFormatter()
    //     if(!this.valid()) return null
    //     const metadata: any = Object.keys(this.propertyNames).map((key: any) => {
    //         const propertyKey = key as keyof typeof this
    //         const value = this[propertyKey]
    //         return `${key}: ${formatter.formatValue(value)}` 
    //     })
    //     return `---\n${metadata.join("\n")}\n---\n`
    // }

    
}