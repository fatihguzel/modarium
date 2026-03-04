# Modarium

Context API based modal management for React. No Redux required.

## Installation

```bash
npm install modarium
```

## Quick Start

#### 1. Create your first modal

```bash
npx modarium request-demo
```

This creates (default: `src/modals/`):
- `src/modals/` folder
- `src/modals/index.jsx` – main modal container
- `src/modals/modals.jsx` – modal configuration
- `src/modals/request-demo/index.jsx` – new modal component

Custom path: `npx modarium request-demo components/modals`

#### 2. Wrap your app

`main.jsx` or `App.jsx`:

```jsx
import { ModalProvider } from 'modarium'

createRoot(document.getElementById('root')).render(
  <ModalProvider>
    <App />
  </ModalProvider>,
)
```

#### 3. Add modal container

In your layout or main component:

```jsx
import Modals from './modals/index.jsx'

function Layout() {
  return (
    <>
      {/* your content */}
      <Modals />
    </>
  )
}
```

With React Router (clear modals on route change):

```jsx
import Modals from './modals/index.jsx'
import { useLocation } from 'react-router-dom'

function Layout() {
  const location = useLocation()
  return <Modals locationPathname={location.pathname} />
}
```

#### 4. Open a modal

From any component:

```jsx
import { useModal } from 'modarium'

function MyComponent() {
  const { appendModal } = useModal()

  return (
    <button onClick={() => appendModal('request-demo', { userId: 123 })}>
      Open Modal
    </button>
  )
}
```

### Adding new modals

```bash
npx modarium contact-form
# or custom path:
npx modarium contact-form src/features/modals
```

### API

| Hook / Prop | Description |
|-------------|-------------|
| `appendModal(name, data?)` | Opens a modal |
| `removeLastModal()` | Closes the last modal |
| `removeAllModals()` | Closes all modals |
| `useModals()` | Returns the list of open modals |

**Modal component props** (each modal receives):
- `data` – Data passed via `appendModal` second argument
- `close` – Function to close the modal
