"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronLeft, ChevronRight, Plus, Settings, Moon, Sun, Timer } from "lucide-react"
import confetti from 'canvas-confetti'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

interface Task {
  id: string
  text: string
  done: boolean
  date: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
}

interface Theme {
  name: string
  background: string
  cardBackground: string
  taskBackground: string
  text: string
  accent: string
}

const themes: Theme[] = [
  { name: "Light", background: "bg-gray-100", cardBackground: "bg-white", taskBackground: "bg-gray-50", text: "text-gray-900", accent: "bg-blue-600" },
  { name: "Dark", background: "bg-gray-900", cardBackground: "bg-gray-800", taskBackground: "bg-gray-700", text: "text-white", accent: "bg-blue-500" },
  { name: "Sunset", background: "bg-orange-100", cardBackground: "bg-white", taskBackground: "bg-orange-50", text: "text-orange-900", accent: "bg-orange-500" },
  { name: "Forest", background: "bg-green-100", cardBackground: "bg-white", taskBackground: "bg-green-50", text: "text-green-900", accent: "bg-green-600" },
  { name: "Ocean", background: "bg-blue-100", cardBackground: "bg-white", taskBackground: "bg-blue-50", text: "text-blue-900", accent: "bg-blue-500" },
]

export default function Component() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[1]) // Start with Dark theme
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [streak, setStreak] = useState(0)

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
  }, [])

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("streak", streak.toString())
  }, [streak])

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(currentTheme))
  }, [currentTheme])

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
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.text} p-8 flex flex-col justify-between items-center transition-colors duration-300`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${currentTheme.cardBackground} rounded-3xl shadow-xl p-8 w-full max-w-md transition-colors duration-300 flex-grow`}
      >
        <div className="flex justify-between items-center mb-8">
          <motion.h1 className="text-4xl font-bold" layout>
            {currentDate.getDate()}{" "}
            <span className="text-gray-400 text-2xl">
              {currentDate.toLocaleString("default", { month: "short" })}
              {" "}
              {currentDate.toLocaleString("default", { weekday: "short" })}
            </span>
          </motion.h1>
          <div className="flex space-x-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeTheme(currentTheme.name === "Light" ? themes[1] : themes[0])}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              {currentTheme.name === "Light" ? <Moon size={24} /> : <Sun size={24} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <Settings size={24} />
            </motion.button>
          </div>
        </div>
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-6 ${currentTheme.cardBackground} rounded-2xl shadow-inner transition-colors duration-300`}
            >
              <h2 className="text-xl font-semibold mb-4">Settings</h2>
              <div className="flex flex-wrap items-center justify-between mb-4">
                <span className="w-full mb-2">Theme</span>
                <div className="flex flex-wrap gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => changeTheme(theme)}
                      className={`w-8 h-8 rounded-full ${theme.background} ${
                        currentTheme.name === theme.name ? 'ring-2 ring-blue-500' : ''
                      }`}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span>Pomodoro Timer</span>
                <button
                  onClick={startPomodoro}
                  disabled={isTimerRunning}
                  className={`p-2 ${currentTheme.accent} rounded-full text-white transition-colors duration-300`}
                >
                  <Timer size={20} />
                </button>
              </div>
              <div className="text-center font-mono text-2xl mb-2">
                {formatTime(pomodoroTime)}
              </div>
              <div className="text-center">
                Current streak: {streak} {streak === 1 ? 'day' : 'days'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={addTask} className="mb-6">
          <label htmlFor="new-task" className="block text-sm font-medium mb-2">New Task</label>
          <div className="flex items-center">
            <input
              id="new-task"
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task (use #tags for categorization)"
              className={`flex-grow ${currentTheme.cardBackground} rounded-l-full px-4 py-3 ${currentTheme.text} placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
            />
            <button
              type="submit"
              className={`${currentTheme.accent} rounded-r-full px-4 py-3 text-white transition-colors duration-300`}
            >
              <Plus size={24} />
            </button>
          </div>
        </form>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold capitalize mb-4">Tasks</h2>
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
                                    className={`flex items-center space-x-3 mb-3 p-3 rounded-xl ${currentTheme.taskBackground} transition-colors duration-300`}
                                  >
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => toggleTaskStatus(task.id)}
                                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${currentTheme.accent} border-gray-300`}
                                    />
                                    <span className="flex-grow">
                                      {task.text}
                                      {task.tags.map((tag, index) => (
                                        <span key={index} className={`ml-2 text-xs ${currentTheme.accent} bg-opacity-20 px-2 py-1 rounded-full`}>#{tag}</span>
                                      ))}
                                    </span>
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => deleteTask(task.id)}
                                      className="text-red-500 hover:text-red-600 transition-colors duration-300"
                                    >
                                      ×
                                    </motion.button>
                                  </motion.div>
                                </div>
                              )}
                            </Draggable>
                          ))
                      ) : (
                        <p className="text-gray-500 italic">You have no tasks to do. Time to relax!</p>
                      )}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            <div>
              <h2 className="text-xl font-semibold capitalize mb-4">Done</h2>
              <p className="mb-2 text-gray-500">{completedTasks} task{completedTasks !== 1 ? 's' : ''} completed</p>
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
                        className={`flex items-center space-x-3 mb-3 p-3 rounded-xl ${currentTheme.taskBackground} transition-colors duration-300`}
                      >
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleTaskStatus(task.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-green-500 border-green-500`}
                        >
                          <Check size={14} className="text-white" />
                        </motion.button>
                        <span className="line-through text-gray-500 flex-grow">
                          {task.text}
                          {task.tags.map((tag, index) => (
                            <span key={index} className={`ml-2 text-xs ${currentTheme.accent} bg-opacity-20 px-2 py-1 rounded-full`}>#{tag}</span>
                          ))}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-600 transition-colors duration-300"
                        >
                          ×
                        </motion.button>
                      </motion.div>
                    ))
                ) : (
                  <p className="text-gray-500 italic">You haven&apos;t finished any tasks yet. Keep going!</p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </DragDropContext>
        <div className="mt-8 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {remainingTasks === 0
              ? "No tasks remaining"
              : `${remainingTasks} task${remainingTasks === 1 ? '' : 's'} remaining`}
          </span>
          <div className="flex space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDate(-1)}
              className={`p-2 ${currentTheme.cardBackground} rounded-full shadow transition-colors duration-300`}
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentDate(new Date())}
              className={`px-4 py-2 ${currentTheme.cardBackground} rounded-full shadow text-sm transition-colors duration-300`}
            >
              Today
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDate(1)}
              className={`p-2 ${currentTheme.cardBackground} rounded-full shadow transition-colors duration-300`}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>
      {/* Footer */}
      <footer className="mt-8 text-center text-sm text-gray-500">
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
