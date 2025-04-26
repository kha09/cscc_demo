import Image from "next/image"
import Link from "next/link" // Import Link
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    // Removed md:space-x-4 to make columns adjacent again
    <main className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-gray-200 to-white">
      {/* Left column - Image One */}
      {/* Removed bg-gray-300 from here as the gradient is now on the main element */}
      {/* Changed md:w-1/2 to md:flex-1 */}
      <div className="w-full md:flex-1 min-h-[20vh] md:min-h-screen flex items-center justify-center pl-20"> {/* Added pl-8 for left padding */}
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
      {/* Changed md:w-1/2 to md:flex-1 */}
      <div className="w-full md:flex-1 relative min-h-[50vh] md:min-h-screen pr-20">
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
        {/* Removed left padding (pl-8) by changing p-8 to py-8 pr-8 pb-8 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 py-8 pr-8 pb-8"> {/* Reduced gap from 8 to 4 */}
          <Image
            src="/static/image/4.png" // Assuming 4.png exists in public/static/image
            alt="Overlay image"
            width={550} // Adjust width as needed
            height={200} // Adjust height as needed
            priority // Keep priority if it's important for loading
          />
          <Link href="/home"> {/* Wrap Button with Link */}
            <Button
              size="lg"
              className="text-xl px-8 py-6 bg-[#259ca7] hover:bg-[#1e7c85] text-white" // Added custom background color, hover effect, and white text
            >
              REGISTRY
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
