
import { GoogleGenAI, Type } from "@google/genai";
import { Verse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BIBLE_ABBREVIATION_TO_BOOK_NUMBER: { [key: string]: number } = {
  "GEN":1, "EXO":2, "LEV":3, "NUM":4, "DEU":5, "JOS":6, "JDG":7, "RUT":8, "1SA":9, "2SA":10,
  "1KI":11, "2KI":12, "1CH":13, "2CH":14, "EZR":15, "NEH":16, "EST":17, "JOB":18, "PSA":19,
  "PRO":20, "ECC":21, "SNG":22, "ISA":23, "JER":24, "LAM":25, "EZK":26, "DAN":27, "HOS":28,
  "JOL":29, "AMO":30, "OBA":31, "JON":32, "MIC":33, "NAM":34, "HAB":35, "ZEP":36, "HAG":37,
  "ZEC":38, "MAL":39, "MAT":40, "MRK":41, "LUK":42, "JHN":43, "ACT":44, "ROM":45, "1CO":46,
  "2CO":47, "GAL":48, "EPH":49, "PHP":50, "COL":51, "1TH":52, "2TH":53, "1TI":54, "2TI":55,
  "TIT":56, "PHM":57, "HEB":58, "JAS":59, "1PE":60, "2PE":61, "1JN":62, "2JN":63, "3JN":64,
  "JUD":65, "REV":66,
};

const BIBLE_ABBREVIATION_TO_ENGLISH_NAME: { [key: string]: string } = {
  "GEN": "Genesis", "EXO": "Exodus", "LEV": "Leviticus", "NUM": "Numbers", "DEU": "Deuteronomy",
  "JOS": "Joshua", "JDG": "Judges", "RUT": "Ruth", "1SA": "1 Samuel", "2SA": "2 Samuel",
  "1KI": "1 Kings", "2KI": "2 Kings", "1CH": "1 Chronicles", "2CH": "2 Chronicles", "EZR": "Ezra",
  "NEH": "Nehemiah", "EST": "Esther", "JOB": "Job", "PSA": "Psalm", "PRO": "Proverbs",
  "ECC": "Ecclesiastes", "SNG": "Song of Solomon", "ISA": "Isaiah", "JER": "Jeremiah",
  "LAM": "Lamentations", "EZK": "Ezekiel", "DAN": "Daniel", "HOS": "Hosea", "JOL": "Joel",
  "AMO": "Amos", "OBA": "Obadiah", "JON": "Jonah", "MIC": "Micah", "NAM": "Nahum",
  "HAB": "Habakkuk", "ZEP": "Zephaniah", "HAG": "Haggai", "ZEC": "Zechariah", "MAL": "Malachi",
  "MAT": "Matthew", "MRK": "Mark", "LUK": "Luke", "JHN": "John", "ACT": "Acts", "ROM": "Romans",
  "1CO": "1 Corinthians", "2CO": "2 Corinthians", "GAL": "Galatians", "EPH": "Ephesians",
  "PHP": "Philippians", "COL": "Colossians", "1TH": "1 Thessalonians", "2TH": "2 Thessalonians",
  "1TI": "1 Timothy", "2TI": "2 Timothy", "TIT": "Titus", "PHM": "Philemon", "HEB": "Hebrews",
  "JAS": "James", "1PE": "1 Peter", "2PE": "2 Peter", "1JN": "1 John", "2JN": "2 John",
  "3JN": "3 John", "JUD": "Jude", "REV": "Revelation",
};

interface VerseReference {
  bookName: string;
  bookAbbreviation: string;
  chapter: number;
  verse: number;
}

const verseReferenceSchema = {
  type: Type.OBJECT,
  properties: {
    references: {
      type: Type.ARRAY,
      description: "A list of relevant Bible verse references.",
      items: {
        type: Type.OBJECT,
        properties: {
          bookName: {
            type: Type.STRING,
            description: "Full name of the Bible book in Ukrainian, e.g., 'Буття', 'Івана'."
          },
          bookAbbreviation: {
            type: Type.STRING,
            description: "Standard 3-letter Bible book abbreviation, e.g., 'GEN', 'JHN'."
          },
          chapter: {
            type: Type.INTEGER,
            description: "The chapter number."
          },
          verse: {
            type: Type.INTEGER,
            description: "The verse number."
          }
        },
        required: ['bookName', 'bookAbbreviation', 'chapter', 'verse']
      }
    }
  },
  required: ['references']
};

export const findVersesByTopic = async (topic: string): Promise<Verse[]> => {
  try {
    // Step 1: Get structured verse references from the Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Give me a list of the top 15 most relevant Bible verse references in Ukrainian for the topic: '${topic}'. For each reference, provide the full Ukrainian book name (e.g., 'Буття', 'Івана'), the standard 3-letter book abbreviation (e.g., 'GEN', 'JHN'), the chapter number, and the verse number.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: verseReferenceSchema,
      },
    });

    if (!response.text) {
      throw new Error("Received an empty response from the Gemini API.");
    }
    
    const jsonResponse = JSON.parse(response.text);
    const references: VerseReference[] = jsonResponse?.references;

    if (!references || !Array.isArray(references) || references.length === 0) {
      console.log("No references found for the topic.");
      return [];
    }

    // Step 2: Fetch the text for each verse from the bolls.life API
    const versePromises = references.map(async (ref) => {
      try {
        const bookNumber = BIBLE_ABBREVIATION_TO_BOOK_NUMBER[ref.bookAbbreviation.toUpperCase()];
        const englishBookName = BIBLE_ABBREVIATION_TO_ENGLISH_NAME[ref.bookAbbreviation.toUpperCase()];

        if (!bookNumber || !englishBookName) {
          console.warn(`Could not find mapping for abbreviation: ${ref.bookAbbreviation}`);
          return null;
        }

        const url = `https://bolls.life/get-verse/UBIO/${bookNumber}/${ref.chapter}/${ref.verse}/`;
        const verseResponse = await fetch(url);
        
        if (!verseResponse.ok) {
          console.warn(`Failed to fetch verse for reference: ${ref.bookName} ${ref.chapter}:${ref.verse}, status: ${verseResponse.status}`);
          return null;
        }

        const verseData = await verseResponse.json();
        
        if (verseData && verseData.text) {
          return {
            reference: `${ref.bookName} ${ref.chapter}:${ref.verse}`,
            linkReference: `${englishBookName} ${ref.chapter}:${ref.verse}`,
            verse: verseData.text,
          };
        }
        return null;
      } catch (fetchError) {
        console.error(`Error fetching verse for reference: ${ref.bookName} ${ref.chapter}:${ref.verse}`, fetchError);
        return null;
      }
    });

    const settledVerses = await Promise.all(versePromises);
    const successfulVerses = settledVerses.filter(v => v !== null) as Verse[];
    
    return successfulVerses;

  } catch (error) {
    console.error("Error in findVersesByTopic:", error);
    throw new Error("Failed to process the topic request.");
  }
};
