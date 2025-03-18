import { Link } from "@/i18n/navigation";

export default function SocialButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 dark:border-gray-600 rounded-2xl text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all w-fit"
    >
      {children}
    </Link>
  );
}