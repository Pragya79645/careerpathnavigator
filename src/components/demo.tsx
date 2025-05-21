import { Layout, Pointer, Zap } from "lucide-react";

import { Feature108 } from "@/components/shadcnblocks-com-feature108"

const demoData = {
  badge: "",
  heading: "",
  description: "",
  tabs: [
    {
      value: "tab-1",
      icon: <Zap className="h-auto w-4 shrink-0" />,
      label: "Get Career Insights",
      content: {
        badge: "Features",
        title: "Resume & Skill Analysis",
        description:
          "Upload your resume and let our AI deeply analyze your skills, strengths, and experience. It then recommends the most suitable career paths, detects any missing skills, and generates a an improvement plan to help you bridge the gap and grow faster",
        buttonText: "",
        imageSrc:
          "/resume.jpg",
        imageAlt: "placeholder",
      },
    },
    {
      value: "tab-2",
      icon: <Pointer className="h-auto w-4 shrink-0" />,
      label: "View Your Roadmap",
      content: {
        badge: " Features",
        title: "Personalized Roadmaps",
        description:
          "Get a step-by-step, easy-to-follow roadmap with curated resources, project ideas, and timelines that guide you from your current level to your dream role.",
        buttonText: "",
        imageSrc:
          "/Roadmap.webp",
        imageAlt: "placeholder",
      },
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4 shrink-0" />,
      label: "Chat With Groq",
      content: {
        badge: "Features",
        title: "Groq-Powered Career Chatbot",
        description:
          "Have a question about career choices, tech stacks, or interview prep? Just ask the chatbot—powered by Groq—and get instant, smart answers.",
        buttonText: "",
        imageSrc:
          "/chatbot.png",
        imageAlt: "placeholder",
      },
    },
  ],
};

function Feature108Demo() {
  return <Feature108 {...demoData} />;
}

export { Feature108Demo };
