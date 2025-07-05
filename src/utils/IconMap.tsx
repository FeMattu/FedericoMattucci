import { ReactNode } from "react";
import { CiLinkedin } from "react-icons/ci";
import { FaCamera, FaGithub, FaInstagram, FaLocationArrow, FaRegMoon, FaWhatsapp } from "react-icons/fa";
import { FaEarthEurope, FaThreads, FaXTwitter } from "react-icons/fa6";
import { FiAperture, FiArrowUpRight, FiFacebook, FiPhone } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { IoSunnyOutline } from "react-icons/io5";
import { MdOutlineAspectRatio, MdOutlineEmail, MdOutlineIso, MdOutlineShutterSpeed } from "react-icons/md";
import { RiMenu3Fill } from "react-icons/ri";
import { TfiLayoutWidthDefaultAlt } from "react-icons/tfi";
import { LuCalendar1 } from "react-icons/lu";
import { TiFlashOutline } from "react-icons/ti";

/**
 * Funzione per ottenere un'icona in base al nome:
 * * default
 * * email
 * * phone
 * * instagram
 * * facebook
 * * linkedin
 * * threads
 * * x-twitter
 * * whatsapp
 * * github
 * * earth
 * * arrow-up-right
 * * moon
 * * sun
 * * menu-mobile
 * * close-menu-mobile
 * * aperture
 * * shutter-speed
 * * focal-lenght
 * * camera
 * * lens
 * * date
 * * location
 * * ratio
 * * iso
 * * flash
 * * dpi

 * @param name 
 * @param size 
 * @param className 
 * @returns 
 */
export default function getIcon(name: string, size: number = 24, className?:string): ReactNode {
    const icons: { [key: string]: ReactNode } = {
        "default": <TfiLayoutWidthDefaultAlt size={size} className={className}/>,
        "email": <MdOutlineEmail size={size} className={className}/>,
        "phone": <FiPhone size={size} className={className}/>,
        "instagram": <FaInstagram size={size} className={className}/>,
        "facebook": <FiFacebook size={size} className={className}/>,
        "linkedin": <CiLinkedin size={size} className={className}/>,
        "threads": <FaThreads size={size} className={className}/>,
        "x-twitter": <FaXTwitter size={size} className={className}/>,
        "whatsapp": <FaWhatsapp size={size} className={className}/>,
        "github": <FaGithub size={size} className={className}/>,
        "earth": <FaEarthEurope size={size} className={className}/>,
        "arrow-up-right": <FiArrowUpRight size={size} className={className}/>,
        "moon": <FaRegMoon size={size} className={className}/>,
        "sun": <IoSunnyOutline size={size} className={className}/>,
        "menu-mobile": <RiMenu3Fill size={size} className={className}/>,
        "close-menu-mobile": <IoMdClose size={size} className={className}/>,
        "aperture": <FiAperture size={size} className={className}/>,
        "shutter-speed": <MdOutlineShutterSpeed size={size} className={className}/>,
        "focal-lenght": <FocalLengthIcon size={size} className={className}/>,
        "camera": <FaCamera size={size} className={className}/>,
        "lens": <LensIcon size={size} className={className}/>,
        "date": <LuCalendar1 size={size} className={className}/>,
        "location": <FaLocationArrow size={size} className={className}/>,
        "ratio": <MdOutlineAspectRatio size={size} className={className}/>,
        "iso": <MdOutlineIso size={size} className={className}/>,
        "flash": <TiFlashOutline size={size} className={className}/>,
        "dpi": <DPIIcon size={size} className={className} />,
    };

    return icons[name] || null;
};

interface IconProps {
    size?: number;
    className?: string;
}

const FocalLengthIcon: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg 
        viewBox="0 0 64 64"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="4" />
      <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M5 32h10m34 0h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 28l-5 4 5 4M52 28l5 4-5 4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
);

const LensIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer lens body */}
    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" />
    
    {/* Inner rings */}
    <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" />
    <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="2" />

    {/* Aperture blades */}
    <path d="M32 12 L36 32 L32 52 L28 32 Z" fill="currentColor" opacity="0.3" />
    <path d="M20 20 L32 32 L44 20" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    <path d="M20 44 L32 32 L44 44" stroke="currentColor" strokeWidth="2" opacity="0.5" />
  </svg>
);

const DPIIcon: React.FC<IconProps> = ({ size = 24, className }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rettangolo di contorno */}
      <rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" strokeWidth="4" />
  
      {/* Griglia di punti */}
      {[...Array(3)].map((_, row) =>
        [...Array(3)].map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={20 + col * 12}
            cy={20 + row * 12}
            r="2"
            fill="currentColor"
          />
        ))
      )}
    </svg>
);
  

