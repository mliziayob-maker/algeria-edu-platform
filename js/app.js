// js/app.js - التطبيق الرئيسي

import AuthSystem from './auth.js';
import Database from './database.js';

class App {
    constructor() {
        this.auth = AuthSystem;
        this.db = new Database();
        this.currentUser = null;
        this.currentGrade = 'sec3';
        this.initialize();
    }

    async initialize() {
        // انتظار تحميل بيانات المستخدم
        this.currentUser = this.auth.currentUser;
        
        if (this.currentUser) {
            await this.loadUserData();
            this.setupEventListeners();
            this.loadSubjects();
            this.loadProgress();
            this.loadActivity();
        }
    }

    async loadUserData() {
        const userData = await this.db.getUserData(this.currentUser.uid);
        if (userData) {
            this.userData = userData;
            this.updateUI(userData);
        }
    }

    updateUI(userData) {
        document.getElementById('userName').textContent = userData.username || 'مستخدم';
        document.getElementById('userGrade').textContent = `المستوى: ${userData.grade || '3 ثانوي'}`;
        document.getElementById('completedLessons').textContent = userData.progress?.completedLessons || 0;
        document.getElementById('averageScore').textContent = `${userData.progress?.averageScore || 0}%`;
        document.getElementById('achievements').textContent = userData.achievements?.length || 0;
    }

    async loadSubjects() {
        const container = document.getElementById('subjectsContainer');
        const subjects = await this.getSubjects(this.currentGrade);
        
        container.innerHTML = subjects.map(sub => `
            <div class="subject-card" onclick="app.openSubject('${sub.id}')">
                <div class="subject-icon">${sub.icon}</div>
                <h3>${sub.name}</h3>
                <p>${sub.description}</p>
                <div class="subject-meta">
                    <span>📚 ${sub.lessons} دروس</span>
                    <span class="subject-progress">${sub.progress || 0}%</span>
                </div>
                <div class="subject-progress-bar">
                    <div class="progress-fill" style="width: ${sub.progress || 0}%"></div>
                </div>
            </div>
        `).join('');
    }

    async getSubjects(grade) {
        // جلب المواد من قاعدة البيانات
        const subjectData = {
            sec3: [
                { id: 'natural-science', name: 'علوم الطبيعة والحياة', icon: '🧬', description: 'آليات تركيب البروتين والتنظيم الجيني', lessons: 8 },
                { id: 'mathematics', name: 'الرياضيات', icon: '📐', description: 'النهايات والمشتقات والتكامل', lessons: 6 },
                { id: 'physics', name: 'العلوم الفيزيائية', icon: '⚡', description: 'المتابعة الزمنية والتحولات النووية', lessons: 7 },
                { id: 'philosophy', name: 'الفلسفة', icon: '🧠', description: 'ماهية الفلسفة والمنهجية', lessons: 5 }
            ],
            bem: [
                { id: 'physics-bem', name: 'الفيزياء والتكنولوجيا', icon: '🧲', description: 'الظواهر الكهربائية والدارة', lessons: 6 },
                { id: 'math-bem', name: 'الرياضيات', icon: '📊', description: 'المعادلات والمتراجحات', lessons: 5 }
            ]
        };
        
        return subjectData[grade] || [];
    }

    async loadProgress() {
        if (!this.currentUser) return;
        
        const analytics = await this.db.getUserAnalytics(this.currentUser.uid);
        // تحديث واجهة التقدم
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            // تحديث التقدم لكل مادة
        }
    }

    async loadActivity() {
        if (!this.currentUser) return;
        
        const activityList = document.getElementById('activityList');
        // جلب الأنشطة الأخيرة
        const activities = [
            { type: 'lesson', text: 'أنهيت درس "آليات تركيب البروتين"', time: 'منذ 10 دقائق' },
            { type: 'quiz', text: 'حصلت على 90% في اختبار الرياضيات', time: 'منذ ساعة' },
            { type: 'achievement', text: 'حصلت على إنجاز "المتعلم المتميز"', time: 'منذ 3 ساعات' }
        ];
        
        activityList.innerHTML = activities.map(act => `
            <div class="activity-item">
                <span class="activity-icon">${act.type === 'lesson' ? '📖' : act.type === 'quiz' ? '📝' : '🏆'}</span>
                <div class="activity-content">
                    <p>${act.text}</p>
                    <span class="activity-time">${act.time}</span>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // البحث
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.searchLessons(e.target.value);
        });

        // تغيير المستوى
        document.getElementById('gradeSelect')?.addEventListener('change', (e) => {
            this.currentGrade = e.target.value;
            this.loadSubjects();
            this.db.updateUserProgress(this.currentUser.uid, 'grade', this.currentGrade);
        });

        // إغلاق القائمة الجانبية على الشاشات الصغيرة
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !e.target.classList.contains('menu-toggle')) {
                sidebar.classList.remove('open');
            }
        });
    }

    searchLessons(query) {
        // تنفيذ البحث
        console.log('Searching for:', query);
    }

    async openSubject(subjectId) {
        // فتح المادة وعرض الدروس
        console.log('Opening subject:', subjectId);
        // حفظ آخر مادة تم فتحها
        await this.db.updateUserProgress(this.currentUser.uid, 'lastSubject', subjectId);
        // إعادة توجيه أو فتح مودال
    }

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
    }

    async logout() {
        await this.auth.logout();
        window.location.href = 'login.html';
    }

    showNotifications() {
        // عرض الإشعارات
        console.log('Showing notifications');
    }

    changeGrade() {
        // تغيير المستوى
        this.currentGrade = document.getElementById('gradeSelect').value;
        this.loadSubjects();
    }
}

// تصدير التطبيق للاستخدام العالمي
window.app = new App();
export default App;
