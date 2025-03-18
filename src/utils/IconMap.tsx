import { ReactNode } from "react";
import { CiLinkedin } from "react-icons/ci";
import { FaGithub, FaInstagram, FaRegMoon, FaWhatsapp } from "react-icons/fa";
import { FaEarthEurope, FaThreads, FaXTwitter } from "react-icons/fa6";
import { FiArrowUpRight, FiFacebook, FiPhone } from "react-icons/fi";
import { IoSunnyOutline } from "react-icons/io5";
import { MdOutlineEmail } from "react-icons/md";
import { TfiLayoutWidthDefaultAlt } from "react-icons/tfi";

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
        "sun": <IoSunnyOutline size={size} className={className}/>
    };

    return icons[name] || null;
};

