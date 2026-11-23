# Safahat Kuran — Marka dönüşümü ve sayfa mimarisi planı

**Durum:** 10 Kasım 2026 tarihli kullanıcı talebi; mevcut proje üzerinde doğrudan uygulama kapsamıdır. Eski ürün adı Mushafım Kuran’dır; mevcut içerik, hesaplar ve yerel okuma kayıtları korunarak arayüz Safahat Kuran markasına taşınacaktır.

## Uygulama yaklaşımı

Mevcut React 19, TypeScript, Vite, Express ve yönetilen MySQL yığını korunur. Yeni bir router bağımlılığı eklemek yerine tarayıcının History API’si ile açık URL rotaları, `pushState`/`popstate` ve ilk yüklemede `window.location.pathname` çözümlemesi kurulur. Express’in mevcut SPA fallback’i derin URL’leri `dist/index.html`’e, Vite ise geliştirme rotalarını uygulamaya döndürür. `public/manus-routes.json` kaynakta bulunan tüm sayfa rotalarıyla eş zamanlı tutulur.

| URL | Sayfa içeriği |
| --- | --- |
| `/` | Safahat Kuran karşılama ekranı; yeni logo, kısa giriş ve yalnızca burada gösterilen etkileşimli 3D Mushaf |
| `/kuran` | Temiz, Mushaf düzenine uygun metin okuyucu; sure, sayfa, cüz ve ayet seçimi; arama; canlı ayet vurgusu |
| `/meal` | Aynı doğrulanmış okuyucunun Türkçe meal görünümü; mevcut Diyanet meal verisiyle sınırlı, bağlı olmayan tefsir varmış gibi gösterilmez |
| `/dinle` | Kâri seçimi ve ayet takip vurgusuyla sesli dinleme görünümü |
| `/pratik` | Bağımsız kayıt-sonrası okuma pratiği; sure, sayfa/cüz ve ayet hedefi seçicileriyle seçili kaynağa bağlanır |
| `/akademi` | Mevcut ders, seviye testi ve ilerleme modülü |
| `/hafiz` | Mevcut doğrulanmış 604-sayfalı ezber/gizleme modülü |
| `/gunun-ayeti` | Günün ayeti ve duası için ayrı sayfa |
| `/kitapligim` | Kaldığım yer, favoriler ve isteğe bağlı hesap durumu |

Ortak navbar her rotada kalır; mobil hamburger, aktif sayfa durumu, klavye erişimi ve logo içerir. Her rota yalnızca kendine ait ana modülü render eder; 3D Mushaf Kur’an okuyucuya taşınmaz. Okuyucu `/kuran`’da odak noktasıdır; yardımcı tanıtım panelleri ve 3D bölüm burada görünmez. Aynı uygulama kökünde tutulan auth, ayet, ses, favori ve okuma konumu state’i route değişikliklerinde korunur. Uygulama başlığı ve açıklaması geçerli rotaya göre `document.title` ve HTML metadata’da Safahat Kuran adını taşır.

## Marka ve logo

Kullanıcının verdiği lacivert zemindeki altın “S” işareti değiştirilmeden kullanılacaktır. Site navbarında ve karşılama/hero alanında uygun optik ölçekte gösterilir; wordmark “Safahat Kuran” olur. `index.html`, favicon, erişilebilir adlar, footer, uygulama kopyası, README ve package adı güncellenir. `app.config.ts` içindeki `logoUrl` yeni logonun dayanıklı HTTPS CDN URL’si olarak düz string literal yapılır. Mevcut yerel depolama anahtarları ve veritabanı tabloları yalnızca marka değişikliği nedeniyle yeniden adlandırılmaz; böylece önceki cihaz konumları/favoriler ve kullanıcı hesapları kaybolmaz.

## Doğru 604 sayfa Mushaf mizanpajı, kelime senkronu ve Akademi

`/kuran` sayfasında sure/sayfa/cüz/ayet seçimi korunur. Ayet kimlikleri, her sayfanın kaynak sınırları ve Mushaf numaraları AlQuran Cloud `quran-uthmani`/page API’siyle doğrulanmaya devam eder. Görsel dizgi, sabit bir commit’ten alınan KFGQPC V1 604 sayfa satır verisini kullanır: sayfa JSON’u 1–604 sınırında, satır numaraları benzersiz/art arda, semantik satır tipleri tanınır; fiziksel kaynaktaki metin satırı sayısı her sayfa için korunur (Fâtiha gibi açılış sayfaları daha az satırlıdır). Sure başlığı/besmele satırları türlerine göre çizilir. QPC `word` Unicode parçaları satır/kelime yerleşimi için kullanılır; sayfa ayet kimlikleri, kelime konumları, birleştirilmiş normalleştirilmiş karakter dizileri ve metin sırası AlQuran Cloud ile çapraz doğrulanmadan gösterilmez. AlQuran Cloud asıl doğruluk kaynağıdır; QPC `qpcV1` özel font glyph’leri/fontları kullanılmaz veya dağıtılmaz. Ayetler kutulara bölünmez; tek çift çerçeveli fildişi sayfa içinde fiziksel satırlar ayrı satırlar olarak akıtılır. Besmele, API’deki açılış ayetinin doğrulanmış dört sözcüğünden ayrı bir fiziksel satır olarak çizilir. Sayfa ayet dizisi, satır sırası, kelime numarası ya da metin normalizasyon karşılaştırması başarısızsa tahmini/sırası belirsiz metin gösterilmez; kullanıcı yeniden deneyebilir.

Sesli kelime takibi yalnız zaman kodunun aynı kayıtla eşleştiği ses için açılır. Uygulama Apache-2.0 lisanslı `zaibihassan/Quranic-Recitation-Data` Yasser Al Dosari Murattal `.opus` sure akışını ve aynı sabit dataset revision’ından `.pb` zamanlamasını kullanır. Gerçek protobuf payload’ı (sure numarası, süre ve yinelenen ayet girdileri; ayet girdisinin yinelenen kelime segmentleri) çözülür; bir tabanlı ses kelime konumu, sure/ayet anahtarı ve milisaniye aralıkları çalışma anında doğrulanır. Yasser segmentlerinin normalleştirilmiş Arapça karakter aralığı, AlQuran Cloud’dan gelen ekranda gösterilen doğrulanmış sözcük aralığıyla kesiştirilerek fiziksel sayfadaki doğru kelime parçasına bağlanır; iki kaynağın boşluk/sözcük bölme biçiminin aynı olduğu varsayılmaz. Zaman aralığı kapsandığında yalnız eşleşen kelime altın vurgulanır. Eşleşen Yasser kaydında ayet/kelime seçimi doğru segmente gider; kelime tıklaması ilgili kelime zamanını açar. Segmenti olmayan birkaç sözcükte yanlış bir kelime tahmin edilmez ve ayet takibi sürer. Diğer kâri kayıtları ve eski Yasser MP3Quran sürümü korunur; kelime kodu sağlamadıklarında açıkça ayet düzeyinde kalır. Dinamik ses/zaman verisi sabit revision HTTPS Hugging Face URL’lerinden gelir; host doğrulamasından geçer; hata olursa oynatıcı hata durumunu gösterir.

Akademi `/akademi` içinde mevcut seviye testi, kaynaklı ders notları, videolar, sınavlar ve kullanıcı hesabına otomatik ilerleme kaydı korunur. Kartlar açık modül başlıkları altında yeniden düzenlenir: **Harf ve Mahreç Bilgisi**, **Harekeler ve Uzatmalar**, **Tecvid Esasları**, ardından **Akıcı Okuyuş ve Ezber**. Her modülde tamamlanan / toplam ders ve görsel ilerleme çubuğu görünür. Tamamlama, mevcut sunucu tarafından %80 eşiğine göre onaylanan ders geçişinden otomatik kaydedilir; guest kullanıcılar müfredat/kaynakları görebilir ama kişisel ilerleme için isteğe bağlı hesap gerekir. Yeni DB şeması veya ortak üretim verisine yazan doğrulama kaydı eklenmez.

Oturumda daha önce çözülen davranış değişmez: HttpOnly, HTTPS `SameSite=None; Secure; Partitioned` oturum; güvenli CSRF; `/api/auth/me` geçici/bozuk yanıtlarında doğrulanamayan oturumun açık kalması; route ve reload sonrasında ortak kök auth state’i. Bu kapsam session cookie veya üyelik modelini değiştirmez.

## Kayıt isteğinin kaynak doğrulaması

Mevcut istemci her API isteğine `X-App-Origin` ekliyor, sunucu ise bu değeri tarayıcının yönettiği `Origin` ile birebir karşılaştırıyor. Preview/proxy veya alan adı dönüşümünde iki origin farklı biçimde iletilirse `İstek kaynağı doğrulanamadı` reddi oluşabilir. Ön yüz mutasyonlarında (POST/PUT/PATCH/DELETE) `X-App-Origin` başlığını göndermeyi bırakır; tarayıcının gerçek `Origin` başlığı ve mevcut `X-CSRF-Token` kullanılır. GET/HEAD için Origin olmayabildiğinden uygulama kaynağı ipucu korunur. Backend normalizasyonu ve hata kodları bu davranışla hizalanır; credential’lı aynı-origin göreli `/api/...` çağrıları korunur, `Access-Control-Allow-Origin: *` veya CSRF’yi gevşeten bir bypass eklenmez. Uygulama oturum çerezi public HTTPS Preview için `SameSite=None; Secure` olarak kalır. Güvenlik/diagnostic başlıklarında Preview iframe’ini bozan `X-Frame-Options` ya da dar `frame-ancestors` politikası eklenmez.

## Kalıcı oturum ve bütünlüklü basılı Mushaf sayfası — 11 Kasım 2026

Yerel e-posta/parola oturumu aynı-origin göreli API çağrıları ve `credentials: include` ile yürütülür. Uygulamaya özel `safahat_app_session` HttpOnly JWT çerezi yedi günlük ömrünü korur; bu ad Preview’in ayrı `webdev_app_session` platform çereziyle çakışmaz. JWT anahtarı mevcut platform sırrından amaç-ayrımlı HMAC ile türetilir; issuer/audience ve proje kimliği doğrulanır. Public HTTPS’te `SameSite=None; Secure; Partitioned` (CHIPS) kullanılır, düz HTTP yerel geliştirmede `SameSite=Lax` kalır. CSRF double-submit çerezi aynı HTTPS bölümlemesini kullanır ve her mutasyonda token karşılaştırması korunur. Tarayıcıda localStorage’a oturum JWT’si yazılmaz; wildcard CORS veya CSRF bypass eklenmez. Başlangıç `/api/auth/me` isteği 5 saniyelik zaman aşımıyla en çok üç kez yeniden denenir; ağ/sunucu hatası doğrulanamayan oturum durumudur, kimliği veya CSRF bilgisini silmez ve hesap düğmesinde manuel yeniden deneme sunar. Kimlik yalnızca başarılı yanıtta açıkça `user: null` geldiğinde temizlenir. Başlangıçta doğrulanan kimlik, ayrı `/api/account` veya eşitleme arızası yüzünden de silinmez. Login mevcut modülde kalır ve ortak App state’i `/akademi`, `/hafiz`, `/kuran` SPA rotalarında korunur.
`/api/auth/me` 2xx içeriği çalışma anında doğrulanır: CSRF değeri biçimce geçerli olmalı ve `user` ya açık `null` ya da beklenen alanlara sahip kullanıcı nesnesi olmalıdır; eksik/bozuk gövde başarısız doğrulama sayılır ve kimliği silmez.

`/kuran`, `/meal` ve `/dinle` okuyucusu tek sureyi art arda kutular halinde göstermeyecek. Ana metin, sabit 604-sayfa KFGQPC satır dizgisinin gerçek satır akışını ve sayfaya özgü metin satırı sayısını korur; QPC Unicode kelime parçaları AlQuran Cloud Uthmani sayfa/ayet dizisiyle doğrulanır ve ayet sonu altın durak işaretleri inline kalır. Fildişi sayfa çift çizgili klasik çerçeve, üst bilgisi ve sayfa altlığı taşır. Sure/cüz/sayfa/ayet seçimi geçerli hedefin ait olduğu sayfayı açar; birden çok sureye taşan sayfa bölümleri doğrulanmış sure içeriğiyle eşleştirilir. Arapça dışı meal/okunuş fiziksel satır akışından ayrı, sürekli metin olarak sunulur. Yasser kelime zaman koduna sahip aynı kayıt için aktif Arapça kelime vurgulanır; manuel seçim ve diğer kayıtlarda en azından etkin ayet belirgin ve sayfa içinde görünür tutulur.

## Proje yapısı

- `src/App.tsx`: ortak navbar, URL/History API yönlendirmesi, başlığa göre içerik seçimi, global veri/hesap/ses state’i, doğrulanmış 604 sayfa Mushaf akışı ve bölüm navigasyonu.
- `src/App.css`: marka, rota içi temiz yerleşim, klasik çerçeveli Mushaf sayfası, satır akışı, etkin kelime/ayet ve responsive navbar stilleri.
- `src/data.ts`: AlQuran Cloud veri/doğrulama, sure/sayfa/cüz gezinmesi ve metin yükleyicileri.
- `src/quranText.ts`: AlQuran Cloud ayet sözcükleri için görüntü metnini değiştirmeyen Uthmani normalizasyonu ve açılış besmelesi ayrımı.
- `src/mushafLayout.ts`: 604 sayfalık KFGQPC V1 satır/kelime konum verisi yükleme, kaynak payload/satır/konum biçimi ve AlQuran Cloud sayfa sırası çapraz doğrulaması.
- `src/wordTiming.ts`: Apache-2.0 Yasser sure sesini/protobuf segmentlerini çözme, kaynak host kontrolü, Uthmani karakter aralığı ve kelime zaman eşleme.
- `src/Academy.tsx`, `src/academyData.ts`, `src/Academy.css`: kaynaklı müfredat ve sınavları koruyarak modül başlıkları, görsel ders ilerlemesi, otomatik sunucu kaydı ve oturum kimliğine göre eski ilerlemeyi ayırma.
- `src/Hafiz.tsx`, `src/RecitationPractice.tsx`: mevcut bağımsız özellik bileşenleri; kendi sayfa rotalarında kullanılır.
- `src/account.ts`: aynı-origin API çağrıları, GET/HEAD uygulama-origin ipucu ve mutasyonlarda tarayıcı `Origin` + CSRF başlığı.
- `server/api.ts`: mevcut kayıt/giriş/CSRF ve hesap API’leri; güvenli origin ayrıştırma, Preview için HTTPS CHIPS oturum/CSRF çerezleri ve yerel HTTP ayrımı.
- `server/index.ts`: mevcut `/api` sunumu ve SPA fallback; derin route isteklerini frontend’e döndürür.
- `public/manus-routes.json`: `/`, `/kuran`, `/meal`, `/dinle`, `/pratik`, `/akademi`, `/hafiz`, `/gunun-ayeti`, `/kitapligim` sayfa ilanları.
- `index.html`, `app.config.ts`, `package.json`, proje README: site adı, ikon ve platform marka metadata’sı.

## Tasarım yönü

**Tasarım hareketi:** Osmanlı tezhip/Medine Mushaf dinginliğini çağdaş bir editoryal dijital ürüne dönüştür.

**Temel ilkeler:** Okumada sade odak; kutsal metinde kaynak görünürlüğü; misafir erişiminde sürtünmesizlik; her ekranda erişilebilir gezinme.

**Renk felsefesi:** Derin lacivert sükûnet ve kurumsal zemindir; kullanıcı logosundaki altın S yön ve değer vurgusudur; okuyucu sayfasındaki fildişi ile koyu hat uzun süreli okunabilirlik sağlar. Aktif ayette ölçülü altın vurgu kullanılır.

**Yerleşim paradigması:** URL’ye göre tek ana görev gösteren sayfalar. Ana sayfa marka/3D karşılama, `/kuran` ise promosyon ve görsel kalabalıktan arındırılmış bir Mushaf okuma yüzeyidir. Navigasyon tüm sayfalarda aynı üst menüdedir.

**İmza öğeleri:** Altın S işaretli lacivert rozet; ince tezhip/geometrik çizgiler; aktif ayette zarif altın kenar/zemin.

**Etkileşim ve animasyon:** Modül değişimi gerçek URL’yi günceller ve geri/ileri düğmelerini destekler; geçişler 180–240 ms, `prefers-reduced-motion` ile sadeleşir. Navigasyon linkleri mobil menüyü kapatır; sure/sayfa/cüz/ayet değişiminde hedef metin anında doğrulanmış kaynağa göre yüklenir.

**Tipografi sistemi:** Arayüzde Manrope ve sistem sans-serif yedeği; Arapça metinde Amiri; başlıklar orta ağırlık ve dengeli, okuyucu Arapça metni geniş satır aralığı ve yüksek kontrastla sunar.

**Marka özü:** “Safahat Kuran”, her yaştan okurun Kur’an’ı okuyup dinlemesi ve öğrenmesi için sakin, doğrulanabilir bir dijital rehberdir. Kişilik: vakur, anlaşılır, güvenilir.

**Marka sesi:** Sade, yargısız ve yönlendirici. Örnekler: “Dilediğiniz sure, sayfa veya cüzden devam edin.” “Bir safha daha, kendi ritminizde.”

**Wordmark ve logo:** Kullanıcının sağladığı altın “S” işareti lacivert zeminle korunur; yanında özel hiyerarşili “Safahat Kuran” wordmark’ı kullanılır.

**İmza marka rengi:** Safahat laciverti `#0b192c`; ikincil ayırt edici vurgu logo altınıdır.

## Önceki kapsamdan korunan kararlar

- Kur’an metni için AlQuran Cloud `quran-uthmani`, Diyanet meal, 114 sure/6.236 ayet ve 1–604 standart sayfa sıra/doğrulama kontrolleri korunur. Yeni istek doğrultusunda KFGQPC V1 sayfa satır/kelime yerleşimi ayrıca doğrulanmış satır mizanpajı olarak eklenir; QPC fontları dahil edilmez.
- Ana okuma, arama, meal ve ses misafirlere açıktır. Yerel e-posta/parola üyeliği isteğe bağlı kalır; önceki veritabanı ve localStorage verisi silinmez.
- Yasser Al-Dosari, MP3Quran kayıt/timing’i ile; Akademi kaynaklı not/video ve ilerleme; Hafız metin gizleme/benzerlik adayları; kayıt-sonrası ses pratiği, kullanıcının onayladığı önceki sınırlar dahilinde korunur.
- Yeni özel domain veya DNS değişikliği yapılmaz; göreli linkler mevcut Preview/yayın hostunda çalışır. Örnek `safahatkuran.com` ancak site o domainde sunuluyorsa aynı path’leri kullanır.
