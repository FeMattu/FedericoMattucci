import UserData from "../interfaces/UserData";
import ParseLanguage from "./LanguageParser";
import ParseExperience from "./ExperienceParser";
import ParseEducation from "./EducationParser";
import ParseSkills from "./SkillParser";
import ParseHobby from "./HobbyParser";
import ParseLocation from "./LocationParser";
import ParseContacts from "./ContactsParser";
import { TFunction } from "../../hooks/useTranslation";

export default function ParseUserData(rawData: any, t: TFunction): UserData {
    return {
        fullname: rawData.fullname,
        username: rawData.username,
        profileImageUrl: rawData.image,
        bio: rawData.bio,
        jobTitle: rawData.jobTitle,
        languages: rawData.languages.map((lang: any) => ParseLanguage(lang, t)),
        location: ParseLocation(rawData.location, t),
        contacts: ParseContacts(rawData.contacts, t),
        experiences: rawData.experiences ? rawData.experiences.map((exp: any) => ParseExperience(exp, t)) : [],
        education: ParseEducation(rawData.education, t),
        skills: rawData.skills.map((skill: any) => ParseSkills(skill, t, "skills")),
        hobbies: {
            description: rawData.hobbies.description || "",
            list: rawData.hobbies ? rawData.hobbies.map((hobby: any) => ParseHobby(hobby)) : []
        }
    };
}