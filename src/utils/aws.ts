import axios from 'axios';

export const sendVerificationEmail = async (email: string, code: string) => {
  try {
    const response = await axios.post('/api/send-verification-email', {
      email,
      code
    });
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};