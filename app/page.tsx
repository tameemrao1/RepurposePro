"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star, Zap, Layers, BarChart3, Upload, Settings, Check } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import MobileMenuWrapper from "@/components/mobile-menu-wrapper";
import HeroSection from "@/components/hero-section";

export default function Home() {
  return (
    <div className="relative h-full absolute bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-black/30 border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7c3bed] to-[#a56eff] flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="font-semibold tracking-tight text-white">Repurpose Pro</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-white/70 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#testimonials" className="text-sm text-white/70 hover:text-white transition-colors">
            Testimonials
          </a>
          <a href="#pricing" className="text-sm text-white/70 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-white/70 hover:text-white transition-colors">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button className="bg-gradient-to-r from-[#7c3bed] to-[#9d5aff] hover:opacity-90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.5)] hover:shadow-[0_0_25px_rgba(124,59,237,0.7)] text-base py-2 px-7">
              Sign In
            </Button>
          </Link>
          <MobileMenuWrapper />
        </div>
      </div>
    </nav>

      {/* Rest of the content */}
      <div className="relative">
          {/* 3D Hero Section */}
          <HeroSection />
      </div>


      {/* Featured In */}
      <section className="py-12 md:py-16 border-t border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-white/50 text-sm mb-8 uppercase tracking-wider">Featured In</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {["TechCrunch", "Forbes", "Wired", "Fast Company", "Inc."].map((logo, index) => (
              <div
                key={index}
                className="text-white/30 hover:text-white/60 transition-colors font-semibold text-lg md:text-xl"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-10 md:py-18 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                Powerful <span className="text-[#a56eff]">Features</span>
              </CardTitle>
              <p className="text-white/70">
                Our platform offers everything you need to transform your long-form content into engaging short-form posts.
              </p>
            </CardHeader>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="h-6 w-6 text-[#a56eff]" />,
                title: "AI-Powered Transformation",
                description: "Our advanced AI transforms content into platform-optimized posts in seconds.",
              },
              {
                icon: <Layers className="h-6 w-6 text-[#a56eff]" />,
                title: "Multi-Platform Support",
                description: "Generate content for Twitter, LinkedIn, Instagram, TikTok, and more.",
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-[#a56eff]" />,
                title: "Content Management",
                description: "Organize, edit, and schedule repurposed content in one dashboard.",
              },
              {
                icon: <Settings className="h-6 w-6 text-[#a56eff]" />,
                title: "Advanced Customization",
                description: "Fine-tune tone and style to match your brand voice.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-black/30 p-3 rounded-lg">{feature.icon}</div>
                      <h3 className="text-xl font-medium">{feature.title}</h3>
                    </div>
                    <p className="text-white/70">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-10 md:py-18 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                How It <span className="text-[#a56eff]">Works</span>
              </CardTitle>
              <p className="text-white/70">Three simple steps to transform your content</p>
            </CardHeader>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Upload className="h-6 w-6 text-[#a56eff]" />,
                title: "Input Your Content",
                description: "Paste your blog post or upload a file for AI analysis.",
              },
              {
                step: "02",
                icon: <Settings className="h-6 w-6 text-[#a56eff]" />,
                title: "Select Platforms & Tone",
                description: "Choose target platforms and brand tone.",
              },
              {
                step: "03",
                icon: <Zap className="h-6 w-6 text-[#a56eff]" />,
                title: "Generate & Edit",
                description: "AI generates posts you can edit and export.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-gradient-to-r from-[#7c3bed] to-[#9d5aff] text-white h-10 w-10 rounded-full flex items-center justify-center font-medium">
                        {step.step}
                      </div>
                      <div className="bg-black/30 p-2 rounded-lg">{step.icon}</div>
                    </div>
                    <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                    <p className="text-white/70">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-10 md:py-18 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                What Our <span className="text-[#a56eff]">Clients</span> Say
              </CardTitle>
              <p className="text-white/70">Hear from content creators who have transformed their workflow</p>
            </CardHeader>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Content Marketing Manager",
                company: "TechStart Inc.",
                quote: "Repurpose Pro has transformed our content strategy. What took hours now takes minutes.",
                result: "300% increase in engagement",
              },
              {
                name: "Mark Thompson",
                role: "Solo Entrepreneur",
                company: "Growth Hackers",
                quote: "As a one-person business, Repurpose Pro handles content creation across all platforms.",
                result: "5x increase in content output",
              },
              {
                name: "Elena Rodriguez",
                role: "Digital Marketing Director",
                company: "Global Media",
                quote: "Maintains our brand voice while optimizing for different platforms.",
                result: "70% time saved on content creation",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="h-full bg-white/5 backdrop-blur-md border border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#7c3bed] to-[#a56eff] flex items-center justify-center text-white font-bold">
                        {testimonial.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-white/70 text-sm">{testimonial.role}, {testimonial.company}</p>
                      </div>
                    </div>
                    <blockquote className="text-white/90 mb-4 italic">"{testimonial.quote}"</blockquote>
                    <div className="bg-[#7c3bed]/20 px-3 py-1 rounded text-sm text-[#a56eff]">
                      Result: {testimonial.result}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 relative">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                Simple, Transparent <span className="text-[#a56eff]">Pricing</span>
              </CardTitle>
              <p className="text-white/70">Choose the plan that works best for your content needs</p>
            </CardHeader>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                features: [
                  "5 transformations/month",
                  "Basic support",
                  "Manual publishing",
                  "Standard AI"
                ],
                cta: "Get Started",
                popular: false,
              },
              {
                name: "Pro",
                price: "$29",
                period: "per month",
                features: [
                  "Unlimited transformations",
                  "All platforms",
                  "Advanced AI",
                  "Content scheduling",
                  "Analytics dashboard",
                  "Priority support"
                ],
                cta: "Get Started",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "pricing",
                features: [
                  "Everything in Pro",
                  "Dedicated account manager",
                  "Custom AI training",
                  "API access",
                  "White-label",
                  "Advanced security"
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7c3bed] to-[#9d5aff]">
                    Most Popular
                  </Badge>
                )}
                <Card className={`h-full bg-white/5 backdrop-blur-md ${plan.popular ? "border-[#7c3bed]" : "border-white/10"}`}>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                      <div className="flex items-end gap-1 mb-2">
                        <span className="text-3xl font-light">{plan.price}</span>
                        <span className="text-white/70 mb-1">/{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-[#a56eff] shrink-0 mt-0.5" />
                          <span className="text-white/80">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${plan.popular ? "bg-gradient-to-r from-[#7c3bed] to-[#9d5aff]" : "bg-white/10 hover:bg-white/20"}`}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-10 md:py-18 relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -bottom-[20%] left-[30%] w-[50%] h-[60%] bg-[#7c3bed]/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[10%] right-[20%] w-[30%] h-[40%] bg-[#a56eff]/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
              Frequently Asked{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c3bed] to-[#a56eff] font-normal">
                Questions
              </span>
            </h2>
            <p className="text-white/70">Everything you need to know about Repurpose Pro</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "How does the AI understand my content?",
                  answer:
                    "Our AI uses advanced natural language processing to analyze your content's structure, key points, tone, and intent. It identifies the most important information and transforms it into platform-specific formats while maintaining your brand voice.",
                },
                {
                  question: "Which platforms does Repurpose Pro support?",
                  answer:
                    "We currently support Twitter/X, LinkedIn, Instagram, Facebook, TikTok, YouTube Shorts, and Pinterest. We're constantly adding new platforms based on user feedback and market trends.",
                },
                {
                  question: "Can I customize the AI-generated content?",
                  answer:
                    "While our AI creates high-quality initial drafts, you have full editing capabilities. You can adjust tone, length, style, and specific wording before publishing or exporting your content.",
                },
                {
                  question: "Is there a limit to how much content I can process?",
                  answer:
                    "Free users can transform up to 5 pieces of content per month. Pro users have unlimited transformations. Enterprise plans include custom volume arrangements based on your organization's needs.",
                },
                {
                  question: "How secure is my content on your platform?",
                  answer:
                    "We take security seriously. Your content is encrypted in transit and at rest. We do not use your content to train our AI models, and we offer enterprise-grade security features for larger organizations, including SSO and custom data retention policies.",
                },
              ].map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-white/5 transition-colors text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-white/70">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-16 relative">
        <div className="container mx-auto px-3 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Card className="bg-gradient-to-r from-[#7c3bed]/20 to-[#9d5aff]/20 backdrop-blur-md border border-white/10">
              <CardContent className="p-16">
                <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
                  Ready to <span className="text-[#a56eff]">Transform</span> Your Content?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-2xl">
                  Join thousands of content creators who are saving time with Repurpose Pro.
                </p>
                <Link href="/signup" passHref>
                  <Button className="bg-gradient-to-r from-[#7c3bed] to-[#9d5aff] text-base py-6 px-8">
                    Get Started Today <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-white/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7c3bed] to-[#a56eff] flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="font-semibold tracking-tight">Repurpose Pro</span>
              </div>
              <p className="text-white/70 text-sm mb-6">
                Transform your blog content into platform-optimized short-form content with AI.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-white/70 hover:text-white text-sm">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-white/70 hover:text-white text-sm">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-white/70 hover:text-white text-sm">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    Cookies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/50 text-sm">© 2025 Repurpose Pro. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-white/50 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-white/50 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-white/50 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
