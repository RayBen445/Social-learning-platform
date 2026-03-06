'use client'

import { useEffect, useState } from 'react'

export function AnimatedCursor() {
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true)
      }
    }

    const handleMouseOut = () => {
      setIsHovering(false)
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  return (
    <style>{`
      * {
        cursor: inherit;
      }

      button, a, [role="button"] {
        cursor: pointer;
      }

      ${isHovering ? `
        * {
          cursor: none !important;
        }
      ` : ''}
    `}</style>
  )
}
