import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  const params = {
    Source: import.meta.env.VITE_AWS_SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: "Your Verification Code",
      },
      Body: {
        Text: {
          Data: `Your verification code is: ${code}`,
        },
        Html: {
          Data: `
            <html>
              <body>
                <h2>Email Verification</h2>
                <p>Your verification code is: <strong>${code}</strong></p>
                <p>Please enter this code to complete your registration.</p>
              </body>
            </html>
          `,
        },
      },
    },
  };

  try {
    await ses.send(new SendEmailCommand(params));
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};