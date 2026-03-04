import { useEffect } from 'react'
import { useModals, useModal } from './ModalContext.jsx'

export function Modal({ modals: modalsConfig, locationPathname }) {
  const allModals = useModals()
  const { removeLastModal, removeAllModals } = useModal()

  useEffect(() => {
    if (!allModals?.length) {
      document.body.style.overflow = ''
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [allModals?.length])

  useEffect(() => {
    return () => removeAllModals()
  }, [locationPathname, removeAllModals])

  useEffect(() => {
    const keyupHandle = (e) => {
      if (e.key === 'Escape') {
        removeLastModal()
      }
    }

    document.addEventListener('keyup', keyupHandle)
    return () => {
      document.removeEventListener('keyup', keyupHandle)
    }
  }, [removeLastModal])

  if (!allModals?.length) return null

  return (
    <div className="fixed inset-0 z-[10050]">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
        style={{ zIndex: 10050 + allModals.length }}
      />
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4">
        {allModals.map((modal, key) => {
          const currentModal = modalsConfig?.find((m) => m.name === modal.name)
          if (!currentModal) return null

          const Element = currentModal.element

          return (
            <div
              key={key}
              className="w-full lg:w-auto max-w-full shrink-0"
              style={{ zIndex: 10051 + key }}
            >
              <Element data={modal.data} close={removeLastModal} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
