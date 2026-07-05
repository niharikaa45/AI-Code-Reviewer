import { useState } from "react";
import Editor from "@monaco-editor/react";
import API from "../api";

export default function Dashboard() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [reviewType, setReviewType] = useState("bug");
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const normalizeRating = (value) => {
    if (value === null || value === undefined) return 5;
    const ratingString = String(value).trim().toLowerCase();
    const numeric = Number(ratingString);
    if (!Number.isNaN(numeric)) {
      return Math.max(1, Math.min(10, Math.round(numeric)));
    }

    const numericMatch = ratingString.match(/(\d{1,2})/);
    if (numericMatch) {
      const num = Number(numericMatch[1]);
      if (!Number.isNaN(num)) {
        return Math.max(1, Math.min(10, num));
      }
    }

    if (ratingString.includes("low")) return 2;
    if (ratingString.includes("neutral") || ratingString.includes("medium") || ratingString.includes("average")) return 5;
    if (ratingString.includes("good")) return 7;
    if (ratingString.includes("high") || ratingString.includes("strong")) return 9;
    if (ratingString.includes("excellent") || ratingString.includes("great")) return 10;

    return 5;
  };

  const ratingLabel = (value) => {
    const normalized = normalizeRating(value);
    if (normalized <= 2) return "Poor";
    if (normalized <= 4) return "Fair";
    if (normalized <= 6) return "Good";
    if (normalized <= 8) return "Very Good";
    return "Excellent";
  };

  const qualityTrend = (value) => {
    const normalized = normalizeRating(value);
    if (normalized <= 4) return "Needs improvement";
    if (normalized <= 6) return "Stable";
    return "Positive";
  };

  const scoreAccent = (value) => {
    const normalized = normalizeRating(value);
    if (normalized <= 4) return "border-rose-500/20 bg-rose-500/10 text-rose-200";
    if (normalized <= 6) return "border-amber-500/20 bg-amber-500/10 text-amber-200";
    if (normalized <= 8) return "border-lime-500/20 bg-lime-500/10 text-lime-200";
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  };

  const handleReview = async () => {
    try {
      setLoading(true);
      setReview(null); 

      const res = await API.post("/review", {
        code,
        language,
        reviewType,
      });

      console.log("Full API Response:", res.data);

      if (res.data.success) {
        const rawData = res.data.review?.review ?? res.data.review ?? res.data;
        const payload = typeof rawData === "string" ? rawData.trim() : rawData;

        if (typeof payload === "string" && payload.startsWith("{")) {
          try {
            const parsedData = JSON.parse(payload);
            setReview(parsedData);
          } catch (parseError) {
            console.error("Failed to parse inner JSON string:", parseError);
            setReview(payload);
          }
        } else {
          setReview(payload);
        }
      }
    } catch (err) {
      console.log("FULL ERROR:", err);
      alert(err.response?.data?.message || "Error analyzing code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050611] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-slate-800 bg-slate-950/95 px-8 py-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400/80">AI CODE REVIEWER</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Your AI review assistant</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Analyze code with a AI-style interface tuned for bugs, performance, security, and quality.</p>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-full bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.62fr_0.38fr]">
          <section className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col items-center gap-4 text-center">
              <div>
                <h2 className="text-xl font-semibold text-white">Code Input</h2>
                <p className="mt-1 text-sm text-slate-400">Paste your source code and choose a review mode.</p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>

                <select
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-500"
                >
                  <option value="bug">Bug Detection</option>
                  <option value="performance">Performance</option>
                  <option value="security">Security Review</option>
                  <option value="quality">Code Quality</option>
                </select>

                <button
                  onClick={handleReview}
                  disabled={loading}
                  className="rounded-full bg-slate-700 px-7 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Analyzing..." : "Analyze Code"}
                </button>
              </div>
            </div>

            <div className="mt-6 rounded-[32px] border border-slate-800 bg-slate-900 p-2 shadow-inner shadow-slate-950/30">
              <div className="overflow-hidden rounded-[30px]">
                <Editor
                  height="640px"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || "")}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
                <p className="text-sm text-slate-500">Review mode</p>
                <p className="mt-2 text-lg font-semibold text-white">{reviewType.charAt(0).toUpperCase() + reviewType.slice(1)}</p>
              </div>
              <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-5">
                <p className="text-sm text-slate-500">Language</p>
                <p className="mt-2 text-lg font-semibold text-white">{language.charAt(0).toUpperCase() + language.slice(1)}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-slate-950/40">
            <div className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div>
                <h2 className="text-xl font-semibold text-white">Assistant</h2>
                <p className="mt-1 text-sm text-slate-400">AI-style code review results.</p>
              </div>
              <span className="rounded-full bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-400">{reviewType}</span>
            </div>

            <div className="space-y-8">
              {loading && (
                <div className="flex min-h-[560px] items-center justify-center rounded-[28px] bg-slate-900/90 p-8 text-slate-300 shadow-inner shadow-slate-950/50">
                  <p className="text-lg">🔍 Thinking like AI... hang tight.</p>
                </div>
              )}

              {!loading && review && (
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">AI</div>
                      <div>
                        <p className="text-sm font-semibold text-white">AI Review Assistant</p>
                        <p className="text-xs text-slate-500">Answer generated from your code input.</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6">
                      <div className={`rounded-3xl border ${scoreAccent(review.rating)} bg-slate-950/80 p-6`}> 
                        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-5">
                          <div>
                            <p className="text-sm text-slate-400">Rating</p>
                            <div className="mt-3 flex items-baseline gap-4">
                              <p className="text-4xl font-semibold text-white">{normalizeRating(review.rating)}</p>
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">{ratingLabel(review.rating)}</span>
                            </div>
                          </div>
                          <div className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                            {qualityTrend(review.rating)}
                          </div>
                        </div>
                      </div>

                      {review.bugs && review.bugs.length > 0 && (
                        <div className="rounded-3xl border border-red-500/20 bg-slate-950/80 p-5 shadow-sm">
                          <p className="text-sm font-semibold text-red-300">Bugs</p>
                          <ul className="mt-3 list-disc space-y-3 pl-6 text-slate-300 text-sm leading-6">
                            {review.bugs.map((bug, i) => <li key={i}>{bug}</li>)}
                          </ul>
                        </div>
                      )}

                      {review.improvements && review.improvements.length > 0 && (
                        <div className="rounded-3xl border border-amber-400/20 bg-slate-950/80 p-5 shadow-sm">
                          <p className="text-sm font-semibold text-amber-300">Improvements</p>
                          <ul className="mt-3 list-disc space-y-3 pl-6 text-slate-300 text-sm leading-6">
                            {review.improvements.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {review.securityIssues && review.securityIssues.length > 0 && (
                        <div className="rounded-3xl border border-orange-500/20 bg-slate-950/80 p-5 shadow-sm">
                          <p className="text-sm font-semibold text-orange-300">Security Issues</p>
                          <ul className="mt-3 list-disc space-y-3 pl-6 text-slate-300 text-sm leading-6">
                            {review.securityIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                          </ul>
                        </div>
                      )}

                      <div className="rounded-3xl border border-violet-500/20 bg-slate-950/80 p-5 shadow-sm">
                        <p className="text-sm font-semibold text-violet-300">Optimized Code</p>
                        {review.optimizedCode ? (
                          <pre className="mt-3 overflow-auto rounded-3xl bg-slate-950 p-6 text-sm text-slate-200 shadow-inner whitespace-pre-wrap">{review.optimizedCode}</pre>
                        ) : (
                          <div className="mt-3 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400">No optimized code was generated. Review summary is above.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!loading && !review && (
                <div className="flex min-h-[560px] items-center justify-center rounded-[28px] border border-dashed border-slate-800 bg-slate-900/90 p-8 text-slate-400">
                  <div className="space-y-2 text-center">
                    <p className="text-xl font-medium text-slate-200">No review yet</p>
                    <p className="text-sm text-slate-400">Click Analyze Code to generate AI-style feedback.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}