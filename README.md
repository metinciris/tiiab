# TİİAB / LAP / Paratiroid Raporlama

Excel tablosundaki `tiiab` ve `LAP` metinlerinden oluşturulmuş, tarayıcıda çalışan React + TypeScript raporlama yardımcısıdır.

## Özellikler

- TİİAB, LAP ve ayrı Paratiroid sekmesi
- Bir vaka içinde birden fazla İİAB alanı
- Tek tıklamayla seçim; çok seçenekli kartlarda tıklayarak seçenekler arasında dolaşma
- Tanı satırında tek seçim, mikroskopi satırlarında çoklu seçim
- Tümör ilişkili seçeneklerde kırmızı görsel uyarı
- Düz yazı rapor çıktısı ve tek tuşla panoya kopyalama
- Her alanı ayrı kopyalama, sonraki alana geçme ve tüm raporu birlikte kopyalama
- Ek boya adedini otomatik hesaplama: 1→3, 2→6, 3→9, 4+→10
- Her tıklamada `localStorage` içine otomatik kayıt
- JSON yedek indirme ve geri yükleme
- İlk çevrim içi açılıştan sonra temel çevrim dışı kullanım için servis çalışanı
- GitHub Actions ile otomatik GitHub Pages yayını

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

Üretim kontrolü:

```bash
npm run build
npm run preview
```

## GitHub Pages'e yayınlama

1. GitHub'da boş bir depo oluşturun.
2. Bu klasörün içeriğini deponun ana dizinine yükleyin.
3. Varsayılan dalın `main` olduğundan emin olun.
4. **Settings → Pages → Build and deployment → Source** alanında **GitHub Actions** seçin.
5. `main` dalına her gönderimde `.github/workflows/deploy.yml` uygulamayı derleyip yayınlar.

`vite.config.ts` içinde `base: './'` kullanıldığı için depo adını ayrıca yazmanız gerekmez.

## Metinleri düzenleme

- Excel'den çıkarılmış ham metinler: `src/data/sourceData.json`
- Tanı eşleştirmeleri, kırmızı kutu anahtarları ve Paratiroid filtresi: `src/data/reportTemplates.ts`
- Raporun düz yazı biçimi ve ek boya metni: `src/lib/report.ts`

## Veri güvenliği

Uygulama sunucuya hasta veya rapor verisi göndermez. Kayıtlar yalnızca kullanılan tarayıcının yerel depolamasında tutulur. Tarayıcı verileri silinirse kayıtlar da silinir; bu nedenle uzun süreli saklama için **Yedek indir** kullanılmalıdır.

## Sayfa açılmıyorsa

1. Depoda `Settings > Pages` bölümüne girin.
2. `Build and deployment > Source` alanını `GitHub Actions` seçin.
3. `Actions` sekmesinde `Deploy GitHub Pages` iş akışını açın ve `Run workflow` düğmesine basın.
4. Yeşil tamamlandıktan sonra uygulamayı şu adresten açın:
   `https://metinciris.github.io/tiiab/`

Dosyaların depo kökünde bulunması gerekir. `package.json`, `src`, `.github` ve `vite.config.ts` başka bir üst klasörün içinde kalmamalıdır.
