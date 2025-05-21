"use client"

import { MotionConfig, motion } from "framer-motion"

const VARIANTS = {
  top: {
    open: {
      rotate: ["0deg", "0deg", "45deg"],
      top: ["35%", "50%", "50%"],
    },
    closed: {
      rotate: ["45deg", "0deg", "0deg"],
      top: ["50%", "50%", "35%"],
    },
  },
  middle: {
    open: {
      rotate: ["0deg", "0deg", "-45deg"],
    },
    closed: {
      rotate: ["-45deg", "0deg", "0deg"],
    },
  },
  bottom: {
    open: {
      rotate: ["0deg", "0deg", "45deg"],
      bottom: ["35%", "50%", "50%"],
      left: "50%",
    },
    closed: {
      rotate: ["45deg", "0deg", "0deg"],
      bottom: ["50%", "50%", "35%"],
      left: "calc(50% + 10px)",
    },
  },
}

export const AnimatedHamburgerButton = ({
  isOpen,
  onClick,
  className,
}: { isOpen: boolean; onClick: () => void; className?: string }) => {
  return (
    <MotionConfig
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
    >
      <motion.button
        initial={false}
        animate={isOpen ? "open" : "closed"}
        onClick={onClick}
        className={`relative h-12 w-12 rounded-full bg-white/10 backdrop-blur-md shadow-lg border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-indigo-500/30 ${className}`}
        whileHover={{ boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)" }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          variants={VARIANTS.top}
          className="absolute h-1 w-5 bg-indigo-400"
          style={{ y: "-50%", left: "50%", x: "-50%", top: "35%" }}
        />
        <motion.span
          variants={VARIANTS.middle}
          className="absolute h-1 w-5 bg-indigo-400"
          style={{ left: "50%", x: "-50%", top: "50%", y: "-50%" }}
        />
        <motion.span
          variants={VARIANTS.bottom}
          className="absolute h-1 w-2.5 bg-indigo-400"
          style={{
            x: "-50%",
            y: "50%",
            bottom: "35%",
            left: "calc(50% + 5px)",
          }}
        />
      </motion.button>
    </MotionConfig>
  )
}
