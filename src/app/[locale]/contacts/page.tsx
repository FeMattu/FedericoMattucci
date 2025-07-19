"use client"

import { Link } from "@/i18n/navigation";
import { useTranslation } from "@/lib/translation";
import { useUserData } from "@/lib/utils";
import { ReactNode } from "react";
import SocialButton from "@/components/SocialButton";
import getIcon from "@/lib/IconMap";

function Contact({ href, type, icon, contact }: { href: string; type: string; icon: ReactNode; contact: string }) {
    const t = useTranslation();
    return (
        <Link href={href} className="flex flex-row items-center gap-2 text-lg hover:text-blue-500">
            {icon}
            <p>{t(type)}: {contact}</p>
        </Link>
    );
}

function ContactList() {
    const userData = useUserData();
    const t = useTranslation();

    if (!userData) {
        return (
            <div className="flex flex-col gap-2 items-center">
                <p className="text-[var(--text-secondary)]">{t('loading.user-info')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 items-center">
            <Contact
                href={`mailto:${userData.contacts.email.personal}`}
                type="contatti.email.personal"
                icon={getIcon("email", 24)}
                contact={userData.contacts.email.personal}
            />
            <Contact
                href={`mailto:${userData.contacts.email.institutional}`}
                type="contatti.email.institutional"
                icon={getIcon("email", 24)}
                contact={userData.contacts.email.institutional}
            />
            <Contact
                href={`mailto:${userData.contacts.email.work}`}
                type="contatti.email.work"
                icon={getIcon("email", 24)}
                contact={userData.contacts.email.work}
            />
            <Contact
                href={`tel:${userData.contacts.phone.number}`}
                type="contatti.phone"
                icon={getIcon("phone", 24)}
                contact={`${userData.contacts.phone.number} (${userData.contacts.phone.type})`}
            />
        </div>
    );
}

function SocialLinks() {
    const userData = useUserData();
    const t = useTranslation();

    if (!userData) {
        return (
            <div className="flex flex-wrap gap-4 justify-center">
                <p className="text-[var(--text-secondary)]">{t('loading.user-info')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(userData.social).map(([platform, link]) =>
                link ? (
                    <SocialButton key={platform} href={link}>
                        {getIcon(platform, 24) || getIcon("default", 24)} 
                        <p>{t(`contatti.social.${platform}`)}</p>
                    </SocialButton>
                ) : null
            )}
        </div>
    );
}

export default function Contacts() {
    const t = useTranslation();
    return (
        <div className="min-h-screen px-6 py-10 flex flex-col sm:flex-row items-center justify-center gap-16 sm:gap-20 text-center sm:text-center">
            <div className="flex flex-col items-center gap-4 max-w-lg">
                <h1 className="text-4xl font-bold">{t("pages.contact")}</h1>
                <p className="text-lg text-[var(--text-secondary)] mb-4">
                    {t('pages.contact.description')}
                </p>
                <ContactList />
            </div>
            <div className="flex flex-col items-center gap-4 max-w-lg">
                <h1 className="text-4xl font-bold">{t("contatti.social")}</h1>
                <SocialLinks />
            </div>
        </div>
    );
}
