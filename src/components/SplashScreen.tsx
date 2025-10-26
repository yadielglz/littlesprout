import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SplashScreenProps {
  show: boolean
  onComplete?: () => void
}

const SplashScreen: React.FC<SplashScreenProps> = ({ show, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    if (!show) return

    const timer1 = setTimeout(() => setCurrentStep(1), 500)
    const timer2 = setTimeout(() => setCurrentStep(2), 1000)
    const timer3 = setTimeout(() => setShowText(true), 1200)
    const timer4 = setTimeout(() => {
      if (onComplete) onComplete()
    }, 2500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center z-[9999] overflow-hidden"
        >
          {/* Background animated elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 50,
                  opacity: 0
                }}
                animate={{ 
                  y: -50,
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="text-center relative z-10">
            {/* Logo container */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: currentStep >= 1 ? 1 : 0,
                rotate: currentStep >= 1 ? 0 : -180
              }}
              transition={{ 
                duration: 0.8,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="relative mb-8"
            >
              {/* Logo background circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: currentStep >= 1 ? 1 : 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full mx-auto flex items-center justify-center shadow-2xl border border-white/30"
              >
                {/* Logo Image */}
                <motion.img
                  initial={{ scale: 0, y: 20 }}
                  animate={{ 
                    scale: currentStep >= 2 ? 1 : 0,
                    y: currentStep >= 2 ? 0 : 20
                  }}
                  transition={{ 
                    delay: 0.4,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 300
                  }}
                  src="/logo.png"
                  alt="LittleSprout"
                  className="w-24 h-24 object-contain"
                />
              </motion.div>

              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ 
                  scale: currentStep >= 2 ? [1, 1.5, 2] : 1,
                  opacity: currentStep >= 2 ? [0.5, 0.2, 0] : 0
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/20"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ 
                  scale: currentStep >= 2 ? [1, 1.8, 2.5] : 1,
                  opacity: currentStep >= 2 ? [0.3, 0.1, 0] : 0
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5
                }}
              />
            </motion.div>

            {/* App name and tagline */}
            <AnimatePresence>
              {showText && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <motion.h1
                    className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    LittleSprout
                  </motion.h1>
                  <motion.p
                    className="text-lg md:text-xl text-white/90 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    Nurturing Growth, One Moment at a Time
                  </motion.p>
                  
                  {/* Loading indicator */}
                  <motion.div
                    className="mt-8 flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-3 h-3 bg-white rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Corner decorations */}
          <motion.div
            className="absolute top-10 left-10 text-2xl opacity-60"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            🍼
          </motion.div>
          <motion.div
            className="absolute top-10 right-10 text-2xl opacity-60"
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            👶
          </motion.div>
          <motion.div
            className="absolute bottom-10 left-10 text-2xl opacity-60"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            💤
          </motion.div>
          <motion.div
            className="absolute bottom-10 right-10 text-2xl opacity-60"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            🧸
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SplashScreen 