import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

interface Credentials {
  email: string;
  password: string;
}
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export async function signup({ email, password }: Credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body.message || body.error || "Signup failed";
      toast.error(msg);
      throw new Error(msg);
    }

    toast.success("Account created successfully!");
  } catch (err: any) {
    if (!(err instanceof Error)) {
      toast.error("Signup failed");
    }
    throw err;
  }
}

export async function login({ email, password }: Credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body.message || body.error || "Login failed";
      toast.error(msg);
      throw new Error(msg);
    }

    toast.success("Welcome back!");
  } catch (err: any) {
    if (!(err instanceof Error)) {
      toast.error("Login failed");
    }
    throw err;
  }
}

export async function me(): Promise<{ email: string; id: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Not authenticated");
    }
    const body = await res.json();
    return body.user;
  } catch (err: any) {
    // probably don't toast here on mount, to avoid spamming
    throw err;
  }
}

export async function logout() {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body.message || body.error || "Logout failed";
      toast.error(msg);
      throw new Error(msg);
    }
    toast.success("Logged out successfully");
  } catch (err: any) {
    if (!(err instanceof Error)) {
      toast.error("Logout failed");
    }
    throw err;
  }
}
export async function changePassword({
  oldPassword,
  newPassword,
}: ChangePasswordPayload) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!res.ok) {
    const { error, message } = await res.json().catch(() => ({}));
    throw new Error(message || error || "Change password failed");
  }
}
export const authApi = { signup, login, logout, me };
