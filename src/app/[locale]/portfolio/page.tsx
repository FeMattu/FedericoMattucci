"use client";

import Gallery from "@/components/Gallery";
import { useTranslations } from "next-intl";

export default function Portfolio() {
    const t = useTranslations();

    return (
        <div className="flex w-full mx-auto min-h-screen justify-center px-6">
            <div className="flex flex-col items-center w-full">
                <div className="text-center mb-8 max-w-7xl">
                    <h1 className="mt-10 mb-10 text-4xl">{t("portfolio")}</h1>
                    <p className="max-w-4xl">{t("portfolio-photography-description")}</p>
                </div>
                <Gallery path={"portfolio"} />                
            </div>
        </div>
    );
}
