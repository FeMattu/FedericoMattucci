import Image from 'next/image';
import Hobbie from '../interfaces/HobbieInterface';
import { useTranslations } from 'next-intl';

export default function HobbieCard({ hobbie }: { hobbie: Hobbie }) {
    const t = useTranslations();
    return (
        <div className="flex flex-col items-center justify-start gap-4 bg-gray-100 dark:bg-black p-4 rounded-lg shadow-md dark:shadow-0">
            {hobbie.image != undefined ? <Image
                src={hobbie.image || ''}
                alt={hobbie.name}
                width={60}
                height={60}
                className="rounded-full object-top object-cover border border-gray-300 dark:border-gray-700 aspect-square overflow-hidden"
            />: null}
            <div className='flex items-center justify-start gap-4'>
                <h1 className='text-2xl font-bold'>
                    {t(hobbie.name)}
                </h1>
            </div>
            <p className="text-lg">{t(hobbie.description)}</p>
        </div>
    );
}