// Welcome email for new ZenFocus users
// Uses Firebase's built-in email verification as welcome notification
import { User, sendEmailVerification } from 'firebase/auth';

/**
 * Send a welcome/verification email to new users
 * Firebase handles the email delivery automatically
 */
export const sendWelcomeEmail = async (email: string, displayName: string, firebaseUser?: User) => {
    try {
        if (firebaseUser && !firebaseUser.emailVerified) {
            // Send Firebase's built-in verification email
            // This acts as both a welcome email and email verification
            await sendEmailVerification(firebaseUser, {
                url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
                handleCodeInApp: false,
            });
            console.log('✅ Welcome/verification email sent to:', email);
        } else {
            console.log('ℹ️ User already verified or no Firebase user provided, skipping welcome email');
        }
    } catch (error: any) {
        // Don't block sign-up if email fails
        console.error('⚠️ Welcome email failed (non-blocking):', error?.code, error?.message);
    }
};
