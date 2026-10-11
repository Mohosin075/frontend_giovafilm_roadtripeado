"use client";
import Image from "next/image";
import googleIcon from "@/public/google.png";
import facebookIcon from "@/public/facebook.png";
import { useSearchParams } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BASEURL ?? "http://10.10.7.50:4009";

export default function SocialLogin() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleGoogleLogin = () => {
    // Redirect to the backend's Google OAuth initiation endpoint.
    // The backend will redirect the user to Google for authentication,
    // then callback with a token/session after successful login.
    let url = `${BACKEND_URL}/api/v1/auth/google`;
    if (redirect) {
      url += `?redirect=${encodeURIComponent(redirect)}`;
    }
    window.location.href = url;
  };

  return (
    <div className="w-full grid grid-cols-2 gap-4">
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-slate-900/60 border border-[#EEEEEE] dark:border-slate-800 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
      >
        <Image
          src={googleIcon}
          alt="Google"
          width={200}
          height={200}
          className="w-5 h-5"
        />
        <span className="text-sm font-bold text-[#424242] dark:text-slate-200">Google</span>
      </button>
      <button className="flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-slate-900/60 border border-[#EEEEEE] dark:border-slate-800 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
        <Image
          src={facebookIcon}
          alt="Facebook"
          width={200}
          height={200}
          className="w-5 h-5"
        />
        <span className="text-sm font-bold text-[#424242] dark:text-slate-200">Facebook</span>
      </button>
    </div>
  );
}
