# TİİAB Raporlama — Yapay Zekâ ve Bakım Yönergeleri

Bu dosya, bu depoda gelecekte kod değiştirecek yapay zekâ araçları ve geliştiriciler için **ilk okunması gereken sözleşmedir**.

## Değişiklikten önce

1. Bu dosyanın tamamını oku.
2. `src/lib/report.ts`, `src/data/reportTemplates.ts`, `src/lib/warnings.ts` ve ilgili editör bileşenlerini incele.
3. Mevcut davranışı değiştirmeden önce `npm test` çalıştır.
4. Değişiklikten sonra hem `npm test` hem `npm run build` çalıştır.
5. Rapor metni değişiyorsa `src/lib/report.test.ts` içindeki sözleşme testlerini güncelle veya yeni test ekle.

## Uygulamanın amacı

React + TypeScript + Vite ile hazırlanmış, tarayıcıda çalışan sitoloji raporlama aracıdır. İki rapor modu vardır:

- `tiiab`: Tiroid ince iğne aspirasyon biyopsisi
- `lap`: “Diğer” başlığı altında lenf nodu, tiroid loju, paratiroid ve serbest örnek yerleri

Birden fazla rapor sekmesi oluşturulabilir. Sağ panel bütün raporların canlı ön izlemesini gösterir. Veriler `localStorage` içinde saklanır.

## Kritik rapor metni sözleşmesi

Aşağıdaki kurallar kullanıcı tarafından özellikle belirlenmiştir ve açık istek olmadan değiştirilmemelidir:

1. Tanı, örnek satırının devamında yer alır; ayrı `TANI` başlığı yoktur.
2. `MİKROSKOPİ` başlığı kullanılmaz.
3. Her mikroskopi satırı tam **3 boşluk** ve tire ile başlar:

   ```text
      - Yeterlilik: ...
   ```

4. Aynı mikroskopi başlığında birden fazla bulgu:
   - nokta nokta ayrı cümle yapılmaz,
   - virgülle tek cümlede birleştirilir,
   - ilk ifade büyük harfle başlar,
   - sonraki ifadeler cümle düzeninde küçük harfle devam eder,
   - satır yalnızca bir noktayla biter,
   - kısaltmalar ve kodlar korunur.
5. Rapor blokları arasında tam **1 boş satır** bulunur.
6. Son rapor ile `EK BOYALAR` arasında tam **3 boş satır** bulunur; kodda bu dört `\n` karakteridir.
7. `MALİGNİTE YÖNÜNDEN KUŞKULU SİTOLOJİ` ve `MALİGN SİTOLOJİ` tamamen büyük harfle kalır.
8. Kullanıcının serbest metni de mikroskopi satırının aynı noktalama düzenine katılır.
9. Uyarı/öneri metinleri kopyalanan patoloji raporuna eklenmez.
10. Tek rapor/örnek varsa rapor satırında ne `1-` sıra numarası ne de `(Örnek NO:1)` alanı kullanılır.
11. İki veya daha fazla örnek varsa her rapor `1-`, `2-` biçiminde başlar ve `(Örnek NO:1)`, `(Örnek NO:2)` alanları kullanılır.
12. Elle yazılan alınma yeri tek örnekte de korunur; yalnız sıra ve Örnek NO bölümleri kaldırılır.

Tek örnek — standart yer:

```text
Lenf nodu: Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma: Nondiagnostik Sitoloji.
   - Yeterlilik: Lenfosit yoktur, epitelyal hücre yoktur.
   - Atipik hücre varlığı: Atipik hücre yoktur.
   - Kolloid: Yok.
   - Makrofaj: Yok.
   - Eşlik eden diğer yapılar: Yok.
```

Tek örnek — elle yazılmış alınma yeri:

```text
("Sağ servikal seviye 3") Sıvı bazlı sitoloji ve ince iğne aspirasyon biyopsisi, yayma: ...
```

Çoklu örnek:

```text
1- (Örnek NO:1) Lenf nodu: ...

2- (Örnek NO:2) Tiroid; ...
```

## Sayfa ve arayüz sözleşmesi

- Üst araç çubuğunda sıfırlama, yeni TİİAB, yeni Diğer, rapor sekmeleri, boya sayısı ve silme bulunur.
- `Raporu sıfırla` doğrudan çalışır; onay penceresi veya geri alma eklenmemiştir.
- Rapor sekmesinde:
  - mikroskopi tamamlanınca `✓`,
  - çelişkili seçim varsa sarı `⚠` görünür,
  - araç ipucu eksik başlıkları ve önerileri gösterir.
- Sağ canlı ön izleme tüm raporları birlikte gösterir.
- Yalnız `Tümünü kopyala` ana kopyalama eylemidir.
- “Ek mikroskopik bulgular” bölümü kapalı başlayan, isteğe bağlı ve çok seçimli kutudur; raporun tamamlanma kontrolüne dahil değildir.
- Tasarım yoğun ve kompakt kalmalıdır; yeni seçenek veya panel eklerken ekranı gereksiz büyütme.
- Örnek yeri için mevcut elle yazılabilir alanlar korunmalıdır.

## Tanı listesi kuralları

### TİİAB

Bethesda tanıları ve mevcut büyük harfli malign tanılar korunmalıdır.

### Diğer

Tanı listesi sade tutulur. Şu genel seçenekler kullanılır:

- Nondiagnostik Sitoloji
- Benign Sitoloji
- Lenf nodu içeriği ile uyumlu
- Önemi belirsiz atipi
- Kist içeriği
- MALİGNİTE YÖNÜNDEN KUŞKULU SİTOLOJİ
- MALİGN SİTOLOJİ

Şunlar tanı listesinden çıkarılmıştır ve tekrar eklenmemelidir:

- Tirosit grupları
- Paratiroid benzeri hücre grupları
- Tiroid papiller karsinom metastazı ile uyumlu

“Diğer” tanıları seçilen örnek yerine göre yalnızca sıralanabilir; seçenekler gizlenmez veya otomatik seçilmez.

## NDS kısayolları

TİİAB NDS seçimleri:

```ts
{
  'tiiab-2-E2': 0,
  'tiiab-3-E3': 0,
  'tiiab-4-E4': 0,
  'tiiab-5-E5': 0,
  'tiiab-6-E6': 0,
  'tiiab-7-E7': 0,
}
```

Diğer NDS seçimleri:

```ts
{
  'LAP-2-E2': 0,
  'LAP-3-E3': 0,
  'LAP-3-M3': 1,
  'LAP-4-E4': 0,
  'LAP-5-E5': 0,
  'LAP-6-E6': 0,
  'LAP-7-E7': 0,
}
```

## Çelişki önerileri

`src/lib/warnings.ts` yalnız öneri üretir:

- seçim silmez,
- rapor oluşturmayı veya kopyalamayı engellemez,
- rapor metnine girmez.

Başlıca kontroller:

- benign tanı + malignite ilişkili mikroskopi,
- malign/kuşkulu tanı + “atipik hücre yoktur”,
- aynı bölümde “Yok” + pozitif bulgu,
- lenfosit, epitelyal hücre veya tirosit için var/yok birlikteliği.

## Boya sayısı

Otomatik ek boya sayısı:

- 1 örnek: 3
- 2 örnek: 6
- 3 örnek: 9
- 4 ve üzeri: 10

Kullanıcı manuel sayı girerse manuel değer önceliklidir.

## Klavye kısayolları

- `Alt + T`: yeni TİİAB
- `Alt + D`: yeni Diğer
- `Alt + N`: NDS
- `Ctrl/Cmd + Shift + C`: tümünü kopyala

Input, textarea, select veya düzenlenebilir metin alanında yazarken kısayollar tetiklenmemelidir.

## Temel dosyalar

- `src/App.tsx`: ana durum, rapor sekmeleri, kısayollar, tamamlanma ve uyarı göstergeleri
- `src/data/reportTemplates.ts`: seçeneklerin hazırlanması ve iki rapor şablonu
- `src/data/sourceData.json`: kaynak seçenek verisi
- `src/lib/report.ts`: rapor metni ve boya metni üretimi
- `src/lib/warnings.ts`: engellemeyen çelişki önerileri
- `src/lib/storage.ts`: başlangıç durumu, yerel saklama ve eski verilerin göçü
- `src/lib/report.test.ts`: rapor sözleşmesinin otomatik testleri
- `src/components/ThyroidEditor.tsx`: TİİAB editörü
- `src/components/OtherEditor.tsx`: Diğer editörü ve örnek yerine göre tanı sıralaması
- `src/components/OptionalMicroscopySection.tsx`: isteğe bağlı ek mikroskopi kutusu
- `.github/workflows/deploy.yml`: test, derleme ve GitHub Pages yayını

## Zorunlu doğrulama

```bash
npm install
npm test
npm run build
```

Test başarısızsa rapor biçimi veya klinik davranış sözleşmesi bozulmuş olabilir. Sorunu anlamadan testi silme, gevşetme veya dağıtımı test dışı bırakma.
