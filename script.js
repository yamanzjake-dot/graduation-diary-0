// حط الرابط اللي أخذته من Apps Script بين علامات التنصيص تحت
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxLn72EoeK6jF3hQX6OAVX1K0EzKICVtp2vBiZjwc9u-yqUeUWj3TWSN6IzZ7FrPJixDA/exec";

// استدعاء عناصر الـ HTML
const form = document.getElementById('guestbook-form');
const messagesGrid = document.querySelector('.messages-grid');
const submitBtn = document.querySelector('.submit-btn');

// 1. جلب الرسائل وعرضها أول ما يفتح الموقع (GET)
async function fetchMessages() {
    try {
        const response = await fetch(SCRIPT_URL);
        const messages = await response.json();
        
        // تفريغ الشبكة قبل إضافة الرسائل الجديدة
        messagesGrid.innerHTML = ''; 

        // إضافة كل رسالة كبطاقة
        messages.forEach(msg => {
            const dateObj = new Date(msg.timestamp);
            const formattedDate = dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });

            const cardHTML = `
                <div class="message-card">
                    <p class="message-text">"${msg.message}"</p>
                    <div class="card-footer">
                        <span class="sender-signature">${msg.name}</span>
                        <span class="date">${formattedDate}</span>
                    </div>
                </div>
            `;
            messagesGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// 2. إرسال رسالة جديدة (POST)
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // منع إعادة تحميل الصفحة
    submitBtn.textContent = 'جاري الإرسال...';
    submitBtn.disabled = true;

    // تجميع البيانات من الفورم
    const identityValue = document.querySelector('input[name="identity"]:checked').value;
    const nameInput = document.getElementById('sender-name').value;
    
    const formData = {
        message: document.getElementById('message').value,
        identity: identityValue,
        name: identityValue === 'anonymous' ? 'صديق' : (nameInput || 'صديق'),
        publishDirect: document.getElementById('publish-direct').checked
    };

    try {
        // إرسال البيانات للـ Apps Script
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        });

        // تنظيف الفورم بعد الإرسال
        form.reset();
        submitBtn.textContent = 'تم الإرسال بنجاح!';
        
        // تحديث الرسائل المعروضة إذا كانت الرسالة للنشر المباشر
        if (formData.publishDirect) {
            setTimeout(fetchMessages, 1500); // استدعاء الرسائل بعد ثانية ونص
        }

        setTimeout(() => {
            submitBtn.textContent = 'إرسال الذكرى';
            submitBtn.disabled = false;
        }, 3000);

    } catch (error) {
        console.error('Error submitting form:', error);
        submitBtn.textContent = 'حدث خطأ، حاول مرة أخرى';
        submitBtn.disabled = false;
    }
});

// تشغيل دالة جلب الرسائل أول ما الصفحة تحمل
fetchMessages();