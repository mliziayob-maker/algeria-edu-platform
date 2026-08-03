// /api/chat.js - Vercel Serverless Function
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY; // يتم ضبطه في إعدادات Vercel

    if (!API_KEY) {
        return res.status(500).json({ error: 'مفتاح الـ API غير مهيأ' });
    }

    const systemContext = `أنت أستاذ افتراضي ذكي في "أكاديمية أمين الإلكترونية". 
    مهمتك مساعدة الطلاب في المناهج الجزائرية (ابتدائي، متوسط BEM، ثانوي BAC).
    أجب باختصار، بأسلوب بيداغوجي مشجع، واستخدم لغة عربية سليمة مع تنسيق معادلات الرياضيات بالرموز عند الحاجة.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: `${systemContext}\n\nسؤال الطالب: ${message}` }] }
                ]
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أستطع فهم السؤال، أعد الصياغة لطفا.";

        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ error: 'حدث خطأ أثناء الاتصال بالخادم الذكي.' });
    }
}
