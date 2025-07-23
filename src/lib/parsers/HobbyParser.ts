import Hobby from "../interfaces/Hobby";

export default function ParseHobby(rawHobby: Hobby): Hobby {
    return {
        name: rawHobby.name,
        description: rawHobby.description,
        link: rawHobby.link || ""
    };
}