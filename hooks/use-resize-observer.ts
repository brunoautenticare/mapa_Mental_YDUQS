"use client"

import { useEffect, type RefObject } from "react"

export function useResizeObserver(
  ref: RefObject<HTMLElement>,
  callback: (size: { width: number; height: number }) => void,
) {
  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    // Create ResizeObserver
    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return

      const { width, height } = entries[0].contentRect
      callback({ width, height })
    })

    // Start observing
    observer.observe(element)

    // Initial size callback
    callback({
      width: element.clientWidth,
      height: element.clientHeight,
    })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [ref, callback])
}
