// api/chat.js
export default async function handler(req, res) {
    // إتاحة CORS لتفادي مشاكل الحظر
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: 'مفتاح الـ API غير مهيأ في إعدادات السيرفر.' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const message = body?.message || body?.prompt || '';

        if (!message) {
            return res.status(400).json({ reply: 'يرجى كتابة سؤال أولاً.' });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `أنت أستاذ افتراضي جزائري لشرح الدروس والحلول وفق المناهج التعليمية. اشرح باختصار وبطريقة مبسطة. سؤال الطالب: ${message}` }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        } 
        
        if (data.error) {
            console.error("Gemini Error:", data.error);
            return res.status(500).json({ reply: `خطأ من جوجل: ${data.error.message}` });
        }

        return res.status(500).json({ reply: 'لم يتم استلام إجابة، أعد المحاولة.' });

    } catch (err) {
        console.error("Server Error:", err);
        return res.status(500).json({ reply: `خطأ سيرفر: ${err.message}` });
    }
}
