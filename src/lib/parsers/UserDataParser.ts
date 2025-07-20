import UserData from "../interfaces/UserData";
import ParseLanguage from "./LanguageParser";
import ParseExperience from "./ExperienceParser";
import ParseEducation from "./EducationParser";
import ParseSkills from "./SkillParser";
import ParseHobby from "./HobbyParser";


export default function ParseUserData(){
    /*
    TODO: Parser delli dati dell utente dai file presenti in public/data/profile , questi si devono basare anche su locale per determinare la ligngua da usare
    per la visulizzazione dle testo.

    nel file JSON sono presenti dei campi il cui valore è tra underscore (_) ad esempio "_aws_" questo significa che il valore deve essere recuperato dal file di traduzione languages/[locale].json 
    (ci pensa gia la funzione di traduzione presente nel file transaltion), ma quello che deve essere fatto all'interno di ogni parser dedicato ad un interfaccia è quello di estrarre solo il testo 
    senza gli undercaorse per passarlo alla funzione di traduzione
    */

    /*

    */
}