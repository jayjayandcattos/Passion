import { SECTION_BLEED } from '../utils/scrollFade'

export { SECTION_BLEED }

export const CARS = [
  {
    url: '/models/2016_ferrari_488_gtb.glb',
    position: [0, -0.5, 0],
    rotation: [0, -Math.PI / 6, 0],
    scale: 100,
    start: 0,
    end: 0.36,
    colorTint: null,
  },
  {
    url: '/models/2020_ferrari_f8_tributo.glb',
    position: [0, -0.5, 0],
    rotation: [0, Math.PI / 8, 0],
    scale: 100,
    start: 0.3,
    end: 0.69,
    colorTint: null,
  },
  {
    url: '/models/ferrari_2021.glb',
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
    scale: 100,
    start: 0.63,
    end: 1,
    colorTint: null,
  },
]

export const CAR_TARGET = [0, -0.15, 0]
