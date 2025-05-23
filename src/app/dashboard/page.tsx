"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { MessageCircle, TrendingUp, Zap, BookOpen } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-purple-500">
            <AvatarImage src="/placeholder.svg?height=64&width=64" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
                Hey Queen! 👑
              </span>
            </h1>
            <p className="text-muted-foreground">Ready to level up your career today?</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
          <Zap className="mr-2 h-4 w-4" /> Update Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="overflow-hidden border-purple-500/20 hover:border-purple-500/40 transition-colors duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Recommended Paths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {[
                  { name: "Frontend Developer", match: "92%" },
                  { name: "UX/UI Designer", match: "87%" },
                  { name: "Product Manager", match: "76%" },
                ].map((path, index) => (
                  <div key={path.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium">
                        {index + 1}
                      </div>
                      <span>{path.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                      {path.match} match
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="overflow-hidden border-teal-500/20 hover:border-teal-500/40 transition-colors duration-300">
            <CardHeader className="bg-gradient-to-r from-teal-500/10 to-blue-500/10">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-teal-400" />
                Skill Gaps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {[
                  { skill: "React", level: 65 },
                  { skill: "UI Design", level: 45 },
                  { skill: "TypeScript", level: 30 },
                ].map((skill) => (
                  <div key={skill.skill} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{skill.skill}</span>
                      <span className="text-xs text-muted-foreground">{skill.level}%</span>
                    </div>
                    <Progress
                      value={skill.level}
                      className="h-2 bg-muted bg-gradient-to-r from-teal-500 to-blue-500"
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 border-teal-500/20 text-teal-400 hover:bg-teal-500/10"
              >
                View All Skills
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="overflow-hidden border-blue-500/20 hover:border-blue-500/40 transition-colors duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-2">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      42%
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Frontend Path</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>HTML & CSS Basics</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>JavaScript Fundamentals</span>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      In Progress
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>React Essentials</span>
                    <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                      Locked
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="fixed bottom-6 right-6"
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Ask Grok</span>
        </Button>
      </motion.div>
    </div>
  )
}
