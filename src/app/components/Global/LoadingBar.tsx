'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'

export default function LoadingBar() {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isPending) {
      setLoading(true)
    } else {
      const timer = setTimeout(() => setLoading(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isPending])

  useEffect(() => {
    startTransition(() => {
    })
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 z-50">
      <div className="h-full w-1/3 bg-indigo-700 animate-[loading_1s_ease-in-out_infinite]"></div>
    </div>
  )
}