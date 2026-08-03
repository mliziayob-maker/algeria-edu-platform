// js/auth-system.js - نظام المصادقة المتكامل (تم إعادة تسميته)

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { FIREBASE_CONFIG } from '../config/firebase-config.js';

class AuthSystem {
    constructor() {
        this.app = initializeApp(FIREBASE_CONFIG);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        this.currentUser = null;
        this.userData = null;
        this.authListeners = [];
    }

    // تهيئة النظام
    init() {
        return new Promise((resolve) => {
            onAuthStateChanged(this.auth, async (user) => {
                if (user) {
                    this.currentUser = user;
                    await this.loadUserData(user.uid);
                } else {
                    this.currentUser = null;
                    this.userData = null;
                }
                this.notifyListeners();
                resolve(this.currentUser);
            });
        });
    }

    // تسجيل الدخول
    async login(email, password) {
        try {
            const result = await signInWithEmailAndPassword(this.auth, email, password);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // إنشاء حساب
    async register(email, password, username, grade = 'sec3') {
        try {
            const result = await createUserWithEmailAndPassword(this.auth, email, password);
            await updateProfile(result.user, { displayName: username });
            
            await setDoc(doc(this.db, "users", result.user.uid), {
                username,
                email,
                grade,
                createdAt: new Date().toISOString(),
                role: 'student',
                progress: { totalLessons: 0, completedLessons: 0, averageScore: 0 },
                preferences: { theme: 'dark', notifications: true, language: 'ar' }
            });
            
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // تسجيل الدخول بواسطة Google
    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // تسجيل الدخول بواسطة Facebook
    async loginWithFacebook() {
        const provider = new FacebookAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // إعادة تعيين كلمة المرور
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
            return { success: true, message: "تم إرسال رابط إعادة التعيين" };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // تسجيل الخروج
    async logout() {
        try {
            await signOut(this.auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // تحميل بيانات المستخدم
    async loadUserData(uid) {
        try {
            const docRef = doc(this.db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                this.userData = docSnap.data();
                return this.userData;
            }
            return null;
        } catch (error) {
            console.error("Error loading user data:", error);
            return null;
        }
    }

    // إضافة مستمع للتغييرات
    addListener(callback) {
        this.authListeners.push(callback);
        if (this.currentUser) callback(this.currentUser, this.userData);
    }

    notifyListeners() {
        this.authListeners.forEach(cb => cb(this.currentUser, this.userData));
    }

    // رسائل الخطأ
    getErrorMessage(code) {
        const errors = {
            'auth/user-not-found': '⚠️ لم يتم العثور على هذا البريد الإلكتروني',
            'auth/wrong-password': '❌ كلمة المرور غير صحيحة',
            'auth/email-already-in-use': '📧 هذا البريد الإلكتروني مستخدم بالفعل',
            'auth/invalid-email': '⚠️ البريد الإلكتروني غير صالح',
            'auth/weak-password': '🔒 كلمة المرور ضعيفة (6 أحرف على الأقل)',
            'auth/too-many-requests': '⏳ تم إرسال طلبات كثيرة، حاول لاحقاً',
            'auth/network-request-failed': '🌐 مشكلة في الشبكة، تحقق من اتصالك'
        };
        return errors[code] || '❌ حدث خطأ غير متوقع';
    }

    // التحقق من حالة المصادقة
    isAuthenticated() {
        return !!this.currentUser;
    }

    // الحصول على معرف المستخدم
    getUserId() {
        return this.currentUser?.uid || null;
    }

    // الحصول على بيانات المستخدم
    getUserData() {
        return this.userData;
    }
}

export default AuthSystem;
