import fs from "fs";
import HobbieInterface from "@/interfaces/HobbieInterface";
import HobbieCard from "./HobbieCard";

export async function getHobbiesFromFile(filePath: string) {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const hobbies: HobbieInterface = JSON.parse(jsonData);
    return {
        props: {
            hobbies,
        },
    };
}

export default async function Hobbies({ JSONfile, className }: { JSONfile: string, className?: string }) {
    const hobbies: HobbieInterface = (await getHobbiesFromFile(JSONfile)).props.hobbies;
    return (
        <div className={`grid grid-cols-2 justify-center gap-4 mt-4 ${className}`}>
            {Object.entries(hobbies).map(([hobbie, hobbieInfo]: [string, Record<string, string>]) => (
                <HobbieCard hobbie={{ name: hobbieInfo.title, description: hobbieInfo.description, image: hobbieInfo.image }} key={hobbie} />
            ))}
        </div>
    );
}
