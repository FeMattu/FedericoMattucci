"use client";

import Gallery from "@/components/Gallery";
import { useTranslations } from "next-intl";

export default function Portfolio() {
    return (
        <div className="flex w-full mx-auto min-h-screen justify-center px-6">
            <div className="flex flex-col items-center w-full">
                <Gallery path={"portfolio"} />                
            </div>
        </div>
    );
}
