import { IconType } from "react-icons";
import { FaInstagram, FaFacebook, FaWhatsapp, FaTiktok, FaXTwitter } from "react-icons/fa6";

export const SOCIAL_PLATFORMS = ["INSTAGRAM", "FACEBOOK", "WHATSAPP", "TIKTOK", "X"] as const;
export type SocialPlatformValue = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_PLATFORM_META: Record<SocialPlatformValue, { label: string; icon: IconType; color: string }> = {
  INSTAGRAM: { label: "Instagram", icon: FaInstagram, color: "#E4405F" },
  FACEBOOK: { label: "Facebook", icon: FaFacebook, color: "#1877F2" },
  WHATSAPP: { label: "WhatsApp", icon: FaWhatsapp, color: "#25D366" },
  TIKTOK: { label: "TikTok", icon: FaTiktok, color: "#000000" },
  X: { label: "X", icon: FaXTwitter, color: "#000000" },
};
