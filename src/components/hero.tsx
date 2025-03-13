import { useTranslations } from "next-intl";
import Image from "next/image";

const Hero = () => {
  const t = useTranslations();
  return (
    <section className="flex flex-col md:flex-row items-center justify-between w-full max-w-5xl mx-auto py-16 px-6">
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h1 className="text-4xl font-bold text-blue-900">Federico Mattucci</h1>
        <p className="mt-4 text-lg text-gray-900 items-center">
          {t('hero-description')}
        </p>
        <div className="mt-6 flex gap-4 justify-center md:justify-start">
          <a href="/cv.pdf" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800">
            CV
          </a>
          <a href="/portfolio" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800">
            Portfolio
          </a>
        </div>
        <div className="mt-6 flex gap-4 justify-center md:justify-start">
          <a href="#" className="text-gray-700 hover:text-black">
            <i className="fab fa-linkedin text-2xl"></i>
          </a>
          <a href="#" className="text-gray-700 hover:text-black">
            <i className="fab fa-instagram text-2xl"></i>
          </a>
          <a href="#" className="text-gray-700 hover:text-black">
            <i className="fab fa-facebook text-2xl"></i>
          </a>
        </div>
      </div>

      <div className="relative w-full md:w-3/4 h-screen">
        <Image 
          src="/images/homepage/entire.jpg" 
          alt="Federico Mattucci" 
          fill
          className="rounded-2xl object-cover"
        />
      </div>
    </section>
  );
};

export default Hero;
