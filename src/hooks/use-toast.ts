// src/hooks/use-toast.ts
import { useState } from "react"

export function useToast() {
  const [isOpen, setIsOpen] = useState(false)

  const toast = ({ title, description, variant }: any) => {
    console.log(`TOAST: ${title} - ${description}`)
    // For now, we'll use a standard alert so you can keep developing
    alert(`${title}\n${description}`)
  }

  return { toast }
}