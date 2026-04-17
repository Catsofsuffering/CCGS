import { describe, expect, it } from 'vitest'
import { normalizeLegacyLongOptions } from '../argv'

describe('normalizeLegacyLongOptions', () => {
  it('rewrites known single-dash long options', () => {
    expect(normalizeLegacyLongOptions(['monitor', '-detach'])).toEqual(['monitor', '--detach'])
    expect(normalizeLegacyLongOptions(['init', '-skip-prompt', '-install-dir', 'C:/tmp'])).toEqual([
      'init',
      '--skip-prompt',
      '--install-dir',
      'C:/tmp',
    ])
  })

  it('preserves short flags and positional arguments', () => {
    expect(normalizeLegacyLongOptions(['-h', '--detach', 'monitor', '-x'])).toEqual([
      '-h',
      '--detach',
      'monitor',
      '-x',
    ])
  })
})
