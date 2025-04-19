"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Assuming Button component exists
export default function StartAssessmentPage() {
    return (<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50" dir="rtl">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image src="/static/image/logo.png" alt="Logo" width={250} // Increased size for clarity
     height={250} // Increased size for clarity
     className="mx-auto" // Center the image
     priority // Prioritize loading the logo
    />
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-nca-dark-blue mb-12">
          ابدأ تقييم منشأتك
        </h1>

        {/* Start Button Container */}
        <div className="flex justify-center">
          <Link href="/home" passHref>
            <Button size="lg" // Use large size for prominence
     className="bg-nca-teal text-white hover:bg-nca-teal-dark rounded-full w-32 h-32 flex items-center justify-center text-lg font-semibold shadow-lg" // Circular button styles
    >
              ابدأ الآن
            </Button>
          </Link>
        </div>
      </div>
    </div>);
}
