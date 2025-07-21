import Location from "../interfaces/Location";
import { cleanValue } from "../utils";
import { TFunction } from "../../hooks/useTranslation";

export default function ParseLocation(rawLocation: any, t: TFunction): Location {
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
        region: cleanValue(t, rawLocation.region, "location.region"),
        city: cleanValue(t, rawLocation.city, "location.city"),
        country: cleanValue(t, rawLocation.country, "location.country"),
        continent: rawLocation.continent ? cleanValue(t, rawLocation.continent, "location.continent") : ""
    };
}