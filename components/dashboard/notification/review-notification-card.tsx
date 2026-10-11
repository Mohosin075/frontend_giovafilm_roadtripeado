"use client";

import { Star } from "lucide-react";

interface ReviewNotificationCardProps {
  userName: string;
  userImage: string;
  placeName: string;
  placeLink: string;
  rating: number;
  timestamp: string;
}

export function ReviewNotificationCard({
  userName,
  userImage,
  placeName,
  placeLink,
  rating,
  timestamp,
}: ReviewNotificationCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white dark:bg-[#131b2e] rounded-lg border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
      {/* User Avatar */}
      <img
        src={userImage}
        alt={userName}
        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-slate-100">{userName}</p>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          reviewed{" "}
          <a href={placeLink} className="text-blue-600 dark:text-blue-400 hover:underline">
            {placeName}
          </a>
        </p>

        {/* Star Rating */}
        <div className="flex gap-0.5 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Timestamp & Unread Indicator */}
      <div className="flex flex-col items-end gap-2">
        <span className="text-sm text-gray-500 dark:text-slate-400">{timestamp}</span>
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      </div>
    </div>
  );
}
