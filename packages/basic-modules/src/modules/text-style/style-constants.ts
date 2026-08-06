/**
 * @description CSS values shared by text-style render and HTML serialization
 */

export const UNDERLINE_OFFSET = '0.15em'
export const WAVY_UNDERLINE_OFFSET = '0.3em'
export const WAVY_UNDERLINE_WITH_EMPHASIS_OFFSET = '0.8em'
export const EMPHASIS_DOT_WITH_WAVY_LINE_HEIGHT = '2'

export const UNDERLINE_OFFSET_CLASS = 'w-e-text-style-underline-offset'
export const WAVY_UNDERLINE_CLASS = 'w-e-text-style-wavy-underline'
export const WAVY_UNDERLINE_WITH_EMPHASIS_CLASS = 'w-e-text-style-wavy-underline-with-emphasis'
export const EMPHASIS_DOT_CLASS = 'w-e-text-style-emphasis-dot'
export const EMPHASIS_DOT_WITH_WAVY_CLASS = 'w-e-text-style-emphasis-dot-with-wavy'

export const WAVY_UNDERLINE_STYLE = {
  textDecorationLine: 'underline',
  textDecorationStyle: 'wavy',
  textUnderlineOffset: WAVY_UNDERLINE_OFFSET,
}

export const WAVY_UNDERLINE_STYLE_HTML = `text-decoration-line: underline; text-decoration-style: wavy; text-underline-offset: ${WAVY_UNDERLINE_OFFSET};`

export const WAVY_UNDERLINE_WITH_EMPHASIS_STYLE = {
  ...WAVY_UNDERLINE_STYLE,
  textUnderlineOffset: WAVY_UNDERLINE_WITH_EMPHASIS_OFFSET,
}

export const WAVY_UNDERLINE_WITH_EMPHASIS_STYLE_HTML = `text-decoration-line: underline; text-decoration-style: wavy; text-underline-offset: ${WAVY_UNDERLINE_WITH_EMPHASIS_OFFSET};`

export const EMPHASIS_DOT_STYLE = {
  textEmphasisStyle: 'filled dot',
  textEmphasisPosition: 'under left',
}

export const EMPHASIS_DOT_STYLE_HTML =
  'text-emphasis-style: filled dot; text-emphasis-position: under left;'

export const EMPHASIS_DOT_WITH_WAVY_STYLE = {
  ...EMPHASIS_DOT_STYLE,
  lineHeight: EMPHASIS_DOT_WITH_WAVY_LINE_HEIGHT,
}

export const EMPHASIS_DOT_WITH_WAVY_STYLE_HTML = `text-emphasis-style: filled dot; text-emphasis-position: under left; line-height: ${EMPHASIS_DOT_WITH_WAVY_LINE_HEIGHT};`
