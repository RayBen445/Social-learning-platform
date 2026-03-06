'use client'

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-lg w-3/4"></div>
        <div className="h-4 bg-muted rounded-lg w-1/2"></div>
      </div>

      {/* Content skeletons */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded-lg"></div>
            <div className="h-4 bg-muted rounded-lg w-5/6"></div>
            <div className="h-4 bg-muted rounded-lg w-4/6"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 bg-card rounded-lg border border-border animate-pulse">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded-lg"></div>
              <div className="h-3 bg-muted rounded-lg w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function GridLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="w-full h-40 bg-muted animate-pulse"></div>
          <div className="p-4 space-y-2">
            <div className="h-4 bg-muted rounded-lg"></div>
            <div className="h-3 bg-muted rounded-lg w-5/6"></div>
            <div className="h-3 bg-muted rounded-lg w-2/3"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
