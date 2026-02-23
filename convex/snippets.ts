import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const get = query({
  args: { id: v.id('snippets') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10
    return await ctx.db.query('snippets').order('desc').take(limit)
  },
})

export const create = mutation({
  args: {
    title: v.optional(v.string()),
    code: v.string(),
    language: v.string(),
    theme: v.optional(v.string()),
    files: v.optional(
      v.array(
        v.object({
          name: v.string(),
          content: v.string(),
          language: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('snippets', {
      ...args,
      createdAt: now,
      updatedAt: now,
      views: 0,
    })
  },
})

export const update = mutation({
  args: {
    id: v.id('snippets'),
    title: v.optional(v.string()),
    code: v.optional(v.string()),
    language: v.optional(v.string()),
    theme: v.optional(v.string()),
    files: v.optional(
      v.array(
        v.object({
          name: v.string(),
          content: v.string(),
          language: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    const existing = await ctx.db.get(id)
    if (!existing) throw new Error('Snippet not found')

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
    return id
  },
})

export const incrementViews = mutation({
  args: { id: v.id('snippets') },
  handler: async (ctx, args) => {
    const snippet = await ctx.db.get(args.id)
    if (!snippet) return
    await ctx.db.patch(args.id, {
      views: (snippet.views ?? 0) + 1,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('snippets') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
