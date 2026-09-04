import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import type { SignupUserType } from '../ChoicePage';

/**
 * Shared shell for the auth screens (landing + choice + signin + register +
 * recovery). Mirrors the rep orchestrator's `OnboardingShell`: a layout route
 * that renders child screens through <Outlet /> and shares navigation helpers
 * + cross-screen state (pending landing section) via the outlet context.
 */
export interface AuthOutletContext {
  navigate: ReturnType<typeof useNavigate>;
  pendingSection: string | null;
  setPendingSection: (section: string | null) => void;
  handleNavigateToSection: (sectionId: string) => void;
  handleSelectRole: (role: SignupUserType) => void;
}

export function useAuthContext() {
  return useOutletContext<AuthOutletContext>();
}

export default function AuthShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  const handleNavigateToSection = (sectionId: string) => {
    setPendingSection(sectionId);
    navigate('/');
  };

  const handleSelectRole = (role: SignupUserType) => {
    localStorage.setItem('pendingUserType', role);
    const pathByRole: Record<SignupUserType, string> = {
      company: '/auth/register-company',
      rep: '/auth/register-rep',
      'call-center': '/auth/register-call-center',
    };
    navigate(pathByRole[role], {
      state: { returnTo: '/auth/choice' },
    });
  };

  const context: AuthOutletContext = {
    navigate,
    pendingSection,
    setPendingSection,
    handleNavigateToSection,
    handleSelectRole,
  };

  return (
    <div className="min-h-0 bg-white">
      <Outlet
        key={location.pathname}
        context={context}
      />
    </div>
  );
}
