"use client"

import { Link } from "@/i18n/navigation";
import { useTranslation } from "@/lib/translation";
import { getUserData } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import SocialButton from "@/components/SocialButton";
import getIcon from "@/lib/IconMap";
import UserData from "@/lib/interfaces/UserData";
import { useParams } from "next/navigation";

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
    const t = useTranslation();
    const params = useParams();
    const locale = params.locale as string || "it";
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getUserData(locale);
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, [locale]);

    if (loading || !userData) {
        return (
            <div className="flex flex-col gap-2 items-center">
                <p className="text-[var(--text-secondary)]">{t('loading.user-info')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 items-center">
            {userData.contacts.email.map((email, index) => (
                <Contact
                    key={`email-${index}`}
                    href={`mailto:${email.address}`}
                    type={`contatti.email.${email.type.toLowerCase()}`}
                    icon={getIcon("email", 24)}
                    contact={email.address}
                />
            ))}
            {userData.contacts.phone.map((phone, index) => (
                <Contact
                    key={`phone-${index}`}
                    href={`tel:${phone.number}`}
                    type="contatti.phone"
                    icon={getIcon("phone", 24)}
                    contact={`${phone.number} (${phone.type})`}
                />
            ))}
        </div>
    );
}

function SocialLinks() {
    const t = useTranslation();
    const params = useParams();
    const locale = params.locale as string || "it";
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getUserData(locale);
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, [locale]);

    if (loading || !userData) {
        return (
            <div className="flex flex-wrap gap-4 justify-center">
                <p className="text-[var(--text-secondary)]">{t('loading.user-info')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-4 justify-center">
            {userData.contacts.social.map((social, index) => (
                <SocialButton key={`${social.network}-${index}`} href={social.link}>
                    {getIcon(social.network.toLowerCase(), 24) || getIcon("default", 24)} 
                    <p>{t(`contatti.social.${social.network.toLowerCase()}`)}</p>
                </SocialButton>
            ))}
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
