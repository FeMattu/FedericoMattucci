import Experience from "../interfaces/Experience";
import ParseLocation from "./LocationParser";
import ParseDate from "./DateParser";
import { cleanValue } from "../utils";
import { TFunction } from "../../hooks/useTranslationsSafe";

export default function ParseExperience(rawExperience: Experience, t: TFunction): Experience {
    return {
        title: rawExperience.title,
        type: cleanValue(t, rawExperience.type, "experience.type"),
        company: rawExperience.company,
        description: rawExperience.description,
        location: ParseLocation(rawExperience.location, t),
        startDate: ParseDate(rawExperience.startDate, t),
        endDate: ParseDate(rawExperience.endDate, t)
    };
}