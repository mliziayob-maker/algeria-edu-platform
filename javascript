// js/auth.js - نظام المصادقة المتكامل

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
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSy...", // سيتم استبداله بمفتاح حقيقي
    authDomain: "academie-amine.firebaseapp.com",
    projectId: "academie-amine",
    storageBucket: "academie-amine.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===== نظام المصادقة =====

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.auth = auth;
        this.db = db;
        this.init();
    }

    init() {
        // مراقبة حالة المستخدم
        onAuthStateChanged(this.auth, async (user) => {
            if (user) {
                this.currentUser = user;
                await this.loadUserData(user.uid);
                this.redirectToDashboard();
            } else {
                this.currentUser = null;
                this.redirectToLogin();
            }
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

    // إنشاء حساب جديد
    async register(email, password, username) {
        try {
            const result = await createUserWithEmailAndPassword(this.auth, email, password);
            // تحديث الملف الشخصي
            await updateProfile(result.user, { displayName: username });
            
            // حفظ بيانات المستخدم في Firestore
            await setDoc(doc(this.db, "users", result.user.uid), {
                username: username,
                email: email,
                createdAt: new Date().toISOString(),
                role: 'student',
                progress: {
                    totalLessons: 0,
                    completedLessons: 0,
                    averageScore: 0
                },
                preferences: {
                    theme: 'dark',
                    notifications: true,
                    language: 'ar'
                }
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
            return { success: true, message: "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني" };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // تسجيل الخروج
    async logout() {
        try {
            await this.auth.signOut();
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

    // رسائل الخطأ المخصصة
    getErrorMessage(code) {
        const errors = {
            'auth/user-not-found': '⚠️ لم يتم العثور على هذا البريد الإلكتروني',
            'auth/wrong-password': '❌ كلمة المرور غير صحيحة',
            'auth/email-already-in-use': '📧 هذا البريد الإلكتروني مستخدم بالفعل',
            'auth/invalid-email': '⚠️ البريد الإلكتروني غير صالح',
            'auth/weak-password': '🔒 كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)',
            'auth/too-many-requests': '⏳ تم إرسال طلبات كثيرة جداً، حاول لاحقاً',
            'auth/network-request-failed': '🌐 مشكلة في الشبكة، تحقق من اتصالك بالإنترنت',
            'auth/popup-closed-by-user': '🔄 تم إلغاء العملية، حاول مرة أخرى'
        };
        return errors[code] || '❌ حدث خطأ غير متوقع، حاول مرة أخرى';
    }

    redirectToDashboard() {
        if (!window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'dashboard.html';
        }
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('login.html') && 
            !window.location.pathname.includes('register.html')) {
            window.location.href = 'login.html';
        }
    }
}

// تصدير النظام للاستخدام
export default new AuthSystem();
