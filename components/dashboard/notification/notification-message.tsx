"use client";

import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { ReviewNotificationCard } from "./review-notification-card";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotificationMessage() {
  const { t } = useLanguage();
  const reviewNotifications = [
    {
      userName: "Alex Thompson",
      userImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      placeName: "Golden Gate Park",
      placeLink: "#",
      rating: 5,
      timestamp: "15 mins ago",
    },
    {
      userName: "Sarah Jenkins",
      userImage:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      placeName: "The Louvre Museum",
      placeLink: "#",
      rating: 4,
      timestamp: "2 hours ago",
    },
    {
      userName: "Marcus Lee",
      userImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      placeName: "Bella Italia",
      placeLink: "#",
      rating: 4,
      timestamp: "Yesterday",
    },
  ];
  return (
    <div className="">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 ">
          <Star size={24} className="text-yellow-500" />
          {/* <StarIcon size={24} className="text-yellow-500" /> */}
          <h2 className="text-xl font-bold text-black dark:text-slate-100 font-inter">
            {t("notifications_page.new_reviews")}
          </h2>
        </div>
        <Button
          variant="outline"
          size={"sm"}
          className="text-sm bg-primary/30 hover:bg-primary/30 text-[#A16207] font-semibold rounded-full px-2 py-1!"
        >
          5 NEW
        </Button>
      </div>
      <div className="space-y-4">
        {reviewNotifications.map((review, index) => (
          <ReviewNotificationCard
            key={index}
            userName={review.userName}
            userImage={review.userImage}
            placeName={review.placeName}
            placeLink={review.placeLink}
            rating={review.rating}
            timestamp={review.timestamp}
          />
        ))}
      </div>
    </div>
  );
}
