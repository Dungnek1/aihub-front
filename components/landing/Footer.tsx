import Link from "next/link";
import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaTelegramPlane,
    FaDiscord,
} from "react-icons/fa";

export default function LandingFooter() {
    return (
        <footer className="relative z-20 w-full bg-white mt-auto text-gray-900 border-t border-gray-200">
            <div className="px-4 sm:px-8 w-full pt-6 pb-6">
                {/* Top Section */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
                    {/* Left Column - Branding */}
                    <div className="flex flex-col items-center sm:items-start justify-between self-stretch w-full sm:w-[360px] gap-6">
                        {/* Logo */}
                        <div className="flex items-center justify-center sm:justify-start gap-3 w-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="158"
                                height="36"
                                viewBox="0 0 158 36"
                                fill="none"
                                className="h-8 w-auto"
                            >
                                <path
                                    d="M62.978 24.8386H59.4653L63.1252 14.1903C63.2799 13.7337 63.5523 13.3508 63.95 13.0194C64.3477 12.6954 64.7895 12.526 65.2829 12.526H74.0387V24.8312H70.7175V20.7884H64.3771L62.978 24.8312V24.8386ZM65.4891 17.6219H70.7175V15.6925H66.4906C66.3801 15.6925 66.2697 15.7588 66.1666 15.8987C66.0635 16.0386 66.0119 16.1417 65.9972 16.2227L65.4891 17.6219Z"
                                    fill="#000000"
                                />
                                <path
                                    d="M84.348 15.6999H81.5939V21.6648H84.348V24.8386H75.5112V21.6648H78.2654V15.6999H75.5112V12.5261H84.348V15.6999Z"
                                    fill="#000000"
                                />
                                <path
                                    d="M101.227 24.8387V20.2362H94.5843V24.8387H91.2632V12.5334H94.5843V17.0623H101.227V12.5334H104.548V24.8387H101.227Z"
                                    fill="#000000"
                                />
                                <path
                                    d="M115.991 12.5261H119.313V21.6427C119.313 22.0182 119.209 22.4012 119.011 22.7767C118.812 23.1523 118.554 23.491 118.237 23.793C117.921 24.0949 117.575 24.3453 117.192 24.5367C116.809 24.7282 116.433 24.8313 116.065 24.8313H109.268C108.9 24.8313 108.532 24.7355 108.141 24.5367C107.751 24.3379 107.405 24.0949 107.096 23.793C106.786 23.491 106.521 23.1523 106.322 22.7767C106.124 22.4012 106.021 22.0182 106.021 21.6427V12.5261H109.342V20.9799C109.342 21.083 109.371 21.1714 109.437 21.2597C109.496 21.3481 109.577 21.4218 109.673 21.4733C109.769 21.5322 109.865 21.5764 109.968 21.6059C110.071 21.6353 110.159 21.65 110.247 21.65H115.078C115.167 21.65 115.262 21.6353 115.358 21.6059C115.461 21.5764 115.557 21.5322 115.653 21.4733C115.748 21.4144 115.829 21.3408 115.888 21.2597C115.955 21.1714 115.984 21.0756 115.984 20.9799V12.5261H115.991Z"
                                    fill="#000000"
                                />
                                <path
                                    d="M134.077 21.6427C134.077 22.0182 133.974 22.4012 133.775 22.7767C133.576 23.1523 133.319 23.491 133.002 23.793C132.685 24.0949 132.339 24.3453 131.956 24.5367C131.573 24.7282 131.198 24.8313 130.83 24.8313H120.785V12.5261H130.83C131.198 12.5261 131.566 12.6218 131.956 12.8206C132.339 13.0121 132.693 13.2625 133.002 13.5644C133.319 13.8663 133.576 14.205 133.775 14.5806C133.974 14.9562 134.077 15.3391 134.077 15.7147V17.0328C134.077 17.2243 134.033 17.3937 133.952 17.5557C133.871 17.7103 133.768 17.8576 133.643 17.9975C133.517 18.1374 133.378 18.2626 133.23 18.3731C133.076 18.4835 132.943 18.5866 132.818 18.675C133.068 18.8517 133.311 19.0653 133.554 19.3157C133.79 19.566 133.967 19.8974 134.085 20.3172V21.6353L134.077 21.6427ZM124.88 17.0549H129.88C130.056 17.0549 130.248 16.996 130.447 16.8782C130.646 16.7604 130.749 16.591 130.749 16.3774C130.749 16.2743 130.719 16.186 130.653 16.0976C130.594 16.0092 130.513 15.9356 130.417 15.884C130.322 15.8251 130.226 15.7809 130.123 15.7515C130.02 15.722 129.924 15.7073 129.843 15.7073H124.106V21.6721H129.843C129.931 21.6721 130.027 21.65 130.123 21.6132C130.226 21.5764 130.322 21.5249 130.417 21.4586C130.513 21.3997 130.594 21.3187 130.653 21.2303C130.719 21.1419 130.749 21.0462 130.749 20.9505C130.749 20.7369 130.646 20.5602 130.447 20.4276C130.248 20.2951 130.056 20.2288 129.88 20.2288H124.88V17.0549Z"
                                    fill="#000000"
                                />
                                <path
                                    d="M23.5 30.1848L27.101 20.619C27.7048 19.0137 29.2366 17.9533 30.9524 17.9533H38.1764L33.2647 5H40.2531C41.9689 5 43.5006 6.06041 44.1044 7.66576L47.9705 17.9606H42.3813C39.8922 17.9606 37.6609 19.485 36.7552 21.7973L33.4708 30.1848H23.5074H23.5Z"
                                    fill="url(#paint0_linear_landing_footer)"
                                />
                                <path
                                    d="M49.3991 21.9077H44.2959C41.9909 21.9077 40.4003 24.2126 41.2177 26.3629L42.6684 30.1848H52.4036L49.4065 21.9077H49.3991Z"
                                    fill="url(#paint1_linear_landing_footer)"
                                />
                                <defs>
                                    <linearGradient
                                        id="paint0_linear_landing_footer"
                                        x1="33.4856"
                                        y1="30.936"
                                        x2="41.4166"
                                        y2="6.74526"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#47C2FF" />
                                        <stop offset="1" stopColor="#00E5FF" />
                                    </linearGradient>
                                    <linearGradient
                                        id="paint1_linear_landing_footer"
                                        x1="46.702"
                                        y1="21.9077"
                                        x2="46.702"
                                        y2="30.1848"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#9FF3DF" />
                                        <stop offset="1" stopColor="#17EFF7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Description */}
                        <p className="font-normal text-base leading-6 text-gray-600 text-center sm:text-left">
                            Cổng thông tin dẫn lối đến tương lai của trí tuệ nhân tạo. Tuyển
                            chọn những thông tin và khám phá quan trọng nhất về AI.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-start justify-center sm:justify-start gap-5 w-full">
                            <a
                                href="https://t.me/+VqaLnSMBwYtiMmM1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-500 transition-colors"
                                aria-label="Telegram"
                            >
                                <FaTelegramPlane className="w-6 h-6" />
                            </a>
                            <a
                                href="javascript:void(0)"
                                className="text-cyan-500 transition-colors"
                                aria-label="Discord"
                            >
                                <FaDiscord className="w-6 h-6" />
                            </a>
                            <a
                                href="https://www.facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-500 transition-colors"
                                aria-label="Facebook"
                            >
                                <FaFacebook className="w-6 h-6" />
                            </a>
                            <a
                                href="https://www.instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-500 transition-colors"
                                aria-label="Instagram"
                            >
                                <FaInstagram className="w-6 h-6" />
                            </a>
                            <a
                                href="https://x.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-500 transition-colors"
                                aria-label="X (Twitter)"
                            >
                                <FaTwitter className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    {/* Mobile Menu Sections - Visible only on mobile */}
                    <div className="flex sm:hidden flex-col items-center gap-6 w-full">
                        {/* Terms of Service */}
                        <Link
                            href="#"
                            className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Điều khoản dịch vụ
                        </Link>

                        {/* Company */}
                        <div className="flex flex-col items-center gap-4">
                            <h3 className="font-normal text-xl leading-[30px] text-gray-900">
                                Công ty
                            </h3>
                            <div className="flex flex-col items-center gap-3">
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Về chúng tôi
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Liên hệ
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Tuyển dụng
                                </Link>
                            </div>
                        </div>

                        {/* Privacy Policy */}
                        <Link
                            href="#"
                            className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Chính sách bảo mật
                        </Link>
                    </div>

                    {/* Desktop Menu Columns - Hidden on tablet, visible on desktop */}
                    <div className="hidden sm:flex items-start gap-[72px] sm:w-auto lg:w-[533px]">
                        {/* Solutions */}
                        <div className="flex flex-col gap-3">
                            <h3 className="font-normal text-xl leading-[30px] text-gray-900 w-[128px]">
                                Giải pháp
                            </h3>
                            <div className="flex flex-col gap-4">
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    AI cho doanh nghiệp
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Tự động hóa
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Phân tích dữ liệu
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Tư vấn AI
                                </Link>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="hidden lg:flex flex-col gap-3">
                            <h3 className="font-normal text-xl leading-[30px] text-gray-900 w-full">
                                Dịch vụ
                            </h3>
                            <div className="flex flex-col gap-4">
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Đào tạo AI
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Công cụ AI
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Hướng dẫn
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Cộng đồng
                                </Link>
                            </div>
                        </div>

                        {/* Company */}
                        <div className="hidden lg:flex flex-col gap-3">
                            <h3 className="font-normal text-xl leading-[30px] text-gray-900 w-[90px]">
                                Công ty
                            </h3>
                            <div className="flex flex-col gap-4">
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Về chúng tôi
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Liên hệ
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Tuyển dụng
                                </Link>
                                <Link
                                    href="#"
                                    className="font-normal text-base leading-6 text-gray-600 hover:text-gray-900 transition-colors w-[128px]"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-200 w-full mb-6"></div>

                {/* Bottom Section */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Copyright */}
                    <p className="font-normal text-base leading-6 text-gray-600 text-center sm:text-left">
                        © 2025 AI Hub - Phát triển bởi sự tò mò và trí tuệ.
                    </p>

                    {/* Legal Links */}
                    <div className="hidden sm:flex font-normal gap-[25px] items-center leading-6 text-gray-600 text-base">
                        <Link href="#" className="hover:text-gray-900 transition-colors">
                            Điều khoản dịch vụ
                        </Link>
                        <Link href="#" className="hover:text-gray-900 transition-colors">
                            Chính sách bảo mật
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}