const tpb_el = document.getElementById("tplayback");
const tpb_playBtn = document.getElementById("play_btn");
const tpb_pauseBtn = document.getElementById("pause_btn");
const tpb_slowBtn = document.getElementById("slow_btn");
const tpb_refreshBtn = document.getElementById("refresh_btn");
const tpb_pronounceBtn = document.getElementById("pronounce_btn");
const tpb_shareBtn = document.getElementById("share_btn");
const tpb_backBtn = document.getElementById("back_btn");
const tpb_fwdBtn = document.getElementById("forward_btn");
const tpb_input = document.getElementById("teacher_inp");

let tpb_timer = null, tpb_i = 0, tpb_speed = 200;
let tpb_voice = null;

const tpb_letterNames = {
    A:"a", B:"bee", C:"cee", Ç:"ççee", D:"dee", E:"ee", F:"fe", G:"gee",
    Ğ:"yumuşak gee", H:"hee", I:"ıı", İ:"i̇i̇", J:"jee", K:"kee", L:"llee",
    M:"mee", N:"nee", O:"oo", Ö:"öü", P:"pee", R:"Re", S:"seee", Ş:"şee",
    T:"tee", U:"ou", Ü:"ü", V:"vee", Y:"yee", Z:"zee"
};

function tpb_loadVoice() {
    const voices = window.speechSynthesis.getVoices()
    tpb_voice = voices.find(v => v.lang === "tr-TR" && /Google|Microsoft/i.test(v.name))
        || voices.find(v => v.lang === "tr-TR")
        || null;
}
if ("speechSynthesis" in window) {
    tpb_loadVoice();
    window.speechSynthesis.onvoiceschanged = tpb_loadVoice;
}

function tpb_word() {
    return tpb_input.value.trim().toLocaleUpperCase("tr-TR");
}

function tpb_mark() {
    tpb_el.innerHTML = [...tpb_word()].map(c => `<span>${c}</span>`).join("");
    [...tpb_el.children].forEach(s => s.style.color = "var(--_blue)");
    if (tpb_el.children[tpb_i]) tpb_el.children[tpb_i].style.color = "var(--_red)";
}

function tpb_play() {
    clearInterval(tpb_timer);
    if (!tpb_el.children.length) tpb_mark();
    if (tpb_i >= tpb_el.children.length) tpb_i = 0;

    tpb_timer = setInterval(() => {
        if (!tpb_el.children.length) return clearInterval(tpb_timer);
        tpb_el.children[tpb_i]?.style.setProperty("color", "var(--_blue)");
        tpb_i++;
        if (tpb_i >= tpb_el.children.length) tpb_i = 0;
        tpb_el.children[tpb_i].style.color = "var(--_red)";
    }, tpb_speed);
}

function tpb_pause() {
    clearInterval(tpb_timer);
    tpb_timer = null;
}

function tpb_slow() {
    tpb_speed = 500;
    tpb_play();
}

function tpb_step(dir) {
    const len = tpb_el.children.length;
    tpb_i = (tpb_i + dir + len) % len;
    tpb_mark();
}

function tpb_setWord(word) {
    tpb_input.value = word;
    const url = new URL(location);
    url.searchParams.set("word", word);
    history.replaceState(null, "", url);
    tpb_i = 0;
    tpb_mark();
    tpb_play();
}

function tpb_pronounceCurrent() {
    const currentLetter = tpb_el.children[tpb_i]?.textContent || tpb_word()[tpb_i] || "";
    if (!currentLetter || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    let name = tpb_letterNames[currentLetter] || currentLetter.toLocaleLowerCase("tr-TR");
    if (currentLetter === "i") name = "i";
    const utterance = new SpeechSynthesisUtterance("......." + name + ".......");
    utterance.lang = "tr-TR";
    utterance.rate = 0.75;
    utterance.pitch = 1;
    if (tpb_voice) utterance.voice = tpb_voice;
    window.speechSynthesis.speak(utterance);
}
function tpb_share() {
    const shareUrl = window.location.href;

    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(shareUrl).catch(() => {
            const tempInput = document.createElement("textarea");
            tempInput.value = shareUrl;
            tempInput.setAttribute("readonly", "");
            tempInput.style.position = "fixed";
            tempInput.style.left = "-9999px";
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
        });
    } else {
        const tempInput = document.createElement("textarea");
        tempInput.value = shareUrl;
        tempInput.setAttribute("readonly", "");
        tempInput.style.position = "fixed";
        tempInput.style.left = "-9999px";
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
    }
    document.getElementById('copy_alert').showModal();
}

tpb_playBtn.onclick = tpb_play;
tpb_pauseBtn.onclick = tpb_pause;
tpb_slowBtn.onclick = tpb_slow;
tpb_refreshBtn.onclick = tpb_mark;
tpb_pronounceBtn.onclick = tpb_pronounceCurrent;
tpb_shareBtn.onclick = tpb_share;
tpb_backBtn.onclick = () => tpb_step(-1);
tpb_fwdBtn.onclick = () => tpb_step(1);
tpb_input.oninput = () => { tpb_i = 0; };
tpb_refreshBtn.onclick = () => tpb_setWord(tpb_word());

const urlWord = new URL(location).searchParams.get("word");
if (urlWord) tpb_input.value = urlWord;
tpb_play();
