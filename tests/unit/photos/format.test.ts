import { describe, expect, it } from 'vitest'
import { cameraName, formatExposure, formatFocalLength, formatTakenAt, shootingSettings } from '@/lib/photos/format'

describe('formatExposure', () => {
  it('adds the seconds unit once', () => {
    expect(formatExposure('1/250')).toBe('1/250 s')
    expect(formatExposure('2 s')).toBe('2 s')
    expect(formatExposure(undefined)).toBeUndefined()
  })
})

describe('formatFocalLength', () => {
  it('normalizes to millimetres', () => {
    expect(formatFocalLength('35')).toBe('35 mm')
    expect(formatFocalLength('50.0 mm')).toBe('50 mm')
    expect(formatFocalLength('weird')).toBe('weird')
  })
})

describe('formatTakenAt', () => {
  it('formats in UTC so the stored wall-clock date never shifts', () => {
    expect(formatTakenAt('2023-07-25T23:59:00.000Z', 'en')).toBe('July 25, 2023')
    expect(formatTakenAt('2023-07-25T23:59:00.000Z', 'it')).toBe('25 luglio 2023')
  })

  it('returns undefined for missing or invalid dates', () => {
    expect(formatTakenAt(null, 'en')).toBeUndefined()
    expect(formatTakenAt('nope', 'en')).toBeUndefined()
  })
})

describe('shootingSettings', () => {
  it('lists settings in reading order and skips missing ones', () => {
    expect(shootingSettings({ aperture: 'f/1.8', exposureTime: '1/250', iso: 100, focalLength: '35' })).toEqual([
      'f/1.8',
      '1/250 s',
      'ISO 100',
      '35 mm',
    ])
    expect(shootingSettings({})).toEqual([])
  })
})

describe('cameraName', () => {
  it('does not repeat the make when the model already starts with it', () => {
    expect(cameraName({ make: 'SONY', model: 'ILCE-7M2' })).toBe('SONY ILCE-7M2')
    expect(cameraName({ make: 'Canon', model: 'Canon EOS R6' })).toBe('Canon EOS R6')
    expect(cameraName({ make: 'SONY' })).toBe('SONY')
    expect(cameraName({})).toBeUndefined()
  })
})
