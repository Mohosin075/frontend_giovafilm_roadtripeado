import React from "react";
import { Icon } from "@iconify/react";
import { getImageUrl } from "@/lib/utils";

interface CategoryIconProps {
  icon: string;
  size?: number;
  color?: string;
  className?: string;
}

export function CategoryIcon({
  icon,
  size = 20,
  color = "#ffffff",
  className = "",
}: CategoryIconProps) {
  if (!icon) return null;

  // Check if it's a custom image (URL, base64, or file path)
  const isCustomImage =
    icon.startsWith("http") ||
    icon.startsWith("data:") ||
    icon.includes("/") ||
    icon.includes(".");

  if (isCustomImage) {
    return (
      <img
        src={getImageUrl(icon)}
        alt="category icon"
        className={`object-cover w-full h-full ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  // Check if it's an emoji
  const isEmoji = /\p{Emoji}/u.test(icon) && !icon.includes(":");

  if (isEmoji) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1 }}>
        {icon}
      </span>
    );
  }

  // Fallback to Iconify
  return (
    <Icon
      icon={icon}
      width={size}
      height={size}
      color={color}
      className={className}
    />
  );
}


