import Time from "./Time"

export default interface Date {
  time?: Time
  day?: number
  weekDay?: string
  month: string
  year: number
  present?: boolean
}