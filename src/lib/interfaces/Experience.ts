import Location from "./Location"
import Date from "./Date"

export default interface Experience {
  title: string
  type: string
  company: string
  description: string
  location: Location
  startDate: Date
  endDate: Date
}