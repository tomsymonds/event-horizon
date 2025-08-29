import EventParser from 'EventParser'

//Class representing an event with date and description
export default class Event {
    day: number | null = null
    month: number | null = null
    year: number | null = null
    hour: number | null = null
    seconds: number | null = null
    story: string
    rawInput: string
    currentFile
    description: string
    text: any
    sourceNoteLink: string | null = null
    projectLink: string | null = null
    projectLinkName: string | "Project"
    propertyNames: any
    type: string = "Event"
    tags: Array<string> = ["#Event"]

    constructor(rawInput: string, currentFile: any, parentMetadata: any, settings: any | "Project"){
        this.propertyNames = {
            type: "type",
            tags: "tags",
            day: "Day",
            month: "Month",
            year: "Year",
            sourceNoteLink: "Source",
            projectLink: settings.projectLinkName
        }
        this.currentFile = currentFile
        this.rawInput = rawInput
        this.projectLinkName = settings.projectLinkName
        if(Object.keys(parentMetadata).length > 0){
            this.sourceNoteLink = `[[${this.currentFile.basename}]]`
            this.projectLink = parentMetadata.frontmatter[this.projectLinkName]? `${parentMetadata.frontmatter[this.projectLinkName]}` : ""
        }
        //Default description is the rawInput
        this.description = this.rawInput
        const parsed = new EventParser(rawInput) 
        if(parsed.results){
            this.day = parsed.results.day
            this.month = parsed.results.month
            this.year = parsed.results.year               
            this.hour = parsed.results.hour
            this.seconds = parsed.results.second
            //If there's a date, get an updated description
            this.description = parsed.results.description
        }
        this.text = this.getDateText()
    }    

    //Formats the description by removing date text if present
    private getDescription(dateText: string){ 
        if (!dateText || dateText === "") return this.rawInput 
        const inputStrippedDate = this.rawInput.replace(dateText, '').trim()
        return inputStrippedDate.charAt(0).toUpperCase() + inputStrippedDate.slice(1)
    }

    //Returns date parts as strings, empty if null
    private getDateText(){
        return {
            day: this.day ? this.day.toString() : "",
            month: this.month ? this.month.toString() : "", 
            year: this.year ? this.year.toString() : ""
        }
    }
    //Validates the event data
    //Must have a year and a non-empty description
    private valid(){
        return (this.year && this.year > 0) && (this.description && this.description.trim().length > 0) 
    }

    //Formats the event as a markdown file
    toFile(){
        if(!this.valid()) return null
        const metadata: any = Object.keys(this.propertyNames).map((key: any) => {
            const propertyKey = key as keyof typeof this
            const valueString = `${this[propertyKey]}`
            const valueStringWithLinks = this.isObsidianLink(valueString) ? `"${valueString}"` : valueString
            return `${this.propertyNames[key]}: ${valueStringWithLinks || ""}`
        })
        return `---\n${metadata.join("\n")}\n---\n`
    }

    //Generates a filename based on the event's date and description
    fileName(){
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const monthName = this.month ? months[this.month - 1] : ""
        const dateParts = [this.day, monthName, this.year].filter(part => part !== null).map(part => String(part).padStart(2, '0'));
        const dateStr = dateParts.join('-');
        return `${dateStr} • ${this.description}.md`
    }

    isObsidianLink(input: string) {
    const regex = /^\[\[([^[\]]+?)(\|([^[\]]+))?\]\]$/;
    return regex.test(input);

}

}