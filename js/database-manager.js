// js/database-manager.js - مدير قاعدة البيانات (تم إعادة تسميته)

import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit,
    addDoc,
    arrayUnion,
    arrayRemove
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class DatabaseManager {
    constructor(authSystem) {
        this.auth = authSystem;
        this.db = getFirestore(this.auth.app);
        this.cache = new Map();
    }

    // ===== إدارة المستخدمين =====
    
    async getUserData(uid) {
        const cacheKey = `user_${uid}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const docRef = doc(this.db, "users", uid);
        const docSnap = await getDoc(docRef);
        const data = docSnap.exists() ? docSnap.data() : null;
        this.cache.set(cacheKey, data);
        return data;
    }

    async updateUser(uid, data) {
        const userRef = doc(this.db, "users", uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        this.cache.delete(`user_${uid}`);
    }

    async updateProgress(uid, subject, progress) {
        const userRef = doc(this.db, "users", uid);
        await updateDoc(userRef, {
            [`progress.${subject}`]: progress,
            updatedAt: new Date().toISOString()
        });
        this.cache.delete(`user_${uid}`);
    }

    // ===== إدارة الدروس =====
    
    async getLessons(grade, subject = null) {
        const cacheKey = `lessons_${grade}_${subject || 'all'}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const lessonsRef = collection(this.db, "lessons");
        let constraints = [where("grade", "==", grade), orderBy("order")];
        if (subject) {
            constraints.push(where("subject", "==", subject));
        }
        
        const q = query(lessonsRef, ...constraints);
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.cache.set(cacheKey, data);
        return data;
    }

    async getLesson(lessonId) {
        const cacheKey = `lesson_${lessonId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const docRef = doc(this.db, "lessons", lessonId);
        const docSnap = await getDoc(docRef);
        const data = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
        this.cache.set(cacheKey, data);
        return data;
    }

    async createLesson(lessonData) {
        const lessonsRef = collection(this.db, "lessons");
        const docRef = await addDoc(lessonsRef, {
            ...lessonData,
            createdAt: new Date().toISOString(),
            views: 0,
            likes: 0
        });
        this.cache.clear();
        return docRef.id;
    }

    async incrementLessonViews(lessonId) {
        const lessonRef = doc(this.db, "lessons", lessonId);
        await updateDoc(lessonRef, {
            views: (await this.getLesson(lessonId))?.views + 1 || 1
        });
        this.cache.delete(`lesson_${lessonId}`);
    }

    // ===== إدارة الاختبارات =====
    
    async getQuizzes(grade, subject) {
        const cacheKey = `quizzes_${grade}_${subject}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const quizzesRef = collection(this.db, "quizzes");
        const q = query(quizzesRef,
            where("grade", "==", grade),
            where("subject", "==", subject)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.cache.set(cacheKey, data);
        return data;
    }

    async submitQuizResult(userId, quizId, score, answers, timeSpent) {
        const resultId = `${userId}_${quizId}`;
        const resultRef = doc(this.db, "quiz_results", resultId);
        
        await setDoc(resultRef, {
            userId,
            quizId,
            score,
            answers,
            timeSpent,
            submittedAt: new Date().toISOString()
        });
        
        // تحديث متوسط الدرجات
        const userData = await this.getUserData(userId);
        const totalQuizzes = (userData?.progress?.totalQuizzes || 0) + 1;
        const totalScore = (userData?.progress?.totalScore || 0) + score;
        const averageScore = Math.round(totalScore / totalQuizzes);
        
        await this.updateUser(userId, {
            'progress.totalQuizzes': totalQuizzes,
            'progress.totalScore': totalScore,
            'progress.averageScore': averageScore
        });
        
        return true;
    }

    // ===== إدارة المحادثات =====
    
    async saveChatHistory(userId, lessonId, messages) {
        const chatRef = doc(this.db, "chat_history", `${userId}_${lessonId}`);
        await setDoc(chatRef, {
            userId,
            lessonId,
            messages,
            lastUpdated: new Date().toISOString()
        });
    }

    async getChatHistory(userId, lessonId) {
        const docRef = doc(this.db, "chat_history", `${userId}_${lessonId}`);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data().messages : [];
    }

    // ===== إدارة الإنجازات =====
    
    async getAchievements(userId) {
        const achievementsRef = collection(this.db, "achievements");
        const q = query(achievementsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async unlockAchievement(userId, achievementId) {
        const achievementRef = doc(this.db, "achievements", `${userId}_${achievementId}`);
        await setDoc(achievementRef, {
            userId,
            achievementId,
            unlockedAt: new Date().toISOString()
        });
    }

    // ===== تحليلات التعلم =====
    
    async logActivity(userId, activity) {
        const analyticsRef = collection(this.db, "analytics");
        await addDoc(analyticsRef, {
            userId,
            ...activity,
            timestamp: new Date().toISOString()
        });
    }

    async getUserAnalytics(userId, days = 30) {
        const analyticsRef = collection(this.db, "analytics");
        const q = query(analyticsRef,
            where("userId", "==", userId),
            orderBy("timestamp", "desc"),
            limit(days)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    }

    // ===== تنظيف الكاش =====
    
    clearCache() {
        this.cache.clear();
    }

    // ===== أدوات مساعدة =====
    
    async getSubjects(grade) {
        const lessons = await this.getLessons(grade);
        const subjects = {};
        lessons.forEach(lesson => {
            if (!subjects[lesson.subject]) {
                subjects[lesson.subject] = {
                    name: lesson.subjectName,
                    icon: lesson.subjectIcon,
                    count: 0
                };
            }
            subjects[lesson.subject].count++;
        });
        return subjects;
    }
}

export default DatabaseManager;
