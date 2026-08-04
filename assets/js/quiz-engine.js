// quiz-engine.js - محرك التمارين التفاعلية
const quizEngine = {
    // تحميل التمارين ديناميكياً من ملف JSON أو السيرفر
    async loadQuizzes() {
        try {
            const res = await fetch('./data/lessons.json');
            const data = await res.json();
            this.renderQuizzes(data.exercises);
        } catch (err) {
            console.error("خطأ في تحميل التمارين:", err);
        }
    },

    // عرض البطاقات التفاعلية
    renderQuizzes(exercises) {
        const container = document.getElementById('interactive-quiz-container');
        if (!container) return;

        container.innerHTML = exercises.map(ex => `
            <div class="quiz-card" style="background:#fff; padding:20px; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:15px;">
                <span style="background:#dbeafe; color:#1e40af; padding:4px 8px; border-radius:6px; font-size:0.8rem; font-weight:bold;">${ex.subject}</span>
                <h4 style="margin:12px 0; color:#0f172a;">${ex.question}</h4>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <input type="text" id="ans-${ex.id}" placeholder="أدخل الإجابة هنا..." style="padding:10px; border:1px solid #cbd5e1; border-radius:8px; flex:1;">
                    <button onclick="quizEngine.verify('${ex.id}', '${ex.correctAnswer}')" style="background:#2563eb; color:#fff; border:none; padding:10px 18px; border-radius:8px; font-weight:bold; cursor:pointer;">تحقق</button>
                </div>
                <div id="res-${ex.id}" style="margin-top:10px; font-weight:bold; font-size:0.9rem;"></div>
            </div>
        `).join('');
    },

    // التحقق من الإجابة
    verify(id, correct) {
        const val = document.getElementById(`ans-${id}`).value.trim();
        const resBox = document.getElementById(`res-${id}`);

        if (!val) {
            resBox.innerHTML = `<span style="color:#f59e0b;">⚠️ أدخل إجابتك أولاً</span>`;
            return;
        }

        if (val.toLowerCase() === correct.toLowerCase()) {
            resBox.innerHTML = `<span style="color:#16a34a;">✅ إجابة صحيحة! أحسنت +20 نقطة.</span>`;
        } else {
            resBox.innerHTML = `<span style="color:#dc2626;">❌ إجابة خاطئة. حاول مجدداً!</span>`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => quizEngine.loadQuizzes());
