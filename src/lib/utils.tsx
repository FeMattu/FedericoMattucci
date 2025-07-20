import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import UserData from "./interfaces/UserData"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserData(){
  /* TODO: Chiamare ParseUserData per effettuare il parsing dei dati del JSON in base alla lingua 
     Utilizzando useTransaltion dal file transaltion.ts per effettuare le traduzioni necessarie
  */
}

