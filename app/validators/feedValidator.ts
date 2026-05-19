import Joi from "joi";
import mongoose from "mongoose";


export const postFeedSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .required()
    .messages({
      "string.base":  "Title must be a string",
      "string.empty": "Title is required",
      "string.min":   "Title must be at least 3 characters long",
      "string.max":   "Title cannot exceed 100 characters",
      "any.required": "Title is required",
    }),

  content: Joi.string()
    .min(10)
    .max(300)
    .trim()
    .required()
    .custom((value: string, helpers) => {
      if (value.trim().length === 0) {
        return helpers.error("string.empty");
      }
      return value.trim();
    }, "Content whitespace guard")
    .messages({
      "string.base":  "Content must be a string",
      "string.empty": "Content cannot be empty or whitespace only",
      "string.min":   "Content must be at least 10 characters long",
      "string.max":   "Content cannot exceed 300 characters",
      "any.required": "Content is required",
    }),

  author: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      "string.base":  "Author name must be a string",
      "string.empty": "Author name is required",
      "string.min":   "Author name must be at least 2 characters long",
      "string.max":   "Author name cannot exceed 50 characters",
      "any.required": "Author name is required",
    }),
});


/**
 * Validates POST /api/feed request body.
 * abortEarly: false  — returns all errors at once, not just the first.
 * stripUnknown: true — silently drops any extra fields not in the schema.
 */
export function validatePost(data: unknown) {
  return postFeedSchema.validate(data, {
    abortEarly:   false,
    stripUnknown: true,
  });
}

/**
 * Validates a MongoDB ObjectId from a route param.
 * Usage: validatePostId(params.id)
 */
export function validatePostId(id: unknown) {
  const schema = Joi.string()
    .trim()
    .required()
    .custom((value: string, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "MongoDB ObjectId format check")
    .messages({
      "string.base":  "Post ID must be a string",
      "string.empty": "Post ID is required",
      "any.invalid":  "Invalid post ID format — must be a valid MongoDB ObjectId",
      "any.required": "Post ID is required",
    });

  return schema.validate(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// TypeScript type
// ─────────────────────────────────────────────────────────────────────────────

export type PostInput = {
  title:   string;
  content: string;
  author:  string;
};