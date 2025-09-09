import EventParser from 'EventParser'
import { BaseNote } from 'BaseNote'

//Class representing an event with date and description
export default class Event extends BaseNote {
    static parentMetadataKeys = {
        name: "source", 
        story: "story"
    }
    static defaultFolder = "Events"
    
    //The raw input text used to create the event
    description: string
    title: string = "New Event"
    metadata: any  = {
        type: "Event",
        tags: [],
        day: "",
        month: "",
        year: "",
        source: "",
        story: ""
    }
    defaultName: "New Event"
    hasDate: boolean = false

    constructor(settings: any) {
        super() 
    }    

    //Extracts date information from the description and sets metadata
    public setMetadata(metadata: any){
        const { description } = metadata
        this.mergeMetadata(this.metadata, metadata)
        if(!description) return
        const results = description ? new EventParser(description).results : null
        this.title = ""
        if(results){
            this.metadata.day
            this.resetDateMetadata
            this.mergeMetadata(this.metadata, results)
            this.description = results.description
            this.title = this.titleWithDate(results.description)
        } else {
            this.title = this.titleWithDate(description)
        }

    }

    //Generates a filename based on the event's date and description
    private titleWithDate(description: string){
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const monthName = this.metadata.month ? months[this.metadata.month - 1] : null
        const dateParts = [this.metadata.day, monthName, this.metadata.year].filter(part => part !== null).map(part => String(part).padStart(2, '0'));
        const dateStr = dateParts.join('-');
        return `${dateStr} • ${description}`
    }

    //Clears the date metadata fields
    private resetDateMetadata() {
        this.metadata.day = ""
        this.metadata.month = ""
        this.metadata.year = ""     
    }

}





