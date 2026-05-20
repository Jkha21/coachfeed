"use client";

import { useState } from "react";
import LivePreview from "@/components/LivePreview";

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
  const [form,          setForm]        = useState<FormState>({ title: "", content: "", author: "" });
  const [errors,        setErrors]      = useState<FormErrors>({});
  const [submitting,    setSubmitting]  = useState(false);
  const [success,       setSuccess]     = useState(false);
  const [apiError,      setApiError]    = useState<string | null>(null);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    const t = form.title.trim();
    const c = form.content.trim();
    const a = form.author.trim();

    if (!t) e.title = "Title is required";
    else if (t.length < LIMITS.title.min) e.title = `Title must be at least ${LIMITS.title.min} characters`;
    else if (t.length > LIMITS.title.max) e.title = `Title cannot exceed ${LIMITS.title.max} characters`;

    if (!c) e.content = "Content is required";
    else if (c.length < LIMITS.content.min) e.content = `Content must be at least ${LIMITS.content.min} characters`;
    else if (c.length > LIMITS.content.max) e.content = `Content cannot exceed ${LIMITS.content.max} characters`;

    if (!a) e.author = "Author name is required";
    else if (a.length < LIMITS.author.min) e.author = `Author name must be at least ${LIMITS.author.min} characters`;
    else if (a.length > LIMITS.author.max) e.author = `Author name cannot exceed ${LIMITS.author.max} characters`;

    return e;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSuccess(false);
    setApiError(null);
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
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
        const message = data.details?.join(", ") || data.error || "Failed to create feed item";
        setApiError(message);
        return;
      }

      setSuccess(true);
      setForm({ title: "", content: "", author: "" });
      setErrors({});
    } catch (err) {
      setApiError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const contentLen    = form.content.length;
  const contentOver85 = contentLen > LIMITS.content.max * 0.85;
  const contentOver   = contentLen > LIMITS.content.max;

  return (
    <main className="mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full sm:w-[576px] shrink-0 box-border">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
          Post to <span className="text-accent">Feed</span>
        </h1>
        <p className="text-text-muted mt-1 text-sm">
          Create a new update to share with your team.
        </p>
      </div>

      {/* Form card - shrink-0 and box-border locks its dimensions */}
      <div className="bg-surface shadow-sm border border-border rounded-2xl p-5 sm:p-6 w-full shrink-0 box-border">
        <div className="space-y-5">
          
          {/* Title Input */}
          <div>
            <label htmlFor="field-title" className="block text-text-muted text-[11px] font-mono font-semibold uppercase tracking-widest mb-1.5">
              Title
            </label>
            <input
              id="field-title"
              className={`w-full box-border bg-bg border ${errors.title ? "border-red-500 ring-1 ring-red-500/20" : "border-border"} rounded-xl px-4 py-2.5 text-text text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all`}
              placeholder="e.g. Sprint 8 Kickoff notes"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              maxLength={LIMITS.title.max}
            />
            {errors.title && (
              <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <span className="text-[10px]">▲</span> {errors.title}
              </p>
            )}
          </div>

          {/* Content Input */}
          <div>
            <label htmlFor="field-content" className="block text-text-muted text-[11px] font-mono font-semibold uppercase tracking-widest mb-1.5">
              Content
            </label>
            <textarea
              id="field-content"
              className={`w-full box-border bg-bg border ${errors.content ? "border-red-500 ring-1 ring-red-500/20" : "border-border"} rounded-xl px-4 py-2.5 text-text text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-y min-h-[110px] max-h-[350px] transition-all`}
              placeholder="What's the update? Keep it clear and actionable."
              value={form.content}
              onChange={(e) => handleChange("content", e.target.value)}
            />
            <div className="flex items-start justify-between mt-1.5">
              {errors.content ? (
                <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                  <span className="text-[10px]">▲</span> {errors.content}
                </p>
              ) : <span />}
              <span className={`text-[11px] font-mono ml-auto transition-colors ${contentOver ? "text-red-500 font-bold" : contentOver85 ? "text-amber-500" : "text-text-muted"}`}>
                {contentLen} / {LIMITS.content.max}
              </span>
            </div>
          </div>

          {/* Author Input */}
          <div>
            <label htmlFor="field-author" className="block text-text-muted text-[11px] font-mono font-semibold uppercase tracking-widest mb-1.5">
              Author
            </label>
            <input
              id="field-author"
              className={`w-full box-border bg-bg border ${errors.author ? "border-red-500 ring-1 ring-red-500/20" : "border-border"} rounded-xl px-4 py-2.5 text-text text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all`}
              placeholder="Your full name"
              value={form.author}
              onChange={(e) => handleChange("author", e.target.value)}
              maxLength={LIMITS.author.max}
            />
            {errors.author && (
              <p className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                <span className="text-[10px]">▲</span> {errors.author}
              </p>
            )}
          </div>
        </div>

        {/* Submit Trigger */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            aria-label={submitting ? "Publishing feed item…" : "Publish feed item"}
            className="w-full box-border bg-accent hover:bg-accent/90 active:scale-[0.99] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm cursor-pointer"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing…
              </>
            ) : "Publish Feed Item"}
          </button>
        </div>

        {/* Status Messages */}
        {apiError && (
          <div role="alert" className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium break-words">{apiError}</span>
          </div>
        )}

        {success && (
          <div role="status" className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Published successfully!</span>
          </div>
        )}

        {/* Modularized Isolated Live Preview */}
        <LivePreview 
          title={form.title} 
          content={form.content} 
          author={form.author} 
        />
      </div>
    </main>
  );
}