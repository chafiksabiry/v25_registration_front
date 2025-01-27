import { redirect } from 'react-router-dom';

const LINKEDIN_SCOPE = 'r_liteprofile r_emailaddress';
const REDIRECT_URI = window.location.origin + '/auth/linkedin/callback';

export const handleLinkedInSignUp = () => {
  const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
  
  if (!clientId) {
    console.error('LinkedIn client ID is not configured');
    return;
  }

  // Generate a random state value for security
  const state = Math.random().toString(36).substring(7);
  // Store state in sessionStorage for validation when LinkedIn redirects back
  sessionStorage.setItem('linkedin_oauth_state', state);

  // Construct the LinkedIn OAuth URL
  const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  linkedInAuthUrl.searchParams.append('response_type', 'code');
  linkedInAuthUrl.searchParams.append('client_id', clientId);
  linkedInAuthUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  linkedInAuthUrl.searchParams.append('state', state);
  linkedInAuthUrl.searchParams.append('scope', LINKEDIN_SCOPE);

  // Redirect to LinkedIn's authorization page
  window.location.href = linkedInAuthUrl.toString();
};

// Function to handle the OAuth callback
export const handleLinkedInCallback = async (code: string, state: string) => {
  // Verify state matches what we stored before the redirect
  const storedState = sessionStorage.getItem('linkedin_oauth_state');
  if (state !== storedState) {
    throw new Error('Invalid OAuth state');
  }

  // Clear stored state
  sessionStorage.removeItem('linkedin_oauth_state');

  // Here you would typically:
  // 1. Send the code to your backend
  // 2. Backend exchanges code for access token with LinkedIn
  // 3. Backend retrieves user profile from LinkedIn
  // 4. Backend creates/updates user account
  // 5. Backend returns session token or user data

  // For now, we'll just log the code (in production, never log sensitive data)
  console.log('Successfully received authorization code');
  
  // Redirect to appropriate page after successful sign-in
  return redirect('/dashboard');
};
export const handleLinkedInSignIn =async () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/linkedin/callback`;
    const scope = 'r_liteprofile r_emailaddress';
    const state = Math.random().toString(36).substring(7);
    
    localStorage.setItem('linkedin_state', state);
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = authUrl;
  };