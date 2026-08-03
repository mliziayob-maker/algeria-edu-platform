// js/main-app.js - التطبيق الرئيسي (تم إعادة تسميته)

import AuthSystem from './auth-system.js';
import DatabaseManager from './database-manager.js';
import ChatEngine from './chat-engine.js';
import LessonsManager from './lessons-manager.js';

class MainApp {
    constructor(authSystem) {
        this.auth = authSystem;
        this.db = new DatabaseManager(authSystem);
        this.chatEngine = new ChatEngine(this.db);
        this.lessonsManager = new LessonsManager(this.db);
        this.currentUser = null;
        this.currentGrade = 'sec3';
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        // تهيئة نظام المصادقة
        await this.auth.init();
        
        // إضافة مستمع للتغييرات
        this.auth.addListener((user, userData) => {
            this.currentUser = user;
            if (user && userData) {
                this.updateUI(userData);
                this.loadUserContent();
            }
        });

        // تحميل المواد الافتراضية
        await this.loadSubjects(this.currentGrade);
        
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('🎓 أكاديمية أمين - جاهزة للاستخدام');
    }

    // تغيير المستوى الدراسي
    async selectGrade(grade) {
        this.currentGrade = grade;
        await this.loadSubjects(grade);
        
        // تحديث الأزرار
        document.querySelectorAll('.grade-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.grade === grade);
        });
    }

    // تحميل المواد
    async loadSubjects(grade) {
        const container = document.getElementById('subjectsGrid');
        if (!container) return;

        try {
            const subjects = await this.lessonsManager.getSubjects(grade);
            
            container.innerHTML = subjects.map(sub => `
                <div class="subject-card" onclick="window.app.openSubject('${sub.id}')">
                    <div class="subject-icon">${sub.icon}</div>
                    <h3>${sub.name}</h3>
                    <p>${sub.description || ''}</p>
                    <div class="subject-meta">
                        <span>📚 ${sub.lessonsCount} دروس</span>
                        <span class="subject-progress">${sub.progress || 0}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${sub.progress || 0}%"></div>
                    </div>
                    <button class="btn-start">بدء التعلم 🚀</button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading subjects:', error);
            container.innerHTML = '<p class="error-msg">⚠️ حدث خطأ في تحميل المواد</p>';
        }
    }

    // فتح مادة
    async openSubject(subjectId) {
        const user = this.auth.currentUser;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        try {
            // تسجيل النشاط
            await this.db.logActivity(user.uid, {
                type: 'subject_open',
                subjectId,
                grade: this.currentGrade
            });

            // عرض الدروس
            const lessons = await this.lessonsManager.getLessonsForSubject(
                this.currentGrade, 
                subjectId
            );
            
            this.showLessonsModal(lessons, subjectId);
        } catch (error) {
            console.error('Error opening subject:', error);
        }
    }

    // عرض مودال الدروس
    showLessonsModal(lessons, subjectId) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>📘 الدروس المتاحة</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="lessons-list">
                    ${lessons.map(lesson => `
                        <div class="lesson-item">
                            <div class="lesson-info">
                                <h4>${lesson.title}</h4>
                                <p>${lesson.description || ''}</p>
                            </div>
                            <button class="btn-start-lesson" onclick="window.app.startLesson('${lesson.id}')">
                                بدء الحصة 🎯
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // بدء حصة تعليمية
    async startLesson(lessonId) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            // تحميل الدرس
            const lesson = await this.db.getLesson(lessonId);
            if (!lesson) {
                alert('⚠️ الدرس غير موجود');
                return;
            }

            // تسجيل بدء الحصة
            await this.db.logActivity(user.uid, {
                type: 'lesson_start',
                lessonId,
                lessonTitle: lesson.title
            });

            // فتح شاشة المحادثة
            this.chatEngine.startLesson(user.uid, lesson);
            
        } catch (error) {
            console.error('Error starting lesson:', error);
        }
    }

    // تحديث واجهة المستخدم
    updateUI(userData) {
        // تحديث اسم المستخدم
        const nameElements = document.querySelectorAll('.user-name');
        nameElements.forEach(el => el.textContent = userData.username || 'مستخدم');

        // تحديث المستوى
        const gradeElements = document.querySelectorAll('.user-grade');
        gradeElements.forEach(el => {
            el.textContent = `المستوى: ${userData.grade || '3 ثانوي'}`;
        });

        // تحديث الإحصائيات
        const progress = userData.progress || {};
        document.getElementById('completedLessons')?.textContent = progress.completedLessons || 0;
        document.getElementById('averageScore')?.textContent = `${progress.averageScore || 0}%`;
    }

    // تحميل محتوى المستخدم
    async loadUserContent() {
        if (!this.currentUser) return;
        
        try {
            const progress = await this.db.getUserData(this.currentUser.uid);
            if (progress) {
                this.updateUI(progress);
            }
        } catch (error) {
            console.error('Error loading user content:', error);
        }
    }

    // إعداد مستمعات الأحداث
    setupEventListeners() {
        // البحث
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // إغلاق المودال بالنقر خارج المحتوى
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.remove();
            }
        });
    }

    // معالج البحث
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.subject-card');
        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
            const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
            const match = title.includes(query) || desc.includes(query);
            card.style.display = match ? 'block' : 'none';
        });
    }

    // تسجيل الخروج
    async logout() {
        await this.auth.logout();
        window.location.href = 'index.html';
    }

    // تدمير التطبيق
    destroy() {
        this.isInitialized = false;
        this.chatEngine.destroy();
        this.db.clearCache();
        console.log('👋 تطبيق أكاديمية أمين - تم إنهاء الجلسة');
    }
}

export default MainApp;
