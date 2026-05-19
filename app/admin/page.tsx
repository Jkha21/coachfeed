"use client";

import { useState } from "react";
import FeedCard from "@/components/FeedCard";
import { useRouter } from "next/navigation";
import type { FeedItem } from "@/types/feed";

const MAX_BODY = 300;

interface FormState {
  title: string;
  content: string; 
  author: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function AdminPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ title: "", content: "", author: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.length < 3) e.title = "Title too short";
    if (!form.content.trim()) e.content = "Content is required";
    else if (form.content.length > MAX_BODY) e.content = `Max ${MAX_BODY} characters`;
    if (!form.author.trim()) e.author = "Author name is required";
    return e;
  };

  const handleChange = <K extends keyof FormState>(field: K, value: string) => {
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          content: form.content.trim(),
          author: form.author.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details?.join(", ") || "Failed to create feed");
      }

      // Success!
      setSuccess(true);
      setForm({ title: "", content: "", author: "" });
      setErrors({});

      // Optionally redirect to home after a short delay
      setTimeout(() => router.push("/"), 1000);
    } catch (err: any) {
      setApiError(err.message || "Something went wrong. Please try again.");
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  const preview: FeedItem | null = form.title || form.content || form.author
    ? {
        _id: "preview",
        title: form.title || "Untitled",
        content: form.content || "No content yet…",
        author: form.author || "Anonymous",
        createdAt: new Date().toISOString(),
      }
    : null;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* header */}
      <div className="mb-6 sm:mb-9">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
          Post to Feed
        </h1>
      </div>

      {/* form card */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 md:p-8">
        {/* Title */}
        <div className="mb-5 sm:mb-6">
          <label className="block text-text-muted text-2xs font-mono font-semibold uppercase tracking-wide mb-2">
            Title
          </label>
          <input
            className={`w-full bg-bg border ${errors.title ? "border-red-500" : "border-border"} rounded-lg px-4 py-3 text-text text-sm focus:border-accent focus:ring-1 focus:ring-accent/40 outline-none`}
            placeholder="e.g. Sprint 8 Kickoff notes"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
          {errors.title && <div className="text-red-400 text-2xs font-mono mt-1">↑ {errors.title}</div>}
        </div>

        {/* Content */}
        <div className="mb-5 sm:mb-6">
          <label className="block text-text-muted text-2xs font-mono font-semibold uppercase tracking-wide mb-2">
            Content
          </label>
          <textarea
            className={`w-full bg-bg border ${errors.content ? "border-red-500" : "border-border"} rounded-lg px-4 py-3 text-text text-sm focus:border-accent focus:ring-1 focus:ring-accent/40 outline-none resize-none`}
            rows={4}
            placeholder="What's the update? Keep it clear and actionable."
            value={form.content}
            onChange={(e) => handleChange("content", e.target.value)}
          />
          <div className={`text-right text-2xs font-mono mt-1 ${form.content.length > MAX_BODY * 0.85 ? "text-amber-500" : "text-text-muted"}`}>
            {form.content.length} / {MAX_BODY}
          </div>
          {errors.content && <div className="text-red-400 text-2xs font-mono mt-1">↑ {errors.content}</div>}
        </div>

        {/* Author */}
        <div className="mb-5 sm:mb-6">
          <label className="block text-text-muted text-2xs font-mono font-semibold uppercase tracking-wide mb-2">
            Author
          </label>
          <input
            className={`w-full bg-bg border ${errors.author ? "border-red-500" : "border-border"} rounded-lg px-4 py-3 text-text text-sm focus:border-accent focus:ring-1 focus:ring-accent/40 outline-none`}
            placeholder="Your name"
            value={form.author}
            onChange={(e) => handleChange("author", e.target.value)}
          />
          {errors.author && <div className="text-red-400 text-2xs font-mono mt-1">↑ {errors.author}</div>}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing…
            </>
          ) : (
            "Publish Feed Item"
          )}
        </button>

        {apiError && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-slide-in">
            <span>⚠️</span>
            {apiError}
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-green-dim border border-green/30 text-green-400 text-sm animate-slide-in">
            <span>✓</span>
            Posted successfully — realtime event emitted to all connected clients.
          </div>
        )}

        {preview && (
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-text-muted text-2xs font-mono font-semibold uppercase tracking-wide mb-4">
              Live Preview
            </div>
            <FeedCard item={preview} isNew={false} />
          </div>
        )}
      </div>
    </main>
  );
}