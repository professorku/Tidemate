import { useCallback, useMemo, useRef, useState } from 'react'

export default function useLongPressReveal(delay = 450) {
  const [revealed, setRevealed] = useState(false)
  const timerRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const reveal = useCallback(() => {
    setRevealed(true)
  }, [])

  const hide = useCallback(() => {
    setRevealed(false)
  }, [])

  const toggle = useCallback(() => {
    setRevealed((prev) => !prev)
  }, [])

  const startPress = useCallback(() => {
    clearTimer()
    timerRef.current = setTimeout(() => {
      setRevealed(true)
    }, delay)
  }, [clearTimer, delay])

  const endPress = useCallback(() => {
    clearTimer()
  }, [clearTimer])

  const bind = useMemo(
    () => ({
      onTouchStart: startPress,
      onTouchEnd: endPress,
      onTouchCancel: endPress,
      onMouseDown: startPress,
      onMouseUp: endPress,
      onMouseLeave: endPress,
    }),
    [endPress, startPress]
  )

  return {
    revealed,
    reveal,
    hide,
    toggle,
    bind,
  }
}