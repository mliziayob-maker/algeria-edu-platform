// --- 1. ربط البوت الذكي بالـ Backend الحقيقي ---
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatBox = document.getElementById('chatBox');

if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        // إدراج سؤال المستخدم
        appendMsg(text, 'user');
        userInput.value = '';

        // إظهار مؤشر التفكير
        const loadingId = appendMsg('جاري التفكير والتأكد من المنهاج...', 'bot-loading');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            document.getElementById(loadingId)?.remove(); // إزالة مؤشر التحميل
            
            appendMsg(data.reply || data.error, 'bot');
        } catch (err) {
            document.getElementById(loadingId)?.remove();
            appendMsg('عذراً، تعذر الاتصال بالأستاذ الذكي حالياً. تحقق من الإنترنت.', 'bot');
        }
    });
}

function appendMsg(text, type) {
    const msgDiv = document.createElement('div');
    const id = 'msg-' + Date.now();
    msgDiv.id = id;
    msgDiv.className = `msg-bubble ${type === 'user' ? 'msg-user' : 'msg-bot'}`;
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

// --- 2. محرك التمارين التفاعلية والتصحيح الفوري (Interactive Quiz Logic) ---
function checkAnswer(exerciseId, correctAnswer) {
    const userAns = document.getElementById(`input-${exerciseId}`).value.trim();
    const resultBox = document.getElementById(`result-${exerciseId}`);

    if (!userAns) {
        resultBox.innerHTML = "<span style='color:#f59e0b;'>⚠️ يرجى إدخال إجابة أولاً!</span>";
        return;
    }

    if (userAns.toLowerCase() === correctAnswer.toLowerCase()) {
        resultBox.innerHTML = "<span style='color:#22c55e; font-weight:bold;'>✅ إجابة صحيحة! أحسنت يا بطل +20 نقطة.</span>";
        // يمكن هنا حفظ النتيجة في localStorage مؤقتاً لحين بناء قاعدة البيانات
        saveProgress(exerciseId, true);
    } else {
        resultBox.innerHTML = `<span style='color:#ef4444; font-weight:bold;'>❌ إجابة خاطئة. حاول مجدداً! (الإجابة الصحيحة هي: ${correctAnswer})</span>`;
        saveProgress(exerciseId, false);
    }
}

function saveProgress(exId, isCorrect) {
    let history = JSON.parse(localStorage.getItem('academy_progress') || '{}');
    history[exId] = { isCorrect, date: new Date().toISOString() };
    localStorage.setItem('academy_progress', JSON.stringify(history));
}
