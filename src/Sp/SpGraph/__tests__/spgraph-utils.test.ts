import { describe, it, expect } from 'vitest'
import { numberToColor, __recal__edges } from '../utils'

describe('SpGraph utils', () => {
  it('numberToColor clamps values and returns hsl string', () => {
    expect(numberToColor(-5)).toMatch(/^hsl\(0, 100%, 45%\)$/)
    expect(numberToColor(0)).toMatch(/^hsl\(0, 100%, 45%\)$/)
    expect(numberToColor(5)).toMatch(/^hsl\(/)
    expect(numberToColor(10)).toMatch(/^hsl\(120, 100%, 45%\)$/)
    expect(numberToColor(100)).toMatch(/^hsl\(120, 100%, 45%\)$/)
  })

  it('__recal__edges builds edges from <id=...> mentions', () => {
    const datas = [
      { id: 'A', forward: ['to <id=B>'], backward: [] },
      { id: 'B', forward: [], backward: ['from <id=A> and <id=C>'] },
      { id: 'C', forward: ['<id=A>'], backward: [] },
    ]
    const edges = __recal__edges(datas as any)
    const ids = new Set(edges.map((e: any) => e.id))
    expect(ids.has('e-B-A')).toBe(true)
    expect(ids.has('e-A-B')).toBe(true)
    expect(ids.has('e-C-B')).toBe(true)
  })
}) 