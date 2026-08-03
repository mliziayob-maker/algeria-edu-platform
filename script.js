/**
 * أكاديمية أمين الإلكترونية - Amin Electronic Academy
 * Script File (script.js)
 * Clean, Modular, XSS-Safe, and Mobile-Optimized JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Navigation Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        // Close menu when clicking links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
        });
    }

    // 2. Interactive AI Teacher Chat Simulation
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatBox = document.getElementById('chatBox');

    if (chatForm && userInput && chatBox) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = userInput.value.trim();
            if (!text) return;

            // Render User Message securely (Avoid innerHTML to prevent XSS)
            appendMessage(text, 'user');
            userInput.value = '';

            // Simulate AI Bot Response after short delay
            showBotTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                const botReply = generateSmartResponse(text);
                appendMessage(botReply, 'bot');
            }, 1200);
        });
    }

    /**
     * Safely Appends Message to Chat Box using DOM methods
     * @param {string} text - Content of the message
     * @param {'user'|'bot'} sender - Type of sender
     */
    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

        if (sender === 'bot') {
            const avatar = document.createElement('i');
            avatar.className = 'fa-solid fa-robot bot-avatar';
            messageDiv.appendChild(avatar);
        }

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = text; // Secure text insertion

        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showBotTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.classList.add('message', 'bot-message');
        
        const avatar = document.createElement('i');
        avatar.className = 'fa-solid fa-robot bot-avatar';

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.style.fontStyle = 'italic';
        contentDiv.style.color = 'var(--text-secondary)';
        contentDiv.textContent = 'الأستاذ أمين يفكر في الإجابة ويصيغ التمارين...';

        indicator.appendChild(avatar);
        indicator.appendChild(contentDiv);
        chatBox.appendChild(indicator);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Smart Rule-based Response Engine
     * @param {string} query 
     * @returns {string}
     */
    function generateSmartResponse(query) {
        const q = query.toLowerCase();
        if (q.includes('رياضيات') || q.includes('حساب') || q.includes('معادلة')) {
            return 'ممتاز! في مادة الرياضيات، يمكننا تفكيك المسألة خطوة بخطوة. إليك تمرين تجريبي: حاول حل x + 5 = 12، واكتب إجابتك هنا لأقوم بتقييمها لك!';
        } else if (q.includes('فيزياء') || q.includes('علوم') || q.includes('تجربة')) {
            return 'في المختبر الافتراضي، يمكنك تجربة محاكاة القوانين الفيزيائية والكيميائية بدقة بصرية عالية. ما هي التجربة التي تود إجراؤها الآن؟';
        } else if (q.includes('مرحبا') || q.includes('السلام') || q.includes('أهلا')) {
            return 'أهلاً بك! أنا أستاذك الافتراضي الذكي في أكاديمية أمين. كيف أستطيع مساعدتك في دراستك اليوم؟';
        } else {
            return `تم استلام سؤالك حول: "${query}". أقوم الآن بتحليل الموضوع وإعداد شرح مبسط وتطبيقات تفاعلية تناسب مستواك الدراسي!`;
        }
    }
});
