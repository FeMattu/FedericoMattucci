import Language from "../interfaces/Language";
import { cleanValue } from "../utils";
import { TFunction } from "../../hooks/useTranslation";

export default function ParseLanguage(rawLanguage: any, t: TFunction): Language {
    return {
        language: cleanValue(t, rawLanguage.language, "language"),
        level: cleanValue(t, rawLanguage.level, "level")
    };
}