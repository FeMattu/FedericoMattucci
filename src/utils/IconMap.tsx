import { Mail, Phone, Instagram, Facebook, Linkedin, Twitter, MessageCircle, Github } from "lucide-react";
import { ReactNode } from "react";

const iconsMap: { [key: string]: ReactNode } = {
    "email": <Mail />,
    "phone": <Phone />,
    "instagram": <Instagram />,
    "facebook": <Facebook />,
    "linkedin": <Linkedin />,
    "threads": <MessageCircle />,
    "x-twitter": <Twitter />,
    "whatsapp": <MessageCircle />,
    "github": <Github />
};

export default iconsMap;
