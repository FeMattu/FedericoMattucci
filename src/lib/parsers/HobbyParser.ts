import Hobby from "../interfaces/Hobby";

export default function ParseHobby(rawHobby: any): Hobby {
    return {
        name: rawHobby.name,
        description: rawHobby.description,
        link: rawHobby.link || ""
    };
}