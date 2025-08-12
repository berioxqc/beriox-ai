"use client"
import Image from "next/image"
import { useState } from "react"
interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  fallbackSrc?: string
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  style = {},
  priority = false,
  quality = 75,
  placeholder = "empty",
  blurDataURL,
  fallbackSrc = "/placeholder-image.png",
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setHasError(true)
    }
    onError?.()
  }
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }
  return (
    <div 
      className={`relative ${className}`}
      style={{
        width,
        height,
        ...style
      }}
    >
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite"
          }}
        />
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: "cover",
          ...style
        }}
      />
      
      <style jsx>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

// Composant spécialisé pour les avatars
export function AvatarImage({
  src,
  alt,
  size = 40,
  className = "",
  ...props
}: {
  src: string
  alt: string
  size?: number
  className?: string
} & Omit<OptimizedImageProps, "width" | "height" | "src" | "alt">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      fallbackSrc="/default-avatar.png"
      {...props}
    />
  )
}

// Composant spécialisé pour les logos
export function LogoImage({
  src,
  alt,
  width,
  height,
  className = "",
  ...props
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
} & Omit<OptimizedImageProps, "width" | "height" | "src" | "alt">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      fallbackSrc="/default-logo.png"
      {...props}
    />
  )
}

// Composant spécialisé pour les images de fond
export function BackgroundImage({
  src,
  alt,
  width,
  height,
  className = "",
  ...props
}: {
  src: string
  alt: string
  width: number
  height: number
  className?: string
} & Omit<OptimizedImageProps, "width" | "height" | "src" | "alt">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      fallbackSrc="/default-background.png"
      {...props}
    />
  )
}
