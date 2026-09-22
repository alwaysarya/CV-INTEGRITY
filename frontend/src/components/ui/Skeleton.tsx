export function Skeleton({ className = '', width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: width || '100%', height: height || '20px' }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="liquid-glass p-5 space-y-3">
      <Skeleton width="60px" height="40px" />
      <Skeleton width="80%" height="28px" />
      <Skeleton width="60%" height="16px" />
      <Skeleton width="40%" height="12px" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="liquid-glass p-5 space-y-3">
      <Skeleton width="40%" height="20px" />
      <div className="space-y-2 mt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height="40px" />
        ))}
      </div>
    </div>
  )
}
