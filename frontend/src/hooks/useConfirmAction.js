import { useCallback, useMemo, useState } from 'react'

const EMPTY_CONFIG = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  tone: 'danger',
  action: null,
}

export default function useConfirmAction() {
  const [config, setConfig] = useState(EMPTY_CONFIG)
  const [loading, setLoading] = useState(false)

  const openConfirm = useCallback((nextConfig) => {
    setConfig({
      ...EMPTY_CONFIG,
      ...nextConfig,
      open: true,
    })
  }, [])

  const closeConfirm = useCallback(() => {
    if (loading) return
    setConfig(EMPTY_CONFIG)
  }, [loading])

  const handleConfirm = useCallback(async () => {
    if (!config.action) {
      closeConfirm()
      return
    }

    try {
      setLoading(true)
      await config.action()
      setConfig(EMPTY_CONFIG)
    } finally {
      setLoading(false)
    }
  }, [closeConfirm, config])

  const modalProps = useMemo(
    () => ({
      isOpen: config.open,
      title: config.title,
      message: config.message,
      confirmLabel: config.confirmLabel,
      cancelLabel: config.cancelLabel,
      tone: config.tone,
      loading,
      onClose: closeConfirm,
      onConfirm: handleConfirm,
    }),
    [closeConfirm, config, handleConfirm, loading]
  )

  return {
    openConfirm,
    closeConfirm,
    modalProps,
  }
}
