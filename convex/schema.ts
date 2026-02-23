import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  snippets: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
    views: v.optional(v.number()),
  }).index('by_created', ['createdAt']),
})
