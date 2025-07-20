import Hobby from "../interfaces/Hobby";
import { cleanValue } from "../utils";

export default function ParseHobby(rawHobby: any, locale: string): Hobby {
    return {
        name: cleanValue(rawHobby.name, "hobbies"),
        description: rawHobby.description
    };
}