'use client'
import { useState } from 'react'

export function PostBody({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = content.length > 600
  const displayed = isLong && !expanded ? content.slice(0, 600) + '…' : content

  return (
    <div>
      <div className="text-[15px] leading-relaxed space-y-3">
        {displayed.split('\n').map((p, i) =>
          p.trim() ? <p key={i}>{p}</p> : <span key={i} className="block h-2" />
        )}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-primary hover:underline mt-3 block"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}
