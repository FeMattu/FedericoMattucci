"use client"

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import SocialButton from "@/components/SocialButton";
import iconsMap from "@/utils/IconMap"

function Contact({ href, type, icon, contact }: { href: string; type: string; icon: ReactNode; contact: string }) {
    const t = useTranslations();
    return (
        <Link href={href} className="flex flex-row items-center gap-2 text-lg hover:text-blue-500">
            {icon}
            <p>{t(type)}: {contact}</p>
        </Link>
    );
}

function ContactList() {
    const [contacts, setContacts] = useState<{ email: { [key: string]: string }; phone: string }>({
        email: {},
        phone: ""
    });

    useEffect(() => {
        fetch("/data/contacts.json")
            .then((res) => res.json())
            .then((data) => setContacts(data.contacts))
            .catch((err) => console.error("Errore nel caricamento dei contatti:", err));
    }, []);

    return (
        <div className="flex flex-col gap-4">
            {/* Emails */}
            {Object.entries(contacts.email).map(([emailType, emailValue]) => (
                <Contact
                    key={emailType}
                    href={`mailto:${emailValue}`}
                    type={emailType}
                    icon={iconsMap["email"]}
                    contact={emailValue}
                />
            ))}
            
            {/* Phone */}
            {contacts.phone && (
                <Contact
                    href={`tel:${contacts.phone}`}
                    type="phone"
                    icon={iconsMap["phone"]}
                    contact={contacts.phone}
                />
            )}
        </div>
    );
}

function SocialLinks() {
    const [socials, setSocials] = useState<{ [key: string]: string }>({});
    const t = useTranslations()

    useEffect(() => {
        fetch("/data/contacts.json")
            .then((res) => res.json())
            .then((data) => setSocials(data.social))
            .catch((err) => console.error("Errore nel caricamento dei social:", err));
    }, []);

    return (
        <div className="flex flex-wrap gap-4 max-w-xl justify-center">
            {Object.entries(socials).map(([platform, link]) =>
                link ? (
                    <SocialButton key={platform} href={link} >
                        {iconsMap[platform] || iconsMap["default"]}
                        <p>{t(platform)}</p>
                    </SocialButton>
                ) : null
            )}
        </div>
    );
}

export default function Contacts() {
    const t = useTranslations();
    return (
        <div className="h-screen flex flex-row gap-20 max-h-screen items-center justify-center px-6">
            <div className="flex flex-col items-center gap-6">
                <h1 className="text-4xl font-bold">{t("contact")}</h1>
                <ContactList />
            </div>
            <div className="flex flex-col items-center gap-6">
                <h1 className="text-4xl font-bold">{t("social-media")}</h1>
                <SocialLinks />
            </div>
        </div>
    );
}
