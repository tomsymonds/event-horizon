import EventParser from 'EventParser'

export default class Event {
    day: number
    month: number
    year: number
    hour: number
    seconds: number
    story: string
    rawInput: string
    valid: boolean = false
    currentFile
    description: string

    constructor(rawInput: string, currentFile: any){
        this.currentFile = currentFile
        this.rawInput = rawInput
        const parsed = new EventParser(rawInput) 
        if(parsed.results){
            this.description = this.getDescription(parsed.results.text)
            this.day = parsed.results.day
            this.month = parsed.results.month
            this.year = parsed.results.year               
            this.hour = parsed.results.hour
            this.seconds = parsed.results.second
            this.story = `[[${this.currentFile.basename}]]`
            this.valid = (this.year != null)
        }
    }    

    private getDescription(dateText: string){ 
        if (!dateText || dateText === "") return this.rawInput 
        const inputStrippedDate = this.rawInput.replace(dateText, '').trim()
        return inputStrippedDate.charAt(0).toUpperCase() + inputStrippedDate.slice(1)
    }
}


