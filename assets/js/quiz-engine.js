// ========================================================
// محرك التمارين التفاعلية - أكاديمية أمين الذكية (quiz-engine.js)
// ========================================================

const quizEngine = {
    // بيانات التمارين الاحتياطية (FallBack) في حال تعذر جلب ملف JSON
    defaultExercises: [
        {
            id: "ex_math_01",
            subject: "الرياضيات",
            question: "حل المعادلة التالية في مجموعة الأعداد الحقيقية: 2x + 4 = 10 (ما هي قيمة x؟)",
            correctAnswer: "3",
            hint: "اطرح 4 من الطرفين أولاً ثم اقسم على 2."
        },
        {
            id: "ex_phys_01",
            subject: "الفيزياء",
            question: "احسب شدة التيار (I) بالناقل إذا كان التوتر U = 12V والمقاومة R = 4Ω",
            correctAnswer: "3",
            hint: "قانون أوم: I = U / R"
        },
        {
            id: "ex_arabic_01",
            subject: "اللغة العربية",
            question: "ما إعراب كلمة 'طالباً' في جملة: 'حضر ثلاثون طالباً'؟",
            correctAnswer: "تمييز",
            hint: "اسم منصوب يأتي بعد العقود لتوضيح المبهم."
        }
    ],

    // 1. تحميل التمارين ديناميكياً
    async loadQuizzes() {
        const container = document.getElementById('interactive-quiz-container');
        if (!container) return;

        try {
            const res = await fetch('./data/lessons.json');
            if (!res.ok) throw new Error('تعذر تحميل ملف التمارين');
            
            const data = await res.json();
            const exercises = (data && data.exercises && data.exercises.length > 0) 
                ? data.exercises 
                : this.defaultExercises;

            this.renderQuizzes(exercises, container);
        } catch (err) {
            console.warn("جاري استخدام بنك التمارين المحلي الاحتياطي:", err);
            this.renderQuizzes(this.defaultExercises, container);
        }
    },

    // 2. عرض بطاقات التمارين التفاعلية في الصفحة
    renderQuizzes(exercises, container) {
        container.innerHTML = exercises.map((ex, index) => `
            <div class="quiz-card" style="background:#ffffff; padding:20px; border-radius:12px; border:1px solid #cbd5e1; margin-bottom:20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: all 0.2s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="background:#dbeafe; color:#1e40af; padding:4px 12px; border-radius:6px; font-size:0.85rem; font-weight:700;">
                        ${ex.subject}
                    </span>
                    <span style="font-size:0.8rem; color:#64748b; font-weight:600;">
                        تمرين #${index + 1}
                    </span>
                </div>

                <h3 style="margin:10px 0 15px 0; color:#0f172a; font-size:1.1rem; line-height:1.5;">
                    ${ex.question}
                </h3>

                <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                    <input type="text" id="ans-${ex.id}" placeholder="أدخل إجابتك هنا..." 
                        style="padding:10px 14px; border:1px solid #94a3b8; border-radius:8px; flex:1; min-width:180px; font-family:inherit; font-size:0.95rem; outline:none;"
                        onkeypress="if(event.key === 'Enter') quizEngine.verify('${ex.id}', '${ex.correctAnswer}')">
                    
                    <button onclick="quizEngine.verify('${ex.id}', '${ex.correctAnswer}')" 
                        style="background:#1d4ed8; color:#ffffff; border:none; padding:10px 20px; border-radius:8px; font-weight:700; cursor:pointer; font-family:inherit; transition: background 0.2s;">
                        تحقق من الإجابة
                    </button>
                </div>

                ${ex.hint ? `<p style="margin:8px 0 0 0; font-size:0.8rem; color:#64748b;">💡 <b>تلميح:</b> ${ex.hint}</p>` : ''}

                <div id="res-${ex.id}" style="margin-top:12px; font-weight:700; font-size:0.95rem;"></div>
            </div>
        `).join('');
    },

    // 3. التحقق الفوري من الإجابات وتسجيل الإنجاز
    verify(id, correct) {
        const inputEl = document.getElementById(`ans-${id}`);
        const resBox = document.getElementById(`res-${id}`);
        if (!inputEl || !resBox) return;

        const userAns = inputEl.value.trim().toLowerCase();
        const targetAns = correct.trim().toLowerCase();

        if (!userAns) {
            resBox.innerHTML = `<span style="color:#d97706; background:#fef3c7; padding:6px 12px; border-radius:6px; display:inline-block;">⚠️ يرجى كتابة إجابة قبل الضغط على تحقق!</span>`;
            return;
        }

        if (userAns === targetAns) {
            resBox.innerHTML = `<span style="color:#15803d; background:#dcfce7; padding:6px 12px; border-radius:6px; display:inline-block;">✅ إجابة صحيحة وممتازة! (+20 نقطة IQ)</span>`;
            this.saveProgress(id, true);
        } else {
            resBox.innerHTML = `<span style="color:#b91c1c; background:#fee2e2; padding:6px 12px; border-radius:6px; display:inline-block;">❌ إجابة غير دقيقة. حاول مرة أخرى!</span>`;
            this.saveProgress(id, false);
        }
    },

    // 4. حفظ الإنجازات محلّياً في المتصفح
    saveProgress(exId, isCorrect) {
        try {
            let progress = JSON.parse(localStorage.getItem('academy_quiz_progress') || '{}');
            progress[exId] = {
                solved: isCorrect,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('academy_quiz_progress', JSON.stringify(progress));
        } catch (e) {
            console.error("تعذر حفظ التقدم في localStorage", e);
        }
    }
};

// تشغيل المحرك تلقائياً فور جاهزية الشاشة
document.addEventListener('DOMContentLoaded', () => quizEngine.loadQuizzes());
