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

/** Remove persisted userId from localStorage and cookies (both path variants). */
export function clearSessionUserId(): void {
  localStorage.removeItem('userId');
  Cookies.remove('userId', SESSION_COOKIE_OPTS);
  Cookies.remove('userId');
}

/** Clear all auth session data (token, userId, profile caches). */
export function clearAuthSession(): void {
  localStorage.removeItem('token');
  clearSessionUserId();
  localStorage.removeItem('userType');
  localStorage.removeItem('companyId');
  localStorage.removeItem('companyName');
  localStorage.removeItem('companyLogo');
  localStorage.removeItem('userFullName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('companyOnboardingProgress');
  localStorage.removeItem('selectedGigId');
  localStorage.removeItem('pendingUserType');
}

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

type RepPhaseStatus = { status?: string };
type RepProfileSnapshot = {
  isBasicProfileCompleted?: boolean;
  status?: string;
  generatedSummary?: string;
  professionalSummary?: { profileDescription?: string };
  experience?: unknown[];
  experiences?: unknown[];
  personalInfo?: { firstName?: string; first_name?: string };
  gigs?: Array<{ status?: string } | null>;
  onboardingProgress?: {
    currentPhase?: number;
    phases?: Record<string, RepPhaseStatus>;
  };
};

/** Mount prefix for the unified rep app (qiankun host = `/reps`). */
function getRepMountBase(): string {
  const creation =
    import.meta.env.VITE_REP_CREATION_PROFILE_URL || "/reps/profile-import";
  if (creation.endsWith("/profile-import")) {
    const base = creation.slice(0, -"/profile-import".length);
    return base || "/reps";
  }
  const orchestrator = import.meta.env.VITE_REP_ORCHESTRATOR_URL || "/reps";
  return String(orchestrator).replace(/\/$/, "") || "/reps";
}

function toRepAbsoluteUrl(appPath: string): string {
  const base = getRepMountBase();
  const path = appPath.startsWith("/") ? appPath : `/${appPath}`;
  return `${base}${path}`;
}

function isRepPhaseCompleted(
  phases: Record<string, RepPhaseStatus> | undefined,
  n: number
): boolean {
  return phases?.[`phase${n}`]?.status === "completed";
}

function hasRepProfileContent(profile: RepProfileSnapshot): boolean {
  if (profile.isBasicProfileCompleted === true) return true;
  if (typeof profile.generatedSummary === "string" && profile.generatedSummary.trim()) {
    return true;
  }
  const desc = profile.professionalSummary?.profileDescription;
  if (typeof desc === "string" && desc.trim()) return true;
  if (Array.isArray(profile.experience) && profile.experience.length > 0) return true;
  if (Array.isArray(profile.experiences) && profile.experiences.length > 0) return true;
  const firstName =
    profile.personalInfo?.firstName || profile.personalInfo?.first_name;
  return typeof firstName === "string" && Boolean(firstName.trim());
}

/**
 * Resume the current onboarding step after login.
 * Do not key solely on `isBasicProfileCompleted` — that flag is only set at
 * the end of the CV editor, so mid-funnel reps were always sent to Import CV.
 */
function computeRepRedirectFromProfile(profileData: RepProfileSnapshot): string {
  const phases = profileData.onboardingProgress?.phases;
  const currentPhase = Number(profileData.onboardingProgress?.currentPhase) || 1;
  const isPublished = profileData.status === "completed";
  const coreDone =
    isPublished ||
    [1, 2, 3, 4].every((n) => isRepPhaseCompleted(phases, n));
  const gigEngaged =
    Array.isArray(profileData.gigs) &&
    profileData.gigs.some(
      (g) => g && ["requested", "enrolled"].includes(String(g.status))
    );

  if (isPublished) return toRepAbsoluteUrl("/dashboard");
  if (coreDone && gigEngaged) return toRepAbsoluteUrl("/profile");
  if (coreDone || isRepPhaseCompleted(phases, 4)) {
    return toRepAbsoluteUrl("/marketplace");
  }
  if (
    isRepPhaseCompleted(phases, 3) ||
    currentPhase >= 4 ||
    phases?.phase4?.status === "in_progress"
  ) {
    return toRepAbsoluteUrl("/orchestrator/subscription");
  }
  if (
    isRepPhaseCompleted(phases, 2) ||
    currentPhase >= 3 ||
    phases?.phase3?.status === "in_progress"
  ) {
    return toRepAbsoluteUrl("/orchestrator/skills");
  }
  if (profileData.isBasicProfileCompleted === true) {
    return toRepAbsoluteUrl("/orchestrator/profile");
  }
  if (hasRepProfileContent(profileData)) {
    return toRepAbsoluteUrl("/profile-editor");
  }
  return (
    import.meta.env.VITE_REP_CREATION_PROFILE_URL ||
    toRepAbsoluteUrl("/profile-import")
  );
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

    const nextPath = computeRepRedirectFromProfile(
      profileData as RepProfileSnapshot
    );

    localStorage.setItem(
      REP_ONBOARDING_STATE_KEY,
      JSON.stringify({
        userId,
        isBasicProfileCompleted: profileData.isBasicProfileCompleted === true,
        allPhasesDone: [1, 2, 3, 4].every((n) => snapshot[n]),
        isPublished: profileData.status === "completed",
        nextPath,
        updatedAt: Date.now(),
      })
    );
  } catch {
    /* ignore storage errors */
  }
}

/** Fallback only when the profile API is unreachable. */
function getRepRedirectFromLocalStorage(userId: string): string | null {
  try {
    const stateRaw = localStorage.getItem(REP_ONBOARDING_STATE_KEY);
    if (stateRaw) {
      const state = JSON.parse(stateRaw) as {
        userId?: string;
        nextPath?: string;
      };
      if (state.userId === userId && typeof state.nextPath === "string" && state.nextPath) {
        return state.nextPath;
      }
    }

    const profileRaw = localStorage.getItem(PROFILE_DATA_KEY);
    if (profileRaw) {
      return computeRepRedirectFromProfile(JSON.parse(profileRaw));
    }
  } catch {
    /* fall through */
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

    // Always prefer live profile so login resumes the real onboarding step
    // (stale localStorage used to force /profile-import).
    try {
      const { data: profileData } = await axios.get(
        `${import.meta.env.VITE_REP_API_URL}/profiles/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      syncRepOnboardingToLocalStorage(profileData, userId);
      return computeRepRedirectFromProfile(profileData);
    } catch {
      return (
        getRepRedirectFromLocalStorage(userId) ||
        import.meta.env.VITE_REP_CREATION_PROFILE_URL ||
        toRepAbsoluteUrl("/profile-import")
      );
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
      clearAuthSession();
    }
    return false;
  }

  const dest = await getPostLoginRedirectUrl(userId, getSessionToken());
  hardNavigate(dest || "/company");
  return true;
}
