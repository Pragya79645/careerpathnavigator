"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Code, Palette, Database, GitBranch, Rocket, CheckCircle, Clock, Lock } from "lucide-react"

export default function Roadmap() {
  const milestones = [
    {
      id: 1,
      title: "Frontend Baddie",
      description: "Master the basics of HTML, CSS, and JavaScript",
      icon: Code,
      status: "completed",
      skills: ["HTML5", "CSS3", "JavaScript ES6"],
      resources: [
        { name: "MDN Web Docs", url: "#" },
        { name: "Frontend Masters", url: "#" },
      ],
    },
    {
      id: 2,
      title: "React Rockstar",
      description: "Build dynamic UIs with React and state management",
      icon: Palette,
      status: "in-progress",
      skills: ["React", "Hooks", "Context API", "Redux"],
      resources: [
        { name: "React Documentation", url: "#" },
        { name: "Egghead.io", url: "#" },
      ],
    },
    {
      id: 3,
      title: "API Architect",
      description: "Connect your frontend to backend services",
      icon: Database,
      status: "locked",
      skills: ["REST APIs", "GraphQL", "Authentication"],
      resources: [
        { name: "API Design Guide", url: "#" },
        { name: "Apollo GraphQL", url: "#" },
      ],
    },
    {
      id: 4,
      title: "DevOps Diva",
      description: "Deploy and manage your applications",
      icon: GitBranch,
      status: "locked",
      skills: ["Git", "CI/CD", "Docker", "Vercel"],
      resources: [
        { name: "GitHub Learning Lab", url: "#" },
        { name: "Vercel Documentation", url: "#" },
      ],
    },
    {
      id: 5,
      title: "Dev Queen",
      description: "Become a full-stack developer with advanced skills",
      icon: Rocket,
      status: "locked",
      skills: ["Next.js", "TypeScript", "Testing", "Performance"],
      resources: [
        { name: "Next.js Documentation", url: "#" },
        { name: "TypeScript Handbook", url: "#" },
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "locked":
        return <Lock className="h-5 w-5 text-muted-foreground" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "locked":
        return "bg-muted text-muted-foreground border-muted-foreground/20"
      default:
        return ""
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Your Career Roadmap</h1>
        <p className="text-muted-foreground">Follow this path to become a Frontend Dev Queen</p>
      </motion.div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-teal-500 hidden md:block"></div>

        <div className="space-y-8 relative">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-4 md:gap-8`}
            >
              {/* Milestone dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500  items-center justify-center z-10 hidden md:flex">
                <div className="w-4 h-4 rounded-full bg-background"></div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <Card
                  className={`border-2 ${
                    milestone.status === "completed"
                      ? "border-green-500/20"
                      : milestone.status === "in-progress"
                        ? "border-blue-500/20"
                        : "border-muted"
                  } transition-colors duration-300`}
                >
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        milestone.status === "locked" ? "bg-muted" : "bg-gradient-to-r from-purple-500 to-blue-500"
                      }`}
                    >
                      <milestone.icon
                        className={`h-6 w-6 ${milestone.status === "locked" ? "text-muted-foreground" : "text-white"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{milestone.title}</CardTitle>
                        <Badge className={getStatusColor(milestone.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(milestone.status)}
                            <span>
                              {milestone.status === "completed" && "Completed"}
                              {milestone.status === "in-progress" && "In Progress"}
                              {milestone.status === "locked" && "Locked"}
                            </span>
                          </span>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className={milestone.status === "locked" ? "bg-muted text-muted-foreground" : ""}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Resources</h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.resources.map((resource) => (
                            <Button
                              key={resource.name}
                              variant="outline"
                              size="sm"
                              className={milestone.status === "locked" ? "opacity-50 pointer-events-none" : ""}
                              asChild
                            >
                              <a href={resource.url}>{resource.name}</a>
                            </Button>
                          ))}
                        </div>
                      </div>
                      {milestone.status !== "locked" && (
                        <Button
                          className={
                            milestone.status === "completed"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          }
                        >
                          {milestone.status === "completed" ? "Review Materials" : "Continue Learning"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Empty div for layout */}
              <div className="flex-1 hidden md:block"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
