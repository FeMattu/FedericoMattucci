import Location from "../interfaces/Location";
import { cleanValue } from "../utils/utils";
import { TFunction } from "../../hooks/useTranslationsSafe";

export default function ParseLocation(rawLocation: Location, t: TFunction): Location {
    return {
        coordinate: rawLocation.coordinate ? {
            longitude: rawLocation.coordinate.longitude,
            latitude: rawLocation.coordinate.latitude
        } : { longitude: "", latitude: ""},
        address: rawLocation.address ? {
            street: rawLocation.address.street,
            number: rawLocation.address.number,
            postalCode: rawLocation.address.postalCode
        } : {street: "", number: undefined, postalCode: ""},
        region: cleanValue(t, rawLocation.region, "location.region"),
        city: cleanValue(t, rawLocation.city, "location.city"),
        country: cleanValue(t, rawLocation.country, "location.country"),
        continent: rawLocation.continent ? cleanValue(t, rawLocation.continent, "location.continent") : ""
    };
}