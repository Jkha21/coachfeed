"use client";

import { useState } from "react";
import FeedCard from "@/components/FeedCard";
import type { FeedItem } from "@/types/feed";

// Single source of truth — mirrors Joi schema in feedValidator.ts
const LIMITS = {
  title:   { min: 3,  max: 100 },
  content: { min: 10, max: 300 },
  author:  { min: 2,  max: 50  },
} as const;

interface FormState {
  title:   string;
  content: string;
  author:  string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function AdminPage() {
  const [form,       setForm]       = useState<FormState>({ title: "", content: "", author: "" });
  const [errors,     setErrors]     = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);

  // ── Client-side validation (mirrors Joi schema) ───────────────────────────
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    const t = form.title.trim();
    const c = form.content.trim();
    const a = form.author.trim();

    if (!t)
      e.title = "Title is required";
    else if (t.length < LIMITS.title.min)
      e.title = `Title must be at least ${LIMITS.title.min} characters`;
    else if (t.length > LIMITS.title.max)
      e.title = `Title cannot exceed ${LIMITS.title.max} characters`;

    if (!c)
      e.content = "Content is required";
    else if (c.length < LIMITS.content.min)
      e.content = `Content must be at least ${LIMITS.content.min} characters`;
    else if (c.length > LIMITS.content.max)
      e.content = `Content cannot exceed ${LIMITS.content.max} characters`;

    if (!a)
      e.author = "Author name is required";
    else if (a.length < LIMITS.author.min)
      e.author = `Author name must be at least ${LIMITS.author.min} characters`;
    else if (a.length > LIMITS.author.max)
      e.author = `Author name cannot exceed ${LIMITS.author.max} characters`;

    return e;
  };

  const handleChange = <K extends keyof FormState>(field: K, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSuccess(false);
    setApiError(null);
  };

  // ── Submit — error handling via route.ts response shape ──────────────────
  // route.ts wraps every outcome into { success, data, error, details }.
  // This page reads that shape directly — no try/catch needed.
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    const response = await fetch("/api/feed", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title:   form.title.trim(),
        content: form.content.trim(),
        author:  form.author.trim(),
      }),
    });

    const data = await response.json();

    if (!data.success) {
      // route.ts always populates data.error (and optionally data.details
      // for Joi validation arrays from the backend)
      const message = data.details?.join(", ") || data.error || "Failed to create feed item";
      setApiError(message);
      setSubmitting(false);
      return;
    }

    // Success — Home page receives the item via feed_created socket event.
    // No router.push("/") needed.
    setSuccess(true);
    setForm({ title: "", content: "", author: "" });
    setErrors({});
    setSubmitting(false);
  };

  // ── Live preview ──────────────────────────────────────────────────────────
  const preview: FeedItem | null =
    form.title || form.content || form.author
      ? {
          _id:       "preview",
          title:     form.title   || "Untitled",
          content:   form.content || "No content yet…",
          author:    form.author  || "Anonymous",
          createdAt: new Date().toISOString(),
        }
      : null;

  const contentLen    = form.content.length;
  const contentOver85 = contentLen > LIMITS.content.max * 0.85;
  const contentOver   = contentLen > LIMITS.content.max;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Header */}
      <div className="mb-6 sm:mb-9">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Post to <span className="text-accent">Feed</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Saved to MongoDB → Redis invalidated → pushed to all clients via socket.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 md:p-8">

        {/* Title */}
        <div className="mb-5 sm:mb-6">
          <label
            htmlFor="field-title"
            className="block text-text-muted text-[11px] font-mono font-semibold uppercase tracking-widest mb-2"
          >
            Title
          </label>
          <input
            id="field-title"
            className={`w-full bg-bg border ${
              errors.title ? "border-red-500" : "border-border"
            } rounded-lg px-4 py-3 text-text text-sm focus:border-accent focus:ring-1 focus:ring-accent/40 outline-none transition-colors`}
            placeholder="e.g. Sprint 8 Kickoff notes"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            maxLength={LIMITS.title.max}
          />
          {errors.title && (
            <p className="text-red-400 text-[11px] font-mono mt-1.5">
              ↑ {errors.title}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="mb-5 sm:mb-6">
          <label
            htmlFor="field-content"
            className="block text-text-muted text-[11px] font-mono font-semibold uppercase tracking-widest mb-2"
          >
            Content
          </label>
          <textarea
            id="field-content"
            className={`w-full bg-bg border ${
              errors.content ? "border-red-500" : "border-border"
            } rounded-lg px-4 py-3 text-text text-sm focus:border-accent focus:ring-1 focus:ring-accent/40 outline-none resize-none transition-colors`}
            rows={4}
            placeholder="What's the update? Keep it clear and actionable."
            value={form.content}
            onChange={(e) => handleChange("content", e.target.value)}
          />
          <div className="flex items-center justify-between mt-1.5">
            {errors.content ? (
              <p className="text-red-400 text-[11px] font-mono">
                ↑ {errors.content}
              </p>
            ) : (
              <span />
            )}
            <span
              className={`text-[11px] font-mono ml-auto ${
                contentOver   ? "text-red-400"   :
                contentOver85 ? "text-amber-400" :
                                "text-text-muted"
              }`}
            >
              {contentLen} / {LIMITS.content.max}
            </span>
          </div>
        </div>

        {/* Author */}
        <div className="mb-6 sm:mb-8">
          <label
            htmlFor="field-author"
            className="block text-text-muted text-[11px] font-mono font-semibold uppercase tracking-widest mb-2"
          >
            Author
          </label>
          <input
            id="field-author"
            className={`w-full bg-bg border ${
              errors.author ? "border-red-500" : "border-border"
            } rounded-lg px-4 py-3 text-text text-sm focus:border-accent focus:ring-1 focus:ring-accent/40 outline-none transition-colors`}
            placeholder="Your full name"
            value={form.author}
            onChange={(e) => handleChange("author", e.target.value)}
            maxLength={LIMITS.author.max}
          />
          {errors.author && (
            <p className="text-red-400 text-[11px] font-mono mt-1.5">
              ↑ {errors.author}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          aria-label={submitting ? "Publishing feed item…" : "Publish feed item"}
          className="w-full bg-accent hover:bg-accent/90 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {submitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing…
            </>
          ) : (
            "Publish Feed Item"
          )}
        </button>

        {/* API error — message comes directly from route.ts */}
        {apiError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
          >
            <span className="flex-shrink-0 mt-0.5">⚠</span>
            <span>{apiError}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div
            role="status"
            className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-sm"
          >
            <span>✓</span>
            Published — feed_created event pushed to all connected clients.
          </div>
        )}

        {/* Live preview */}
        {preview && (
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-text-muted text-[11px] font-mono font-semibold uppercase tracking-widest mb-4">
              Live Preview
            </p>
            <FeedCard item={preview} isNew={false} />
          </div>
        )}
      </div>
    </main>
  );
}