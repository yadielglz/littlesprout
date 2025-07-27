import React, { useEffect, useRef, useState } from 'react'

// Example CDC milestones (age in months)
const MILESTONES = [
  { age: 2, text: 'Smiles at people' },
  { age: 2, text: 'Can briefly calm themselves' },
  { age: 4, text: 'Babbles with expression' },
  { age: 4, text: 'Holds head steady, unsupported' },
  { age: 6, text: 'Responds to own name' },
  { age: 6, text: 'Rolls over in both directions' },
  { age: 9, text: 'Stands, holding on' },
  { age: 9, text: 'Plays peek-a-boo' },
  { age: 12, text: 'Says "mama" and "dada"' },
  { age: 12, text: 'Pulls up to stand' },
  { age: 18, text: 'Says several single words' },
  { age: 18, text: 'Walks alone' },
  { age: 24, text: 'Begins to run' },
  { age: 24, text: 'Kicks a ball' },
  { age: 36, text: 'Climbs well' },
  { age: 36, text: 'Speaks in sentences' },
  { age: 48, text: 'Hops and stands on one foot' },
  { age: 48, text: 'Draws a person with 2 to 4 body parts' },
]

function getAgeInMonths(dob: string) {
  try {
    const [birthYear, birthMonth] = dob.split('-').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Convert to 1-indexed
    
    return (currentYear - birthYear) * 12 + (currentMonth - birthMonth);
  } catch (error) {
    console.warn('Invalid date format in getAgeInMonths:', dob);
    return 0;
  }
}

interface MilestoneTickerProps {
  dob: string
}

const MilestoneTicker: React.FC<MilestoneTickerProps> = ({ dob }) => {
  const ageMonths = getAgeInMonths(dob)
  const upcoming = MILESTONES.filter(m => m.age >= ageMonths).slice(0, 5)
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex(i => (i + 1) % upcoming.length)
    }, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [upcoming.length])

  if (upcoming.length === 0) return null

  return (
    <div className="w-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 py-2 px-4 rounded shadow flex flex-col items-center overflow-x-auto my-2 md:my-4 md:mt-0 md:mb-4 md:max-w-2xl md:mx-auto">
      <div className="text-xs text-green-700 dark:text-green-300 font-bold mb-1">Upcoming Milestone ({upcoming[index].age} mo)</div>
      <div className="text-center text-gray-800 dark:text-white font-medium leading-tight">
        {upcoming[index].text}
      </div>
    </div>
  )
}

export default MilestoneTicker 