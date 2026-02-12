import React, { useState, useEffect, useRef } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

const PLACEHOLDER_SRC = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement> & { lazy?: boolean }) {
  const [didError, setDidError] = useState(false)
  const [imageSrc, setImageSrc] = useState(props.lazy ? PLACEHOLDER_SRC : props.src)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleError = () => {
    setDidError(true)
  }

  useEffect(() => {
    if (!props.lazy || !props.src) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(props.src)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px',
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [props.src, props.lazy])

  const { src, alt, style, className, lazy, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Ошибка загрузки изображения" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img 
      ref={imgRef}
      src={imageSrc} 
      alt={alt || 'Изображение'} 
      className={`${className ?? ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`} 
      style={style} 
      {...rest} 
      onError={handleError}
      onLoad={() => setIsLoaded(true)}
      loading={lazy ? 'lazy' : undefined}
    />
  )
}


