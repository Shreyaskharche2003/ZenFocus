// Welcome email template for new ZenFocus users
// This template can be used with Firebase Extensions (Trigger Email)
// or any email service (SendGrid, Resend, etc.)

export const getWelcomeEmailTemplate = (displayName: string) => {
    const firstName = displayName.split(' ')[0] || 'Focus Seeker';

    return {
        subject: `Welcome to ZenFocus, ${firstName}! 🧘‍♀️✨`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ZenFocus</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f3ef;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
            <td style="background: linear-gradient(135deg, #4a5740 0%, #7a8b68 100%); padding: 48px 40px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                <h1 style="color: white; font-size: 28px; margin: 0 0 8px 0; letter-spacing: -0.5px;">Welcome to ZenFocus</h1>
                <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">AI-Powered Focus Tracking for Mindful Productivity</p>
            </td>
        </tr>

        <!-- Welcome Message -->
        <tr>
            <td style="padding: 40px;">
                <h2 style="color: #4a5740; font-size: 22px; margin: 0 0 16px 0;">Hey ${firstName}! 👋</h2>
                <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
                    We're thrilled to have you join ZenFocus! You've just taken the first step toward 
                    understanding and improving your focus habits. Here's what makes ZenFocus special:
                </p>

                <!-- Features -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                    <!-- Feature 1 -->
                    <tr>
                        <td style="padding: 16px; background: #f8f7f4; border-radius: 12px; margin-bottom: 12px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 44px; padding-right: 16px; vertical-align: top;">
                                        <div style="width: 40px; height: 40px; background: rgba(122,139,104,0.15); border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">🧠</div>
                                    </td>
                                    <td>
                                        <strong style="color: #4a5740; font-size: 15px;">AI-Powered Focus Tracking</strong>
                                        <p style="color: #777; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5;">
                                            Our computer vision engine analyzes your focus in real-time — detecting when you're focused, distracted, or away. All processing happens <strong>locally on your device</strong>.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 12px;"></td></tr>

                    <!-- Feature 2 -->
                    <tr>
                        <td style="padding: 16px; background: #f8f7f4; border-radius: 12px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 44px; padding-right: 16px; vertical-align: top;">
                                        <div style="width: 40px; height: 40px; background: rgba(184,212,227,0.3); border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">📊</div>
                                    </td>
                                    <td>
                                        <strong style="color: #4a5740; font-size: 15px;">Smart Analytics & Insights</strong>
                                        <p style="color: #777; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5;">
                                            Discover your peak focus hours, track daily streaks, and view detailed productivity scores. Watch your focus habits improve over time with beautiful charts.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 12px;"></td></tr>

                    <!-- Feature 3 -->
                    <tr>
                        <td style="padding: 16px; background: #f8f7f4; border-radius: 12px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 44px; padding-right: 16px; vertical-align: top;">
                                        <div style="width: 40px; height: 40px; background: rgba(167,139,218,0.2); border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">👥</div>
                                    </td>
                                    <td>
                                        <strong style="color: #4a5740; font-size: 15px;">Group Study Rooms</strong>
                                        <p style="color: #777; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5;">
                                            Study with friends in real-time! Create or join rooms with a 6-digit code. Enjoy live chat, screen sharing, session goals, and see everyone's focus status as you study together.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr><td style="height: 12px;"></td></tr>

                    <!-- Feature 4 -->
                    <tr>
                        <td style="padding: 16px; background: #f8f7f4; border-radius: 12px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 44px; padding-right: 16px; vertical-align: top;">
                                        <div style="width: 40px; height: 40px; background: rgba(201,160,138,0.2); border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">🔒</div>
                                    </td>
                                    <td>
                                        <strong style="color: #4a5740; font-size: 15px;">100% Privacy First</strong>
                                        <p style="color: #777; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5;">
                                            Your camera feed is never uploaded or stored. All AI processing happens directly in your browser. We believe privacy is a feature, not an afterthought.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Quick Start -->
                <div style="background: linear-gradient(135deg, #4a5740 0%, #7a8b68 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                    <h3 style="color: white; font-size: 18px; margin: 0 0 8px 0;">🚀 Quick Start Guide</h3>
                    <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">
                        1. Go to <strong>Focus</strong> tab → Choose <strong>AI Session</strong><br>
                        2. Allow camera access → Start focusing!<br>
                        3. Check <strong>Analytics</strong> to see your results<br>
                        4. Invite friends to <strong>Group Study</strong> rooms
                    </p>
                </div>

                <!-- CTA -->
                <div style="text-align: center; margin-bottom: 24px;">
                    <p style="color: #777; font-size: 14px; margin: 0;">
                        Ready to unlock your potential? Your first focus session is just a click away.
                    </p>
                </div>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="background: #f8f7f4; padding: 24px 40px; text-align: center; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0 0 8px 0;">
                    ✨ ZenFocus — AI-Powered Focus Tracking
                </p>
                <p style="color: #bbb; font-size: 11px; margin: 0;">
                    Built with mindfulness in mind. Your privacy is our priority.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`,
        text: `
Welcome to ZenFocus, ${firstName}! 🧘‍♀️✨

We're thrilled to have you join ZenFocus! You've just taken the first step toward understanding and improving your focus habits.

Here's what makes ZenFocus special:

🧠 AI-Powered Focus Tracking
Our computer vision engine analyzes your focus in real-time — detecting when you're focused, distracted, or away. All processing happens locally on your device.

📊 Smart Analytics & Insights  
Discover your peak focus hours, track daily streaks, and view detailed productivity scores.

👥 Group Study Rooms
Study with friends in real-time! Create or join rooms with a 6-digit code. Enjoy live chat, screen sharing, session goals, and see everyone's focus status.

🔒 100% Privacy First
Your camera feed is never uploaded or stored. All AI processing happens directly in your browser.

🚀 Quick Start:
1. Go to Focus tab → Choose AI Session
2. Allow camera access → Start focusing!
3. Check Analytics to see your results
4. Invite friends to Group Study rooms

Ready to unlock your potential? Your first focus session is just a click away.

— The ZenFocus Team
`,
    };
};

// Save welcome email to Firestore mail collection 
// (for use with Firebase Trigger Email extension)
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

export const sendWelcomeEmail = async (email: string, displayName: string) => {
    try {
        const template = getWelcomeEmailTemplate(displayName);

        // Option 1: Using Firebase Trigger Email Extension
        // This creates a document in the 'mail' collection which the extension picks up
        const mailRef = doc(collection(db, 'mail'));
        await setDoc(mailRef, {
            to: email,
            message: {
                subject: template.subject,
                html: template.html,
                text: template.text,
            },
            createdAt: Date.now(),
        });

        console.log('✅ Welcome email queued for:', email);
    } catch (error) {
        // Don't block sign-up if email fails
        console.error('Welcome email failed (non-blocking):', error);
    }
};
