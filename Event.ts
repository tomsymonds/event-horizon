import EventParser from 'EventParser'

export default class Event {
    description: string
    day: number
    month: number
    year: number
    hour: number
    seconds: number
    story: string
    rawInput: string
    valid: boolean

    constructor(rawInput: string){
        const parsed = new EventParser(rawInput) 
        this.rawInput = rawInput
        const inputStrippedDate = rawInput.replace(parsed.results.text, '').trim()
        this.description = inputStrippedDate.charAt(0).toUpperCase() + inputStrippedDate.slice(1)
        this.day = parsed.results.day
        this.month = parsed.results.month
        this.year = parsed.results.year               
        this.hour = parsed.results.hour
        this.seconds = parsed.results.second
        this.story = ""
        this.valid = (this.year != null)
    }    
}


