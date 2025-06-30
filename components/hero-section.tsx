"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent z-10"></div>

      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#7c3bed]/20 rounded-full blur-[120px] animate-pulse"></div>
        <div
          className="absolute top-[30%] -right-[20%] w-[60%] h-[60%] bg-[#a56eff]/20 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-[#7c3bed]/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-6 leading-tight">
              From{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c3bed] to-[#a56eff] font-normal">
                Blog
              </span>{" "}
              to{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c3bed] to-[#a56eff] font-normal">
                Buzz
              </span>
              , Instantly
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-8">
              Transform your blog content into platform-optimized short-form content with AI. Save hours of work and
              reach more people.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/signup" passHref>
                <Button className="w-auto sm:w-auto bg-gradient-to-r from-[#7c3bed] to-[#9d5aff] hover:opacity-90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.5)] hover:shadow-[0_0_25px_rgba(124,59,237,0.7)] text-base py-6 px-8">
                  Get Started <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                Sign In <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="w-full relative flex justify-center items-center">
            <div className="flex justify-center items-center w-full">
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(124,59,237,0.2)] inline-block">
                <Image
                  src="/dashboard.png"
                  alt="Platform Interface"
                  width={800}
                  height={500}
                  className="object-contain rounded-xl"
                  priority
                  quality={95}
                />
              </div>
            </div>
          </div>
        </div> {/* ← closes grid grid-cols-1 lg:grid-cols-2 */}
      </div>   {/* ← closes container */}
    </section>
  )
}

