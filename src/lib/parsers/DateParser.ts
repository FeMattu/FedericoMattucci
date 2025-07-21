import Date from "../interfaces/Date";
import ParseTime from "./TimeParser";
import { cleanValue } from "../utils";

export default function ParseDate(rawDate: any, locale: string): Date {
    return {
        time: rawDate.time ? ParseTime(rawDate.time, locale) : { hour: 0, minute: 0, second: 0 },
        day: rawDate.day || NaN,
        weekDay: rawDate.weekDay ? cleanValue(rawDate.weekDay, "date.weekday") : undefined,
        month: cleanValue(rawDate.month, "date.month"),
        year: rawDate.year,
        present: rawDate.present || false
    };
}