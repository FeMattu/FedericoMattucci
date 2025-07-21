import Location from "../interfaces/Location";
import { cleanValue } from "../utils";

export default function ParseLocation(rawLocation: any, locale: string): Location {
    return {
        coordinate: rawLocation.coordinate ? {
            longitude: rawLocation.coordinate.logitue,
            latitude: rawLocation.coordinate.latitude
        } : { longitude: "", latitude: ""},
        address: rawLocation.address ? {
            street: rawLocation.address.street,
            number: rawLocation.address.number,
            postalCode: rawLocation.address.postalCode
        } : {street: "", number: NaN, postalCode: ""},
        region: cleanValue(rawLocation.region, "location.region"),
        city: cleanValue(rawLocation.city, "location.city"),
        country: cleanValue(rawLocation.country, "location.country"),
        continent: rawLocation.continent ? cleanValue(rawLocation, "location.continent") : ""
    };
}