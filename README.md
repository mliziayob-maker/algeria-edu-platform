# منصة أكاديمية أمين الذكية 🎓

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3.x-green)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

## 📖 الرؤية
منصة تعليمية جزائرية **مفتوحة المصدر**، تستخدم الذكاء الاصطناعي لتقديم تعليم مخصص وتفاعلي لجميع الأطوار (ابتدائي، متوسط، ثانوي).

## ✨ الميزات الرئيسية
- 🤖 **أستاذ افتراضي ذكي** (يعتمد على Gemini API مع نظام RAG).
- 📝 **تمارين تفاعلية** مع تصحيح فوري وتغذية راجعة تفسيرية.
- 📊 **تتبع التقدم الشخصي** وتحليلات التعلم.
- 🌐 **متعدد اللغات** (عربية، إنجليزية، فرنسية).
- 🎮 **نظام تحفيزي** (نقاط، شارات، ومتسلسلات تعلم).
- 👨‍🏫 **لوحة تحكم للمعلمين** لإدارة المحتوى.

---

## 🛠️ التقنيات المستخدمة
| **المجال** | **التقنية** |
| :--- | :--- |
| **الواجهة الأمامية** | Next.js 14 + TypeScript + Tailwind CSS |
| **قاعدة البيانات** | Supabase (PostgreSQL) |
| **الذكاء الاصطناعي** | Google Gemini API + RAG |
| **النشر** | Vercel |
| **إدارة الحالة** | Zustand |
| **النماذج** | React Hook Form |
| **الاختبارات** | Jest + React Testing Library |

---

## 📂 هيكل المشروع (النسخة النهائية)
```
algeria-edu-platform/
├── .github/                     # سياسات وقوالب GitHub
│   ├── ISSUE_TEMPLATE/          # قوالب تقارير المشاكل
│   └── PULL_REQUEST_TEMPLATE.md # قالب طلبات السحب
├── frontend/                    # تطبيق Next.js (الواجهة)
│   ├── app/                     # مجلد التطبيق الرئيسي (App Router)
│   ├── components/              # مكونات React القابلة لإعادة الاستخدام
│   ├── lib/                     # دوال مساعدة واتصالات API
│   ├── public/                  # ملفات ثابتة (صور، أيقونات)
│   ├── package.json             # اعتماديات الواجهة
│   └── tsconfig.json            # إعدادات TypeScript
├── backend/                     # منطق الخادم (Supabase Edge Functions)
│   ├── functions/               # دوال سحابية لكل وظيفة
│   │   ├── auth/                # دوال المصادقة
│   │   ├── ai/                  # دوال الذكاء الاصطناعي
│   │   └── exercises/           # دوال التمارين
│   └── package.json             # اعتماديات الخادم
├── database/                    # مخططات قاعدة البيانات
│   ├── schema.sql               # ملف إنشاء الجداول (PostgreSQL)
│   └── seed.sql                 # بيانات تجريبية أولية
├── content/                     # محتوى تعليمي منظم (JSON)
│   ├── phases/                  # بيانات الأطوار (ابتدائي، متوسط، ثانوي)
│   ├── subjects/                # بيانات المواد
│   └── exercises/               # ملفات التمارين (مقسمة حسب المادة)
├── tests/                       # اختبارات آلية
│   ├── unit/                    # اختبارات الوحدات
│   └── integration/             # اختبارات التكامل
├── docs/                        # وثائق المشروع
│   ├── architecture.md          # شرح العمارة التقنية
│   ├── api-reference.md         # توثيق واجهات برمجة التطبيقات
│   └── setup-guide.md           # دليل الإعداد للمطورين
├── .env.example                 # نموذج للمتغيرات البيئية
├── .gitignore                   # استثناءات Git
├── LICENSE                      # ترخيص المشروع (MIT)
└── README.md                    # هذا الملف
```

---

## 🚀 البدء السريع (للتطوير المحلي)

### المتطلبات الأساسية
- Node.js (v18 أو أحدث)
- npm أو yarn
- حساب Supabase (مجاني)
- مفتاح API من Google Gemini

### خطوات الإعداد
```bash
# 1. استنساخ المستودع
git clone https://github.com/Algeria-Edu-Org/algeria-edu-platform.git
cd algeria-edu-platform

# 2. تثبيت الاعتماديات للواجهة
cd frontend
npm install

# 3. إعداد المتغيرات البيئية
cp .env.example .env.local
# افتح ملف .env.local وأضف مفاتيح Supabase و Gemini

# 4. تشغيل بيئة التطوير
npm run dev

# 5. فتح المتصفح على http://localhost:3000
```

---

## 🤝 المساهمة
نرحب بمساهمات المجتمع! يرجى اتباع الخطوات التالية:

1. **انسخ المستودع** (Fork) إلى حسابك.
2. **أنشئ فرعاً** لميزتك:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **أضف تغييراتك** مع رسائل التزام واضحة:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **ارفع فرعك** إلى GitHub:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **افتح طلب سحب** (Pull Request) مع وصف تفصيلي لتغييراتك.

### إرشادات المساهمة
- التزم بمعايير الكود (ESLint + Prettier).
- اكتب اختبارات للتغييرات الجديدة.
- حدّث الوثائق إذا لزم الأمر.
- تأكد من اجتياز جميع الاختبارات قبل رفع الطلب.

---

## 📜 الترخيص
هذا المشروع مرخص تحت **MIT License** - انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

## 👥 الفريق القيادي
| **رئيس الفريق** | **الوناس مليزي** |
| :--- | :--- |


---

## 📞 التواصل
- **GitHub**: [Algeria-Edu-Org](https://github.com/Algeria-Edu-Org)
- **Discord**: (رابط السيرفر الخاص بالفريق)
- **البريد الإلكتروني**: [mliziayob@email.com](mailto:example@email.com)

---

**شكراً لاهتمامك بمستقبل التعليم في الجزائر!** 🇩🇿
