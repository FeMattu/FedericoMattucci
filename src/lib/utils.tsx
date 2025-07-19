import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { useTranslation } from "./translation"
import { useLocale } from "next-intl"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Interface for user data structure.
 * Contains all user information including profile data, education, skills, etc.
 */

export interface UserData {
  fullname: string
  username: string
  image: string
  bio: string
  "job-title": string
  languages: {
    it: string
    en: string
  }
  location: {
    city: string
    region: string
    country: string
  }
  contacts: {
    email: {
      personal: string
      institutional: string
      work: string
    }
    phone: {
      number: string
      type: string
    }
  }
  social: {
    instagram: string
    facebook: string
    linkedin: string
    whatsapp: string
    github: string
  }
  jobs: Array<{
    title: string
    type: string
    company: string
    description: string
    location: {
      city: string
      country: string
    }
    "start-date": {
      month: string
      year: number
    }
    "end-date": {
      month: string
      year: number
      present?: boolean
    }
  }>
  education: {
    studies: Array<{
      title: string
      name: string
      istitution: string
      description: string
      grade: string
      location: {
        city: string
        country: string
      }
      "start-date": {
        month: string
        year: number
      }
      "end-date": {
        month: string
        year: number
        present?: boolean
      }
    }>
  }
  skills: Array<{
    name: string
    "front-end"?: {
      title: string
      list: Array<{
        name: string
        level: string
        list?: Array<{
          name: string
          level: string
        }>
      }>
    }
    "back-end"?: {
      title: string
      list: Array<{
        name: string
        level: string
        list?: Array<{
          name: string
          level: string
          list?: Array<{
            name: string
            level: string
            list?: Array<{
              name: string
              level: string
            }>
          }>
        }>
      }>
    }
    mobile?: {
      title: string
      list: Array<{
        name: string
        level: string
      }>
    }
    list?: Array<{
      name: string
      level?: string
      list?: Array<{
        name: string
        level?: string
        list?: Array<{
          name: string
          level: string
        }>
      }>
    }>
  }>
  hobbies: Array<{
    name: string
    description: string
    link?: string
  }>
}

/**
 * React hook to fetch and translate user data from profile JSON files.
 * Automatically translates values that match the _key_ pattern using the translation system.
 * 
 * @returns UserData object with translated values or null if loading/error
 * 
 * @example
 * ```tsx
 * const UserProfile = () => {
 *   const userData = useUserData()
 *   
 *   if (!userData) return <div>Loading...</div>
 *   
 *   return <div>{userData.fullname}</div>
 * }
 * ```
 */

export function useUserData(): UserData | null {
  const t = useTranslation()
  const locale = useLocale()
  
  const [userData, setUserData] = React.useState<UserData | null>(null)
  
  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/data/profile/${locale}.json`)
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        
        const rawData = await response.json()
        
        // Function to recursively translate values that match _key_ pattern
        const translateValue = (value: any): any => {
          if (typeof value === 'string' && value.startsWith('_') && value.endsWith('_')) {
            const key = value.slice(1, -1) // Remove underscores
            return t(key)
          } else if (Array.isArray(value)) {
            return value.map(translateValue)
          } else if (typeof value === 'object' && value !== null) {
            const translatedObj: any = {}
            for (const [k, v] of Object.entries(value)) {
              translatedObj[k] = translateValue(v)
            }
            return translatedObj
          }
          return value
        }
        
        const translatedData = translateValue(rawData)
        setUserData(translatedData as UserData)
        
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUserData(null)
      }
    }
    
    fetchUserData()
  }, [locale, t])
  
  return userData
}

/**
 * Async function to fetch and translate user data from profile JSON files.
 * Requires locale and translation function to be passed as parameters.
 * 
 * @param locale - The locale to use for fetching the correct profile file (e.g., 'it', 'en')
 * @param t - Translation function from useTranslation hook
 * @returns Promise<UserData | null> - User data with translated values or null if error
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const t = useTranslation()
 *   const locale = useLocale()
 *   
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       const userData = await getUserData(locale, t)
 *       console.log(userData?.fullname)
 *     }
 *     fetchData()
 *   }, [locale, t])
 * }
 * ```
 */

export async function getUserData(locale: string, t: (key: string) => string): Promise<UserData | null> {
  try {
    const response = await fetch(`/data/profile/${locale}.json`)
    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }
    
    const rawData = await response.json()
    
    // Function to recursively translate values that match _key_ pattern
    const translateValue = (value: any): any => {
      if (typeof value === 'string' && value.startsWith('_') && value.endsWith('_')) {
        const key = value.slice(1, -1) // Remove underscores
        return t(key)
      } else if (Array.isArray(value)) {
        return value.map(translateValue)
      } else if (typeof value === 'object' && value !== null) {
        const translatedObj: any = {}
        for (const [k, v] of Object.entries(value)) {
          translatedObj[k] = translateValue(v)
        }
        return translatedObj
      }
      return value
    }
    
    const translatedData = translateValue(rawData)
    return translatedData as UserData
    
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}