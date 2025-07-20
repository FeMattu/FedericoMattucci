export default interface Contacts {
  websiteUrl: string
  email: Array<{
    type: string
    address: string
  }>
  phone: Array<{
    type: string
    number: string
  }>
  social: Array<{
    network: string
    link: string
  }>
}