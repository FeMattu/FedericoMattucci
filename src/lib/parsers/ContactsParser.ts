import Contacts from "../interfaces/Contacts";
import { cleanValue } from "../utils";
import { TFunction } from "../../hooks/useTranslation";

export default function ParseContacts(rawContacts: any, t: TFunction): Contacts {
    return {
        websiteUrl: rawContacts.websiteUrl || "",
        email: rawContacts.email ? rawContacts.email.map((email: any) => ({
            type: cleanValue(t, email.type, "contacts.email"),
            address: email.address
        })) : [],
        phone: rawContacts.phone ? rawContacts.phone.map((phone: any) => ({
            type: cleanValue(t, phone.type, "contacts.phone.type"),
            scope: cleanValue(t, phone.scope, "contacts.phone.scope"),
            number: phone.number
        })) : [],
        social: rawContacts.social ? rawContacts.social.map((social: any) => ({
            network: cleanValue(t, social.name, "contacts.social"),
            link: social.link
        })) : []
    };
}