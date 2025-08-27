import * as chrono from 'chrono-node';

function findYearsWithContext(text: string) {
  // Regex: optional preceding words (by|in|before|after) + space + year
  const regex = /\b(?:by|in|before|after)?\s*(1[0-9]{3}|2[0-9]{3})\b/gi;

  const matches = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Capture the full match and the year
    matches.push({
      text: match[0].trim(), // includes the word if present
      year: parseInt(match[1], 10)
    });
  }

  return matches;
}


export default class EventParser {

    results: any  

    constructor(text:string){
        const basicResults = chrono.parse(text);
        if (basicResults.length > 0){
            this.results =  {
                day: basicResults[0].start.get('day') || null,
                month: basicResults[0].start.get('month') || null,
                year: basicResults[0].start.get('year') || null,
                hour: basicResults[0].start.get('hour') || null,
                minute: basicResults[0].start.get('minute') || null,
                second: basicResults[0].start.get('second') || null,
                text: basicResults[0].text || ""
            }
        }       
        const yearResults = findYearsWithContext(text);
        if (yearResults.length > 0){
            this.results = {
                day: null,
                month: null,    
                hour: null,
                minute: null,
                second: null,
                year: yearResults[0].year,
                text: yearResults[0].text || ""
            }
        }
    }
}