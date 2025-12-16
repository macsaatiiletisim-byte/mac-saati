// --- 1. TEMA YÖNETİMİ ---
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Kayıtlı temayı kontrol et
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
    if (toggleButton) toggleButton.innerText = '☀️';
}

// Butona tıklanınca temayı değiştir
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

// --- 2. HEADER TARİH (Sol Üstteki Güncel Tarih) ---
const headerDate = document.getElementById('headerDate');
if (headerDate) {
    const simdi = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    headerDate.innerText = `📅 ${simdi.toLocaleDateString('tr-TR', options)}`;
}

// Yardımcı Fonksiyon: Tarihi YYYY-AA-GG formatına çevirir
function yerelTarihString(dateObj) {
    const yil = dateObj.getFullYear();
    const ay = String(dateObj.getMonth() + 1).padStart(2, '0');
    const gun = String(dateObj.getDate()).padStart(2, '0');
    return `${yil}-${ay}-${gun}`;
}

// --- 3. MAÇ LİSTESİ VE GRUPLAMA ANA MANTIĞI ---
const macListesiContainer = document.getElementById('mac-listesi');

// LİG ÖNCELİK SIRALAMASI (Küçük sayı daha üstte çıkar)
const ligOnceligi = {
    'tr': 1,      // Süper Lig
    'world': 2,   // Milli Maçlar
    'ucl': 3,     // Şampiyonlar Ligi
    'uel': 4,     // Avrupa Ligi
    'uecl': 5,    // Konferans Ligi
    'eng': 6,     // İngiltere
    'esp': 7,     // İspanya
    'ita': 8,     // İtalya
    'ger': 9,     // Almanya
    'fra': 10     // Fransa
};

// LİG RENK KODLARI (Başlık ve Gün isimleri için)
const ligRenkleri = {
    'tr': '#d63031',    // Kırmızı
    'eng': '#6c5ce7',   // Mor
    'esp': '#f1c40f',   // Sarı
    'ger': '#e17055',   // Turuncu
    'ita': '#00b894',   // Yeşil
    'fra': '#0984e3',   // Mavi
    'ucl': '#2e86de',   // Koyu Mavi
    'uel': '#ff9f43',   // Açık Turuncu
    'uecl': '#1dd1a1',  // Açık Yeşil
    'world': '#636e72'  // Gri
};

// AY İSİMLERİ LİSTESİ (YENİ EKLENDİ! 📅)
// 0. indeks boş bırakıldı ki 1. ay Ocak olsun.
const ayIsimleri = ["", "OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN", "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK"];


if (macListesiContainer) {
    // JSON dosyasından verileri çek
    fetch('maclar.json')
        .then(response => response.json())
        .then(data => {
            // MAÇLARI SIRALA (Önce Lig Önceliği, Sonra Tarih/Saat)
            data.sort((a, b) => {
                const oncelikA = ligOnceligi[a.ligTuru] || 99;
                const oncelikB = ligOnceligi[b.ligTuru] || 99;

                if (oncelikA !== oncelikB) {
                    return oncelikA - oncelikB; // Lige göre sırala
                } else {
                    // Aynı ligde tarihi önce olanı üste al
                    const tarihSaatA = new Date(a.tarih + 'T' + a.saat);
                    const tarihSaatB = new Date(b.tarih + 'T' + b.saat);
                    return tarihSaatA - tarihSaatB;
                }
            });

            // Yükleniyor yazısını temizle
            macListesiContainer.innerHTML = ""; 

            let macVarMi = false;
            let sonBasilanLig = "";

            // Bugün ve Yarın tarihlerini hazırla
            const bugunTarihObj = new Date();
            const bugunString = yerelTarihString(bugunTarihObj);
            const yarinTarihObj = new Date();
            yarinTarihObj.setDate(yarinTarihObj.getDate() + 1);
            const yarinString = yerelTarihString(yarinTarihObj);

            const gunler = ["PAZAR", "PAZARTESİ", "SALI", "ÇARŞAMBA", "PERŞEMBE", "CUMA", "CUMARTESİ"];

            // HER BİR MAÇ İÇİN KART OLUŞTUR
            data.forEach(mac => {
                // Geçmiş maçları gösterme (Maç saatinden 2.5 saat sonrası)
                const macZamani = new Date(`${mac.tarih}T${mac.saat}`);
                const suAn = new Date();
                const macBitis = new Date(macZamani.getTime() + (2.5 * 60 * 60 * 1000));

                if (suAn > macBitis) return; // Maç bitmişse döngüden çık

                macVarMi = true;

                // --- TARİH VE GÜN HESAPLAMA (GÜNCELLENDİ) ---
                let gunMetni = "";
                // Tarihi parçala: "2025-12-19" -> ["2025", "12", "19"]
                let tarihParcalari = mac.tarih.split('-'); 
                let gunSayi = tarihParcalari[2]; // "19"
                let aySayi = parseInt(tarihParcalari[1]); // 12 (Sayıya çevir)

                // 🔥 YENİ: Sayısal tarihi SÖZLÜ tarihe çevir (Örn: 19 ARALIK)
                let sozluTarih = `${gunSayi} ${ayIsimleri[aySayi]}`;

                // Gün ismini belirle (BUGÜN, YARIN veya CUMA gibi)
                if (mac.tarih === bugunString) {
                    gunMetni = "BUGÜN";
                } else if (mac.tarih === yarinString) {
                    gunMetni = "YARIN";
                } else {
                    const d = new Date(tarihParcalari[0], tarihParcalari[1] - 1, tarihParcalari[2]);
                    gunMetni = gunler[d.getDay()];
                }
                // -------------------------------------------

                // Lig CSS sınıfını ve rengini belirle
                let ligClass = mac.ligTuru + '-league';
                let ligRengi = ligRenkleri[mac.ligTuru] || '#d63031'; 

                // Şifreli/Şifresiz rozetini hazırla
                let durumHTML = "";
                if (mac.durum === 'sifreli') {
                    durumHTML = '<span class="badge encrypted">🔒 ŞİFRELİ</span>';
                } else {
                    durumHTML = '<span class="badge free">🌍 ŞİFRESİZ</span>';
                }

                // Eğer yeni bir lige geçtiysek, lig başlığını ekle
                if (mac.lig !== sonBasilanLig) {
                    macListesiContainer.innerHTML += `
                        <div class="league-header ${ligClass}">
                            <h3>${mac.lig}</h3>
                        </div>
                    `;
                    // Lig açıklaması varsa ekle
                    if (mac.aciklama && mac.aciklama.trim() !== "") {
                        macListesiContainer.innerHTML += `
                            <div class="league-info-box">${mac.aciklama}</div>
                        `;
                    }
                    sonBasilanLig = mac.lig;
                }

                // MAÇ KARTINI OLUŞTUR (HTML)
                const htmlKart = `
                    <div class="match-card">
                        <div class="time-box">
                            <span class="hour">${mac.saat}</span>
                            <span class="date-numeric">${sozluTarih}</span>
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
                // Kartı listeye ekle
                macListesiContainer.innerHTML += htmlKart;
            });

            // Hiç maç yoksa mesaj göster
            if (!macVarMi) {
                macListesiContainer.innerHTML = '<div style="text-align:center; padding:50px; color:#999; font-size:15px;">Şu an için yayında maç bulunmuyor.<br>Daha sonra tekrar kontrol ediniz.</div>';
            }
        })
        .catch(error => {
            console.error('Veri çekme hatası:', error);
            macListesiContainer.innerHTML = '<div style="text-align:center; padding:20px; color:red;">Maçlar yüklenirken bir sorun oluştu.</div>';
        });
}