import Date from "./Date"
import Location from "./Location"

export interface Studies {
  name: string
  title: string
  institution: string
  description: string
  location: Location
  startDate: Date
  endDate: Date
}

export interface Course {
  name: string
  description: string
  institution: string
  location: Location
  startDate: Date
  endDate: Date
}

export interface Certification {
  title: string
  issueBy: string
  description: string
  id: string
  url: string
  issueDate: Date
  expirationDate: Date
  validity: string
  valid: boolean
}

export interface Degree {
  title: string
  type: string
  institution: string
  description: string
  grade: string
  date: Date
}

export default interface Education {
  studies: Array<Studies>
  courses: Array<Course>
  certifications: Array<Certification>
  degrees: Array<Degree>
}