// محرك التمارين التفاعلي الحي
const exercisesData = [
  {
    id: "ex_math_01",
    subject: "جناح الخوارزمي (الرياضيات)",
    question: "حل المعادلة التالية في مجموعة الأعداد الحقيقية: 2x + 4 = 10",
    correctAnswer: "3",
    hint: "اطرح 4 من الطرفين أولاً ثم اقسم على 2."
  },
  {
    id: "ex_phys_01",
    subject: "مجمع ابن الهيثم (الفيزياء)",
    question: "احسب شدة التيار (I) إذا كان التوتر U = 12V المقاومة R = 4 Ohm",
    correctAnswer: "3",
    hint: "تذكر قانون أوم: U = R * I"
  }
];

function renderInteractiveQuizzes() {
  const container = document.getElementById('interactive-quiz-container');
  if (!container) return;

  container.innerHTML = exercisesData.map(ex => `
    <div class="quiz-card" style="background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 15px;">
      <span style="font-size: 0.8rem; background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 6px; font-weight: bold;">${ex.subject}</span>
      <h4 style="margin: 10px 0; color: #1e293b;">${ex.question}</h4>
      
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <input type="text" id="input-${ex.id}" placeholder="أدخل إجابتك هنا..." style="padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; flex: 1;">
        <button onclick="submitAnswer('${ex.id}', '${ex.correctAnswer}')" style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer;">تحقق من الإجابة</button>
      </div>

      <div id="feedback-${ex.id}" style="margin-top: 10px; font-size: 0.9rem; font-weight: bold;"></div>
    </div>
  `).join('');
}

function submitAnswer(exId, correctAns) {
  const userAns = document.getElementById(`input-${exId}`).value.trim();
  const feedback = document.getElementById(`feedback-${exId}`);

  if (!userAns) {
    feedback.innerHTML = `<span style="color: #f59e0b;">⚠️ أصلح الإجابة أولاً!</span>`;
    return;
  }

  if (userAns === correctAns) {
    feedback.innerHTML = `<span style="color: #16a34a;">✅ إجابة صحيحة وممتازة! (+20 نقطة IQ)</span>`;
  } else {
    feedback.innerHTML = `<span style="color: #dc2626;">❌ إجابة غير دقيقة، حاول مجدداً.</span>`;
  }
}

// تشغيل المحرك فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', renderInteractiveQuizzes);
