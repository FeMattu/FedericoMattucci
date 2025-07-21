import Contacts from "./Contacts"
import Education from "./Education"
import Experience from "./Experience"
import Hobby from "./Hobby"
import Language from "./Language"
import Location from "./Location"
import Skill from "./Skill"

export default interface UserData {
  fullname: string
  username: string
  profileImageUrl: string
  bio: string
  jobTitle: string
  languages: Array<Language>
  location: Location
  contacts: Contacts
  experiences: Array<Experience>
  education: Education
  skills: Array<Skill>
  hobbies: {
    description?: string,
    list: Array<Hobby>
  }
}