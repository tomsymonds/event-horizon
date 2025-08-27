import EventParser from 'EventParser'

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
    parsed: boolean = false

    constructor(rawInput: string, currentFile: any){
        this.currentFile = currentFile
        this.rawInput = rawInput
        const parsed = new EventParser(rawInput) 
        this.story = `[[${this.currentFile.basename}]]`
        //Default description is the rawInput
        this.description = this.rawInput
        if(parsed.results){
            this.parsed = true
            this.day = parsed.results.day
            this.month = parsed.results.month
            this.year = parsed.results.year               
            this.hour = parsed.results.hour
            this.seconds = parsed.results.second
            //If there's a date, get an updated description
            this.description = this.getDescription(parsed.results.text)
        }
        this.text = this.getDateText()
    }    

    //Removes the date part from the description
    private getDescription(dateText: string){ 
        if (!dateText || dateText === "") return this.rawInput 
        const inputStrippedDate = this.rawInput.replace(dateText, '').trim()
        return inputStrippedDate.charAt(0).toUpperCase() + inputStrippedDate.slice(1)
    }

    private getDateText(){
        return {
            day: this.day ? this.day.toString() : "",
            month: this.month ? this.month.toString() : "", 
            year: this.year ? this.year.toString() : ""
        }
    }

    private valid(){
        console.log("Validating event", this)
        if(this.day && (this.day < 1 || this.day > 31)) return false
        if(this.month && (this.month < 1 || this.month > 12)) return false
        if(this.year && this.year < 0) return false
        if(!this.description || this.description.trim() === "") return false    
        return true
    }

    toFile(){
        if(!this.valid()) return null
        return `---\ndescription: ${this.description}\nday: ${this.day ? this.day : ""}\nmonth: ${this.month ? this.month : ""}\nyear: ${this.year ? this.year : ""}\nstory: ["${this.story}"]\n---`
    }

    fileName(){
        const dateParts = [this.day, this.month, this.year].filter(part => part !== null).map(part => String(part).padStart(2, '0'));
        const dateStr = dateParts.join('-');
        return `${dateStr} • ${this.description}.md`
    }

    // update(eventValues: {description: string, day: string, month: string, year: string}){
    //     console.log(this)
    //     console.log(eventValues)

    //     this.description = eventValues.description
    //     this.day = Number(eventValues.day)
    //     this.text.month = Number(eventValues.month) 
    //     this.text.year = Number(eventValues.year) 
    //     return this.valid()
    // }
}


