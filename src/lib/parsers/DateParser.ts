import Date from "../interfaces/Date";
import ParseTime from "./TimeParser";
import { cleanValue } from "../utils";
import { TFunction } from "../../hooks/useTranslation";

export default function ParseDate(rawDate: any, t: TFunction): Date {
    return {
        time: rawDate.time ? ParseTime(rawDate.time) : { hour: 0, minute: 0, second: 0 },
        day: rawDate.day || NaN,
        weekDay: rawDate.weekDay ? cleanValue(t, rawDate.weekDay, "date.weekday") : undefined,
        month: cleanValue(t, rawDate.month, "date.month"),
        year: rawDate.year,
        present: rawDate.present || false
    };
}