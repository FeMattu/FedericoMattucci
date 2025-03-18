import { ReactNode } from "react";
import { CiLinkedin } from "react-icons/ci";
import { FaGithub, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaThreads, FaXTwitter } from "react-icons/fa6";
import { FiFacebook, FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { TfiLayoutWidthDefaultAlt } from "react-icons/tfi";

export default function getIcon(name: string, size: number = 24): ReactNode {
    const icons: { [key: string]: ReactNode } = {
        "default": <TfiLayoutWidthDefaultAlt size={size}/>,
        "email": <MdOutlineEmail size={size} />,
        "phone": <FiPhone size={size} />,
        "instagram": <FaInstagram size={size} />,
        "facebook": <FiFacebook size={size} />,
        "linkedin": <CiLinkedin size={size} />,
        "threads": <FaThreads size={size} />,
        "x-twitter": <FaXTwitter size={size} />,
        "whatsapp": <FaWhatsapp size={size} />,
        "github": <FaGithub size={size} />
    };

    return icons[name] || null;
};

