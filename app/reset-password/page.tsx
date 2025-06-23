import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0a0014] text-white flex flex-col">
      {/* Animated background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/30 relative z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7c3bed] to-[#a56eff] flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="font-semibold tracking-tight">Repurpose Pro</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to login</span>
          </Link>

          <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_25px_rgba(124,59,237,0.2)]">
            <CardHeader>
              <CardTitle className="text-2xl font-light">
                Reset your{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c3bed] to-[#a56eff] font-normal">
                  password
                </span>
              </CardTitle>
              <CardDescription className="text-white/70">
                Enter your email and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="bg-white/5 border-white/10 focus-visible:ring-[#7c3bed] text-white placeholder:text-white/50"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full bg-gradient-to-r from-[#7c3bed] to-[#9d5aff] hover:opacity-90 transition-all shadow-[0_0_15px_rgba(124,59,237,0.5)] hover:shadow-[0_0_25px_rgba(124,59,237,0.7)]">
                Send Reset Link
              </Button>
              <p className="text-center text-white/70 text-sm">
                Remember your password?{" "}
                <Link href="/login" className="text-[#a56eff] hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
