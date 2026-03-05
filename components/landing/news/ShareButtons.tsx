import {
    FaTelegramPlane,
    FaDiscord,
    FaFacebook,
    FaInstagram,
    FaTwitter,
} from "react-icons/fa";

interface ShareButtonsProps {
    url: string;
    title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {

    const shareLinks = [
        {
            name: "Telegram",
            icon: <FaTelegramPlane className="w-5 h-5 text-[#2E90FA]" />,
            href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        },
        {
            name: "Discord",
            icon: <FaDiscord className="w-5 h-5 text-[#2E90FA]" />,
            href: "javascript:void(0)",
        },
        {
            name: "Facebook",
            icon: <FaFacebook className="w-5 h-5 text-[#2E90FA]" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        },
        {
            name: "Instagram",
            icon: <FaInstagram className="w-5 h-5 text-[#2E90FA]" />,
            href: "https://www.instagram.com",
        },
        {
            name: "Twitter",
            icon: <FaTwitter className="w-5 h-5 text-[#2E90FA]" />,
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        },
    ];

    return (
        <div className="flex items-center gap-4">
            <span className="text-gray-500 font-medium">Share on:</span>

            <div className="flex items-center gap-2">
                {shareLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full 
                                   bg-white border border-gray-200 
                                   hover:bg-gray-100 transition-colors"
                        aria-label={`Share on ${link.name}`}
                    >
                        {link.icon}
                    </a>
                ))}
            </div>
        </div>
    );
}
