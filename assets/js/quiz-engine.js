module.exports = async (req, res) => {
    // إعدادات CORS للسماح بالطلبات من التطبيق
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'المسار يقبل طلبات POST فقط.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: 'مفتاح الـ API غير مهيأ في متغيرات البيئة بـ Vercel.' });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                // استمرار التنفيذ إذا كان النص خاماً
            }
        }

        const message = body?.message || body?.prompt || '';

        if (!message) {
            return res.status(400).json({ reply: 'يرجى كتابة سؤال أولاً.' });
        }

        const cleanKey = apiKey.trim();
        // استخدام اسم النموذج المعتمد المحدث gemini-2.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanKey}`;

        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `أنت أستاذ افتراضي جزائري لشرح الدروس والحلول وفق المناهج التعليمية. اشرح باختصار وبطريقة مبسطة. سؤال الطالب: ${message}` }]
                }]
            })
        });

        const data = await apiResponse.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }

        if (data.error) {
            console.error("Google API Error Details:", data.error);
            return res.status(500).json({ reply: `خطأ من جوجل: ${data.error.message || 'تعذر معالجة الطلب'}` });
        }

        return res.status(500).json({ reply: 'لم يتم استلام إجابة من الذكاء الاصطناعي، أعد المحاولة.' });

    } catch (err) {
        console.error("Internal Server Error:", err);
        return res.status(500).json({ reply: `خطأ في الخادم الداخلي: ${err.message}` });
    }
};
