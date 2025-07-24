"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { extractTextFromPDF } from "../../../utils/parsePDF"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Area,
} from "recharts"
import Confetti from "react-confetti"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Briefcase,
  Award,
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  BarChart2,
  Zap,
  Target,
  ArrowUpRight,
  Clock,
  DollarSign,
  Building,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Star,
  Bookmark,
  Info,
  Cpu,
  Code,
  Database,
  Server,
  Globe,
  Clipboard,
  FileCheck,
  Paperclip,
  Sparkles,
  Trophy,
  PartyPopper,
} from "lucide-react"
import { motion } from "framer-motion"
import { Tooltip as TooltipComponent, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Define TypeScript interfaces for our data structures
interface ResumeData {
  name: string
  email: string
  phone: string
  location?: string
  education: string[]
  skills: string[]
  experience: Array<
    | {
        company?: string
        title?: string
        dates?: string
        description?: string
      }
    | string
  >
  certifications?: string[]
}

interface CareerPath {
  title: string
  description: string
  requiredSkills: string[]
  missingSkills: string[]
  roadmap: Array<{
    step: string
    description: string
  }>
}

interface CareerAnalysis {
  careerPaths: CareerPath[]
}

interface ImprovementScores {
  formattingCompatibility: number
  keywordRelevance: number
  sectionCompleteness: number
  quantifiedImpact: number
  grammarClarity: number
  lengthDensity: number
}

interface ImprovementSuggestions {
  overallAssessment: string
  contentImprovements: string[]
  formatImprovements: string[]
  scores: ImprovementScores
}

interface MarketDemand {
  demandLevel: string
  description: string
}

interface SalaryRange {
  min: number
  max: number
}

interface IndustryTrend {
  trend: string
  description: string
}

interface IndustryInsights {
  marketDemand: MarketDemand
  salaryRange: SalaryRange
  growthAreas: string[]
  industryTrends: IndustryTrend[]
  topEmployers: string[]
}

interface SkillChartData {
  skill: string
  current: number
  required: number
  missing: number
}

interface AnalysisResult {
  parsed: ResumeData
  careerAnalysis: CareerAnalysis
  improvementSuggestions: ImprovementSuggestions
  industryInsights: IndustryInsights
}

const COLORS = ["#8b5cf6", "#ec4899", "#10b981", "#3b82f6", "#f59e0b", "#ef4444"]

const ResumeUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedCareerPath, setSelectedCareerPath] = useState(0)
  const [activeTab, setActiveTab] = useState("resume")
  const [skillsData, setSkillsData] = useState<SkillChartData[]>([])
  const [processingStage, setProcessingStage] = useState<number>(0)
  const [expandedRoadmapStep, setExpandedRoadmapStep] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebrationBadge, setShowCelebrationBadge] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get window dimensions for confetti
  useEffect(() => {
    const getWindowDimensions = () => {
      const { innerWidth: width, innerHeight: height } = window
      return { width, height }
    }

    const handleResize = () => {
      setWindowDimensions(getWindowDimensions())
    }

    if (typeof window !== 'undefined') {
      setWindowDimensions(getWindowDimensions())
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Trigger celebration when analysis is complete
  useEffect(() => {
    if (analysisResult) {
      setShowConfetti(true)
      setShowCelebrationBadge(true)
      
      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false)
      }, 5000)

      return () => clearTimeout(confettiTimer)
    }
  }, [analysisResult])

  const getMotivationalMessage = (name: string) => {
    const messages = [
      `Amazing work, ${name}! Your career journey is about to take off! 🚀`,
      `Congratulations, ${name}! You're one step closer to your dream career! ✨`,
      `Fantastic, ${name}! Your resume shows incredible potential! 🌟`,
      `Outstanding, ${name}! Your career analysis reveals exciting opportunities! 🎯`,
      `Brilliant, ${name}! You're ready to conquer new professional heights! ⭐`,
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setError(null)
    console.log("Selected File:", selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a PDF resume.")
      return
    }

    if (file.type !== "application/pdf") {
      setMessage("❌ Please upload a PDF file.")
      return
    }

    setUploading(true)
    setMessage("Processing your resume...")
    setError(null)
    setAnalysisResult(null)
    setProcessingStage(1)

    try {
      // Test API connectivity first
      setMessage("Testing API connection...")

      try {
        const testRes = await fetch("/api/resume-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeText: "Test resume text" }),
        })

        if (!testRes.ok) {
          throw new Error(`API connection test failed: ${testRes.status}`)
        }

        setMessage("API connection successful. Extracting text from PDF...")
        setProcessingStage(2)
      } catch (e: any) {
        setError(`API connectivity issue: ${e.message}`)
        setUploading(false)
        return
      }

      // Extract text from PDF
      let extractedText
      try {
        extractedText = await extractTextFromPDF(file)
        console.log("Extracted text from PDF:", extractedText.substring(0, 100) + "...")
        setProcessingStage(3)
      } catch (pdfError: any) {
        setError(`PDF Text Extraction Error: ${pdfError.message}`)
        setUploading(false)
        return
      }

      // Parse resume data and get career analysis with Groq
      setMessage("Analyzing resume with AI...")
      try {
        const response = await fetch("/api/resume-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resumeText: extractedText }),
        })

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`)
        }

        const result = await response.json()
        setProcessingStage(4)

        // Set state with results
        setAnalysisResult(result)

        // Prepare data for skills chart
        if (result.parsed.skills && result.careerAnalysis.careerPaths) {
          const skillsChartData = prepareSkillsChartData(
            result.parsed.skills,
            result.careerAnalysis.careerPaths[0].requiredSkills,
            result.careerAnalysis.careerPaths[0].missingSkills,
          )
          setSkillsData(skillsChartData)
        }

        setMessage("✅ Resume analyzed successfully!")
        setActiveTab("resume")
        setProcessingStage(5)
      } catch (analysisError: any) {
        setError(`Analysis Error: ${analysisError.message}`)
        setUploading(false)
        return
      }
    } catch (err: any) {
      console.error(err)
      setError(`Error: ${err.message}`)
    }

    setUploading(false)
  }

  const prepareSkillsChartData = (
    currentSkills: string[],
    requiredSkills: string[],
    missingSkills: string[],
  ): SkillChartData[] => {
    // Create radar chart data for skills comparison
    const allSkills = [...new Set([...currentSkills, ...requiredSkills])]

    return allSkills.map((skill) => {
      const hasSkill = currentSkills.includes(skill)
      const isRequired = requiredSkills.includes(skill)
      const isMissing = missingSkills.includes(skill)

      return {
        skill,
        current: hasSkill ? 100 : 0,
        required: isRequired ? 100 : 0,
        missing: isMissing ? 100 : 0,
      }
    })
  }

  const updateSkillsData = (careerPathIndex: number) => {
    if (!analysisResult?.careerAnalysis?.careerPaths || !analysisResult?.parsed?.skills) return

    const skillsChartData = prepareSkillsChartData(
      analysisResult.parsed.skills || [],
      analysisResult.careerAnalysis.careerPaths[careerPathIndex]?.requiredSkills || [],
      analysisResult.careerAnalysis.careerPaths[careerPathIndex]?.missingSkills || [],
    )

    setSkillsData(skillsChartData)
  }

  const handleCareerPathSelect = (index: number) => {
    setSelectedCareerPath(index)
    updateSkillsData(index)
  }

  const getProcessingStageText = () => {
    switch (processingStage) {
      case 1:
        return "Connecting to AI service..."
      case 2:
        return "Extracting text from PDF..."
      case 3:
        return "Analyzing resume content..."
      case 4:
        return "Generating career insights..."
      case 5:
        return "Analysis complete!"
      default:
        return "Preparing..."
    }
  }

  const getDemandLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "low":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400"
    }
  }

  const getSkillMatchPercentage = () => {
    if (!analysisResult?.parsed?.skills || !analysisResult?.careerAnalysis?.careerPaths) return 0

    const currentPath = analysisResult.careerAnalysis.careerPaths[selectedCareerPath]
    const requiredSkills = currentPath.requiredSkills.length
    const missingSkills = currentPath.missingSkills.length
    const matchedSkills = requiredSkills - missingSkills

    return Math.round((matchedSkills / requiredSkills) * 100)
  }

  const getSkillGapData = () => {
    if (!analysisResult?.careerAnalysis?.careerPaths) return []

    const currentPath = analysisResult.careerAnalysis.careerPaths[selectedCareerPath]
    return [
      { name: "Matched Skills", value: currentPath.requiredSkills.length - currentPath.missingSkills.length },
      { name: "Missing Skills", value: currentPath.missingSkills.length },
    ]
  }

  const getScoreData = () => {
    if (!analysisResult?.improvementSuggestions?.scores) return []

    const { formattingCompatibility, keywordRelevance, sectionCompleteness, quantifiedImpact, grammarClarity, lengthDensity } = analysisResult.improvementSuggestions.scores
    return [
      { category: "Format", score: formattingCompatibility },
      { category: "Keywords", score: keywordRelevance },
      { category: "Sections", score: sectionCompleteness },
      { category: "Impact", score: quantifiedImpact },
      { category: "Grammar", score: grammarClarity },
      { category: "Length", score: lengthDensity },
    ]
  }

  const getAverageScore = () => {
    if (!analysisResult?.improvementSuggestions?.scores) return 0

    const { formattingCompatibility, keywordRelevance, sectionCompleteness, quantifiedImpact, grammarClarity, lengthDensity } = analysisResult.improvementSuggestions.scores
    return Math.round((formattingCompatibility + keywordRelevance + sectionCompleteness + quantifiedImpact + grammarClarity + lengthDensity) / 6)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-gradient-to-r from-green-400 to-emerald-500"
    if (score >= 6) return "bg-gradient-to-r from-yellow-400 to-orange-500"
    if (score >= 4) return "bg-gradient-to-r from-orange-400 to-red-500"
    return "bg-gradient-to-r from-red-400 to-red-600"
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return "#10b981"
    if (score >= 6) return "#f59e0b"
    if (score >= 4) return "#f97316"
    return "#ef4444"
  }

  const getSalaryRangeData = () => {
    if (!analysisResult?.industryInsights?.salaryRange) return []

    const { min, max } = analysisResult.industryInsights.salaryRange
    const avg = (min + max) / 2

    return [
      { name: "Min", value: min },
      { name: "Avg", value: avg },
      { name: "Max", value: max },
    ]
  }

  const toggleRoadmapStep = (index: number) => {
    if (expandedRoadmapStep === index) {
      setExpandedRoadmapStep(null)
    } else {
      setExpandedRoadmapStep(index)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400">
          Career Compass AI
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Upload your resume to get AI-powered insights, personalized career paths, and actionable improvement
          suggestions
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="mb-10 overflow-hidden border-0 shadow-xl bg-white dark:bg-slate-900">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Resume Analysis</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Get personalized career insights and skill gap analysis in seconds
                  </p>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="resumeUpload"
                    className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-12 h-12 mb-3 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">PDF (MAX. 10MB)</p>
                    </div>
                    <input
                      id="resumeUpload"
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {file && (
                    <div className="mt-3 flex items-center p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-300"
                  size="lg"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center">
                      Analyze Resume
                      <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                  <span
                    className="absolute bottom-0 left-0 h-1 bg-white/20 transition-all duration-300 ease-in-out"
                    style={{ width: uploading ? `${processingStage * 20}%` : "0%" }}
                  ></span>
                </Button>

                {uploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>{getProcessingStageText()}</span>
                      <span>{processingStage * 20}%</span>
                    </div>
                    <Progress value={processingStage * 20} className="h-1.5" />
                  </div>
                )}

                {message && !error && !uploading && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p>{message}</p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Error</p>
                      <p>{error}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 to-purple-600/90 z-10"></div>
                <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=600')] bg-cover bg-center"></div>
                <div className="relative z-20 p-10 h-full flex flex-col justify-center text-white">
                  <h3 className="text-2xl font-bold mb-6">Unlock Your Career Potential</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-white/20 rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <p>Identify skill gaps </p>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-white/20 rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <p>Discover optimal career paths based on your experience</p>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-white/20 rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <p>Get actionable resume improvement suggestions</p>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 bg-white/20 rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <p>Access industry insights and salary expectations</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.3}
        />
      )}

      {/* Celebration Badge */}
      {showCelebrationBadge && analysisResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className="mb-8"
        >
          <Card className="border-0 shadow-2xl overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            </div>
            
            <CardContent className="relative z-10 p-8 text-center text-white">
              {/* Trophy Icon with Animation */}
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ 
                  rotate: 0, 
                  scale: 1,
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.8,
                  type: "spring",
                  stiffness: 300,
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm"
              >
                <Trophy className="w-12 h-12 text-yellow-300" />
              </motion.div>

              {/* Celebration Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="text-3xl font-bold mb-4 flex items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </motion.div>
                Congratulations!
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </motion.div>
              </motion.h2>

              {/* Personalized Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className="text-xl mb-4 font-medium"
              >
                {getMotivationalMessage(analysisResult.parsed.name || "Career Seeker")}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.4 }}
                className="text-white/90 mb-6 text-lg"
              >
                Your resume has been successfully analyzed! Explore your career insights, improvement suggestions, and personalized roadmap below.
              </motion.p>

              {/* Action Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.6 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.8 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm transition-all cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile Ready
                  </Badge>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 2.0 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm transition-all cursor-pointer">
                    <Target className="w-4 h-4 mr-2" />
                    Career Paths Found
                  </Badge>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 2.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm transition-all cursor-pointer">
                    <Zap className="w-4 h-4 mr-2" />
                    Improvements Identified
                  </Badge>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 2.4 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 text-sm backdrop-blur-sm transition-all cursor-pointer">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Industry Insights
                  </Badge>
                </motion.div>
              </motion.div>

              {/* Close Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 2 }}
                className="mt-6"
              >
                <Button
                  variant="outline"
                  onClick={() => setShowCelebrationBadge(false)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  Continue to Analysis
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-4 right-4"
              >
                <PartyPopper className="w-6 h-6 text-yellow-300" />
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-4 left-4"
              >
                <Star className="w-5 h-5 text-yellow-300" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
            <Tabs defaultValue="resume" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-slate-200 dark:border-slate-800">
                <TabsList className="w-full h-16 bg-transparent p-0 rounded-none">
                  <TabsTrigger
                    value="resume"
                    className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400 rounded-none"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Resume Profile</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="career"
                    className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400 rounded-none"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span>Career Paths</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="improvements"
                    className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400 rounded-none"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Award className="w-4 h-4" />
                      <span>Improvements</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    value="insights"
                    className="flex-1 h-full data-[state=active]:border-b-2 data-[state=active]:border-violet-500 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400 rounded-none"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Industry Insights</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-6 md:p-8">
                <TabsContent value="resume" className="mt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                          <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg text-violet-700 dark:text-violet-400 flex items-center">
                              <User className="w-5 h-5 mr-2" />
                              Profile
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-center mb-6">
                              <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-md">
                                <div className="bg-violet-100 dark:bg-violet-900/50 w-full h-full flex items-center justify-center">
                                  <User className="h-12 w-12 text-violet-600 dark:text-violet-400" />
                                </div>
                              </Avatar>
                            </div>

                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {analysisResult.parsed.name}
                              </h3>
                              {analysisResult.parsed.experience &&
                                analysisResult.parsed.experience[0] &&
                                typeof analysisResult.parsed.experience[0] !== "string" && (
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {analysisResult.parsed.experience[0].title}
                                  </p>
                                )}
                            </div>

                            <Separator />

                            <div className="space-y-3">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-3 text-slate-400" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                                  <p className="font-medium">{analysisResult.parsed.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-3 text-slate-400" />
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                                  <p className="font-medium">{analysisResult.parsed.phone}</p>
                                </div>
                              </div>
                              {analysisResult.parsed.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                                  <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                                    <p className="font-medium">{analysisResult.parsed.location}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center">
                              <BookOpen className="w-5 h-5 mr-2" />
                              Education
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-[200px] pr-4">
                              <ul className="space-y-3">
                                {analysisResult.parsed.education?.map((edu, index) => (
                                  <motion.li
                                    key={index}
                                    className="p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                  >
                                    {edu}
                                  </motion.li>
                                )) || <li>No education data found</li>}
                              </ul>
                            </ScrollArea>
                          </CardContent>
                        </Card>

                        {analysisResult.parsed.certifications && analysisResult.parsed.certifications.length > 0 && (
                          <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg text-amber-700 dark:text-amber-400 flex items-center">
                                <Award className="w-5 h-5 mr-2" />
                                Certifications
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {analysisResult.parsed.certifications.map((cert, index) => (
                                  <motion.li
                                    key={index}
                                    className="p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                  >
                                    {cert}
                                  </motion.li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </motion.div>
                    </div>

                    <div className="lg:col-span-2">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="space-y-6"
                      >
                        <Card className="">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400 flex items-center">
                              <Award className="w-5 h-5 mr-2" />
                              Skills
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.parsed.skills?.map((skill, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.1 + index * 0.03 }}
                                >
                                  <Badge
                                    variant="secondary"
                                    className="bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors px-3 py-1 text-sm"
                                  >
                                    {skill}
                                  </Badge>
                                </motion.div>
                              )) || <p>No skills data found</p>}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center">
                              <Briefcase className="w-5 h-5 mr-2" />
                              Experience
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                              <ul className="space-y-4">
                                {analysisResult.parsed.experience?.map((exp, index) => (
                                  <motion.li
                                    key={index}
                                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 shadow-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                  >
                                    {typeof exp === "string" ? (
                                      exp
                                    ) : (
                                      <div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                          <p className="font-semibold text-violet-700 dark:text-violet-400 text-lg">
                                            {exp.title}
                                          </p>
                                          {exp.dates && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                                              <Clock className="w-4 h-4 mr-1 inline" />
                                              {exp.dates}
                                            </p>
                                          )}
                                        </div>
                                        {exp.company && (
                                          <p className="text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                                            <Building className="w-4 h-4 mr-1 inline text-slate-400" />
                                            {exp.company}
                                          </p>
                                        )}
                                        {exp.description && (
                                          <p className="mt-2 text-slate-600 dark:text-slate-400">{exp.description}</p>
                                        )}
                                      </div>
                                    )}
                                  </motion.li>
                                )) || <li>No experience data found</li>}
                              </ul>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="career" className="mt-0">
                  {analysisResult.careerAnalysis && analysisResult.careerAnalysis.careerPaths ? (
                    <div className="space-y-8">
                      <div className="flex flex-wrap gap-3 mb-4">
                        {analysisResult.careerAnalysis.careerPaths.map((path, index) => (
                          <motion.button
                            key={index}
                            onClick={() => handleCareerPathSelect(index)}
                            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                              selectedCareerPath === index
                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md"
                                : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                          >
                            {path.title}
                          </motion.button>
                        ))}
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-xl text-violet-700 dark:text-violet-400">
                                  {analysisResult.careerAnalysis.careerPaths[selectedCareerPath]?.title ||
                                    "Career Path"}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {analysisResult.careerAnalysis.careerPaths[selectedCareerPath]?.description ||
                                    "No description available"}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                                      Required Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                      {analysisResult.careerAnalysis.careerPaths[
                                        selectedCareerPath
                                      ]?.requiredSkills?.map((skill, index) => (
                                        <Badge
                                          key={index}
                                          className="bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 hover:bg-violet-200"
                                        >
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <div>
                      
                            <Card className="border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                                  Skills Analysis
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="overflow-x-auto pb-4">
                                  <div className="min-w-[600px] h-[300px] md:h-[350px] lg:h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart
                                        width={500}
                                        height={300}
                                        data={skillsData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                        <XAxis
                                          dataKey="skill"
                                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                                          interval={0}
                                          angle={-45}
                                          textAnchor="end"
                                          height={60}
                                        />
                                        <YAxis
                                          domain={[0, 100]}
                                          tick={{ fill: "#94a3b8" }}
                                          label={{
                                            value: "Skill Level (%)",
                                            angle: -90,
                                            position: "insideLeft",
                                            fill: "#94a3b8",
                                            fontSize: 12,
                                          }}
                                        />
                                        <Tooltip
                                          contentStyle={{
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                            borderRadius: "8px",
                                            border: "none",
                                            boxShadow:
                                              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                          }}
                                        />
                                        <Legend verticalAlign="top" height={36} iconType="circle" />
                                        <Bar
                                          dataKey="current"
                                          name="Your Skills"
                                          fill="#8b5cf6"
                                          radius={[4, 4, 0, 0]}
                                          barSize={20}
                                        />
                                        <Bar
                                          dataKey="required"
                                          name="Required Skills"
                                          fill="#10b981"
                                          radius={[4, 4, 0, 0]}
                                          barSize={20}
                                        />
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                                <div className="mt-4  gap-4">
                                
                                  <div className="bg-red-300 dark:bg-emerald-900/20 p-6 rounded-lg">
                                    <h4 className="text-xl text-red-700 font-bold dark:text-emerald-400 mb-2 text-center">
                                      Missing Skills
                                    </h4>
                                    <ul className="space-y-1 max-h-[100px] overflow-y-auto pr-2">
                                      {analysisResult?.careerAnalysis?.careerPaths[
                                        selectedCareerPath
                                      ]?.missingSkills.map((skill, index) => (
                                        <li
                                          key={index}
                                          className="text-sm text-black dark:text-black-300 font-bold flex items-center gap-1.5"
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                                          {skill}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                           
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      >
                        <Card className="border-0 shadow-md overflow-hidden ">
                         
                          <CardContent>
                            <div className="space-y-4">
                              {analysisResult.careerAnalysis.careerPaths[selectedCareerPath]?.roadmap?.map(
                                (step, index) => (
                                  <Collapsible
                                    key={index}
                                    open={expandedRoadmapStep === index}
                                    onOpenChange={() => toggleRoadmapStep(index)}
                                  >
                                    <motion.div
                                      className="relative pl-6"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                                    >
                                      <div className="absolute top-0 left-0 h-full w-0.5 bg-emerald-200 dark:bg-emerald-800"></div>
                                      <div className="absolute top-0 left-0 w-5 h-5 rounded-full bg-emerald-500 -translate-x-1/2 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{index + 1}</span>
                                      </div>
                                      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                                          <h5 className="font-bold text-emerald-700 dark:text-emerald-400">
                                            {step.step}
                                          </h5>
                                          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-full">
                                            {expandedRoadmapStep === index ? (
                                              <ChevronUp className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                            ) : (
                                              <ChevronDown className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                                            )}
                                          </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                          <p className="text-slate-700 dark:text-slate-300 mt-2">{step.description}</p>
                                          <div className="mt-3 flex justify-end">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                            >
                                              <Lightbulb className="h-4 w-4 mr-1" /> Resources
                                            </Button>
                                          </div>
                                        </CollapsibleContent>
                                      </div>
                                    </motion.div>
                                  </Collapsible>
                                ),
                              ) || <p></p>}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-64 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="improvements" className="mt-0">
                  {analysisResult.improvementSuggestions ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-green-50  dark:from-green-950/30 dark:to-emerald-950/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-green-700 dark:text-green-400 flex items-center">
                                  <FileCheck className="w-5 h-5 mr-2" />
                                  ATS Compatibility Assessment
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <Alert className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-sm">
                                  <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  <AlertTitle className="text-green-700 dark:text-green-400 font-medium">
                                    ATS Score: {getAverageScore()}/10
                                  </AlertTitle>
                                  <AlertDescription className="text-slate-700 dark:text-slate-300 mt-2">
                                    {analysisResult.improvementSuggestions.overallAssessment}
                                  </AlertDescription>
                                  <AlertDescription className="text-slate-600 dark:text-slate-400 mt-3 text-sm">
                                    <strong>Scoring based on 6 ATS factors:</strong> Formatting Compatibility, Keyword Relevance, Section Completeness, Quantified Impact, Grammar Clarity, and Length/Density optimization.
                                  </AlertDescription>
                                </Alert>
                              </CardContent>
                            </Card>
                          </motion.div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.1 }}
                            >
                              <Card className="h-full border-0 shadow-md overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center">
                                    <Clipboard className="w-5 h-5 mr-2" />
                                    Content Improvement
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ScrollArea className="h-[300px] pr-4">
                                    <ul className="space-y-3">
                                      {analysisResult.improvementSuggestions.contentImprovements?.map((item, index) => (
                                        <motion.li
                                          key={index}
                                          className="flex p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm"
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                        >
                                          <span className="text-blue-500 mr-2 font-bold">•</span>
                                          <span className="text-slate-700 dark:text-slate-300">{item}</span>
                                        </motion.li>
                                      )) || <li>No content improvement suggestions</li>}
                                    </ul>
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: 0.2 }}
                            >
                              <Card className="h-full border-0 shadow-md overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg text-purple-700 dark:text-purple-400 flex items-center">
                                    <Paperclip className="w-5 h-5 mr-2" />
                                    Format Improvement
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ScrollArea className="h-[300px] pr-4">
                                    <ul className="space-y-3">
                                      {analysisResult.improvementSuggestions.formatImprovements?.map((item, index) => (
                                        <motion.li
                                          key={index}
                                          className="flex p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm"
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                        >
                                          <span className="text-purple-500 mr-2 font-bold">•</span>
                                          <span className="text-slate-700 dark:text-slate-300">{item}</span>
                                        </motion.li>
                                      )) || <li>No format improvement suggestions</li>}
                                    </ul>
                                  </ScrollArea>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </div>
                        </div>

                        <div className="lg:col-span-1">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                          >
                            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-violet-950/30">
                              <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-indigo-700 dark:text-indigo-400 flex items-center justify-between">
                                  <div className="flex items-center">
                                    <BarChart2 className="w-5 h-5 mr-2" />
                                    ATS Score
                                  </div>
                                  <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                    {getAverageScore()}/10
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {/* Overall Score Circle */}
                                <div className="flex items-center justify-center mb-6">
                                  <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                          {getAverageScore()}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">out of 10</div>
                                      </div>
                                    </div>
                                    {/* Animated rings */}
                                    <motion.div
                                      className="absolute inset-0 rounded-full border-2 border-indigo-300 dark:border-indigo-700"
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <motion.div
                                      className="absolute inset-0 rounded-full border border-purple-300 dark:border-purple-700"
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                    />
                                  </div>
                                </div>

                                {/* Score Breakdown with Progress Bars */}
                                <div className="space-y-3 px-1">
                                  {getScoreData().map((item, index) => (
                                    <motion.div
                                      key={item.category}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center justify-between min-h-[20px]">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 pr-2">
                                          {item.category}
                                        </span>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                          {item.score}/10
                                        </span>
                                      </div>
                                      <div className="relative">
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                          <motion.div
                                            className={`h-full rounded-full ${getScoreColor(item.score)}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(item.score / 10) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.6 + index * 0.1, ease: "easeOut" }}
                                          />
                                        </div>
                                        {/* Score indicator dot */}
                                        <motion.div
                                          className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md ${getScoreColor(item.score)}`}
                                          initial={{ left: 0 }}
                                          animate={{ left: `calc(${(item.score / 10) * 100}% - 6px)` }}
                                          transition={{ duration: 1, delay: 0.6 + index * 0.1, ease: "easeOut" }}
                                        />
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>

                                {/* Mini Chart */}
                                <div className="h-[140px] w-full mt-6">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      width={300}
                                      height={140}
                                      data={getScoreData()}
                                      margin={{ top: 5, right: 10, left: 10, bottom: 30 }}
                                    >
                                      <XAxis 
                                        dataKey="category" 
                                        tick={{ fill: "#94a3b8", fontSize: 9 }}
                                        interval={0}
                                        angle={0}
                                        textAnchor="middle"
                                        height={30}
                                      />
                                      <YAxis hide />
                                      <Tooltip
                                        contentStyle={{
                                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                                          borderRadius: "8px",
                                          border: "none",
                                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                          fontSize: "12px"
                                        }}
                                      />
                                      <Bar
                                        dataKey="score"
                                        radius={[2, 2, 0, 0]}
                                        barSize={20}
                                      >
                                        {getScoreData().map((entry, index) => (
                                          <motion.rect
                                            key={`cell-${index}`}
                                            fill={getScoreBarColor(entry.score)}
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                                          />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                            className="mt-6"
                          >
                            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-amber-700 dark:text-amber-400 flex items-center">
                                  <Zap className="w-5 h-5 mr-2" />
                                  ATS Quick Tips
                                  <Badge className="ml-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-xs">
                                    ATS
                                  </Badge>
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-3">
                                  {[
                                    { icon: FileText, text: "Use ATS-compatible formatting", tip: "Avoid tables, columns, graphics - use clean, linear layout" },
                                    { icon: Target, text: "Include relevant tech keywords", tip: "Add React, JavaScript, Node.js, API, SQL, Python, etc." },
                                    { icon: User, text: "Include all essential sections", tip: "Summary, Skills, Experience, Projects, Education" },
                                    { icon: TrendingUp, text: "Quantify your achievements", tip: "Use numbers: 'Increased efficiency by 30%', 'Led team of 5'" },
                                    { icon: CheckCircle, text: "Write clearly and error-free", tip: "Use action verbs, active voice, consistent tense" },
                                    { icon: BarChart2, text: "Optimize length and density", tip: "1-2 pages, balanced white space and content" }
                                  ].map((item, index) => (
                                    <motion.li
                                      key={index}
                                      className="group flex items-start p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200 cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                      whileHover={{ scale: 1.02 }}
                                    >
                                      <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full mr-3 mt-0.5 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                                        <item.icon className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      </div>
                                      <div className="flex-1">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                                          {item.text}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                          {item.tip}
                                        </span>
                                      </div>
                                      <ChevronRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-64 w-full" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="insights" className="mt-0">
                  {analysisResult.industryInsights ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-6"
                          >
                            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-violet-700 dark:text-violet-400 flex items-center">
                                  <TrendingUp className="w-5 h-5 mr-2" />
                                  Market Demand
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Demand Level</h4>
                                  <Badge
                                    className={getDemandLevelColor(
                                      analysisResult.industryInsights.marketDemand.demandLevel,
                                    )}
                                  >
                                    {analysisResult.industryInsights.marketDemand.demandLevel}
                                  </Badge>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400">
                                  {analysisResult.industryInsights.marketDemand.description}
                                </p>
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-green-700 dark:text-green-400 flex items-center">
                                  <DollarSign className="w-5 h-5 mr-2" />
                                  Salary Range
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Annual Salary (USD)</p>
                                    <p className="text-xl font-bold text-green-700 dark:text-green-400">
                                      ${analysisResult.industryInsights.salaryRange.min.toLocaleString()} - $
                                      {analysisResult.industryInsights.salaryRange.max.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="h-[150px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                      width={500}
                                      height={400}
                                      data={getSalaryRangeData()}
                                      margin={{
                                        top: 10,
                                        right: 30,
                                        left: 0,
                                        bottom: 0,
                                      }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                      <XAxis dataKey="name" />
                                      <YAxis />
                                      <Tooltip />
                                      <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.3}
                                      />
                                    </AreaChart>
                                  </ResponsiveContainer>
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-blue-700 dark:text-blue-400 flex items-center">
                                  <Building className="w-5 h-5 mr-2" />
                                  Top Employers
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {analysisResult.industryInsights.topEmployers?.map((employer, index) => (
                                    <motion.li
                                      key={index}
                                      className="flex items-center p-2 rounded-md bg-white/60 dark:bg-slate-800/60"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                    >
                                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                                        <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <span className="text-slate-700 dark:text-slate-300">{employer}</span>
                                    </motion.li>
                                  )) || <li>No top employers data</li>}
                                </ul>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>

                        <div className="lg:col-span-2">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="space-y-6"
                          >
                            <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-amber-700 dark:text-amber-400 flex items-center">
                                  <Lightbulb className="w-5 h-5 mr-2" />
                                  Growth Areas
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {analysisResult.industryInsights.growthAreas?.map((area, index) => (
                                    <motion.div
                                      key={index}
                                      className="p-4 rounded-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm"
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                    >
                                      <div className="flex items-center mb-2">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3">
                                          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <h4 className="font-medium text-amber-700 dark:text-amber-400">
                                          Growth Area {index + 1}
                                        </h4>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-400">{area}</p>
                                    </motion.div>
                                  )) || <p>No growth areas data</p>}
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="border-0 shadow-md overflow-hidden bg-white dark:bg-slate-900">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-slate-800 dark:text-slate-200 flex items-center">
                                  <LineChart className="w-5 h-5 mr-2" />
                                  Industry Trends
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ScrollArea className="h-[400px] pr-4">
                                  <div className="space-y-4">
                                    {analysisResult.industryInsights.industryTrends?.map((trend, index) => (
                                      <motion.div
                                        key={index}
                                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 shadow-sm"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                      >
                                        <div className="flex items-center mb-2">
                                          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mr-3">
                                            {index % 5 === 0 && (
                                              <Cpu className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                            )}
                                            {index % 5 === 1 && (
                                              <Code className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                            )}
                                            {index % 5 === 2 && (
                                              <Database className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                            )}
                                            {index % 5 === 3 && (
                                              <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                            )}
                                            {index % 5 === 4 && (
                                              <Server className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                            )}
                                          </div>
                                          <h4 className="font-medium text-violet-700 dark:text-violet-400">
                                            {trend.trend}
                                          </h4>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400">{trend.description}</p>
                                      </motion.div>
                                    )) || <p>No industry trends data</p>}
                                  </div>
                                </ScrollArea>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-64 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  )}
                </TabsContent>
              </CardContent>

              <CardFooter className="border-t border-slate-200 dark:border-slate-800 p-4 flex flex-wrap gap-3 justify-between">
                <div className="flex flex-wrap gap-2">
                  <TooltipProvider>
                    <TooltipComponent>
                      <TooltipTrigger asChild>
                        
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download analysis as PDF</p>
                      </TooltipContent>
                    </TooltipComponent>
                  </TooltipProvider>

                  <TooltipProvider>
                    <TooltipComponent>
                      <TooltipTrigger asChild>
                        
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share this analysis</p>
                      </TooltipContent>
                    </TooltipComponent>
                  </TooltipProvider>

                  <TooltipProvider>
                    <TooltipComponent>
                      <TooltipTrigger asChild>
                       
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Save this analysis</p>
                      </TooltipContent>
                    </TooltipComponent>
                  </TooltipProvider>
                </div>

                <div>
                  <TooltipProvider>
                    <TooltipComponent>
                      <TooltipTrigger asChild>
                       
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Get access to advanced career insights</p>
                      </TooltipContent>
                    </TooltipComponent>
                  </TooltipProvider>
                </div>
              </CardFooter>
            </Tabs>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default ResumeUpload
