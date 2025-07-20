import Language from "../interfaces/Language";
import { cleanValue } from "../utils";

export default function ParseLanguage(rawLanguage: any, locale: string): Language {
    return {
        language: cleanValue(rawLanguage.language, "language"),
        level: cleanValue(rawLanguage.level, "level")
    };
}