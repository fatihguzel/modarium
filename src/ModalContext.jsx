import { createContext, useContext, useReducer, useCallback } from 'react'

const ModalContext = createContext(null)

const initialState = { modals: [] }

function modalReducer(state, action) {
  switch (action.type) {
    case 'APPEND':
      return { modals: [...state.modals, action.payload] }
    case 'REMOVE_LAST':
      return { modals: state.modals.slice(0, -1) }
    case 'REMOVE_ALL':
      return { modals: [] }
    default:
      return state
  }
}

export function ModalProvider({ children }) {
  const [state, dispatch] = useReducer(modalReducer, initialState)

  const appendModal = useCallback((name, data = null) => {
    dispatch({ type: 'APPEND', payload: { name, data } })
  }, [])

  const removeLastModal = useCallback(() => {
    dispatch({ type: 'REMOVE_LAST' })
  }, [])

  const removeAllModals = useCallback(() => {
    dispatch({ type: 'REMOVE_ALL' })
  }, [])

  const value = {
    modals: state.modals,
    appendModal,
    removeLastModal,
    removeAllModals,
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModals() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModals must be used within ModalProvider')
  }
  return context.modals
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within ModalProvider')
  }
  return {
    appendModal: context.appendModal,
    removeLastModal: context.removeLastModal,
    removeAllModals: context.removeAllModals,
  }
}
