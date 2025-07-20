import Location from "../interfaces/Location";
import { cleanValue } from "../utils";

export default function ParseLocation(rawLocation: any, locale: string): Location {
    return {
        region: cleanValue(rawLocation.region, "location"),
        city: cleanValue(rawLocation.city, "location"),
        country: cleanValue(rawLocation.country, "location")
    };
}