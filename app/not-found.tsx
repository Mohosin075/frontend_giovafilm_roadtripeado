import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/navigation/header";
import Footer from "@/components/shared/navigation/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F9FAFB] dark:bg-[#0b0f19] relative overflow-hidden font-public-sans">
        {/* Background Decorative Lines matching Hero Banner */}
        <div className="absolute inset-0 pointer-events-none">
          <svg
            className="w-full h-full opacity-[0.05] dark:opacity-[0.03] stroke-black dark:stroke-white"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="100"
              x2="100"
              y2="0"
              stroke="currentColor"
              strokeWidth="0.2"
            />
            <line
              x1="-20"
              y1="100"
              x2="80"
              y2="0"
              stroke="currentColor"
              strokeWidth="0.2"
            />
            <line
              x1="20"
              y1="100"
              x2="120"
              y2="0"
              stroke="currentColor"
              strokeWidth="0.2"
            />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          {/* 404 Heading */}
          <h1 className="text-8xl md:text-[150px] font-black text-[#FFC107] drop-shadow-sm leading-none mb-4">
            404
          </h1>
          
          {/* Subheading */}
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
            Off the Beaten Path
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed mb-10">
            Oops! It looks like the destination you&apos;re looking for isn&apos;t on our maps yet. Let&apos;s get you back to discovering hidden gems.
          </p>
          
          {/* Action Button */}
          <div className="pt-8">
            <Link href="/">
              <Button className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-extrabold rounded-lg px-10 h-14 text-base shadow-lg shadow-yellow-500/20 cursor-pointer">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
