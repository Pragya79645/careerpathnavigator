"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { ArrowRight, Mail, Lock } from "lucide-react"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      if (isSignUp) {
        // Sign Up Logic
        const result = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, "users", result.user.uid), {
          email: result.user.email,
          createdAt: new Date(),
        })
        console.log("Account created")
      } else {
        // Sign In Logic
        await signInWithEmailAndPassword(auth, email, password)
        console.log("Signed in")
      }
      router.push("/")
    } catch (error: any) {
      console.error("Auth Error:", error.message)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 via-purple-100 to-teal-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 via-teal-400 to-blue-500 bg-clip-text text-transparent">
            Career Path Navigator
          </h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-medium text-center text-purple-400 mb-6">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h2>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-12 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 px-12 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 via-teal-400 to-blue-500 text-white font-medium py-3 px-4 rounded-lg transition-all hover:shadow-md flex items-center justify-center"
              >
                {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                <ArrowRight className="ml-2" size={18} />
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-1 text-purple-500 hover:text-purple-600 font-medium transition-colors"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>

          <div className="h-1 bg-gradient-to-r from-purple-500 via-teal-400 to-blue-500"></div>
        </div>

      
      </div>
    </div>
  )
}