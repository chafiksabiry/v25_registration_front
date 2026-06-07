import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { auth } from "./api";

interface TokenPayload {
  userId?: string;
  exp?: number;
}

/** Valid JWT in localStorage or userId cookie (orchestrator / qiankun session). */
export function isSessionActive(token?: string | null): boolean {
  const stored = token ?? localStorage.getItem("token");
  if (stored) {
    try {
      const decoded = jwtDecode<TokenPayload>(stored);
      if (decoded.exp && decoded.exp * 1000 < Date.now()) return false;
      return Boolean(decoded.userId);
    } catch {
      /* fall through to cookie */
    }
  }
  return Boolean(Cookies.get("userId"));
}

export function getSessionUserId(token?: string | null): string | null {
  const stored = token ?? localStorage.getItem("token");
  if (stored) {
    try {
      const decoded = jwtDecode<TokenPayload>(stored);
      if (decoded.userId) return decoded.userId;
    } catch {
      /* ignore */
    }
  }
  return Cookies.get("userId") ?? null;
}

export function getSessionToken(): string {
  return localStorage.getItem("token") ?? "";
}

/**
 * Post-sign-in destination (company → /company, rep → env URLs).
 * Never returns `/app2` (deprecated blank page).
 */
export async function getPostLoginRedirectUrl(
  userId: string,
  token: string
): Promise<string | null> {
  try {
    const checkUserType = await auth.checkUserType(userId);
    if (checkUserType.userType == null) return null;

    if (checkUserType.userType === "company") {
      try {
        const { data: onboardingProgress } = await axios.get(
          `${import.meta.env.VITE_COMPANY_API_URL}/onboarding/companies/${userId}/onboardingProgress`
        );
        if (
          onboardingProgress.currentPhase !== 4 ||
          !onboardingProgress.phases?.find((p: { id: number }) => p.id === 4)?.completed
        ) {
          return "/company";
        }
        return "/app7";
      } catch (e: unknown) {
        const status =
          e &&
          typeof e === "object" &&
          "response" in e &&
          (e as { response?: { status?: number } }).response?.status;
        if (status === 404) return "/company";
        throw e;
      }
    }

    try {
      const { data: profileData } = await axios.get(
        `${import.meta.env.VITE_REP_API_URL}/profiles/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!profileData.isBasicProfileCompleted) {
        return import.meta.env.VITE_REP_CREATION_PROFILE_URL || null;
      }
      const p = profileData.onboardingProgress?.phases;
      const allDone =
        p?.phase1?.status === "completed" &&
        p?.phase2?.status === "completed" &&
        p?.phase3?.status === "completed" &&
        p?.phase4?.status === "completed";
      return allDone
        ? import.meta.env.VITE_REP_DASHBOARD_URL || "/reps/profile"
        : import.meta.env.VITE_REP_ORCHESTRATOR_URL || null;
    } catch {
      return import.meta.env.VITE_REP_CREATION_PROFILE_URL || null;
    }
  } catch {
    return null;
  }
}

/** Redirect authenticated users away from guest-only pages. */
export async function redirectIfAuthenticated(token?: string | null): Promise<boolean> {
  if (!isSessionActive(token)) return false;

  const userId = getSessionUserId(token);
  if (!userId) {
    window.location.replace("/company");
    return true;
  }

  const dest = await getPostLoginRedirectUrl(userId, getSessionToken());
  window.location.replace(dest || "/company");
  return true;
}
