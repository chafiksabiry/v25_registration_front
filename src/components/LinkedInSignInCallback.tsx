import { useEffect } from "react";
import { useSearchParams,useNavigate } from "react-router-dom";
import axios from "axios";
import {handleLinkedInSignInCallback} from '../utils/Linkedin';

/* const LinkedInSignInCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const handleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = searchParams.get('state');

      if (code && state) {
        
        handleLinkedInSignInCallback(code,state)
       .then(() => navigate('/dashboard'))
       .catch((err) => {
        console.error('LinkedIn signing in failed:', err);
        navigate('/login?error=linkedin_auth_failed'); // Redirect to login on error
      });
       
      }
    };

    handleAuth();
  }, [navigate]);

  return <p>Signing in with LinkedIn...</p>;
}; */
const LinkedInSignInCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
  
    useEffect(() => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
  
      if (code && state) {
        (async () => {
          try {
            await handleLinkedInSignInCallback(code, state);
            navigate("/dashboard");
          } catch (err) {
            console.error("LinkedIn sign-in failed:", err);
            navigate("/login?error=linkedin_auth_failed");
          }
        })();
      }
    }, [navigate, searchParams]); // Ajout de `searchParams` comme dépendance
  
    return <p>Signing in with LinkedIn...</p>;
  };

export default LinkedInSignInCallback;
