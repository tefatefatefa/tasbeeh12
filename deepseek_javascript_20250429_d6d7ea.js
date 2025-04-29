document.addEventListener('DOMContentLoaded', function() {
    // العناصر الأساسية
    const counterElement = document.getElementById('counter');
    const incrementBtn = document.getElementById('increment');
    const resetBtn = document.getElementById('reset');
    const azkarButtons = document.querySelectorAll('.azkar-btn');
    const currentDhikrElement = document.getElementById('current-dhikr');
    const progressCountElement = document.getElementById('progress-count');
    const progressFillElement = document.querySelector('.progress-fill');
    const todayCountElement = document.getElementById('today-count');
    const weekCountElement = document.getElementById('week-count');
    const totalCountElement = document.getElementById('total-count');
    const targetInput = document.getElementById('target-input');
    const soundToggle = document.getElementById('sound-toggle');
    const vibrationToggle = document.getElementById('vibration-toggle');
    const clickSound = document.getElementById('click-sound');

    // البيانات
    let currentCount = 0;
    let todayCount = 0;
    let weekCount = 0;
    let totalCount = 0;
    let currentDhikr = 'سبحان الله';
    let target = 100;
    let soundEnabled = true;
    let vibrationEnabled = true;

    // تحميل البيانات من localStorage
    function loadData() {
        const savedData = localStorage.getItem('tasbeehData');
        if (savedData) {
            const data = JSON.parse(savedData);
            currentCount = data.currentCount || 0;
            todayCount = data.todayCount || 0;
            weekCount = data.weekCount || 0;
            totalCount = data.totalCount || 0;
            currentDhikr = data.currentDhikr || 'سبحان الله';
            target = data.target || 100;
            soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
            vibrationEnabled = data.vibrationEnabled !== undefined ? data.vibrationEnabled : true;
            
            // تحديث تاريخ آخر استخدام
            const lastUsedDate = data.lastUsedDate ? new Date(data.lastUsedDate) : null;
            const today = new Date().toDateString();
            
            if (!lastUsedDate || lastUsedDate.toDateString() !== today) {
                // إذا كان اليوم مختلفًا، نعيد العد اليومي
                currentCount = 0;
                updateTodayCount();
            }
        }
        
        // تحديث القيم في الواجهة
        updateUI();
    }

    // حفظ البيانات في localStorage
    function saveData() {
        const data = {
            currentCount,
            todayCount,
            weekCount,
            totalCount,
            currentDhikr,
            target,
            soundEnabled,
            vibrationEnabled,
            lastUsedDate: new Date().toISOString()
        };
        localStorage.setItem('tasbeehData', JSON.stringify(data));
    }

    // تحديث واجهة المستخدم
    function updateUI() {
        counterElement.textContent = currentCount;
        currentDhikrElement.textContent = currentDhikr;
        progressCountElement.textContent = `${currentCount}/${target}`;
        progressFillElement.style.width = `${Math.min((currentCount / target) * 100, 100)}%`;
        todayCountElement.textContent = todayCount;
        weekCountElement.textContent = weekCount;
        totalCountElement.textContent = totalCount;
        targetInput.value = target;
        soundToggle.checked = soundEnabled;
        vibrationToggle.checked = vibrationEnabled;
        
        // تحديث الأزرار النشطة
        azkarButtons.forEach(btn => {
            if (btn.dataset.dhikr === currentDhikr) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // زيادة العداد
    function incrementCounter() {
        currentCount++;
        todayCount++;
        weekCount++;
        totalCount++;
        
        if (soundEnabled) {
            clickSound.currentTime = 0;
            clickSound.play();
        }
        
        if (vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        updateUI();
        saveData();
    }

    // إعادة تعيين العداد
    function resetCounter() {
        currentCount = 0;
        updateUI();
        saveData();
    }

    // تغيير الذكر الحالي
    function changeDhikr(dhikr) {
        currentDhikr = dhikr;
        currentCount = 0;
        updateUI();
        saveData();
    }

    // تحديث العداد اليومي
    function updateTodayCount() {
        const today = new Date().toDateString();
        const lastUsedDate = localStorage.getItem('lastUsedDate');
        
        if (lastUsedDate !== today) {
            localStorage.setItem('lastUsedDate', today);
            todayCount = 0;
            saveData();
        }
    }

    // تعيين الهدف الجديد
    function setTarget(newTarget) {
        target = Math.max(1, newTarget);
        updateUI();
        saveData();
    }

    // تفعيل/تعطيل الصوت
    function toggleSound(enabled) {
        soundEnabled = enabled;
        saveData();
    }

    // تفعيل/تعطيل الاهتزاز
    function toggleVibration(enabled) {
        vibrationEnabled = enabled;
        saveData();
    }

    // استماع للأحداث
    incrementBtn.addEventListener('click', incrementCounter);
    resetBtn.addEventListener('click', resetCounter);
    
    azkarButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            changeDhikr(btn.dataset.dhikr);
        });
    });
    
    targetInput.addEventListener('change', (e) => {
        setTarget(parseInt(e.target.value));
    });
    
    soundToggle.addEventListener('change', (e) => {
        toggleSound(e.target.checked);
    });
    
    vibrationToggle.addEventListener('change', (e) => {
        toggleVibration(e.target.checked);
    });

    // اختصارات لوحة المفاتيح
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            incrementCounter();
        } else if (e.key === 'r' || e.key === 'R') {
            resetCounter();
        }
    });

    // تحميل البيانات عند بدء التشغيل
    loadData();
    
    // تحديث العداد اليومي كل دقيقة للتأكد من الدقة
    setInterval(updateTodayCount, 60000);
});