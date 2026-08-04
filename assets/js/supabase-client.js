// supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// جلب عدد الطلاب الحقيقي المباشر لإلغاء رقم "10K" الوهمي
export async function updateRealStats() {
    const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    if (!error && count !== null) {
        const studentStatEl = document.getElementById('real-student-count');
        if (studentStatEl) studentStatEl.innerText = `${count}+`;
    }
}
