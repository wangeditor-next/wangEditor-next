/**
 * @description generate style-class.less for class-based CSP mode
 */

const fs = require('node:fs')
const path = require('node:path')

const rootDir = path.resolve(__dirname, '..')
const colorConfigPath = path.join(rootDir, 'packages/basic-modules/src/modules/color/menu/config.ts')
const fontConfigPath = path.join(rootDir, 'packages/basic-modules/src/modules/font-size-family/menu/config.ts')
const lineHeightConfigPath = path.join(rootDir, 'packages/basic-modules/src/modules/line-height/menu/config.ts')
const outputPath = path.join(rootDir, 'packages/basic-modules/src/assets/style-class.less')

function extractArrayLiteral(content, marker) {
  const markerIndex = content.indexOf(marker)

  if (markerIndex < 0) {
    throw new Error(`Marker not found: ${marker}`)
  }

  const startIndex = content.indexOf('[', markerIndex)

  if (startIndex < 0) {
    throw new Error(`Array start not found for marker: ${marker}`)
  }

  let depth = 0
  let endIndex = -1

  for (let i = startIndex; i < content.length; i += 1) {
    const char = content[i]

    if (char === '[') { depth += 1 }
    if (char === ']') {
      depth -= 1
      if (depth === 0) {
        endIndex = i
        break
      }
    }
  }

  if (endIndex < 0) {
    throw new Error(`Array end not found for marker: ${marker}`)
  }

  return content.slice(startIndex, endIndex + 1)
}

function evalArrayLiteral(arrayLiteral) {
  // eslint-disable-next-line no-new-func
  return Function(`return ${arrayLiteral}`)()
}

function normalize(type, value) {
  const trimmed = String(value || '').trim()

  if (!trimmed) { return '' }
  if (type === 'fontFamily') { return trimmed.replace(/"/g, '').replace(/\s+/g, ' ').toLowerCase() }
  return trimmed.replace(/\s+/g, '').toLowerCase()
}

function hashStyleValue(input) {
  const MOD = 2147483647
  let hash = 7

  for (const char of input) {
    hash = (hash * 31 + (char.codePointAt(0) || 0)) % MOD
  }

  return hash.toString(36)
}

function className(type, value) {
  const prefix = {
    color: 'w-e-color',
    bgColor: 'w-e-bg-color',
    fontSize: 'w-e-font-size',
    fontFamily: 'w-e-font-family',
    textAlign: 'w-e-text-align',
    lineHeight: 'w-e-line-height',
    indent: 'w-e-indent',
  }[type]

  return `${prefix}-${hashStyleValue(`${type}:${normalize(type, value)}`)}`
}

function quoteFontFamily(value) {
  if (/^[a-z0-9-]+$/i.test(value)) { return value }
  return `"${value.replace(/"/g, '\\"')}"`
}

function getIndentValues(fontSizes) {
  const values = new Set(['2em'])

  fontSizes.forEach(fontSize => {
    const size = parseInt(fontSize, 10)
    const unit = fontSize.replace(`${size}`, '')

    if (size > 0 && unit) {
      values.add(`${size * 2}${unit}`)
    }
  })

  return Array.from(values)
}

function appendRules(lines, values, type, cssProp, formatter = value => value) {
  values.forEach(value => {
    lines.push(`.${className(type, value)} { ${cssProp}: ${formatter(value)}; }`)
  })
  lines.push('')
}

function run() {
  const colorConfig = fs.readFileSync(colorConfigPath, 'utf8')
  const fontConfig = fs.readFileSync(fontConfigPath, 'utf8')
  const lineHeightConfig = fs.readFileSync(lineHeightConfigPath, 'utf8')

  const colors = evalArrayLiteral(extractArrayLiteral(colorConfig, 'const COLORS'))
  const fontSizeRaw = evalArrayLiteral(extractArrayLiteral(fontConfig, 'const fontSizeList'))
  const fontFamilyRaw = evalArrayLiteral(extractArrayLiteral(fontConfig, 'const fontFamilyList'))
  const lineHeights = evalArrayLiteral(extractArrayLiteral(lineHeightConfig, 'return ['))
  const fontSizes = fontSizeRaw.map(item => (typeof item === 'string' ? item : item.value))
  const fontFamilies = fontFamilyRaw.map(item => (typeof item === 'string' ? item : item.value))
  const textAlignList = ['left', 'center', 'right', 'justify']
  const indentValues = getIndentValues(fontSizes)

  const lines = [
    '/**',
    ' * @description class-based text style rules for strict CSP mode',
    ' */',
    '',
  ]

  appendRules(lines, colors, 'color', 'color')
  appendRules(lines, colors, 'bgColor', 'background-color')
  appendRules(lines, fontSizes, 'fontSize', 'font-size')
  appendRules(lines, fontFamilies, 'fontFamily', 'font-family', quoteFontFamily)
  appendRules(lines, textAlignList, 'textAlign', 'text-align')
  appendRules(lines, lineHeights, 'lineHeight', 'line-height')
  appendRules(lines, indentValues, 'indent', 'text-indent')

  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`)
  // eslint-disable-next-line no-console
  console.log(`Generated ${path.relative(rootDir, outputPath)}`)
}

run()
