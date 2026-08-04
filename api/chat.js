// api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: 'مفتاح الـ API غير مهيأ في إعدادات السيرفر.' });
    }

    try {
        const { message } = req.body;

        // استخدام الموديل المستقر والمتاح مجاناً للجميع gemini-1.5-flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `أنت أستاذ افتراضي جزائري لشرح الدروس والحلول وفق المناهج التعليمية. اشرح باختصار وبطريقة مبسطة. سؤال الطالب: ${message}` }]
                }]
            })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const botReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: botReply });
        } else if (data.error) {
            console.error("Google API Error:", data.error);
            // إظهار رسالة صديقة للمستخدم عند استهلاك الكوتا
            if (data.error.code === 429 || data.error.message.includes('Quota')) {
                return res.status(429).json({ reply: 'عذراً، وصل الأستاذ الذكي للحد الأقصى من الأسئلة في الدقيقة. يرجى الانتظار 30 ثانية والإعادة!' });
            }
            return res.status(500).json({ reply: 'حدث خطأ في الاتصال بالخدمة، يرجى المحاولة بعد قليل.' });
        } else {
            return res.status(500).json({ reply: 'لم يتم استلام رد متاح، جرب إعادة السؤال.' });
        }

    } catch (error) {
        console.error("API Fetch Error:", error);
        return res.status(500).json({ reply: 'عذراً، حدث خطأ في الاتصال بالخادم.' });
    }
}
