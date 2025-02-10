import { redirect } from 'react-router-dom';
import { auth } from '../lib/api';

const LINKEDIN_SCOPE = 'openid profile email';
console.log("REDIRECT_URI",window.location.origin);
const REDIRECT_URI = window.location.origin + '/auth/linkedin/callback';
console.log("REDIRECT_URI",REDIRECT_URI);

export const handleLinkedInSignUp = () => {
  console.log("we are in handlelinkedinsignup function");
  const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
  
  if (!clientId) {
    console.error('LinkedIn client ID is not configured');
    return;
  }

  // Generate a random state value for security
  const state = Math.random().toString(36).substring(7);
  console.log("state",state);
  // Store state in sessionStorage for validation when LinkedIn redirects back
  localStorage.setItem('linkedin_oauth_state', state);
console.log('linkedin_oauth_state', state);
  // Construct the LinkedIn OAuth URL
  const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  linkedInAuthUrl.searchParams.append('response_type', 'code');
  linkedInAuthUrl.searchParams.append('client_id', clientId);
  linkedInAuthUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  linkedInAuthUrl.searchParams.append('state', state);
  linkedInAuthUrl.searchParams.append('scope', LINKEDIN_SCOPE);
console.log("linkedInAuthUrl",linkedInAuthUrl);
  // Redirect to LinkedIn's authorization page
  console.log("linkedInAuthUrl.toString()",linkedInAuthUrl.toString())
  
   window.location.href = linkedInAuthUrl.toString();
};

// Function to handle the OAuth callback
export const handleLinkedInCallback = async (code: string, state: string) => {
  // Verify state matches what we stored before the redirect

  const storedState = localStorage.getItem('linkedin_oauth_state');
  console.log("state in comparison", state);
  console.log("storedState",storedState);
  console.log(state !== storedState);
  if (state !== storedState) {
    throw new Error('Invalid OAuth state');
  }

  // Clear stored state
  localStorage.removeItem('linkedin_oauth_state');

  // Here you would typically:
  // 1. Send the code to your backend
  // 2. Backend exchanges code for access token with LinkedIn
  // 3. Backend retrieves user profile from LinkedIn
  // 4. Backend creates/updates user account
  // 5. Backend returns session token or user data
  const response= await auth.linkedInAuth(code);
  console.log("response",response);
  localStorage.setItem("auth_token", response.token);

 
  // For now, we'll just log the code (in production, never log sensitive data)
  console.log('Successfully received authorization code');
  
  // Redirect to appropriate page after successful sign-in
 // return redirect('/dashboard');
};
// Function to handle the OAuth callback
export const handleLinkedInSignInCallback = async (code: string, state: string) => {
  // Verify state matches what we stored before the redirect
  const storedState = localStorage.getItem('linkedin_state');
  console.log("state in comparison", state);
  console.log("storedState",storedState);
  console.log(state !== storedState);
  if (state !== storedState) {
    throw new Error('Invalid OAuth state');
  }
        try {
          // Send auth code to your backend for exchange
            const response= await auth.linkedinSignIn(code);
            console.log("response",response);
            localStorage.setItem("auth_token", response.token); 
            localStorage.setItem("userId",response.user._id);
          
        } catch (error) {
          console.error("LinkedIn Sign-in Error", error);
        }
      


  // Clear stored state
  localStorage.removeItem('linkedin_state');
  // For now, we'll just log the code (in production, never log sensitive data)
 // console.log('Successfully received authorization code');
  
  // Redirect to appropriate page after successful sign-in
  //return redirect('/dashboard');
};
export const handleLinkedInSignIn =async () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/linkedin/signin/callback`;
    const scope = 'openid profile email';
    const state = Math.random().toString(36).substring(7);
    
    localStorage.setItem('linkedin_state', state);
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
    
    window.location.href = authUrl;
  };