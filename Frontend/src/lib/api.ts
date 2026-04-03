/**
 * API client helpers
 * All calls go through backend — never direct to DB from frontend.
 */

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ── Token helper ──────────────────────────────────────────────
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("graphix-store");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

// ── Auth ──────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as { token: string; user: any };
}

export async function apiSignup(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  return data as { token: string; user: any };
}

// ── Charts ────────────────────────────────────────────────────

export async function apiSaveChart(
  token: string,
  payload: { title: string; prompt: string; chartConfig: any },
) {
  const res = await fetch(`${API}/api/charts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save chart");
  return data;
}

export async function apiUpdateChart(
  token: string,
  id: string,
  payload: { title?: string; chartConfig?: any },
) {
  const res = await fetch(`${API}/api/charts/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update chart");
  return data;
}

export async function apiDeleteChart(token: string, id: string) {
  const res = await fetch(`${API}/api/charts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete chart");
  return data;
}

export async function apiUpdateChartTitle(
  token: string,
  id: string,
  title: string,
) {
  const res = await fetch(`${API}/api/charts/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update chart");
  return data;
}

// ── Feedback ──────────────────────────────────────────────────

export async function submitFeedback(
  payload: { name: string; email: string; thoughts: string; rating?: number },
  token?: string,
) {
  const res = await fetch(`${API}/api/feedback`, {
    method: "POST",
    headers: token
      ? authHeaders(token)
      : { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      thoughts: payload.thoughts,
      rating: payload.rating ?? 5,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
  else console.log("Feedback submitted:", data);
  return data as {
    id: string;
    authorName: string;
    message: string;
    rating: number;
    createdAt: string;
  };
}

export async function apiFetchFeedbacks() {
  const res = await fetch(`${API}/api/feedback`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch feedbacks");
  return data as {
    id: string;
    authorName: string;
    message: string;
    rating: number;
    createdAt: string;
  }[];
}

export async function apiFetchMyFeedbacks(token: string) {
  const res = await fetch(`${API}/api/feedback/mine`, {
    method: "GET",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch your feedbacks");
  return data as {
    id: string;
    authorName: string;
    message: string;
    rating: number;
    createdAt: string;
  }[];
}
