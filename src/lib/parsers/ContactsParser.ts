import Contacts from "../interfaces/Contacts";
import { cleanValue } from "../utils";

export default function ParseContacts(rawContacts: any, locale: string): Contacts {
    return {
        websiteUrl: rawContacts.websiteUrl || "",
        email: rawContacts.email ? rawContacts.email.map((email: any) => ({
            type: cleanValue(email.type, "contacts.email"),
            address: email.address
        })) : [],
        phone: rawContacts.phone ? rawContacts.phone.map((phone: any) => ({
            type: cleanValue(phone.type, "contacts.phone.type"),
            scope: cleanValue(phone.scope, "contacts.phone.scope"),
            number: phone.number
        })) : [],
        social: rawContacts.social ? rawContacts.social.map((social: any) => ({
            network: cleanValue(social.name, "contacts.social"),
            link: social.link
        })) : []
    };
}