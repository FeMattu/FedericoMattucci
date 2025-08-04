import Language from "../interfaces/Language";
import { cleanValue } from "../utils/utils";
import { TFunction } from "../../hooks/useTranslationsSafe";

export default function ParseLanguage(rawLanguage: Language, t: TFunction): Language {
    return {
        language: cleanValue(t, rawLanguage.language, "language"),
        level: cleanValue(t, rawLanguage.level, "level")
    };
}