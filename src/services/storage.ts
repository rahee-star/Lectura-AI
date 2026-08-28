import { LectureNote, UserFeedback, UserProfile, StreakData, WeeklyGoalProgress } from '../types';
import { SAMPLE_LECTURES } from '../data/sampleLectures';

const STORAGE_KEY = 'lectura_saved_lectures_v1';
const FEEDBACK_STORAGE_KEY = 'lectura_user_feedback_v1';
const USER_PROFILE_KEY = 'lectura_user_profile_v1';
const STREAK_STORAGE_KEY = 'lectura_user_streak_v1';

export function getUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    return parsed?.isAuthenticated ? parsed : null;
  } catch (err) {
    console.error('Error loading user profile:', err);
    return null;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export function logoutUserProfile(): void {
  try {
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (err) {
    console.error('Error logging out user:', err);
  }
}

export function getStreakData(): StreakData {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!data) {
      // Initialize with default 5-day active streak history leading up to today
      const defaultDailyLogs: Record<string, number> = {};
      const pastDates = [4, 3, 2, 1, 0].map((daysAgo, idx) => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const dateStr = d.toISOString().split('T')[0];
        // realistic study minutes for past active days (45m, 60m, 50m, 75m, 40m)
        const mins = [45, 60, 50, 75, 40][idx] || 45;
        defaultDailyLogs[dateStr] = mins;
        return dateStr;
      });

      const initialStreak: StreakData = {
        count: 5,
        activeDates: pastDates,
        lastActiveDate: today,
        weeklyGoalMinutes: 300, // 5 hours default
        targetDaysPerWeek: 5,
        dailyLogs: defaultDailyLogs,
      };
      localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(initialStreak));
      return initialStreak;
    }

    const parsed: StreakData = JSON.parse(data);
    // Ensure all fields exist
    if (!parsed.weeklyGoalMinutes) parsed.weeklyGoalMinutes = 300;
    if (!parsed.targetDaysPerWeek) parsed.targetDaysPerWeek = 5;
    if (!parsed.dailyLogs) parsed.dailyLogs = {};
    if (!parsed.count) parsed.count = parsed.activeDates?.length || 1;

    return parsed;
  } catch (err) {
    console.error('Error loading streak data:', err);
    return {
      count: 5,
      activeDates: [],
      lastActiveDate: '',
      weeklyGoalMinutes: 300,
      targetDaysPerWeek: 5,
      dailyLogs: {},
    };
  }
}

export function saveStreakData(streak: StreakData): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
  } catch (err) {
    console.error('Error saving streak data:', err);
  }
}

export function updateWeeklyGoal(targetMinutes: number, targetDays: number = 5): StreakData {
  try {
    const current = getStreakData();
    const updated: StreakData = {
      ...current,
      weeklyGoalMinutes: Math.max(30, targetMinutes),
      targetDaysPerWeek: Math.min(7, Math.max(1, targetDays)),
    };
    saveStreakData(updated);
    return updated;
  } catch (err) {
    console.error('Error updating weekly goal:', err);
    return getStreakData();
  }
}

export function logStudyMinutes(minutes: number, activityName?: string): StreakData {
  try {
    if (minutes <= 0) return getStreakData();
    const current = getStreakData();
    const today = new Date().toISOString().split('T')[0];

    const currentTodayMinutes = current.dailyLogs[today] || 0;
    const newTodayMinutes = currentTodayMinutes + Math.round(minutes);

    const updatedDailyLogs = {
      ...current.dailyLogs,
      [today]: newTodayMinutes,
    };

    const updatedDates = current.activeDates.includes(today)
      ? current.activeDates
      : [...current.activeDates, today];

    const updated: StreakData = {
      ...current,
      count: updatedDates.length,
      activeDates: updatedDates,
      lastActiveDate: today,
      dailyLogs: updatedDailyLogs,
    };

    saveStreakData(updated);
    return updated;
  } catch (err) {
    console.error('Error logging study minutes:', err);
    return getStreakData();
  }
}

export function recordActiveDay(initialMinutes: number = 0): StreakData {
  try {
    const current = getStreakData();
    const today = new Date().toISOString().split('T')[0];

    let hasChanged = false;
    let updatedDates = current.activeDates;
    let updatedCount = current.count;
    let updatedLogs = { ...current.dailyLogs };

    if (!current.activeDates.includes(today)) {
      updatedDates = [...current.activeDates, today];
      updatedCount = updatedDates.length;
      hasChanged = true;
    }

    if (initialMinutes > 0 || !updatedLogs[today]) {
      updatedLogs[today] = (updatedLogs[today] || 0) + initialMinutes;
      hasChanged = true;
    }

    if (hasChanged) {
      const updated: StreakData = {
        ...current,
        count: updatedCount,
        activeDates: updatedDates,
        lastActiveDate: today,
        dailyLogs: updatedLogs,
      };
      saveStreakData(updated);
      return updated;
    }
    return current;
  } catch (err) {
    console.error('Error updating streak:', err);
    return getStreakData();
  }
}

export function calculateWeeklyProgress(streak: StreakData): WeeklyGoalProgress {
  const targetMinutes = streak.weeklyGoalMinutes || 300;
  const targetDays = streak.targetDaysPerWeek || 5;

  // Determine current week dates (Monday through Sunday)
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayStr = now.toISOString().split('T')[0];

  let studiedMinutesThisWeek = 0;
  let activeDaysThisWeek = 0;

  const dailyBreakdown = dayNames.map((name, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    const dateStr = d.toISOString().split('T')[0];
    const minutes = streak.dailyLogs?.[dateStr] || 0;
    const isToday = dateStr === todayStr;
    const isActive = streak.activeDates?.includes(dateStr) || minutes > 0;

    studiedMinutesThisWeek += minutes;
    if (minutes > 0 || isActive) {
      activeDaysThisWeek += 1;
    }

    return {
      date: dateStr,
      dayName: name,
      shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
      minutes,
      isToday,
      isActive,
    };
  });

  const percentComplete = targetMinutes > 0 ? Math.min(100, Math.round((studiedMinutesThisWeek / targetMinutes) * 100)) : 0;
  const remainingMinutes = Math.max(0, targetMinutes - studiedMinutesThisWeek);
  const isGoalMet = studiedMinutesThisWeek >= targetMinutes;

  return {
    targetMinutes,
    studiedMinutesThisWeek,
    targetDaysPerWeek: targetDays,
    activeDaysThisWeek,
    percentComplete,
    isGoalMet,
    remainingMinutes,
    dailyBreakdown,
  };
}

export function getSavedLectures(): LectureNote[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (err) {
    console.error('Error loading lectures from storage:', err);
    return [];
  }
}

export function saveLecture(lecture: LectureNote): void {
  try {
    const current = getSavedLectures();
    const index = current.findIndex((l) => l.id === lecture.id);
    let updated: LectureNote[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = lecture;
    } else {
      updated = [lecture, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving lecture to storage:', err);
  }
}

export function deleteLecture(lectureId: string): LectureNote[] {
  try {
    const current = getSavedLectures();
    const filtered = current.filter((l) => l.id !== lectureId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Error deleting lecture:', err);
    return [];
  }
}

export function resetToSamples(): LectureNote[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_LECTURES));
  return SAMPLE_LECTURES;
}

export function getFeedbackList(): UserFeedback[] {
  try {
    const data = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading feedback:', err);
    return [];
  }
}

export function saveFeedback(feedback: UserFeedback): UserFeedback[] {
  try {
    const current = getFeedbackList();
    const updated = [feedback, ...current];
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving feedback:', err);
    return [];
  }
}

export function deleteFeedback(id: string): UserFeedback[] {
  try {
    const current = getFeedbackList();
    const filtered = current.filter((f) => f.id !== id);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Error deleting feedback:', err);
    return [];
  }
}
