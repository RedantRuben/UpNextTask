"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronLeft, ChevronRight, Plus, Settings, Moon, Sun, Timer, Trophy } from "lucide-react" // Added Trophy icon
import confetti from 'canvas-confetti'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

// Task Interface
interface Task {
  id: string
  text: string
  done: boolean
  date: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

// Theme Interface
interface Theme {
  name: string
  background: string
  cardBackground: string
  taskBackground: string
  text: string
  accent: string
}

// Achievement Interface
interface Achievement {
  id: string
  name: string
  description: string
  icon?: JSX.Element
}

// Predefined Themes
const themes: Theme[] = [
  { name: "Light", background: "bg-gray-100", cardBackground: "bg-white", taskBackground: "bg-gray-50", text: "text-gray-900", accent: "bg-blue-600" },
  { name: "Dark", background: "bg-gray-900", cardBackground: "bg-gray-800", taskBackground: "bg-gray-700", text: "text-white", accent: "bg-blue-500" },
  { name: "Sunset", background: "bg-orange-100", cardBackground: "bg-white", taskBackground: "bg-orange-50", text: "text-orange-900", accent: "bg-orange-500" },
  { name: "Forest", background: "bg-green-100", cardBackground: "bg-white", taskBackground: "bg-green-50", text: "text-green-900", accent: "bg-green-600" },
  { name: "Ocean", background: "bg-blue-100", cardBackground: "bg-white", taskBackground: "bg-blue-50", text: "text-blue-900", accent: "bg-blue-500" },
  { name: "Lavender", background: "bg-purple-100", cardBackground: "bg-purple-50", taskBackground: "bg-purple-200", text: "text-purple-900", accent: "bg-purple-500" },
  { name: "Midnight", background: "bg-indigo-900", cardBackground: "bg-indigo-800", taskBackground: "bg-indigo-700", text: "text-indigo-100", accent: "bg-indigo-500" },
  { name: "Cherry", background: "bg-red-100", cardBackground: "bg-red-50", taskBackground: "bg-red-200", text: "text-red-900", accent: "bg-red-500" },
  { name: "Teal", background: "bg-teal-100", cardBackground: "bg-teal-50", taskBackground: "bg-teal-200", text: "text-teal-900", accent: "bg-teal-500" },
  { name: "Amber", background: "bg-amber-100", cardBackground: "bg-amber-50", taskBackground: "bg-amber-200", text: "text-amber-900", accent: "bg-amber-500" },
  { name: "Rose", background: "bg-pink-100", cardBackground: "bg-pink-50", taskBackground: "bg-pink-200", text: "text-pink-900", accent: "bg-pink-500" },
  { name: "Slate", background: "bg-slate-100", cardBackground: "bg-slate-50", taskBackground: "bg-slate-200", text: "text-slate-900", accent: "bg-slate-500" },
  { name: "Cyan", background: "bg-cyan-100", cardBackground: "bg-cyan-50", taskBackground: "bg-cyan-200", text: "text-cyan-900", accent: "bg-cyan-500" },
  { name: "Lime", background: "bg-lime-100", cardBackground: "bg-lime-50", taskBackground: "bg-lime-200", text: "text-lime-900", accent: "bg-lime-500" },
  { name: "Emerald", background: "bg-emerald-100", cardBackground: "bg-emerald-50", taskBackground: "bg-emerald-200", text: "text-emerald-900", accent: "bg-emerald-500" },
  { name: "Indigo", background: "bg-indigo-100", cardBackground: "bg-indigo-50", taskBackground: "bg-indigo-200", text: "text-indigo-900", accent: "bg-indigo-500" },
  { name: "Gray", background: "bg-gray-200", cardBackground: "bg-gray-100", taskBackground: "bg-gray-300", text: "text-gray-800", accent: "bg-gray-500" },
  { name: "Yellow", background: "bg-yellow-100", cardBackground: "bg-yellow-50", taskBackground: "bg-yellow-200", text: "text-yellow-900", accent: "bg-yellow-500" },
  { name: "Bronze", background: "bg-orange-200", cardBackground: "bg-orange-100", taskBackground: "bg-orange-300", text: "text-orange-900", accent: "bg-orange-600" },
  { name: "Gold", background: "bg-yellow-200", cardBackground: "bg-yellow-100", taskBackground: "bg-yellow-300", text: "text-yellow-900", accent: "bg-yellow-600" },
]

// Predefined Achievements
const achievements: Achievement[] = [
  {
    id: "first_task",
    name: "First Task",
    description: "Complete your first task.",
    icon: <Trophy size={20} className="text-yellow-500" />,
  },
  {
    id: "five_tasks",
    name: "Task Master",
    description: "Complete 5 tasks.",
    icon: <Trophy size={20} className="text-green-500" />,
  },
  {
    id: "streak_5",
    name: "5-Day Streak",
    description: "Maintain a streak of 5 days.",
    icon: <Trophy size={20} className="text-blue-500" />,
  },
  // Add more achievements as needed
]

export default function Component() {
  // Existing States
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[1]) // Start with Dark theme
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [streak, setStreak] = useState(0)
  
  // New State for Achievements
  const [earnedAchievements, setEarnedAchievements] = useState<string[]>([])

  // Load data from localStorage
  useEffect(() => {
    const storedTasks = localStorage.getItem("tasks")
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks))
    }
    const storedStreak = localStorage.getItem("streak")
    if (storedStreak) {
      setStreak(parseInt(storedStreak))
    }
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme) {
      setCurrentTheme(JSON.parse(storedTheme))
    }
    const storedAchievements = localStorage.getItem("achievements")
    if (storedAchievements) {
      setEarnedAchievements(JSON.parse(storedAchievements))
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("streak", streak.toString())
  }, [streak])

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(currentTheme))
  }, [currentTheme])

  useEffect(() => {
    localStorage.setItem("achievements", JSON.stringify(earnedAchievements))
  }, [earnedAchievements])

  // Achievement Awarding Logic
  useEffect(() => {
    // Check for First Task Achievement
    if (tasks.length >= 1 && !earnedAchievements.includes("first_task")) {
      awardAchievement("first_task")
    }

    // Check for Task Master Achievement
    const completedTasks = tasks.filter(task => task.done).length
    if (completedTasks >= 5 && !earnedAchievements.includes("five_tasks")) {
      awardAchievement("five_tasks")
    }

    // Check for 5-Day Streak Achievement
    if (streak >= 5 && !earnedAchievements.includes("streak_5")) {
      awardAchievement("streak_5")
    }

    // Add more achievement checks as needed
  }, [tasks, streak, earnedAchievements])

  const awardAchievement = (achievementId: string) => {
    setEarnedAchievements([...earnedAchievements, achievementId])
    // Optional: Trigger confetti or other visual effects
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  // Existing Functions
  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.trim()) {
      const tags = newTask.match(/#\w+/g) || []
      const taskText = newTask.replace(/#\w+/g, '').trim()
      setTasks([...tasks, {
        id: Date.now().toString(),
        text: taskText,
        done: false,
        date: currentDate.toISOString().split('T')[0],
        priority: 'medium',
        tags: tags.map(tag => tag.slice(1))
      }])
      setNewTask("")
    }
  }

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const newDoneStatus = !task.done
        if (newDoneStatus) {
          setStreak(streak + 1)
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        } else {
          setStreak(Math.max(0, streak - 1))
        }
        return { ...task, done: newDoneStatus }
      }
      return task
    }))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + days)
    setCurrentDate(newDate)
  }

  const changeTheme = (theme: Theme) => {
    setCurrentTheme(theme)
  }

  const startPomodoro = () => {
    setIsTimerRunning(true)
    const timer = setInterval(() => {
      setPomodoroTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          setIsTimerRunning(false)
          return 25 * 60
        }
        return prevTime - 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newTasks = Array.from(tasks)
    const [reorderedItem] = newTasks.splice(result.source.index, 1)
    newTasks.splice(result.destination.index, 0, reorderedItem)

    setTasks(newTasks)
  }

  const filteredTasks = tasks.filter((task) => task.date === currentDate.toISOString().split('T')[0])
  const remainingTasks = filteredTasks.filter((task) => !task.done).length
  const completedTasks = filteredTasks.filter((task) => task.done).length

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.text} p-4 sm:p-8 flex flex-col justify-between items-center transition-colors duration-300`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${currentTheme.cardBackground} rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md transition-colors duration-300 flex-grow`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <motion.h1 className="text-3xl sm:text-4xl font-bold" layout>
            {currentDate.getDate()}{" "}
            <span className="text-gray-400 text-base sm:text-2xl">
              {currentDate.toLocaleString("default", { month: "short" })}
              {" "}
              {currentDate.toLocaleString("default", { weekday: "short" })}
            </span>
          </motion.h1>
          <div className="flex space-x-3 sm:space-x-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeTheme(currentTheme.name === "Light" ? themes[1] : themes[0])}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Toggle Theme"
            >
              {currentTheme.name === "Light" ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              aria-label="Settings"
            >
              <Settings size={20} />
            </motion.button>
          </div>
        </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 sm:mb-6 p-4 sm:p-6 ${currentTheme.cardBackground} rounded-2xl shadow-inner transition-colors duration-300 overflow-auto max-h-80`}
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Settings</h2>
              {/* Theme Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                <span className="mb-2 sm:mb-0">Theme</span>
                <div className="flex flex-wrap gap-1 sm:gap-2 max-h-40 overflow-y-auto">
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => changeTheme(theme)}
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${theme.background} ${
                        currentTheme.name === theme.name ? 'ring-2 ring-blue-500' : ''
                      }`}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
              {/* Pomodoro Timer */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span>Pomodoro Timer</span>
                <button
                  onClick={startPomodoro}
                  disabled={isTimerRunning}
                  className={`p-2 ${currentTheme.accent} rounded-full text-white transition-colors duration-300`}
                  aria-label="Start Pomodoro Timer"
                >
                  <Timer size={18} />
                </button>
              </div>
              {/* Timer Display */}
              <div className="text-center font-mono text-xl sm:text-2xl mb-2">
                {formatTime(pomodoroTime)}
              </div>
              {/* Streak Display */}
              <div className="text-center text-sm sm:text-base">
                Current streak: {streak} {streak === 1 ? 'day' : 'days'}
              </div>
              {/* Achievements Section */}
              <div className="mt-4 sm:mt-6">
                <h3 className="text-md sm:text-lg font-semibold mb-2">Achievements</h3>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-md ${earnedAchievements.includes(achievement.id) ? 'bg-green-100' : 'bg-gray-200'} transition-colors duration-300`}>
                      {achievement.icon}
                      <div>
                        <p className="text-sm sm:text-base font-medium">{achievement.name}</p>
                        <p className="text-xs sm:text-sm">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="mb-4 sm:mb-6">
          <label htmlFor="new-task" className="block text-sm sm:text-base font-medium mb-1 sm:mb-2">New Task</label>
          <div className="flex flex-col sm:flex-row items-stretch">
            <input
              id="new-task"
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task (use #tags for categorization)"
              className={`flex-grow ${currentTheme.cardBackground} rounded-full sm:rounded-l-full sm:rounded-r-none px-4 py-2 sm:py-3 ${currentTheme.text} placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
            />
            <button
              type="submit"
              className={`${currentTheme.accent} mt-2 sm:mt-0 sm:ml-2 rounded-full sm:rounded-r-full px-4 py-2 sm:py-3 text-white transition-colors duration-300 flex justify-center items-center`}
              aria-label="Add Task"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>

        {/* Task List */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="space-y-4 sm:space-y-6">
            {/* Pending Tasks */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold capitalize mb-3 sm:mb-4">Tasks</h2>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <AnimatePresence>
                      {filteredTasks.filter((task) => !task.done).length > 0 ? (
                        filteredTasks
                          .filter((task) => !task.done)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 p-3 rounded-xl ${currentTheme.taskBackground} transition-colors duration-300`}
                                  >
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => toggleTaskStatus(task.id)}
                                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${currentTheme.accent} border-gray-300`}
                                      aria-label="Toggle Task Status"
                                    />
                                    <span className="flex-grow text-sm sm:text-base">
                                      {task.text}
                                      {task.tags.map((tag, index) => (
                                        <span key={index} className={`ml-1 sm:ml-2 text-xs sm:text-sm ${currentTheme.accent} bg-opacity-20 px-2 py-1 rounded-full`}>#{tag}</span>
                                      ))}
                                    </span>
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => deleteTask(task.id)}
                                      className="text-red-500 hover:text-red-600 transition-colors duration-300 text-lg sm:text-xl"
                                      aria-label="Delete Task"
                                    >
                                      ×
                                    </motion.button>
                                  </motion.div>
                                </div>
                              )}
                            </Draggable>
                          ))
                      ) : (
                        <p className="text-gray-500 italic text-sm sm:text-base">You haven&#39;t finished any tasks yet. Keep going!</p>
                      )}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Completed Tasks */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold capitalize mb-2 sm:mb-3">Done</h2>
              <p className="mb-2 text-gray-500 text-sm sm:text-base">{completedTasks} task{completedTasks !== 1 ? 's' : ''} completed</p>
              <AnimatePresence>
                {filteredTasks.filter((task) => task.done).length > 0 ? (
                  filteredTasks
                    .filter((task) => task.done)
                    .map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 p-3 rounded-xl ${currentTheme.taskBackground} transition-colors duration-300`}
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center bg-green-500 border-green-500`}
                          aria-label="Mark Task as Incomplete"
                        >
                          <Check size={14} className="text-white" />
                        </motion.button>
                        <span className="line-through text-gray-500 flex-grow text-sm sm:text-base">
                          {task.text}
                          {task.tags.map((tag, index) => (
                            <span key={index} className={`ml-1 sm:ml-2 text-xs sm:text-sm ${currentTheme.accent} bg-opacity-20 px-2 py-1 rounded-full`}>#{tag}</span>
                          ))}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-300 text-lg sm:text-xl"
                          aria-label="Delete Task"
                        >
                          ×
                        </motion.button>
                      </motion.div>
                    ))
                ) : (
                  <p className="text-gray-500 italic text-sm sm:text-base">You haven&#39;t finished any tasks yet. Keep going!</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DragDropContext>

        {/* Footer Section within Card */}
        <div className="mt-6 sm:mt-8 flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-500">
            {remainingTasks === 0
              ? "No tasks remaining"
              : `${remainingTasks} task${remainingTasks === 1 ? '' : 's'} remaining`}
          </span>
          <div className="flex space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDate(-1)}
              className={`p-2 ${currentTheme.cardBackground} rounded-full shadow transition-colors duration-300`}
              aria-label="Previous Day"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(new Date())}
              className={`px-3 py-1 ${currentTheme.accent} rounded-full shadow text-xs sm:text-sm text-white transition-colors duration-300`}
              aria-label="Today"
            >
              Today
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDate(1)}
              className={`p-2 ${currentTheme.cardBackground} rounded-full shadow transition-colors duration-300`}
              aria-label="Next Day"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Footer Outside Card */}
      <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
        © {new Date().getFullYear()} Developed by{" "}
        <a
          href="https://rubenredant.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Ruben Redant
        </a>
      </footer>
    </div>
  )
}
