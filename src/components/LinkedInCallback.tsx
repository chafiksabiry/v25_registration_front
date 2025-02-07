import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { handleLinkedInCallback } from '../utils/Linkedin';

const LinkedInCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
console.log(code,state);
    if (code && state) {
      handleLinkedInCallback(code, state)
        .then(() => navigate('/dashboard')) // Redirect to dashboard on success
        .catch((err) => {
          console.error('LinkedIn authentication failed:', err);
          navigate('/login?error=linkedin_auth_failed'); // Redirect to login on error
        });
    }
  }, [searchParams, navigate]);

  return <div>Authenticating with LinkedIn...</div>;
};

export default LinkedInCallback;
