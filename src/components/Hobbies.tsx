import HobbieInterface from "@/interfaces/HobbieInterface";
import HobbieCard from "./HobbieCard";
import fs from "fs/promises";

export async function getHobbiesFromFile(filePath: string) {
    try {
        const jsonData = await fs.readFile(filePath, "utf-8");
        const hobbies: HobbieInterface = JSON.parse(jsonData);
        return hobbies;
    } catch (error) {
        console.error("Errore nel caricamento degli hobby:", error);
        return { defaultHobby: { title: '', description: '', image: '' } } as unknown as HobbieInterface;
    }
}


export default async function Hobbies({ JSONfile, className }: { JSONfile: string, className?: string }) {
    const hobbies: HobbieInterface = (await getHobbiesFromFile(JSONfile));
    return (
        <div className={`grid grid-cols-2 justify-center gap-4 mt-4 ${className}`}>
            {Object.entries(hobbies).map(([hobbie, hobbieInfo]: [string, Record<string, string>]) => (
                <HobbieCard hobbie={{ name: hobbieInfo.title, description: hobbieInfo.description, image: hobbieInfo.image }} key={hobbie} />
            ))}
        </div>
    );
}
