# Sitoloji Raporlama

GitHub Pages üzerinde çalışan, tarayıcıya otomatik kayıt yapan TİİAB ve diğer boyun sitolojileri raporlama yardımcısı.

## İki ayrı raporlama sayfası

### Tiroid

Excel dosyasındaki `tiiab` sayfası temel alınır.

- Bethesda tanı seçenekleri
- Yeterlilik
- Nükleer özellikler
- Kolloid
- Makrofaj
- Eşlik eden lenfositler ve diğer yapılar
- Hücre bloğu

### Diğer

Excel dosyasındaki `LAP` sayfası temel alınır. Tiroid formundan ayrı bir bileşendir.

- Önce örnek türü seçilir: Tiroid loju, Paratiroid veya LAP / Lenf nodu
- Bu sayfaya özgü tanı seçenekleri
- Yeterlilik
- Atipik hücre varlığı
- Kolloid
- Makrofaj
- Eşlik eden diğer yapılar
- Hücre bloğu

## Kullanım

- Bir karta tıklanınca seçenek aktif olur.
- Birden fazla metni bulunan karta tekrar tıklanınca sonraki metne geçilir.
- Son metinden sonra tekrar tıklanınca kart kapanır.
- Seçili kartlar belirgin yeşil görünür.
- Tümör ilişkili seçili kartlar kırmızı görünür.
- Seçili olmayan kartların zemini beyazdır.
- Hücre bloğu seçilmişse raporda `MİKROSKOPİ` altında tek satır olarak yer alır.
- Ek boyalar raporun iki boş satır altında otomatik eklenir.
- Her değişiklik `localStorage` içine otomatik kaydedilir.

## Yerel çalışma

```bash
npm install
npm run dev
```

## Derleme

```bash
npm run build
```

Derlenmiş dosyalar `dist` klasöründe oluşur.

## GitHub Pages

Depo adı `tiiab` için Vite base yolu `/tiiab/` olarak ayarlanmıştır. `.github/workflows/deploy.yml`, `main` veya `master` dalına yapılan her gönderimde projeyi derler ve `dist` klasörünü GitHub Pages'e yayınlar.

## v1.3 arayüz düzeni

- Yeni rapor, soldaki iki renkli **TİİAB / Diğer** ekleme çubuğundan oluşturulur.
- Mevcut raporun türü sonradan değiştirilmez; böylece seçimler yanlışlıkla silinmez.
- Canlı rapor daima bütün raporları gösterir.
- Solda seçilen rapor, canlı raporda renklenir ve otomatik olarak görünür konuma kayar.
- Raporların arasında ayraç çizgisi yerine yalnız bir boş satır bulunur.
