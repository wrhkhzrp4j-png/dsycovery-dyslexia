// ===== script-summary.js — Dashboard Calculation =====

// สเตตัสควบคุมการเล่นเสียง
let isSpeakingSummary = false;

window.onload = function() {
    // 1. สอยคะแนนสะสมรายด่านมาจากกระเป๋าหน่วยความจำของเครื่อง (localStorage)
    const scoreGame1 = parseInt(localStorage.getItem("letterDetectiveScore")) || 0;
    const scoreGame2 = parseInt(localStorage.getItem("soundMatchScore")) || 0;
    const scoreGame3 = parseInt(localStorage.getItem("speedReadingScore")) || 0;

    // 2. จัดระเบียบตัวเลขคะแนนที่ได้ลงไปบนแท็ก HTML ตาราง
    document.getElementById("score-g1").textContent = `${scoreGame1} / 5`;
    document.getElementById("score-g2").textContent = `${scoreGame2} / 5`;
    document.getElementById("score-g3").textContent = `${scoreGame3} / 5`;

    // 3. ฟังก์ชันจัดเก็บกฎการแบ่งเกณฑ์คะแนนและกำหนดโค้ดสีฟอนต์ตามระดับความคล่องแคล่ว
    function evalStatus(score) {
        if (score >= 4) return { text: "🟢 ปกติ", color: "#10b981" };      // สีพาสเทลเขียวสดชื่น
        if (score >= 3) return { text: "🟡 เฝ้าระวัง", color: "#f59e0b" };  // สีส้มอมเหลืองนวล
        return { text: "🔴 เสี่ยงสูง", color: "#ef4444" };                  // สีพาสเทลแดงแจ้งเตือน
    }

    const resG1 = evalStatus(scoreGame1);
    const resG2 = evalStatus(scoreGame2);
    const resG3 = evalStatus(scoreGame3);

    // ประทับข้อความสถานะและสีฟอนต์ที่อ้างอิงลงในตารางทีละช่อง
    const elG1 = document.getElementById("status-g1");
    elG1.textContent = resG1.text;
    elG1.style.color = resG1.color;
    
    const elG2 = document.getElementById("status-g2");
    elG2.textContent = resG2.text;
    elG2.style.color = resG2.color;

    const elG3 = document.getElementById("status-g3");
    elG3.textContent = resG3.text;
    elG3.style.color = resG3.color;

    // 4. คำนวณหาค่าสถิติร้อยละสะสมรวมทั้ง 3 ด่าน (คะแนนดิบเต็ม 15 แต้ม)
    const totalScore = scoreGame1 + scoreGame2 + scoreGame3;
    const overallAverage = Math.round((totalScore / 15) * 100);

    // อัปเดตตัวเลขผลลัพธ์ที่ท้ายตารางสรุป
    document.getElementById("avg-score").textContent = `${overallAverage}%`;

    // 5. ชี้เป้า Element ของกล่องดัชนีรวมและแถบกราฟเพื่อสร้างแอนิเมชันความไว
    const overallBar = document.getElementById("overall-bar");
    const overallCard = document.getElementById("overall-card");
    const overallStatus = document.getElementById("overall-status");
    const overallDesc = document.getElementById("overall-desc");
    const avgStatusText = document.getElementById("avg-status");

    // รันความกว้างของหลอดความก้าวหน้าตามสูตรเปอร์เซ็นต์จริง
    overallBar.style.width = `${overallAverage}%`;
    overallBar.textContent = `${overallAverage}%`;

    // ปรับเปลี่ยนพฤติกรรมความสวยงาม มู้ด แอนด์ โทน ของหน้าเว็บตามช่วงระดับความลื่นไหล
    if (overallAverage >= 80) {
        overallBar.style.backgroundColor = "#10b981";
        overallStatus.textContent = "🟢 ทักษะอยู่ในเกณฑ์ปกติ";
        overallStatus.style.backgroundColor = "#ecfdf5";
        overallStatus.style.color = "#10b981";
        overallCard.style.borderLeftColor = "#10b981";
        overallDesc.textContent = "ระบบประมวลผลคำศัพท์และภาษาของท่านทำงานได้ดีและมีความแม่นยำตามเกณฑ์มาตรฐานขั้นต้น";
        avgStatusText.textContent = "🟢 ปกติ";
        avgStatusText.style.color = "#10b981";
    } else if (overallAverage >= 53) {
        overallBar.style.backgroundColor = "#f59e0b";
        overallStatus.textContent = "🟡 ควรเฝ้าระวังและส่งเสริมเพิ่มเติม";
        overallStatus.style.backgroundColor = "#fffbeb";
        overallStatus.style.color = "#b45309";
        overallCard.style.borderLeftColor = "#f59e0b";
        overallDesc.textContent = "พบจุดติดขัดหรือจังหวะลังเลบางประการในการทดสอบบางด้าน แนะนำให้เปิดอ่านบทวิเคราะห์เพื่อเติมเต็มทักษะ";
        avgStatusText.textContent = "🟡 เฝ้าระวัง";
        avgStatusText.style.color = "#b45309";
    } else {
        overallBar.style.backgroundColor = "#ef4444";
        overallStatus.textContent = "🔴 แนะนำให้รับการประเมินเพิ่มเติม";
        overallStatus.style.backgroundColor = "#fef2f2";
        overallStatus.style.color = "#ef4444";
        overallCard.style.borderLeftColor = "#ef4444";
        overallDesc.textContent = "ระบบตรวจพบความท้าทายในหลายทักษะร่วมกัน แนะนำให้ทดลองใช้เครื่องมืออำนวยความสะดวกหรือปรึกษาผู้เชี่ยวชาญ";
        avgStatusText.textContent = "🔴 เสี่ยงสูง";
        avgStatusText.style.color = "#ef4444";
    }
}

// 🔊 ฟังก์ชันควบคุมปุ่มลำโพงอ่านออกเสียงข้อมูลบนหน้าสรุปผล
function toggleSummarySpeech() {
    if (!('speechSynthesis' in window)) {
        alert("เบราว์เซอร์นี้ไม่รองรับการอ่านออกเสียงข้อมูล");
        return;
    }

    // ถ้ากำลังพูดอยู่ -> กดซ้ำให้หยุดพูดทันที
    if (isSpeakingSummary) {
        window.speechSynthesis.cancel();
        isSpeakingSummary = false;
        return;
    }

    // ดึงข้อความสถานะและคำอธิบายปัจจุบันมาอ่านออกเสียงแบบไดนามิกส์
    const statusText = document.getElementById("overall-status").textContent;
    const descText = document.getElementById("overall-desc").textContent;
    const textToSpeak = `แดชบอร์ดสรุปผลทักษะการอ่าน ดัชนีระดับทักษะการอ่านโดยรวม ผลลัพธ์คือ ${statusText} ${descText}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "th-TH";

    utterance.onend = function() {
        isSpeakingSummary = false;
    };
    utterance.onerror = function() {
        isSpeakingSummary = false;
    };

    isSpeakingSummary = true;
    window.speechSynthesis.speak(utterance);
}