"use client";

import { Mail, Globe, Share2, Instagram, Youtube, Facebook } from "lucide-react";

export type ContactInfo = {
  id: number;
  icon: string;
  title: string;
  description: string;
  content: string | string[];
  contentType: "email" | "social";
};

export interface ContactInfoCardProps {
  data: ContactInfo;
}

const iconMap = {
  mail: <Mail className="w-8 h-8 text-yellow-400" />,
  globe: <Globe className="w-8 h-8 text-yellow-400" />,
};

const socialIconMap = {
  facebook: (
    <a
      href="https://www.facebook.com/share/19EaG6cYHv/"
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors block"
    >
      <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
    </a>
  ),
  instagram: (
    <a
      href="https://www.instagram.com/roadtripeado?igsh=MTNra3VwbGdwNzd5bw=="
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors block"
    >
      <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-600 dark:hover:text-pink-400" />
    </a>
  ),
  youtube: (
    <a
      href="https://youtube.com/@roadtripeado?si=hKx3FtiXlL5dTFzQ"
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors block"
    >
      <Youtube className="w-5 h-5 text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
    </a>
  ),
  tiktok: (
    <a
      href="https://www.tiktok.com/@roadtripeado?_r=1&_t=ZT-989KjXNc92E"
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors block"
    >
      <svg className="w-5 h-5 fill-gray-400 hover:fill-black dark:hover:fill-[#fabf13]" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.21-.42-.45-.61-.7-.02 3.68-.03 7.36-.04 11.04-.01 1.25-.33 2.51-.95 3.6-1.39 2.5-4.22 3.97-7.07 3.77-3-.21-5.75-2.42-6.52-5.36-.93-3.21.36-6.84 3.09-8.49.88-.53 1.88-.83 2.9-.91.02.13.04.26.06.39v4.09c-.44.07-.88.23-1.27.47-1.12.67-1.76 1.99-1.57 3.28.18 1.13.97 2.13 2.05 2.5 1.15.4 2.45.15 3.37-.62.86-.71 1.28-1.84 1.24-2.96-.02-3.87-.02-7.74-.02-11.61.9-.01 1.8.01 2.69-.02z"/>
      </svg>
    </a>
  ),
};

export function ContactInfoCard({ data }: ContactInfoCardProps) {
  return (
    <div className="bg-white dark:bg-[#131b2e]/90 backdrop-blur-md rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-slate-800/80">
      {/* Icon container with yellow background */}
      <div className="mb-6 inline-flex items-center justify-center w-12 h-12 bg-yellow-50 dark:bg-amber-400/10 rounded-lg">
        {iconMap[data?.icon as keyof typeof iconMap]}
      </div>

      {/* Card title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-3">{data?.title}</h3>

      {/* Card description */}
      <p className="text-gray-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
        {data?.description}
      </p>

      {/* Render content based on type */}
      {data?.contentType === "email" && typeof data?.content === "string" && (
        <a
          href={`mailto:${data?.content}`}
          className="text-yellow-500 font-semibold text-sm hover:text-yellow-600 transition-colors inline-block"
        >
          {data?.content}
        </a>
      )}

      {data?.contentType === "social" && Array.isArray(data?.content) && (
        <div className="flex gap-2">
          {data?.content.map((icon) => (
            <div key={icon}>
              {socialIconMap[icon as keyof typeof socialIconMap]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
