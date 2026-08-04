// api/chat.js // Vercel trigger update

export default async function handler(req, res) {
    // السماح بطلبات POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // جلب المفتاح من متغيرات البيئة في Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: 'مفتاح الـ API غير مهيأ في إعدادات السيرفر.' });
    }

    try {
        const { message } = req.body;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `أنت أستاذ افتراضي جزائري لشرح الدروس والحلول وفق المناهج التعليمية. إجابتك قصيرة ومباشرة ومفيدة. سؤال الطالب: ${message}` }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const botReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: botReply });
        } else {
            return res.status(500).json({ reply: 'حدث خطأ أثناء معالجة الإجابة من الذكاء الاصطناعي.' });
        }

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ reply: 'عذراً، حدث خطأ في الاتصال بالخادم.' });
    }
}
