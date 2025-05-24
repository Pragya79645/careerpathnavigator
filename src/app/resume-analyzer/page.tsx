import ResumeUpload from "@/components/resume-analyzer/resume-upload"

export const metadata = {
  title: "Resume Analyzer | Career Compass",
  description: "AI-powered resume analysis and career path recommendations",
}

export default function ResumeAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12">
      <ResumeUpload />
    </div>
  )
}
