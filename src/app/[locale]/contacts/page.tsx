"use client"

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import SocialButton from "@/components/SocialButton";
import getIcon from "@/lib/IconMap";

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
        <div className="flex flex-col gap-2 items-center">
            {Object.entries(contacts.email).map(([emailType, emailValue]) => (
                <Contact
                    key={emailType}
                    href={`mailto:${emailValue}`}
                    type={emailType}
                    icon={getIcon("email", 24)}
                    contact={emailValue}
                />
            ))}
            {contacts.phone && (
                <Contact
                    href={`tel:${contacts.phone}`}
                    type="phone"
                    icon={getIcon("phone", 24)}
                    contact={contacts.phone}
                />
            )}
        </div>
    );
}

function SocialLinks() {
    const [socials, setSocials] = useState<{ [key: string]: string }>({});
    const t = useTranslations();

    useEffect(() => {
        fetch("/data/contacts.json")
            .then((res) => res.json())
            .then((data) => setSocials(data.social))
            .catch((err) => console.error("Errore nel caricamento dei social:", err));
    }, []);

    return (
        <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(socials).map(([platform, link]) =>
                link ? (
                    <SocialButton key={platform} href={link}>
                        {getIcon(platform, 24) || getIcon("default", 24)} 
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
        <div className="min-h-screen px-6 py-10 flex flex-col sm:flex-row items-center justify-center gap-16 sm:gap-20 text-center sm:text-center">
            <div className="flex flex-col items-center gap-4 max-w-lg">
                <h1 className="text-4xl font-bold">{t("contact")}</h1>
                <ContactList />
            </div>
            <div className="flex flex-col items-center gap-4 max-w-lg">
                <h1 className="text-4xl font-bold">{t("social-media")}</h1>
                <SocialLinks />
            </div>
        </div>
    );
}
