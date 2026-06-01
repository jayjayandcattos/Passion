import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../gsap'

export function HeroEntrance({ onEntranceComplete }) {
  const containerRef = useRef(null)
  const subtitleRef = useRef(null)
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const onCompleteRef = useRef(onEntranceComplete)

  useEffect(() => {
    onCompleteRef.current = onEntranceComplete
  }, [onEntranceComplete])

  useGSAP(
    () => {
      const targets = [subtitleRef.current, titleRef.current, descriptionRef.current].filter(
        Boolean,
      )

      const complete = () => {
        onCompleteRef.current?.()
      }

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(targets, { y: 0, opacity: 1 })
        complete()
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ onComplete: complete })
        tl.from([subtitleRef.current, titleRef.current], {
          y: 56,
          opacity: 0,
          duration: 0.85,
          ease: 'power4.out',
          stagger: 0.08,
        })
        tl.from(
          descriptionRef.current,
          {
            y: 28,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
          },
          '-=0.35',
        )
      })

      return () => mm.revert()
    },
    { scope: containerRef },
  )

  return (
    <div ref={containerRef} className="text-content hero-text">
      <h2 ref={subtitleRef} className="subtitle">
        2016
      </h2>
      <h1 ref={titleRef} className="title">
        488 GTB
      </h1>
      <p ref={descriptionRef} className="description">
        Turbocharged era — raw performance, instant response.
      </p>
    </div>
  )
}
