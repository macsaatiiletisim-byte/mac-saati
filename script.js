// --- 1. TEMA YÖNETİMİ ---
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (toggleButton) toggleButton.innerText = '☀️';
}

if (toggleButton) {
    toggleButton.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            toggleButton.innerText = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            toggleButton.innerText = '🌙';
        }
    });
}

// --- 2. HEADER TARİH ---
const headerDate = document.getElementById('headerDate');
if (headerDate) {
    const simdi = new Date();
    headerDate.innerText = `📅 ${simdi.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}`;
}

function yerelTarihString(dateObj) {
    const yil = dateObj.getFullYear();
    const ay = String(dateObj.getMonth() + 1).padStart(2, '0');
    const gun = String(dateObj.getDate()).padStart(2, '0');
    return `${yil}-${ay}-${gun}`;
}

// --- 3. MAÇ LİSTESİ VE GRUPLAMA ---
const macListesiContainer = document.getElementById('mac-listesi');

// LİG ÖNCELİK SIRALAMASI
const ligOnceligi = { 'tr': 1, 'world': 2, 'ucl': 3, 'uel': 4, 'uecl': 5, 'eng': 6, 'esp': 7, 'ita': 8, 'ger': 9, 'fra': 10 };
// LİG RENK KODLARI
const ligRenkleri = { 'tr': '#d63031', 'eng': '#6c5ce7', 'esp': '#f1c40f', 'ger': '#e17055', 'ita': '#00b894', 'fra': '#0984e3', 'ucl': '#2e86de', 'uel': '#ff9f43', 'uecl': '#1dd1a1', 'world': '#636e72' };

if (macListesiContainer) {
    fetch('maclar.json')
        .then(response => response.json())
        .then(data => {
            data.sort((a, b) => {
                const oncelikA = ligOnceligi[a.ligTuru] || 99;
                const oncelikB = ligOnceligi[b.ligTuru] || 99;
                if (oncelikA !== oncelikB) return oncelikA - oncelikB;
                return new Date(a.tarih + 'T' + a.saat) - new Date(b.tarih + 'T' + b.saat);
            });

            // --- DÜZELTME BURADA: LİSTEYİ TEMİZLE ---
            macListesiContainer.innerHTML = ""; 
            // ----------------------------------------

            let macVarMi = false;
            let sonBasilanLig = "";
            const bugunTarihObj = new Date();
            const bugunString = yerelTarihString(bugunTarihObj);
            const yarinTarihObj = new Date();
            yarinTarihObj.setDate(yarinTarihObj.getDate() + 1);
            const yarinString = yerelTarihString(yarinTarihObj);
            const gunler = ["PAZAR", "PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ"];

            data.forEach(mac => {
                const macZamani = new Date(`${mac.tarih}T${mac.saat}`);
                const suAn = new Date();
                const macBitis = new Date(macZamani.getTime() + (2.5 * 60 * 60 * 1000));
                if (suAn > macBitis) return;

                macVarMi = true;
                let gunMetni = "";
                let tarihParcalari = mac.tarih.split('-'); 
                let sayisalTarih = `${tarihParcalari[2]}.${tarihParcalari[1]}`; 
                if (mac.tarih === bugunString) gunMetni = "BUGÜN";
                else if (mac.tarih === yarinString) gunMetni = "YARIN";
                else { const d = new Date(tarihParcalari[0], tarihParcalari[1] - 1, tarihParcalari[2]); gunMetni = gunler[d.getDay()]; }

                let ligClass = mac.ligTuru + '-league';
                let ligRengi = ligRenkleri[mac.ligTuru] || '#d63031'; 
                let durumHTML = mac.durum === 'sifreli' ? '<span class="badge encrypted">🔒 ŞİFRELİ</span>' : '<span class="badge free">🌍 ŞİFRESİZ</span>';

                if (mac.lig !== sonBasilanLig) {
                    macListesiContainer.innerHTML += `<div class="league-header ${ligClass}"><h3>${mac.lig}</h3></div>`;
                    
                    if (mac.aciklama && mac.aciklama.trim() !== "") {
                        macListesiContainer.innerHTML += `<div class="league-info-box">${mac.aciklama}</div>`;
                    }

                    sonBasilanLig = mac.lig;
                }

                const htmlKart = `
                    <div class="match-card">
                        <div class="time-box">
                            <span class="hour">${mac.saat}</span>
                            <span class="date-numeric">${sayisalTarih}</span>
                            <span class="day" style="color:${ligRengi};">${gunMetni}</span>
                        </div>
                        <div class="match-info">
                            <div class="teams-wrapper">
                                <span class="team-name home">${mac.evSahibi}</span>
                                <span class="vs-badge">VS</span>
                                <span class="team-name away">${mac.deplasman}</span>
                            </div>
                            <div class="channel-wrapper">
                                <span class="channel-name">📺 ${mac.kanal}</span>
                                ${durumHTML}
                            </div>
                        </div>
                    </div>
                `;
                macListesiContainer.innerHTML += htmlKart;
            });

            if (!macVarMi) {
                macListesiContainer.innerHTML = '<div style="text-align:center; padding:50px; color:#999; font-size:15px;">Şu an için yayında maç bulunmuyor.<br>Daha sonra tekrar kontrol ediniz.</div>';
            }
        })
        .catch(error => console.error('Hata:', error));
}