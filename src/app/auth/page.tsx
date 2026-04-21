"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"
import { LogIn, Rocket, ShieldCheck, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      
      const userDoc = await getDoc(doc(db, "users", result.user.uid))
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date(),
          isNewUser: true
        })
      }
      
      router.push("/")
    } catch (error: any) {
      console.error("Auth Error:", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#f8f9ff]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 blur-[120px] rounded-full animate-pulse decoration-8" />
      
      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col md:flex-row items-center gap-12 md:gap-24">
        {/* Left Side: Brand & Marketing */}
        <div className="flex-1 text-center md:text-left space-y-8 hidden md:block">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
              <Sparkles className="w-3 h-3" />
              Elevate Your Career
            </div>
            <h1 className="text-6xl lg:text-7xl font-black leading-tight text-gray-900 tracking-tighter">
              Pilot Your <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
                Tech Future.
              </span>
            </h1>
            <p className="text-gray-500 text-lg mt-6 max-w-lg leading-relaxed font-medium">
              Join 10,000+ professionals using AI to navigate their career paths, prepare for interviews, and master technical skills.
            </p>
          </motion.div>

          {/* Quick Stats/Features */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className="p-4 rounded-3xl bg-white/50 border border-white shadow-sm flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">AI Powered</div>
                <div className="text-gray-500 text-xs">Dynamic Guidance</div>
              </div>
            </div>
            <div className="p-4 rounded-3xl bg-white/50 border border-white shadow-sm flex items-start gap-4">
              <div className="p-2 rounded-xl bg-teal-100 text-teal-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">Secure</div>
                <div className="text-gray-500 text-xs">Privacy Guaranteed</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            
            <div className="relative bg-white/70 backdrop-blur-3xl rounded-[38px] shadow-2xl border border-white/80 p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-indigo-50 rounded-full animate-pulse" />
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl text-indigo-600">
                    <LogIn size={40} strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Welcome to Navigator
                </h2>
                <p className="text-gray-500 mt-2 font-medium">
                  Connect your account to continue
                </p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full group relative flex items-center justify-center gap-4 bg-gray-900 hover:bg-black text-white font-bold py-5 px-8 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-indigo-500/20 active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  {!isLoading ? (
                    <>
                      <div className="bg-white p-1 rounded-lg">
                        <svg className="w-5 h-5 shadow-sm" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </div>
                      <span className="text-lg">Continue with Google</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    </div>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 leading-relaxed font-medium">
                  By joining, you agree to our <br />
                  <span className="text-gray-900 font-bold hover:underline cursor-pointer">Terms</span> & <span className="text-gray-900 font-bold hover:underline cursor-pointer">Conditions</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}