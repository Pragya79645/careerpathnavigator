"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Code, 
  Palette, 
  Database, 
  GitBranch, 
  Rocket, 
  CheckCircle, 
  Clock, 
  Lock,
  Plus,
  Search,
  Filter,
  Star,
  Users,
  TrendingUp,
  BookOpen,
  Target,
  Zap,
  Brain,
  Shield,
  Smartphone,
  Globe,
  Server,
  Bot,
  Sparkles,
  Calendar,
  Award,
  Play,
  ExternalLink,
  Download,
  Share2,
  Bookmark,
  MoreVertical
} from "lucide-react"

interface Milestone {
  id: number
  title: string
  description: string
  icon: any
  status: "completed" | "in-progress" | "locked"
  skills: string[]
  resources: { name: string; url: string; type: string }[]
  estimatedTime: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  prerequisites?: string[]
}

interface RoadmapData {
  id: string
  title: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: string
  popularity: number
  rating: number
  tags: string[]
  milestones: Milestone[]
  color: string
  gradient: string
  icon: any
  totalSkills: number
  completedSkills: number
  trending?: boolean
}

export default function Roadmap() {
  const [activeRoadmap, setActiveRoadmap] = useState<string>("frontend")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRoadmap, setGeneratedRoadmap] = useState<RoadmapData | null>(null)
  const [customRole, setCustomRole] = useState("")
  const [customCompany, setCustomCompany] = useState("")

  // Predefined roadmaps data
  const roadmaps: RoadmapData[] = [
    {
      id: "frontend",
      title: "Frontend Development",
      description: "Master modern web development with React, TypeScript, and cutting-edge tools",
      category: "Web Development",
      difficulty: "Beginner",
      duration: "6-8 months",
      popularity: 95,
      rating: 4.8,
      tags: ["React", "TypeScript", "CSS", "JavaScript"],
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
      icon: Code,
      totalSkills: 15,
      completedSkills: 8,
      trending: true,
      milestones: [
        {
          id: 1,
          title: "HTML & CSS Fundamentals",
          description: "Master the building blocks of web development",
          icon: Code,
          status: "completed",
          skills: ["HTML5", "CSS3", "Flexbox", "Grid", "Responsive Design"],
          resources: [
            { name: "MDN Web Docs", url: "https://developer.mozilla.org", type: "documentation" },
            { name: "CSS Tricks", url: "https://css-tricks.com", type: "article" },
            { name: "Flexbox Froggy", url: "https://flexboxfroggy.com", type: "interactive" },
          ],
          estimatedTime: "3-4 weeks",
          difficulty: "Beginner",
        },
        {
          id: 2,
          title: "JavaScript Mastery",
          description: "Learn modern JavaScript and ES6+ features",
          icon: Brain,
          status: "in-progress",
          skills: ["ES6+", "DOM Manipulation", "Async/Await", "Fetch API", "Modules"],
          resources: [
            { name: "JavaScript.info", url: "https://javascript.info", type: "tutorial" },
            { name: "You Don't Know JS", url: "#", type: "book" },
            { name: "Codewars", url: "https://codewars.com", type: "practice" },
          ],
          estimatedTime: "4-6 weeks",
          difficulty: "Intermediate",
          prerequisites: ["HTML & CSS Fundamentals"],
        },
        {
          id: 3,
          title: "React Development",
          description: "Build interactive UIs with React and hooks",
          icon: Palette,
          status: "locked",
          skills: ["React", "JSX", "Hooks", "State Management", "Component Architecture"],
          resources: [
            { name: "React Documentation", url: "https://react.dev", type: "documentation" },
            { name: "React Tutorial", url: "#", type: "tutorial" },
            { name: "React Patterns", url: "#", type: "article" },
          ],
          estimatedTime: "6-8 weeks",
          difficulty: "Intermediate",
          prerequisites: ["JavaScript Mastery"],
        },
        {
          id: 4,
          title: "TypeScript & Advanced Patterns",
          description: "Add type safety and scalability to your applications",
          icon: Shield,
          status: "locked",
          skills: ["TypeScript", "Generics", "Advanced Types", "Design Patterns"],
          resources: [
            { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", type: "documentation" },
            { name: "Type Challenges", url: "#", type: "practice" },
          ],
          estimatedTime: "4-5 weeks",
          difficulty: "Advanced",
          prerequisites: ["React Development"],
        },
        {
          id: 5,
          title: "Modern Tooling & Deployment",
          description: "Master build tools, testing, and deployment strategies",
          icon: Rocket,
          status: "locked",
          skills: ["Vite", "Testing", "CI/CD", "Deployment", "Performance"],
          resources: [
            { name: "Vite Documentation", url: "https://vitejs.dev", type: "documentation" },
            { name: "Vitest", url: "https://vitest.dev", type: "testing" },
            { name: "Vercel", url: "https://vercel.com", type: "deployment" },
          ],
          estimatedTime: "3-4 weeks",
          difficulty: "Advanced",
          prerequisites: ["TypeScript & Advanced Patterns"],
        },
      ],
    },
    {
      id: "backend",
      title: "Backend Development",
      description: "Build scalable server-side applications with modern technologies",
      category: "Backend",
      difficulty: "Intermediate",
      duration: "8-10 months",
      popularity: 88,
      rating: 4.7,
      tags: ["Node.js", "Python", "Databases", "APIs"],
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-r from-green-500 to-emerald-500",
      icon: Server,
      totalSkills: 18,
      completedSkills: 3,
      milestones: [
        {
          id: 1,
          title: "Server Fundamentals",
          description: "Understanding servers, HTTP, and backend architecture",
          icon: Server,
          status: "completed",
          skills: ["HTTP", "REST", "Server Architecture", "APIs"],
          resources: [
            { name: "MDN HTTP", url: "#", type: "documentation" },
            { name: "REST API Tutorial", url: "#", type: "tutorial" },
          ],
          estimatedTime: "2-3 weeks",
          difficulty: "Beginner",
        },
        {
          id: 2,
          title: "Node.js & Express",
          description: "Build web servers with Node.js and Express framework",
          icon: Code,
          status: "in-progress",
          skills: ["Node.js", "Express", "Middleware", "Routing"],
          resources: [
            { name: "Node.js Documentation", url: "https://nodejs.org", type: "documentation" },
            { name: "Express.js Guide", url: "https://expressjs.com", type: "tutorial" },
          ],
          estimatedTime: "4-5 weeks",
          difficulty: "Intermediate",
          prerequisites: ["Server Fundamentals"],
        },
        {
          id: 3,
          title: "Database Design",
          description: "Design and manage databases for web applications",
          icon: Database,
          status: "locked",
          skills: ["SQL", "MongoDB", "Database Design", "ORM"],
          resources: [
            { name: "MongoDB University", url: "#", type: "course" },
            { name: "SQL Tutorial", url: "#", type: "tutorial" },
          ],
          estimatedTime: "5-6 weeks",
          difficulty: "Intermediate",
          prerequisites: ["Node.js & Express"],
        },
      ],
    },
    {
      id: "mobile",
      title: "Mobile Development",
      description: "Create native and cross-platform mobile applications",
      category: "Mobile",
      difficulty: "Intermediate",
      duration: "10-12 months",
      popularity: 82,
      rating: 4.6,
      tags: ["React Native", "Flutter", "iOS", "Android"],
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: Smartphone,
      totalSkills: 20,
      completedSkills: 2,
      milestones: [
        {
          id: 1,
          title: "Mobile Fundamentals",
          description: "Understanding mobile app development concepts",
          icon: Smartphone,
          status: "completed",
          skills: ["Mobile UI/UX", "App Architecture", "Platform Guidelines"],
          resources: [
            { name: "iOS Human Interface Guidelines", url: "#", type: "documentation" },
            { name: "Material Design", url: "#", type: "guidelines" },
          ],
          estimatedTime: "2-3 weeks",
          difficulty: "Beginner",
        },
        {
          id: 2,
          title: "React Native",
          description: "Build cross-platform mobile apps with React Native",
          icon: Code,
          status: "in-progress",
          skills: ["React Native", "Navigation", "Native Modules", "Platform APIs"],
          resources: [
            { name: "React Native Documentation", url: "#", type: "documentation" },
            { name: "Expo", url: "#", type: "platform" },
          ],
          estimatedTime: "8-10 weeks",
          difficulty: "Intermediate",
          prerequisites: ["Mobile Fundamentals"],
        },
      ],
    },
    {
      id: "devops",
      title: "DevOps & Cloud",
      description: "Master deployment, monitoring, and cloud infrastructure",
      category: "DevOps",
      difficulty: "Advanced",
      duration: "6-8 months",
      popularity: 76,
      rating: 4.5,
      tags: ["Docker", "Kubernetes", "AWS", "CI/CD"],
      color: "from-orange-500 to-red-500",
      gradient: "bg-gradient-to-r from-orange-500 to-red-500",
      icon: GitBranch,
      totalSkills: 22,
      completedSkills: 1,
      milestones: [
        {
          id: 1,
          title: "Containerization",
          description: "Package applications with Docker",
          icon: GitBranch,
          status: "completed",
          skills: ["Docker", "Docker Compose", "Containerization"],
          resources: [
            { name: "Docker Documentation", url: "#", type: "documentation" },
            { name: "Docker Tutorial", url: "#", type: "tutorial" },
          ],
          estimatedTime: "3-4 weeks",
          difficulty: "Intermediate",
        },
        {
          id: 2,
          title: "Cloud Platforms",
          description: "Deploy and manage applications on cloud platforms",
          icon: Globe,
          status: "locked",
          skills: ["AWS", "Azure", "GCP", "Cloud Architecture"],
          resources: [
            { name: "AWS Documentation", url: "#", type: "documentation" },
            { name: "Cloud Architecture Patterns", url: "#", type: "article" },
          ],
          estimatedTime: "6-8 weeks",
          difficulty: "Advanced",
          prerequisites: ["Containerization"],
        },
      ],
    },
    {
      id: "ai-ml",
      title: "AI & Machine Learning",
      description: "Build intelligent applications with machine learning",
      category: "AI/ML",
      difficulty: "Advanced",
      duration: "12-15 months",
      popularity: 94,
      rating: 4.9,
      tags: ["Python", "TensorFlow", "PyTorch", "Data Science"],
      color: "from-indigo-500 to-purple-500",
      gradient: "bg-gradient-to-r from-indigo-500 to-purple-500",
      icon: Bot,
      totalSkills: 25,
      completedSkills: 0,
      trending: true,
      milestones: [
        {
          id: 1,
          title: "Python for Data Science",
          description: "Master Python libraries for data manipulation and analysis",
          icon: Code,
          status: "locked",
          skills: ["Python", "NumPy", "Pandas", "Matplotlib", "Jupyter"],
          resources: [
            { name: "Python Documentation", url: "#", type: "documentation" },
            { name: "Pandas Tutorial", url: "#", type: "tutorial" },
          ],
          estimatedTime: "4-6 weeks",
          difficulty: "Intermediate",
        },
        {
          id: 2,
          title: "Machine Learning Fundamentals",
          description: "Learn core ML concepts and algorithms",
          icon: Brain,
          status: "locked",
          skills: ["Supervised Learning", "Unsupervised Learning", "Feature Engineering"],
          resources: [
            { name: "Scikit-learn", url: "#", type: "documentation" },
            { name: "ML Course", url: "#", type: "course" },
          ],
          estimatedTime: "6-8 weeks",
          difficulty: "Advanced",
          prerequisites: ["Python for Data Science"],
        },
      ],
    },
  ]

  const categories = ["all", "Web Development", "Backend", "Mobile", "DevOps", "AI/ML"]

  const filteredRoadmaps = roadmaps.filter(roadmap => {
    const matchesSearch = roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         roadmap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         roadmap.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || roadmap.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const currentRoadmap = roadmaps.find(r => r.id === activeRoadmap) || roadmaps[0]

  const generateCustomRoadmap = async () => {
    if (!customRole || !customCompany) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/company-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: customRole, company: customCompany })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Transform the API response into our roadmap format
        const customRoadmap: RoadmapData = {
          id: "custom",
          title: `${customRole} at ${customCompany}`,
          description: `AI-generated roadmap for ${customRole} position at ${customCompany}`,
          category: "Custom",
          difficulty: "Intermediate",
          duration: "Variable",
          popularity: 0,
          rating: 0,
          tags: [customRole, customCompany],
          color: "from-violet-500 to-purple-500",
          gradient: "bg-gradient-to-r from-violet-500 to-purple-500",
          icon: Sparkles,
          totalSkills: 0,
          completedSkills: 0,
          milestones: [] // This would be populated from the API response
        }
        setGeneratedRoadmap(customRoadmap)
      }
    } catch (error) {
      console.error('Error generating roadmap:', error)
    } finally {
      setIsGenerating(false)
    }
  }

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Intermediate":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return ""
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "documentation":
        return <BookOpen className="h-4 w-4" />
      case "tutorial":
        return <Play className="h-4 w-4" />
      case "course":
        return <Award className="h-4 w-4" />
      case "practice":
        return <Target className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Developer Roadmaps
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover structured learning paths to master new technologies and advance your career
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row gap-4 items-center"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roadmaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Generate Custom Roadmap
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Custom Roadmap</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role">Target Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Frontend Developer"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company (optional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g., Google, Microsoft"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                  />
                </div>
                <Button
                  onClick={generateCustomRoadmap}
                  disabled={!customRole || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Roadmap
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <Tabs value={activeRoadmap} onValueChange={setActiveRoadmap} className="w-full">
          {/* Roadmap Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          >
            {filteredRoadmaps.map((roadmap) => (
              <motion.div
                key={roadmap.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`cursor-pointer ${activeRoadmap === roadmap.id ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setActiveRoadmap(roadmap.id)}
              >
                <Card className={`h-full border-2 transition-all duration-300 ${
                  activeRoadmap === roadmap.id 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                    : 'border-border hover:border-purple-300'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${roadmap.gradient}`}>
                        <roadmap.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {roadmap.trending && (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                        <Badge className={getDifficultyColor(roadmap.difficulty)}>
                          {roadmap.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{roadmap.description}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{roadmap.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{roadmap.popularity}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{roadmap.completedSkills}/{roadmap.totalSkills}</span>
                        </div>
                        <Progress value={(roadmap.completedSkills / roadmap.totalSkills) * 100} className="h-2" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {roadmap.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {roadmap.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{roadmap.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Selected Roadmap Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRoadmap}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-lg ${currentRoadmap.gradient}`}>
                        <currentRoadmap.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{currentRoadmap.title}</CardTitle>
                        <p className="text-muted-foreground">{currentRoadmap.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{currentRoadmap.duration}</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{currentRoadmap.difficulty}</div>
                      <div className="text-sm text-muted-foreground">Difficulty</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{currentRoadmap.totalSkills}</div>
                      <div className="text-sm text-muted-foreground">Skills</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{currentRoadmap.popularity}%</div>
                      <div className="text-sm text-muted-foreground">Popularity</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {currentRoadmap.completedSkills}/{currentRoadmap.totalSkills} skills
                      </span>
                    </div>
                    <Progress value={(currentRoadmap.completedSkills / currentRoadmap.totalSkills) * 100} />
                  </div>
                </CardContent>
              </Card>

              {/* Roadmap Timeline */}
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 hidden md:block transform -translate-x-1/2"></div>

                <div className="space-y-8">
                  {currentRoadmap.milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-4 md:gap-8 relative`}
                    >
                      {/* Milestone dot */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 items-center justify-center z-10 hidden md:flex">
                        <div className="w-5 h-5 rounded-full bg-background flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <Card className={`border-2 transition-all duration-300 ${
                          milestone.status === "completed"
                            ? "border-green-500/30 bg-green-50/50 dark:bg-green-900/10"
                            : milestone.status === "in-progress"
                              ? "border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10"
                              : "border-border hover:border-purple-300"
                        }`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  milestone.status === "locked" 
                                    ? "bg-muted" 
                                    : "bg-gradient-to-r from-purple-500 to-blue-500"
                                }`}>
                                  <milestone.icon className={`h-5 w-5 ${
                                    milestone.status === "locked" 
                                      ? "text-muted-foreground" 
                                      : "text-white"
                                  }`} />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{milestone.title}</CardTitle>
                                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(milestone.status)}>
                                  {getStatusIcon(milestone.status)}
                                  <span className="ml-1">
                                    {milestone.status === "completed" && "Completed"}
                                    {milestone.status === "in-progress" && "In Progress"}
                                    {milestone.status === "locked" && "Locked"}
                                  </span>
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{milestone.estimatedTime}</span>
                              </div>
                              <Badge className={getDifficultyColor(milestone.difficulty)}>
                                {milestone.difficulty}
                              </Badge>
                            </div>

                            {milestone.prerequisites && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Prerequisites</h4>
                                <div className="flex flex-wrap gap-2">
                                  {milestone.prerequisites.map((prereq) => (
                                    <Badge key={prereq} variant="outline" className="text-xs">
                                      {prereq}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="text-sm font-medium mb-2">Skills You'll Learn</h4>
                              <div className="flex flex-wrap gap-2">
                                {milestone.skills.map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant="outline"
                                    className={`${
                                      milestone.status === "locked" 
                                        ? "bg-muted text-muted-foreground border-muted" 
                                        : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300"
                                    }`}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-2">Learning Resources</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {milestone.resources.map((resource) => (
                                  <Button
                                    key={resource.name}
                                    variant="outline"
                                    size="sm"
                                    className={`justify-start ${
                                      milestone.status === "locked" 
                                        ? "opacity-50 pointer-events-none" 
                                        : "hover:bg-purple-50 hover:border-purple-300"
                                    }`}
                                    asChild
                                  >
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                      {getResourceIcon(resource.type)}
                                      <span className="ml-2 truncate">{resource.name}</span>
                                    </a>
                                  </Button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {milestone.status !== "locked" && (
                                <Button
                                  className={`flex-1 ${
                                    milestone.status === "completed"
                                      ? "bg-green-500 hover:bg-green-600"
                                      : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                                  }`}
                                >
                                  {milestone.status === "completed" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Review & Practice
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-4 w-4 mr-2" />
                                      Start Learning
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Spacer for alternating layout */}
                      <div className="flex-1 hidden md:block"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  )
}
