"use client"
import { type Dispatch, type SetStateAction, useState, type DragEvent, type FormEvent, useEffect } from "react"
import { FiPlus } from "react-icons/fi"
import { motion } from "framer-motion"
import { FaTrash } from "react-icons/fa"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc } from "firebase/firestore"
import { getAuth, onAuthStateChanged, type User } from "firebase/auth"
import type React from "react"

// Firebase configuration
const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyAxm7qtwA-HnVlbNa0nbvkJ2GVDku38VIQ",
  authDomain: "careerpathnavigator-8783c.firebaseapp.com",
  projectId: "careerpathnavigator-8783c",
  storageBucket: "careerpathnavigator-8783c.firebasestorage.app",
  messagingSenderId: "411185912011",
  appId: "1:411185912011:web:03fb1b13a0aae0fe33634e",
  measurementId: "G-F14VF8W9RJ",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export const CustomKanban = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center flex-col">
        <h1 className="text-2xl mb-4">Please sign in to access your Kanban board</h1>
        <p>Sign in to save and access your tasks.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-white text-neutral-800 mt-16">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-purple-400 to-teal-400 py-8 px-4 text-center text-white shadow-md sm:py-16">
        <div className="mx-auto w-full">
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:mb-4 sm:text-4xl md:text-5xl">Plan Your Journey</h1>
          <p className="text-sm sm:text-base md:text-xl">
            Organize tasks, track progress, and achieve your goals — one step at a time.
          </p>
          <p className="mt-2 text-sm">Signed in as: {currentUser.email}</p>
        </div>
      </div>

      <div className="px-4 py-4 w-full sm:px-6 md:px-8 sm:py-8">
        <Board userId={currentUser.uid} />
      </div>
    </div>
  )
}

const Board = ({ userId }: { userId: string }) => {
  const [cards, setCards] = useState<CardType[]>([])
  const [loading, setLoading] = useState(true)

  // Define columns order
  const columns = [
    { id: "backlog", title: "Backlog", headingColor: "text-purple-600" },
    { id: "todo", title: "TODO", headingColor: "text-yellow-600" },
    { id: "doing", title: "In progress", headingColor: "text-blue-600" },
    { id: "done", title: "Complete", headingColor: "text-emerald-600" },
  ]

  useEffect(() => {
    // Subscribe to real-time updates for this user's cards
    const userTasksRef = collection(db, "users", userId, "tasks")

    const unsubscribe = onSnapshot(userTasksRef, (snapshot) => {
      const updatedCards: CardType[] = []
      snapshot.forEach((doc) => {
        updatedCards.push({
          id: doc.id,
          ...(doc.data() as Omit<CardType, "id">),
        })
      })
      setCards(updatedCards)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  // Update Firebase when cards change
  const updateCardsInFirebase = async (updatedCards: CardType[]) => {
    try {
      // Handle card updates
      for (const card of updatedCards) {
        await setDoc(doc(db, "users", userId, "tasks", card.id), { title: card.title, column: card.column })
      }

      // Check for deleted cards
      const deletedCards = cards.filter((oldCard) => !updatedCards.some((newCard) => newCard.id === oldCard.id))

      // Delete removed cards from Firebase
      for (const card of deletedCards) {
        await deleteDoc(doc(db, "users", userId, "tasks", card.id))
      }
    } catch (error) {
      console.error("Error updating cards in Firebase:", error)
    }
  }

  // Custom setCards function that also updates Firebase
  const setCardsWithFirebase = (newCards: CardType[] | ((prev: CardType[]) => CardType[])) => {
    setCards((prevCards) => {
      const updatedCards = typeof newCards === "function" ? newCards(prevCards) : newCards
      updateCardsInFirebase(updatedCards)
      return updatedCards
    })
  }

  if (loading) {
    return <div className="w-full text-center py-8">Loading your tasks...</div>
  }

  return (
    <div className="flex flex-col w-full">
      {/* Scrollable container for columns */}
      <div className="flex flex-col md:flex-row w-full gap-4 overflow-x-auto pb-16 lg:pb-6 pt-2">
        {columns.map((column) => (
          <Column
            key={column.id}
            title={column.title}
            column={column.id as ColumnType}
            headingColor={column.headingColor}
            cards={cards}
            setCards={setCardsWithFirebase}
          />
        ))}
      </div>

      {/* Mobile Delete Zone (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white shadow-lg border-t border-gray-200 p-3 flex justify-center lg:hidden">
        <MobileDeleteZone setCards={setCardsWithFirebase} />
      </div>

      {/* Desktop Delete Zone */}
      <div className="hidden lg:block mt-4">
        <DeleteZone setCards={setCardsWithFirebase} />
      </div>
    </div>
  )
}

type ColumnProps = {
  title: string
  headingColor: string
  cards: CardType[]
  column: ColumnType
  setCards: Dispatch<SetStateAction<CardType[]>>
}

const Column = ({ title, headingColor, cards, column, setCards }: ColumnProps) => {
  const [active, setActive] = useState(false)

  useEffect(() => {
    const handleDeleteCard = (e: Event) => {
      const { id } = (e as CustomEvent).detail
      setCards((prev) => prev.filter((card) => card.id !== id))
    }

    document.addEventListener("deleteCard", handleDeleteCard)
    return () => {
      document.removeEventListener("deleteCard", handleDeleteCard)
    }
  }, [setCards])

  const handleDragStart = (e: DragEvent, card: CardType) => {
    e.dataTransfer.setData("cardId", card.id)
  }

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId")

    setActive(false)
    clearHighlights()

    const indicators = getIndicators()
    const { element } = getNearestIndicator(e, indicators)

    const before = element.dataset.before || "-1"

    if (before !== cardId) {
      let copy = [...cards]

      let cardToTransfer = copy.find((c) => c.id === cardId)
      if (!cardToTransfer) return
      cardToTransfer = { ...cardToTransfer, column }

      copy = copy.filter((c) => c.id !== cardId)

      const moveToBack = before === "-1"

      if (moveToBack) {
        copy.push(cardToTransfer)
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before)
        if (insertAtIndex === undefined) return

        copy.splice(insertAtIndex, 0, cardToTransfer)
      }

      setCards(copy)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    highlightIndicator(e)

    setActive(true)
  }

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators()

    indicators.forEach((i) => {
      i.style.opacity = "0"
    })
  }

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators()

    clearHighlights(indicators)

    const el = getNearestIndicator(e, indicators)

    el.element.style.opacity = "1"
  }

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()

        const offset = e.clientY - (box.top + DISTANCE_OFFSET)

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      },
    )

    return el
  }

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`) as unknown as HTMLElement[])
  }

  const handleDragLeave = () => {
    clearHighlights()
    setActive(false)
  }

  const filteredCards = cards.filter((c) => c.column === column)

  return (
    <div className="w-full md:flex-1 md:min-w-[250px] md:max-w-[350px] mb-4 md:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        <span className="rounded bg-white px-2 py-1 text-sm text-neutral-600 shadow-sm">{filteredCards.length}</span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`min-h-40 w-full rounded-lg bg-white p-3 sm:p-4 shadow-md transition-colors ${active ? "bg-purple-100" : ""}`}
      >
        {filteredCards.map((c) => {
          return <Card key={c.id} {...c} handleDragStart={handleDragStart} />
        })}
        <DropIndicator beforeId={null} column={column} />
        <AddCard column={column} setCards={setCards} />
      </div>
    </div>
  )
}

type CardProps = CardType & {
  handleDragStart: Function
}

const Card = ({ title, id, column, handleDragStart }: CardProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Get the setCards function from the parent component using a custom event
    const event = new CustomEvent("deleteCard", { detail: { id } })
    document.dispatchEvent(event)
  }

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { title, id, column })}
        className="cursor-grab rounded-lg border border-neutral-200 bg-white p-3 shadow-sm hover:shadow-md active:cursor-grabbing w-full relative group"
      >
        <p className="text-sm text-neutral-700 break-words pr-6">{title}</p>
        <button
          onClick={handleDelete}
          className="absolute right-2 top-2 text-neutral-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 md:opacity-0 focus:opacity-100"
          aria-label="Delete card"
        >
          <FaTrash size={14} />
        </button>
      </motion.div>
    </>
  )
}

type DropIndicatorProps = {
  beforeId: string | null
  column: string
}

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div data-before={beforeId || "-1"} data-column={column} className="my-0.5 h-0.5 w-full bg-purple-400 opacity-0" />
  )
}

// Desktop Delete Zone
const DeleteZone = ({
  setCards,
}: {
  setCards: Dispatch<SetStateAction<CardType[]>>
}) => {
  const [active, setActive] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setActive(true)
    setIsDraggingOver(true)
  }

  const handleDragLeave = () => {
    setActive(false)
    setIsDraggingOver(false)
  }

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId")
    if (!cardId) return

    // Show delete animation
    setShowDeleteAnimation(true)

    // Delete the card after animation plays
    setTimeout(() => {
      setCards((pv) => pv.filter((c) => c.id !== cardId))
      setShowDeleteAnimation(false)
      setActive(false)
      setIsDraggingOver(false)
    }, 800)
  }

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`flex-1 min-h-[200px] md:min-w-[250px] md:max-w-[350px] flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
        active ? "border-red-400 bg-red-50 text-red-500" : "border-teal-400 bg-teal-50 text-teal-500"
      }`}
    >
      {showDeleteAnimation ? (
        <div className="flex flex-col items-center">
          <FaTrash className="text-3xl md:text-4xl animate-bounce" />
          <p className="mt-2 text-sm md:text-base">Deleting...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <FaTrash className="text-2xl md:text-3xl transition-transform hover:scale-110" />
          <p className="mt-2 text-sm md:text-base">Drop to delete</p>
        </div>
      )}
    </div>
  )
}

// Mobile Delete Zone (horizontal bar)
const MobileDeleteZone = ({
  setCards,
}: {
  setCards: Dispatch<SetStateAction<CardType[]>>
}) => {
  const [active, setActive] = useState(false)
  const [showDeleteAnimation, setShowDeleteAnimation] = useState(false)

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setActive(true)
  }

  const handleDragLeave = () => {
    setActive(false)
  }

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId")
    if (!cardId) return

    // Show delete animation
    setShowDeleteAnimation(true)

    // Delete the card after animation plays
    setTimeout(() => {
      setCards((pv) => pv.filter((c) => c.id !== cardId))
      setShowDeleteAnimation(false)
      setActive(false)
    }, 800)
  }

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`w-full py-3 px-4 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
        active ? "border-red-400 bg-red-50 text-red-500" : "border-teal-400 bg-teal-50 text-teal-500"
      }`}
    >
      {showDeleteAnimation ? (
        <div className="flex items-center">
          <FaTrash className="text-xl animate-bounce mr-2" />
          <p className="text-sm">Deleting...</p>
        </div>
      ) : (
        <div className="flex items-center">
          <FaTrash className="text-lg mr-2" />
          <p className="text-sm">Drop here to delete</p>
        </div>
      )}
    </div>
  )
}

type AddCardProps = {
  column: ColumnType
  setCards: Dispatch<SetStateAction<CardType[]>>
}

const AddCard = ({ column, setCards }: AddCardProps) => {
  const [text, setText] = useState("")
  const [adding, setAdding] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!text.trim().length) return

    const newCard = {
      column,
      title: text.trim(),
      id: doc(collection(db, "temp")).id, // Generate Firebase compatible ID
    }

    setCards((pv) => [...pv, newCard])
    setText("")
    setAdding(false)
  }

  return (
    <>
      {adding ? (
        <motion.form layout onSubmit={handleSubmit}>
          <div className="relative w-full">
            <textarea
              onChange={(e) => setText(e.target.value)}
              value={text}
              autoFocus
              placeholder="Add new task..."
              className="w-full rounded-lg border border-purple-400 bg-purple-50 p-2 text-sm text-neutral-700 placeholder-purple-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => setText("")}
                className="absolute right-2 top-2 text-neutral-400 hover:text-red-500 transition-colors"
                aria-label="Clear input"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-md px-2 py-1 text-xs text-neutral-500 transition-colors hover:text-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-md bg-gradient-to-r from-purple-400 to-teal-400 px-2 py-1 text-xs text-white transition-colors hover:from-purple-500 hover:to-teal-500"
            >
              <span>Add</span>
              <FiPlus />
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.button
          layout
          onClick={() => setAdding(true)}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-purple-300 px-2 py-1.5 text-xs text-purple-500 transition-colors hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600"
        >
          <span>Add card</span>
          <FiPlus />
        </motion.button>
      )}
    </>
  )
}

type ColumnType = "backlog" | "todo" | "doing" | "done"

type CardType = {
  title: string
  id: string
  column: ColumnType
}

export default CustomKanban
