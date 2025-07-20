import Experience from "../interfaces/Experience";
import ParseLocation from "./LocationParser";
import ParseDate from "./DateParser";
import { cleanValue } from "../utils";

export default function ParseExperience(rawExperience: any, locale: string): Experience {
    return {
        title: rawExperience.title,
        type: cleanValue(rawExperience.type, "experience"),
        company: rawExperience.company,
        description: rawExperience.description,
        location: ParseLocation(rawExperience.location, locale),
        startDate: ParseDate(rawExperience.startDate || rawExperience["start-date"], locale),
        endDate: ParseDate(rawExperience.endDate || rawExperience["end-date"], locale)
    };
}