import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-gray-300 to-white">
      {/* Left column - Image One */}
      {/* Removed bg-gray-300 from here as the gradient is now on the main element */}
      <div className="w-full md:w-1/2 min-h-[20vh] md:min-h-screen flex items-center justify-center">
        <Image
          src="/static/image/logo.png"
          alt="Featured image"
          width={600} // Set explicit width
          height={600} // Set explicit height
          priority
        />
      </div>

      {/* Right column - Image Two with Heading and Button overlay */}
      {/* Removed bg-gray-300 from here to let the main gradient show */}
      <div className="w-full md:w-1/2 relative min-h-[50vh] md:min-h-screen">
        {/* Image Two filling the entire right section */}
        <div className="absolute inset-0">
          <Image
            src="/static/image/6.png?height=800&width=600"
            alt="Background image"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Heading and Button overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8">
          <Image
            src="/static/image/4.png" // Assuming 4.png exists in public/static/image
            alt="Overlay image"
            width={500} // Adjust width as needed
            height={200} // Adjust height as needed
            priority // Keep priority if it's important for loading
          />
          <Button size="lg" className="text-xl px-8 py-6">
            Button
          </Button>
        </div>
      </div>
    </main>
  )
}
