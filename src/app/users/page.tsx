"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { User as UserIcon, Mail, Calendar, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UsersPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile(docSnap.data())
        }
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4">
        <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
          <UserIcon size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-gray-500 max-w-md">Please sign in to view your career profile and progress.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Profile Header */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500" />
        
        <div className="px-12 pb-12">
          <div className="relative -mt-16 mb-8 flex items-end gap-6">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl rounded-2xl">
              <AvatarImage src={user.photoURL || ""} className="rounded-2xl" />
              <AvatarFallback className="text-4xl bg-indigo-50 text-indigo-600 rounded-2xl">
                {user.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="pb-2">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                {user.displayName}
              </h1>
              <p className="text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                <Mail size={14} className="text-indigo-400" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">
                  Account Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase">Member Since</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {profile?.createdAt?.toDate ? profile.createdAt.toDate().toLocaleDateString() : (user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">
                  Activity Insights
                </h3>
                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={80} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Career Journey</h4>
                  <p className="text-gray-400 text-xs leading-relaxed mb-6">
                    You are currently navigating through your technical path. Use the sidebar tools to analyze your resume or prepare for interviews.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                    View Progress
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
