import UserData from "../interfaces/UserData";
import ParseLanguage from "./LanguageParser";
import ParseExperience from "./ExperienceParser";
import ParseEducation from "./EducationParser";
import ParseSkills from "./SkillParser";
import ParseHobby from "./HobbyParser";
import ParseLocation from "./LocationParser";
import ParseContacts from "./ContactsParser";

export default function ParseUserData(rawData: any, locale: string): UserData {
    return {
        fullname: rawData.fullname,
        username: rawData.username,
        profileImageUrl: rawData.image,
        bio: rawData.bio,
        jobTitle: rawData.jobTitle,
        languages: rawData.languages.map((lang: any) => ParseLanguage(lang, locale)),
        location: ParseLocation(rawData.location, locale),
        contacts: ParseContacts(rawData.contacts, locale),
        experiences: rawData.experiences ? rawData.experiences.map((exp: any) => ParseExperience(exp, locale)) : [],
        education: ParseEducation(rawData.education, locale),
        skills: rawData.skills.map((skill: any) => ParseSkills(skill, locale, "skills")),
        hobbies: {
            name: rawData.hobbies?.name || "Hobbies",
            description: rawData.hobbies?.description || "I miei hobby e interessi personali.",
            list: rawData.hobbies ? rawData.hobbies.map((hobby: any) => ParseHobby(hobby, locale)) : []
        }
    };
}