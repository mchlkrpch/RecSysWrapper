import { describe, it, expect } from 'vitest'
import { get_color_by_string, is_katex_str, rgbaStringToHex, create_json_node } from '../utils/utils'

describe('utils', () => {
  it('get_color_by_string maps first letter to a stable color', () => {
    expect(get_color_by_string('Alice')).toBeDefined()
    expect(get_color_by_string('alice')).toEqual(get_color_by_string('Alice'))
    expect(get_color_by_string('Bob')).not.toEqual(get_color_by_string('Alice'))
  })

  it('is_katex_str detects $...$ wrappers', () => {
    expect(is_katex_str('$x$')).toBe(true)
    expect(is_katex_str('x$')).toBe(false)
    expect(is_katex_str('$x')).toBe(false)
    expect(is_katex_str('$$')).toBe(true)
  })

  it('rgbaStringToHex converts rgba to hex without alpha by default', () => {
    expect(rgbaStringToHex('rgba(255, 0, 0, 1)')).toEqual('#ff0000')
    expect(rgbaStringToHex('rgb(0, 128, 255)')).toEqual('#0080ff')
  })

  it('rgbaStringToHex converts with alpha when includeAlpha = true', () => {
    expect(rgbaStringToHex('rgba(255, 0, 0, 0.5)', true)).toEqual('#ff000080')
    expect(rgbaStringToHex('rgba(0, 0, 0, 0)', true)).toEqual('#00000000')
  })

  it('create_json_node builds a deep-cloned node with id and content', () => {
    const n = create_json_node('id-1', { x: 10, y: 20 }, [{ tp: 'text', content: 'hello' }])
    expect(n.data.metadata.id).toEqual('id-1')
    expect(n.position).toEqual({ x: 10, y: 20 })
    expect(n.data.cnt[0].content).toEqual('hello')
  })
}) 