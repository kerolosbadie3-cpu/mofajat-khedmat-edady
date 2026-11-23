// ===== الإعدادات =====
// غيّر القيمة دي كل شهر (مثلاً "2026-12") عشان الهدايا تتغير والكل يخدش من جديد
const SALT = "2026-11";

// قاعدة بيانات الحاضرين بالاسم الرباعي
const allowedUsers = [
    { name: "مينا نبيل صبحي عازر" },
    { name: "بيشوي منير كمال فوزي" },
    { name: "أندرو مجدي رفعت منقريوس" },
    { name: "جرجس عادل شفيق قزمان" },
    { name: "جون سامح نصيف عزيز" },
    { name: "شنودة إيهاب رمزي بديع" },
    { name: "فادي رأفت وليم كامل" },
    { name: "بولا غطاس صبري وهبه" },
    { name: "توماس عماد ميلاد منير" },
    { name: "أبانوب شحاته وجيه نسيم" },
    { name: "مايكل شكري فؤاد خليل" },
    { name: "تادرس عادل فرج توفيق" },
    { name: "أرسانيوس أشرف رزق قزمان" },
    { name: "إسحق ممدوح كمال حبيب" },
    { name: "ماريو أشرف رزق لبيب" },
    { name: "بافلي أمير ناجي فرج" },
    { name: "توني نجيب نبيل حليم" },
    { name: "متي رمزي صبري جرجس" },
    { name: "يوحنا سامي عوض الله نصر" },
    { name: "أنطونيوس صموئيل عبده فايز" },
    { name: "ميرون عادل منير شفيق" },
    { name: "إيليا ممدوح نصحي وديع" },
    { name: "إرميا فايز صبري عياد" },
    { name: "يوستوس رأفت كمال عزيز" },
    { name: "كيرلس سامح عياد توفيق" },
    { name: "يوسف عادل فرج منير" },
    { name: "مينا ممدوح صبري شحاته" },
    { name: "جرجس رأفت شفيق نصر" },
    { name: "أندرو أشرف رزق كامل" },
    { name: "جون ناصر شكري فوزي" }
];

// قائمة الجوائز
const gifts = [
    "25 كارت",
    "30 كارت",
    "35 كارت",
    "40 كارت",
    "45 كارت",
    "50 كارت",
    "55 كارت"
];

// ===== العناصر =====
const loginPage = document.getElementById('login-page');
const giftPage = document.getElementById('gift-page');
const btnCheck = document.getElementById('btn-check');
const btnLogout = document.getElementById('btn-logout');
const nameInput = document.getElementById('user-name');
const errorMsg = document.getElementById('error-msg');
const welcomeUser = document.getElementById('welcome-user');
const giftResult = document.getElementById('gift-result');
const scratchInstruction = document.getElementById('scratch-instruction');
const canvas = document.getElementById('scratch-canvas');
const ctx = canvas.getContext('2d');

let currentUser = null;
let currentGift = "";
let revealed = false;
let drawing = false;
let lastX = 0;
let lastY = 0;
let lastCheck = 0;

// ===== أدوات مساعدة =====
function normalizeArabic(text) {
    if (!text) return "";
    return text
        .replace(/[\u064B-\u065F\u0640]/g, "") // التشكيل والتطويل
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, " ")
        .trim();
}

function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}
function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* تجاهل */ }
}

// تصحيح دالة البحث لتعيد كائناً صريحاً [0] بدلاً من مصفوفة كاملة
function findUser(input) {
    const clean = normalizeArabic(input);
    if (clean.split(" ").length < 3) return { error: "short" };

    const exact = allowedUsers.filter(u => normalizeArabic(u.name) === clean);
    if (exact.length === 1) return { user: exact[0] };

    const starts = allowedUsers.filter(u => normalizeArabic(u.name).startsWith(clean + " "));
    if (starts.length === 1) return { user: starts[0] };

    return { error: starts.length > 1 ? "ambiguous" : "none" };
}

function giftFor(name) {
    const str = SALT + "|" + normalizeArabic(name);
    let h = 7;
    for (let i = 0; i < str.length; i++) {
        h = (h * 31 + str.charCodeAt(i)) >>> 0;
    }
    return gifts[h % gifts.length];
}

function storageKey(user) {
    return `revealed_${SALT}_${normalizeArabic(user.name)}`;
}

// ===== تسجيل الدخول =====
function handleCheck() {
    const inputName = nameInput.value;

    if (!inputName.trim()) {
        errorMsg.innerText = "من فضلك اكتب اسمك أولاً يا بطل! ⚠️";
        return;
    }

    const result = findUser(inputName);

    if (result.error === "short") {
        errorMsg.innerText = "اكتب اسمك الرباعي كامل يا بطل (الاسم + اسم الأب + الجد + أبو الجد) ✍️";
        return;
    }
    if (result.error === "ambiguous") {
        errorMsg.innerText = "في أكتر من اسم شبه كده، اكتب اسمك الرباعي كامل 🙏";
        return;
    }
    if (result.error === "none") {
        errorMsg.innerText = "عاش يا بطل على المحاولة! شد حيلك الجمعة الجاية والتزم بالحضور عشان تدخل سحب الهدايا المرة الجاية 🤍";
        return;
    }

    showGift(result.user);
}

function showGift(user) {
    errorMsg.innerText = "";
    currentUser = user;
    currentGift = giftFor(user.name);
    giftResult.innerText = currentGift;

    loginPage.classList.add('hidden');
    giftPage.classList.remove('hidden');

    welcomeUser.textContent = "";
    welcomeUser.appendChild(document.createTextNode("مبروووووك يا بطل 🎉🥳"));
    const nameSpan = document.createElement('span');
    nameSpan.className = 'welcome-name';
    nameSpan.textContent = user.name;
    welcomeUser.appendChild(nameSpan);

    if (storageGet(storageKey(user))) {
        scratchInstruction.innerText = "شوف هديتك المحفوظة تاني يا بطل واخدش المستطيل! 🎁👇";
    } else {
        scratchInstruction.innerText = "امسح واخدش المستطيل الرمادي اللي تحت عشان تكشف عن هديتك! 👇";
    }

    revealed = false;

    // تم تعديل التوقيت لـ 60 ملي ثانية لضمان انتهاء المتصفح تماماً من إظهار كلاسات الـ CSS والبدء بالرسم
    setTimeout(() => {
        initScratchCard();
    }, 60);
}

btnCheck.addEventListener('click', handleCheck);
nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCheck();
});

btnLogout.addEventListener('click', () => {
    nameInput.value = "";
    errorMsg.innerText = "";
    currentUser = null;
    currentGift = "";
    revealed = false;
    drawing = false;
    giftPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
});

// ===== كارت الخدش =====
function initScratchCard() {
    const parent = canvas.parentElement;
    canvas.style.transition = "none";
    canvas.style.opacity = 1;
    canvas.style.display = "block";

    canvas.width = parent.clientWidth && parent.clientWidth > 0 ? parent.clientWidth : 280;
    canvas.height = parent.clientHeight && parent.clientHeight > 0 ? parent.clientHeight : 90;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#b2bec3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '600 16px Cairo, Tahoma, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('اخدش هنا عشان تشوف هديتك ✨', canvas.width / 2, canvas.height / 2);
}

function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function scratchLine(x1, y1, x2, y2) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 44;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function checkScratchPercentage(force) {
    if (revealed) return;

    const now = Date.now();
    if (!force && now - lastCheck < 120) return;
    lastCheck = now;

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < pixels.length; i += 64) {
        total++;
        if (pixels[i] === 0) clear++;
    }

    if (total > 0 && clear / total > 0.35) {
        revealGift();
    }
}

function revealGift() {
    revealed = true;
    drawing = false;

    canvas.style.transition = "opacity 0.4s ease";
    canvas.style.opacity = 0;
    setTimeout(() => { canvas.style.display = "none"; }, 400);

    if (currentUser) storageSet(storageKey(currentUser), "1");
    triggerLocalConfetti();
}

function triggerLocalConfetti() {
    console.log("🎉 مبروك! تم كشف الهدية.");
}

// ===== ربط أحداث اللمس والـ Pointer Events كاملة وبدون أخطاء =====
canvas.addEventListener('pointerdown', (e) => {
    if (revealed) return;
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    scratchLine(lastX, lastY, pos.x, pos.y);
});

canvas.addEventListener('pointermove', (e) => {
    if (!drawing || revealed) return;
    const pos = getPos(e);
    scratchLine(lastX, lastY, pos.x, pos.y);
    lastX = pos.x;
    lastY = pos.y;
    checkScratchPercentage(false);
});

canvas.addEventListener('pointerup', (e) => {
    if (!drawing) return;
    drawing = false;
    canvas.releasePointerCapture(e.pointerId);
    checkScratchPercentage(true);
});

canvas.addEventListener('pointercancel', () => {
    drawing = false;
});
