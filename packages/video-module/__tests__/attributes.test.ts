import { $ } from 'dom7'

import {
  genEditorVideoAttrs,
  genVideoAttributesHtml,
  normalizeVideoAttributes,
  normalizeVideoControlsList,
  normalizeVideoPreload,
  parseVideoAttributes,
} from '../src/module/attributes'

describe('video attributes helpers', () => {
  it('normalizes preload values', () => {
    expect(normalizeVideoPreload('none')).toBe('none')
    expect(normalizeVideoPreload(' Metadata ')).toBe('metadata')
    expect(normalizeVideoPreload('AUTO')).toBe('auto')
    expect(normalizeVideoPreload('')).toBeUndefined()
    expect(normalizeVideoPreload('lazy')).toBeUndefined()
    expect(normalizeVideoPreload(true)).toBeUndefined()
    expect(normalizeVideoPreload(undefined)).toBeUndefined()
  })

  it('keeps supported controlslist tokens only, in order and without duplicates', () => {
    expect(normalizeVideoControlsList('nodownload')).toBe('nodownload')
    expect(normalizeVideoControlsList(' NoDownload  nofullscreen\tfoo nodownload ')).toBe(
      'nodownload nofullscreen',
    )
    expect(normalizeVideoControlsList('noremoteplayback noplaybackrate')).toBe(
      'noremoteplayback noplaybackrate',
    )
    expect(normalizeVideoControlsList('foo bar')).toBeUndefined()
    expect(normalizeVideoControlsList('')).toBeUndefined()
    expect(normalizeVideoControlsList(['nodownload'])).toBeUndefined()
  })

  it('normalizes an attributes object and drops unset or invalid values', () => {
    expect(normalizeVideoAttributes(undefined)).toEqual({})
    expect(normalizeVideoAttributes('autoplay')).toEqual({})
    expect(
      normalizeVideoAttributes({
        autoplay: true,
        loop: 'true',
        muted: false,
        playsInline: true,
        preload: 'invalid',
        controlsList: 'nodownload foo',
        disablePictureInPicture: true,
      }),
    ).toEqual({
      autoplay: true,
      playsInline: true,
      controlsList: 'nodownload',
      disablePictureInPicture: true,
    })
  })

  it('parses attributes from a <video> element', () => {
    const $video = $(
      '<video AUTOPLAY loop muted playsinline preload="Metadata" controlslist="nodownload nofullscreen" disablepictureinpicture></video>',
    )

    expect(parseVideoAttributes($video[0])).toEqual({
      autoplay: true,
      loop: true,
      muted: true,
      playsInline: true,
      preload: 'metadata',
      controlsList: 'nodownload nofullscreen',
      disablePictureInPicture: true,
    })
    expect(parseVideoAttributes($('<video controls></video>')[0])).toEqual({})
    expect(parseVideoAttributes(undefined)).toEqual({})
  })

  it('generates attribute html in a stable order', () => {
    expect(
      genVideoAttributesHtml({
        disablePictureInPicture: true,
        controlsList: 'nofullscreen nodownload',
        preload: 'none',
        playsInline: true,
        muted: true,
        loop: true,
        autoplay: true,
      }),
    ).toBe(
      ' autoplay loop muted playsinline preload="none" controlslist="nofullscreen nodownload" disablepictureinpicture',
    )
    expect(genVideoAttributesHtml({ preload: '"><script>', controlsList: '"onerror' })).toBe('')
    expect(genVideoAttributesHtml({})).toBe('')
  })

  it('generates editor attrs without autoplay and muted', () => {
    expect(
      genEditorVideoAttrs({
        autoplay: true,
        loop: true,
        muted: true,
        playsInline: true,
        preload: 'auto',
        controlsList: 'nodownload',
        disablePictureInPicture: true,
      }),
    ).toEqual({
      loop: true,
      playsinline: true,
      preload: 'auto',
      controlslist: 'nodownload',
      disablepictureinpicture: true,
    })
    expect(genEditorVideoAttrs({})).toEqual({})
  })
})
