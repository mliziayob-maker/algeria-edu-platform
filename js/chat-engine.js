// js/chat-engine.js - محرك المحادثة التفاعلي (تم إعادة تسميته)

class ChatEngine {
    constructor(databaseManager) {
        this.db = databaseManager;
        this.currentLesson = null;
        this.userId = null;
        this.messages = [];
        this.isActive = false;
        this.chatContainer = null;
        this.responseTimeouts = [];
    }

    // بدء الحصة
    async startLesson(userId, lesson) {
        this.userId = userId;
        this.currentLesson = lesson;
        this.messages = [];
        this.isActive = true;

        // إنشاء واجهة المحادثة
        this.createChatInterface();
        
        // تحميل التاريخ السابق
        const history = await this.db.getChatHistory(userId, lesson.id);
        if (history && history.length > 0) {
            this.messages = history;
            this.renderMessages();
        } else {
            // رسالة ترحيبية
            this.addMessage('bot', `👋 أهلاً بك! ${lesson.teacher || 'الأستاذ'} 
                \n${lesson.intro || 'مرحباً بك في الحصة التعليمية'}`);
        }

        // تسجيل بدء الحصة
        await this.db.logActivity(userId, {
            type: 'chat_start',
            lessonId: lesson.id,
            lessonTitle: lesson.title
        });
    }

    // إنشاء واجهة المحادثة
    createChatInterface() {
        // إزالة الواجهة القديمة إن وجدت
        const existing = document.getElementById('chatContainer');
        if (existing) existing.remove();

        // إنشاء الحاوية
        const container = document.createElement('div');
        container.id = 'chatContainer';
        container.className = 'chat-container';
        container.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <h3>💬 ${this.currentLesson?.title || 'الحصة التعليمية'}</h3>
                    <span class="chat-teacher">👨‍🏫 ${this.currentLesson?.teacher || 'الأستاذ'}</span>
                </div>
                <button class="btn-close-chat" onclick="window.app?.chatEngine?.closeLesson()">✕</button>
            </div>
            <div id="chatMessages" class="chat-messages"></div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" placeholder="✏️ اكتب سؤالك هنا..." 
                       onkeydown="if(event.key === 'Enter') window.app?.chatEngine?.sendMessage()">
                <button onclick="window.app?.chatEngine?.sendMessage()">🚀 إرسال</button>
            </div>
        `;
        document.body.appendChild(container);
        this.chatContainer = container;
        
        // تركيز على الإدخال
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
        }, 100);
    }

    // إضافة رسالة
    addMessage(type, content) {
        const message = {
            type: type, // 'user' | 'bot'
            content: content,
            timestamp: new Date().toISOString()
        };
        this.messages.push(message);
        this.renderMessage(message);
        this.saveHistory();
    }

    // عرض رسالة
    renderMessage(message) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const div = document.createElement('div');
        div.className = `message ${message.type === 'user' ? 'message-user' : 'message-bot'}`;
        
        if (message.type === 'bot') {
            div.innerHTML = `
                <span class="bot-name">${this.currentLesson?.teacher || 'الأستاذ'}</span>
                <p>${message.content}</p>
            `;
        } else {
            div.innerHTML = `<p>${message.content}</p>`;
        }
        
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    // عرض كل الرسائل
    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        container.innerHTML = '';
        this.messages.forEach(msg => this.renderMessage(msg));
    }

    // إرسال رسالة
    async sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        // إضافة رسالة المستخدم
        this.addMessage('user', text);

        // الحصول على رد البوت
        const reply = await this.getBotReply(text);
        this.addMessage('bot', reply);

        // تسجيل النشاط
        await this.db.logActivity(this.userId, {
            type: 'chat_message',
            lessonId: this.currentLesson?.id,
            messageCount: this.messages.length
        });
    }

    // ردود البوت الذكية
    async getBotReply(userMessage) {
        const msg = userMessage.toLowerCase();

        // ردود ذكية حسب الكلمات المفتاحية
        const responses = {
            'شكر': '🙏 الله يبارك فيك! أنت طالب متميز، واصل بهذا المستوى!',
            'مرحب': '👋 وعليكم السلام! أهلاً بك في الحصة. أنا جاهز للإجابة على كل أسئلتك.',
            'حل|كيف|طريقة': '💡 سؤال رائع! دعنا نتبع المنهجية التالية:\n1️⃣ نحدد المعطيات\n2️⃣ نكتب القانون المناسب\n3️⃣ نطبق الحل خطوة بخطوة\n4️⃣ نتحقق من النتيجة',
            'تمرين|مسألة': '📝 ممتاز! إليك تمرين تطبيقي:\n🔹 أحسب قيمة x في المعادلة: 2x + 5 = 13\n🔹 الحل: 2x = 8 ⇒ x = 4',
            'فهم|وضح|شرح': '📚 دعني أوضح لك الفكرة الأساسية:\n✅ المفهوم الرئيسي\n✅ التطبيق المباشر\n✅ التدريب المستمر',
            'درس|مادة': `📖 نحن الآن في درس "${this.currentLesson?.title}"\nسأركز معك على:\n• المفاهيم الأساسية\n• الأمثلة التطبيقية\n• الأسئلة المتوقعة`,
            'امتحان|بكالوريا|bem|اختبار': '📝 نصيحة مهمة للامتحان:\n⏰ نظم وقتك\n📖 راجع المفاهيم الأساسية\n✍️ تدرب على حل التمارين السابقة'
        };

        // البحث عن رد مناسب
        for (const [key, reply] of Object.entries(responses)) {
            const keywords = key.split('|');
            if (keywords.some(kw => msg.includes(kw))) {
                return reply;
            }
        }

        // ردود عشوائية
        const defaultReplies = [
            '💪 إجابة ممتازة! دعنا الآن ننتقل إلى النقطة التالية...',
            '🎯 تمام! هذا يحل جزءاً كبيراً من الإشكالية. ماذا عن التطبيق العملي؟',
            '✨ أحسنت! أنت على الطريق الصحيح. هل تريد المزيد من الأمثلة؟',
            '📊 تحليل رائع! دعني أضيف أن...',
            '🧠 تفكير منطقي! هذه النقطة مهمة جداً في الدرس.'
        ];
        
        const randomReply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
        return randomReply + '\n\n📌 هل لديك سؤال آخر أو تريد متابعة الدرس؟';
    }

    // حفظ التاريخ
    async saveHistory() {
        if (!this.userId || !this.currentLesson) return;
        await this.db.saveChatHistory(
            this.userId,
            this.currentLesson.id,
            this.messages
        );
    }

    // إنهاء الحصة
    async closeLesson() {
        if (!this.isActive) return;

        this.isActive = false;
        
        // تسجيل إنهاء الحصة
        if (this.userId) {
            await this.db.logActivity(this.userId, {
                type: 'chat_end',
                lessonId: this.currentLesson?.id,
                messageCount: this.messages.length
            });
            await this.saveHistory();
        }

        // إغلاق الواجهة
        if (this.chatContainer) {
            this.chatContainer.remove();
            this.chatContainer = null;
        }

        // إلغاء المؤقتات
        this.responseTimeouts.forEach(clearTimeout);
        this.responseTimeouts = [];

        this.currentLesson = null;
        this.messages = [];
    }

    // تدمير المحرك
    destroy() {
        this.closeLesson();
    }
}

export default ChatEngine;
