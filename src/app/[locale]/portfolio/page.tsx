"use client";

import Gallery from "@/components/Gallery";
import { useTranslation } from "@/lib/translation";

export default function Portfolio() {
    const t = useTranslation();
    
    return (
        <div className="flex w-full mx-auto min-h-screen justify-center px-6">
            <div className="flex flex-col items-center w-full pt-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
                        {t('pages.portfolio')}
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
                        {t('pages.portfolio.description')}
                    </p>
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
                            {t('hobby.photography')}
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                            {t('pages.portfolio.photography-description')}
                        </p>
                    </div>
                </div>
                <Gallery path={"portfolio"}/>                
            </div>
        </div>
    );
}
