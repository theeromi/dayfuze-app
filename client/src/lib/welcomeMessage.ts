import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
  firstLoginTime: any;
  displayName: string;
  email: string;
  createdAt: any;
}

export interface WelcomeMessage {
  greeting: string;
  message: string;
  timeBasedGreeting: string;
  joinMessage: string;
}

export class WelcomeMessageGenerator {
  static getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return '🌅 Good morning';
    } else if (hour >= 12 && hour < 17) {
      return '☀️ Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      return '🌇 Good evening';
    } else {
      return '🌙 Good night';
    }
  }

  static getJoinTimeMessage(firstLoginTime: Date): string {
    const now = new Date();
    const joinDate = firstLoginTime;
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    const joinTimeOfDay = joinDate.getHours();
    let joinTimeGreeting = '';
    
    if (joinTimeOfDay >= 5 && joinTimeOfDay < 12) {
      joinTimeGreeting = 'morning';
    } else if (joinTimeOfDay >= 12 && joinTimeOfDay < 17) {
      joinTimeGreeting = 'afternoon';  
    } else if (joinTimeOfDay >= 17 && joinTimeOfDay < 22) {
      joinTimeGreeting = 'evening';
    } else {
      joinTimeGreeting = 'late night';
    }

    if (diffDays === 0) {
      return `Welcome to DayFuse! 🎉 You joined us today in the ${joinTimeGreeting}. Let's make your first day productive!`;
    } else if (diffDays === 1) {
      return `Welcome back! 👋 You joined DayFuse yesterday ${joinTimeGreeting}. Ready for day 2?`;
    } else if (diffDays < 7) {
      return `Great to see you! 🌟 You've been with DayFuse for ${diffDays} days now since joining that ${joinTimeGreeting}.`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Welcome back, productivity champion! 💪 You've been crushing it for ${weeks} week${weeks > 1 ? 's' : ''} since joining.`;
    } else if (diffMonths < 12) {
      return `Look who's back! 🔥 You've been part of the DayFuse family for ${diffMonths} month${diffMonths > 1 ? 's' : ''} now!`;
    } else {
      return `Wow, ${diffYears} year${diffYears > 1 ? 's' : ''} with DayFuse! 🏆 You're a true productivity veteran!`;
    }
  }

  static getMotivationalMessage(daysSinceJoined: number): string {
    const motivationalMessages = [
      "Ready to tackle today's goals? 🎯",
      "Let's make today count! ✨", 
      "Time to turn plans into progress! 🚀",
      "What will you accomplish today? 💫",
      "Your future self will thank you! 🌟",
      "Small steps, big results! 🎊",
      "Today's a fresh start! 🌱",
      "Let's build momentum! ⚡",
      "Focus on what matters most! 🎪",
      "Make it happen! 💪"
    ];

    if (daysSinceJoined < 7) {
      return "You're building great habits! Keep up the momentum! 🌟";
    } else if (daysSinceJoined < 30) {
      return "You're becoming a productivity pro! Let's keep growing! 🚀";
    } else {
      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      return motivationalMessages[randomIndex];
    }
  }

  static async generateWelcomeMessage(userId: string, displayName?: string): Promise<WelcomeMessage> {
    try {
      // Get user profile from Firestore
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      const timeBasedGreeting = this.getTimeBasedGreeting();
      const userName = displayName || 'there';
      
      if (!userDoc.exists()) {
        // New user or no profile data
        return {
          greeting: `${timeBasedGreeting}, ${userName}!`,
          message: "Welcome to DayFuse! 🎉 Let's start organizing your day and boosting your productivity!",
          timeBasedGreeting,
          joinMessage: "You're just getting started - let's make today amazing! ✨"
        };
      }

      const userData = userDoc.data() as UserProfile;
      const firstLoginDate = userData.firstLoginTime?.toDate() || new Date();
      
      const joinMessage = this.getJoinTimeMessage(firstLoginDate);
      const daysSinceJoined = Math.floor((new Date().getTime() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24));
      const motivationalMessage = this.getMotivationalMessage(daysSinceJoined);

      return {
        greeting: `${timeBasedGreeting}, ${userName}!`,
        message: motivationalMessage,
        timeBasedGreeting,
        joinMessage
      };

    } catch (error) {
      console.error('Error generating welcome message:', error);
      
      // Fallback message
      return {
        greeting: `${this.getTimeBasedGreeting()}, ${displayName || 'there'}!`,
        message: "Ready to make today productive? Let's get started! 🚀",
        timeBasedGreeting: this.getTimeBasedGreeting(),
        joinMessage: "Welcome to DayFuse! Let's organize your day! 📅"
      };
    }
  }
}

export const welcomeMessageGenerator = new WelcomeMessageGenerator();