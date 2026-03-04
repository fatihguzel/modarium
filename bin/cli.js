#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function findProjectRoot() {
  let dir = process.cwd()
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, 'package.json'))) {
      return dir
    }
    dir = dirname(dir)
  }
  return process.cwd()
}

function toPascalCase(str) {
  return str
    .split(/[-_\s]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

function getModalsIndexTemplate() {
  return `import { useModals, useModal } from 'modarium'
import { modals } from './modals.jsx'
import { useEffect } from 'react'

/**
 * Main modal container - renders all modals.
 * Pass locationPathname (e.g. from useLocation) to clear modals on route change.
 */
export default function Modals({ locationPathname }) {
  const allModals = useModals()
  const { removeAllModals, removeLastModal } = useModal()

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
      if (e.key === 'Escape') removeLastModal()
    }
    document.addEventListener('keyup', keyupHandle)
    return () => document.removeEventListener('keyup', keyupHandle)
  }, [removeLastModal])

  if (!allModals?.length) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10050 }}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(1px)',
          zIndex: 10050 + allModals.length,
        }}
      />
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {allModals.map((modal, key) => {
          const currentModal = modals.find((m) => m.name === modal.name)
          if (!currentModal) return null

          const Element = currentModal.element

          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                overflowY: 'auto',
                overflowX: 'hidden',
                zIndex: 10051 + key,
              }}
            >
              <Element data={modal.data} close={removeLastModal} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
`
}

function getModalTemplate(componentName) {
  return `/**
 * @param {Object} data - Data passed to modal (via appendModal second argument)
 * @param {Function} close - Closes the modal (calls removeLastModal)
 */
export default function ${componentName}({ data, close }) {
  return null
}
`
}

function getModalsConfigTemplate(modalName, componentName, importPath) {
  return `import ${componentName} from '${importPath}'

export const modals = [
  {
    name: '${modalName}',
    element: ${componentName},
  },
]
`
}

function updateModalsConfig(content, modalName, componentName, importPath) {
  if (content.includes(`name: '${modalName}'`)) {
    return content
  }

  const newImport = `import ${componentName} from '${importPath}'`
  const newEntry = `  {\n    name: '${modalName}',\n    element: ${componentName},\n  }`

  const importRegex = /^import .+ from .+$/gm
  const imports = content.match(importRegex)
  let newContent = content
  if (imports) {
    const lastImport = imports[imports.length - 1]
    const lastImportEnd = content.indexOf(lastImport) + lastImport.length
    newContent =
      content.slice(0, lastImportEnd) + '\n' + newImport + content.slice(lastImportEnd)
  } else {
    newContent = newImport + '\n\n' + content
  }

  const arrayEndIndex = newContent.lastIndexOf(']')
  const beforeBracket = newContent.slice(0, arrayEndIndex)
  const afterBracket = newContent.slice(arrayEndIndex)
  const needsComma = /[}\s]$/.test(beforeBracket.trim())
  const entry = needsComma ? ',\n' + newEntry : newEntry
  return beforeBracket + entry + '\n' + afterBracket
}

const modalName = process.argv[2]
const customPath = process.argv[3]

if (!modalName) {
  console.error('Usage: npx modarium <modal-name> [path]')
  console.error('Example: npx modarium request-demo')
  console.error('Example: npx modarium request-demo src/components/modals')
  process.exit(1)
}

const root = findProjectRoot()
const basePath = customPath || 'src/modals'
const modalsDir = join(root, basePath)
const modalDir = join(modalsDir, modalName)
const modalIndexPath = join(modalDir, 'index.jsx')

const componentName = toPascalCase(modalName)

if (existsSync(modalIndexPath)) {
  console.log(`Modal "${modalName}" already exists.`)
  process.exit(0)
}

if (!existsSync(modalsDir)) {
  mkdirSync(modalsDir, { recursive: true })
  writeFileSync(join(modalsDir, 'index.jsx'), getModalsIndexTemplate())
  console.log(`${basePath}/ folder created.`)
  console.log(`${basePath}/index.jsx created.`)
}

const modalsIndexPath = join(modalsDir, 'index.jsx')
if (!existsSync(modalsIndexPath)) {
  writeFileSync(modalsIndexPath, getModalsIndexTemplate())
  console.log(`${basePath}/index.jsx created.`)
}

mkdirSync(modalDir, { recursive: true })
writeFileSync(modalIndexPath, getModalTemplate(componentName))
console.log(`${basePath}/${modalName}/index.jsx created.`)

const modalsConfigPath = join(modalsDir, 'modals.jsx')
const modalsPath = modalsConfigPath
const importPath = `./${modalName}/index.jsx`

let content
if (existsSync(modalsPath)) {
  content = readFileSync(modalsPath, 'utf-8')
  content = updateModalsConfig(content, modalName, componentName, importPath)
} else {
  content = getModalsConfigTemplate(modalName, componentName, importPath)
}

writeFileSync(modalsPath, content)
console.log(`${basePath}/modals.jsx updated.`)
console.log('\nModal ready! Use appendModal("' + modalName + '") to open it.')
