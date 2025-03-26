"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import S3Image from "./s3image";

export default function Portfolio() {
    const t = useTranslations();

    return (
        <div className="flex w-full mx-auto min-h-screen justify-center px-6">
            <div className="flex flex-col items-center max-w-7xl w-full">
                <div className="text-center mb-8">
                    <h1 className="mt-10 text-4xl">Portfolio</h1>
                    <p>{t("portfolio-photography-description")}</p>
                </div>

                <Suspense fallback={<p className="text-center">Caricamento immagini...</p>}>
                    <S3Image
                    keyS3="portfolio/street-photography/ferrari.jpg"
                    alt="Ferrari"
                    className="w-full max-w-md"
                    />
                </Suspense>
            </div>
        </div>
    );
}
