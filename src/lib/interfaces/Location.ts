export default interface Location {
  coordinate?: {
    latitude: string
    longitude: string
  }
  address?: {
    street: string
    number: number
    postalCode: string
  }
  city: string
  region: string
  country: string
  continent: string
}