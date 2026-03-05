import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';

interface NewsCardProps {
    imageUrl: string;
    category: string;
    date: string;
    title: string;
    description: string;
    variant?: 'vertical' | 'horizontal';
    href: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
    imageUrl,
    category,
    date,
    title,
    description,
    variant = 'vertical',
    href,
}) => {
    if (variant === 'horizontal') {
        return (
            <div
                className="flex flex-col lg:flex-row bg-white overflow-hidden relative group w-full max-w-[1240px] h-auto lg:h-[412px] rounded-[20px] p-4 lg:p-6 gap-6 lg:gap-12 shadow-[0px_0px_15px_0px_#0000000F,0px_0px_20px_0px_#0000001A]"
            >
                {/* Left Part - Content */}
                <div className="flex flex-col flex-1 order-2 lg:order-1">
                    <div className="flex flex-col gap-4">
                        {/* Category and Date */}
                        <div className="flex items-center gap-4 text-sm lg:text-base">
                            <span
                                className="font-medium inline-block text-white rounded-[16px] py-[6px] px-[12px]"
                                style={{
                                    background: 'linear-gradient(17.67deg, #47C2FF 7.6%, #00E5FF 88.27%)',
                                }}
                            >
                                {category}
                            </span>
                            <div className="flex items-center text-gray-500 gap-1">
                                <Calendar size={18} />
                                <span>{date}</span>
                            </div>
                        </div>

                        {/* Title */}
                        <Link href={href}  className="hover:text-cyan-500 transition-colors">
                            <h2 className="text-xl lg:text-3xl font-bold text-gray-900 line-clamp-2">
                                {title}
                            </h2>
                        </Link>

                        {/* Description */}
                        <p className="text-gray-500 text-sm lg:text-base line-clamp-3 lg:line-clamp-4">
                            {description}
                        </p>

                        {/* Read More */}
                        <div>
                            <Link href={href} >
                                <button
                                    className="flex items-center justify-center font-medium text-white cursor-pointer hover:opacity-90 transition-opacity h-10 lg:h-12 rounded-[10px] px-4 lg:px-6 border-none"
                                    style={{
                                        background: 'linear-gradient(17.67deg, #47C2FF 7.6%, #00E5FF 88.27%)',
                                    }}
                                >
                                    Đọc thêm <ArrowRight size={18} className="ml-2" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Part - Image */}
                <Link href={href}  className="order-1 lg:order-2">
                    <div
                        className="relative overflow-hidden flex-shrink-0 w-full lg:w-[560px] h-[200px] lg:h-[364px] rounded-[20px]"
                    >
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                </Link>
            </div>
        );
    }

    // Vertical variant (original)
    return (
        <div
            className="flex flex-col bg-white overflow-hidden relative group w-full max-w-[400px] h-auto rounded-[20px] border border-[#D2D5DB] p-[1px] shadow-[0px_0px_20px_0px_#0000001A]"
        >
            {/* Top Part - Image */}
            <Link href={href}>
                <div
                    className="relative overflow-hidden w-full h-[220px] rounded-t-[19px]"
                >
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </Link>

            {/* Bottom Part - Content */}
            <div className="flex flex-col w-full p-6 gap-3">
                {/* Category and Date */}
                <div className="flex items-center gap-4 text-sm">
                    <span
                        className="font-medium inline-block rounded-[16px] py-1 px-2 bg-[#0BA5EC]"
                    >
                        <span
                            className="bg-clip-text text-white"
                        >
                            {category}
                        </span>
                    </span>
                    <div className="flex items-center text-gray-500 gap-1">
                        <Calendar size={16} />
                        <span>{date}</span>
                    </div>
                </div>

                {/* Title */}
                <Link href={href} className="hover:text-cyan-500 transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                        {title}
                    </h3>
                </Link>

                {/* Description */}
                <p className="text-gray-500 text-sm line-clamp-3">
                    {description}
                </p>

                {/* Read More */}
                <div className="pt-3 border-t border-gray-200 flex justify-end mt-4">
                    <Link href={href}>
                        <div
                            className="flex items-center font-medium cursor-pointer hover:opacity-80 transition-opacity bg-clip-text text-transparent"
                            style={{
                                backgroundImage: 'linear-gradient(17.67deg, #47C2FF 7.6%, #00E5FF 88.27%)',
                            }}
                        >
                            Đọc thêm <ArrowRight size={16} className="ml-1 text-[#47C2FF]" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NewsCard;
