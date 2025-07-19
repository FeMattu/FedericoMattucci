import Logo from "../ui/logo";
import UserButton from "../UserButton";

export default function Footer() {
    return (
        <footer className="w-full flex flex-col py-4 justify-center items-center">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <div className="flex items-center gap-4">
                <Logo />
            </div>
            <UserButton />
        </div>
        <div className="w-full text-center text-sm mt-4">
            <p>© {new Date().getFullYear()} Federico Mattucci - All rights reserved</p>
        </div>
    </footer>
    );
}
