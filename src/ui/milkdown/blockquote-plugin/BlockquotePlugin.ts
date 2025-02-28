import { MilkdownPlugin } from '@milkdown/kit/ctx'
import { blockquoteAttr } from '@milkdown/kit/preset/commonmark'

const extendedAttr: MilkdownPlugin = (ctx) => {
  return async () => {
    ctx.set(blockquoteAttr.key, () => {
      return { class: 'blockquote' }
    })
  }
}

export const plugins = [
  extendedAttr,
]
