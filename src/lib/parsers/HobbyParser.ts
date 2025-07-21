import Hobby from "../interfaces/Hobby";
import { cleanValue } from "../utils";

export default function ParseHobby(rawHobby: any, locale: string): Hobby {
    return {
        name: rawHobby.name,
        description: rawHobby.description,
        link: rawHobby.link || ""
    };
}