import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
}

export function Logo({ href = '/', size = 'md', showText = false, className = '' }: LogoProps) {
  const dimensions = sizeMap[size]

  const logo = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Image
          src="/images/learnloop-logo.jpg"
          alt="LearnLoop Logo"
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-lg"
          priority
        />
      </div>
      {showText && (
        <div className="hidden sm:block">
          <h1 className={`font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent ${
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'
          }`}>
            LearnLoop
          </h1>
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{logo}</Link>
  }

  return logo
}
