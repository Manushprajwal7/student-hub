'use client'
import { useEffect, useRef } from 'react'

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null)
  const resizeObserver = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    if (ref.current) {
      resizeObserver.current = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect
          console.log('Size changed:', width, height)
          // Perform actions based on the new size
        }
      })
      resizeObserver.current.observe(ref.current)
    }

    return () => {
      resizeObserver.current?.disconnect()
    }
  }, [])

  return <div ref={ref}>Content</div>
}

export default MyComponent

