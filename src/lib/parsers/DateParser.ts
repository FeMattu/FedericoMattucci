import Date from "../interfaces/Date";
import ParseTime from "./TimeParser";
import { cleanValue } from "../utils/utils";
import { TFunction } from "../../hooks/useTranslationsSafe";

export default function ParseDate(rawDate: Date, t: TFunction): Date {
    return {
        time: rawDate.time ? ParseTime(rawDate.time) : { hour: 0, minute: 0, second: 0 },
        day: rawDate.day || undefined,
        weekDay: rawDate.weekDay ? cleanValue(t, rawDate.weekDay, "date.weekDay") : undefined,
        month: cleanValue(t, rawDate.month, "date.month"),
        year: rawDate.year,
        present: rawDate.present || false
    };
}