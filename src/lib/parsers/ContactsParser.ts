import Contacts from "../interfaces/Contacts";
import { cleanValue } from "../utils";
import { TFunction } from "../../hooks/useTranslationsSafe";

export default function ParseContacts(rawContacts: Contacts, t: TFunction): Contacts {
    return {
        websiteUrl: rawContacts.websiteUrl || "",
        email: rawContacts.email.map((email: {type: string, address: string}) => ({
            type: cleanValue(t, email.type, "contacts.email"),
            address: email.address
        })),
        phone: rawContacts.phone.map((phone: {type: string, scope: string, number: string}) => ({
            type: cleanValue(t, phone.type, "contacts.phone.type"),
            scope: cleanValue(t, phone.scope, "contacts.phone.scope"),
            number: phone.number
        })),
        social: rawContacts.social.map((social: {network: string, link: string}) => ({
            network: cleanValue(t, social.network, "contacts.social"),
            link: social.link
        }))
    };
}