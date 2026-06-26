import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { auth } from "./api";
import { hardNavigate } from "./appNavigation";

interface TokenPayload {
  userId?: string;
  typeUser?: string | null;
  exp?: number;
}

const SESSION_COOKIE_OPTS = { path: '/', sameSite: 'Lax' as const };

/** Persist userId cookie from JWT / localStorage so company MFE auth gates pass. */
export function syncSessionUserIdCookie(token?: string | null): string | null {
  const userId = getSessionUserId(token);
  if (userId) {
    Cookies.set('userId', userId, SESSION_COOKIE_OPTS);
    localStorage.setItem('userId', userId);
  }
  return userId;
}

/** Valid JWT in localStorage (full login session). */
export function isSessionActive(token?: string | null): boolean {
  const stored = token ?? localStorage.getItem("token");
  if (!stored) return false;

  try {
    const decoded = jwtDecode<TokenPayload>(stored);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return false;
    return Boolean(decoded.userId);
  } catch {
    return false;
  }
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
  return Cookies.get("userId") ?? localStorage.getItem("userId") ?? null;
}

export function getSessionToken(): string {
  return localStorage.getItem("token") ?? "";
}

const REP_ONBOARDING_STATE_KEY = "rep_onboarding_state";
const PROFILE_DATA_KEY = "profileData";

function computeRepRedirectFromProfile(profileData: {
  isBasicProfileCompleted?: boolean;
  status?: string;
  onboardingProgress?: { phases?: Record<string, { status?: string }> };
}): string | null {
  const creation = import.meta.env.VITE_REP_CREATION_PROFILE_URL || null;
  const dashboard = import.meta.env.VITE_REP_DASHBOARD_URL || "/reps/profile";
  const orchestrator = import.meta.env.VITE_REP_ORCHESTRATOR_URL || null;

  if (!profileData.isBasicProfileCompleted) return creation;
  const p = profileData.onboardingProgress?.phases;
  const allDone =
    p?.phase1?.status === "completed" &&
    p?.phase2?.status === "completed" &&
    p?.phase3?.status === "completed" &&
    p?.phase4?.status === "completed" &&
    p?.phase5?.status === "completed";
  const isPublished = profileData.status === "completed";
  return allDone && isPublished ? dashboard : orchestrator;
}

function syncRepOnboardingToLocalStorage(
  profileData: Record<string, unknown>,
  userId: string
): void {
  try {
    localStorage.setItem(PROFILE_DATA_KEY, JSON.stringify(profileData));
    localStorage.setItem("profileDataTimestamp", String(Date.now()));

    const phases = (profileData.onboardingProgress as { phases?: Record<string, { status?: string }> })
      ?.phases;
    const snapshot: Record<number, boolean> = {};
    for (let n = 1; n <= 5; n++) {
      snapshot[n] = phases?.[`phase${n}`]?.status === "completed";
    }
    localStorage.setItem("rep_phase_completion", JSON.stringify(snapshot));

    localStorage.setItem(
      REP_ONBOARDING_STATE_KEY,
      JSON.stringify({
        userId,
        isBasicProfileCompleted: profileData.isBasicProfileCompleted === true,
        allPhasesDone: [1, 2, 3, 4, 5].every((n) => snapshot[n]),
        isPublished: profileData.status === "completed",
        updatedAt: Date.now(),
      })
    );
  } catch {
    /* ignore storage errors */
  }
}

function getRepRedirectFromLocalStorage(userId: string): string | null {
  try {
    const stateRaw = localStorage.getItem(REP_ONBOARDING_STATE_KEY);
    if (stateRaw) {
      const state = JSON.parse(stateRaw) as {
        userId?: string;
        isBasicProfileCompleted?: boolean;
        allPhasesDone?: boolean;
        isPublished?: boolean;
      };
      if (state.userId === userId) {
        const creation = import.meta.env.VITE_REP_CREATION_PROFILE_URL || null;
        const dashboard = import.meta.env.VITE_REP_DASHBOARD_URL || "/reps/profile";
        const orchestrator = import.meta.env.VITE_REP_ORCHESTRATOR_URL || null;
        if (!state.isBasicProfileCompleted) return creation;
        return state.allPhasesDone && state.isPublished ? dashboard : orchestrator;
      }
    }

    const profileRaw = localStorage.getItem(PROFILE_DATA_KEY);
    if (profileRaw) {
      return computeRepRedirectFromProfile(JSON.parse(profileRaw));
    }
  } catch {
    /* fall through to API */
  }
  return null;
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

    if (checkUserType.userType === "admin") {
      return "/admin";
    }

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
        return "/company";
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

    // Fast path: use localStorage snapshot (no API round-trip on every login).
    const cachedRedirect = getRepRedirectFromLocalStorage(userId);
    if (cachedRedirect) return cachedRedirect;

    try {
      const { data: profileData } = await axios.get(
        `${import.meta.env.VITE_REP_API_URL}/profiles/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      syncRepOnboardingToLocalStorage(profileData, userId);
      return computeRepRedirectFromProfile(profileData);
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

  const userId = syncSessionUserIdCookie(token) ?? getSessionUserId(token);

  // A JWT alone (e.g. password-recovery verify step) is not a full login session.
  // Without the userId cookie the company/rep apps reject the user → redirect loop.
  if (!userId) {
    const recoveryInProgress = sessionStorage.getItem("passwordRecoveryFlow");
    if (recoveryInProgress || localStorage.getItem("token")) {
      localStorage.removeItem("token");
    }
    return false;
  }

  const dest = await getPostLoginRedirectUrl(userId, getSessionToken());
  hardNavigate(dest || "/company");
  return true;
}
