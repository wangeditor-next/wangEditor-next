/**
 * @description style preset public types
 */

export type StylePresetScope = 'text' | 'block'

export interface IStylePreset {
  /** Stable kebab-case identifier persisted in JSON and HTML. */
  key: string
  /** Label displayed in the toolbar menu. */
  title: string
  /** Apply the preset to text marks or block elements. */
  scope: StylePresetScope
  /** Optional business class names added after the stable generated class. */
  className?: string
}

export interface IStylePresetMenuConfig {
  presets: IStylePreset[]
}
