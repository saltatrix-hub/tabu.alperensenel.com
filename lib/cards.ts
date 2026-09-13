export type Card = { word: string; forbidden: string[]; category: string };

export const cards: Card[] = [
  { word:'Kahve', forbidden:['Fincan','İçmek','Kafein','Türk','Sıcak'], category:'Günlük Hayat' },
  { word:'Şemsiye', forbidden:['Yağmur','Islanmak','Açmak','Sap','Güneş'], category:'Günlük Hayat' },
  { word:'Asansör', forbidden:['Kat','Düğme','Yukarı','Aşağı','Bina'], category:'Günlük Hayat' },
  { word:'Uyku', forbidden:['Yatak','Gece','Rüya','Yorgun','Uyanmak'], category:'Günlük Hayat' },
  { word:'Tatil', forbidden:['Otel','Deniz','Yaz','Dinlenmek','Seyahat'], category:'Günlük Hayat' },
  { word:'Diş Fırçası', forbidden:['Macun','Ağız','Beyaz','Banyo','Temizlemek'], category:'Günlük Hayat' },
  { word:'Pizza', forbidden:['İtalya','Peynir','Dilim','Fırın','Hamur'], category:'Yemek' },
  { word:'Baklava', forbidden:['Tatlı','Fıstık','Şerbet','Gaziantep','Tepsi'], category:'Yemek' },
  { word:'Hamburger', forbidden:['Köfte','Ekmek','Fast food','Patates','Ketçap'], category:'Yemek' },
  { word:'Dondurma', forbidden:['Soğuk','Külah','Yaz','Erimek','Tatlı'], category:'Yemek' },
  { word:'Mantı', forbidden:['Yoğurt','Sarımsak','Hamur','Kayseri','Kaşık'], category:'Yemek' },
  { word:'Çay', forbidden:['Bardak','Demlik','İçmek','Sıcak','Rize'], category:'Yemek' },
  { word:'Futbol', forbidden:['Top','Gol','Maç','Hakem','Saha'], category:'Spor' },
  { word:'Basketbol', forbidden:['Pota','Top','Smaç','Beş','NBA'], category:'Spor' },
  { word:'Yüzme', forbidden:['Havuz','Su','Kulaç','Mayo','Deniz'], category:'Spor' },
  { word:'Boks', forbidden:['Eldiven','Ring','Yumruk','Nakavt','Dövüş'], category:'Spor' },
  { word:'Tenis', forbidden:['Raket','Top','Kort','Servis','File'], category:'Spor' },
  { word:'Maraton', forbidden:['Koşmak','Kilometre','Yarış','Atlet','Uzun'], category:'Spor' },
  { word:'Telefon', forbidden:['Aramak','Mesaj','Ekran','Cep','Akıllı'], category:'Teknoloji' },
  { word:'İnternet', forbidden:['Web','Bağlantı','Wi-Fi','Site','Online'], category:'Teknoloji' },
  { word:'Robot', forbidden:['Makine','Yapay zekâ','Metal','İnsan','Otomatik'], category:'Teknoloji' },
  { word:'Şifre', forbidden:['Giriş','Gizli','Harf','Hesap','Güvenlik'], category:'Teknoloji' },
  { word:'Bilgisayar', forbidden:['Klavye','Ekran','Fare','İşlemci','Laptop'], category:'Teknoloji' },
  { word:'Kulaklık', forbidden:['Müzik','Ses','Kulak','Bluetooth','Dinlemek'], category:'Teknoloji' },
  { word:'Astronot', forbidden:['Uzay','Roket','Ay','Kask','NASA'], category:'Genel Kültür' },
  { word:'Piramit', forbidden:['Mısır','Üçgen','Firavun','Taş','Mezar'], category:'Genel Kültür' },
  { word:'Pusula', forbidden:['Kuzey','Yön','İbre','Harita','Manyetik'], category:'Genel Kültür' },
  { word:'Volkan', forbidden:['Lav','Dağ','Patlamak','Ateş','Yanardağ'], category:'Genel Kültür' },
  { word:'Kütüphane', forbidden:['Kitap','Okumak','Sessiz','Raf','Ödünç'], category:'Genel Kültür' },
  { word:'Dedektif', forbidden:['Suç','Polis','İpucu','Gizem','Araştırmak'], category:'Genel Kültür' },
  { word:'Gitar', forbidden:['Tel','Müzik','Çalmak','Akort','Enstrüman'], category:'Sanat' },
  { word:'Tiyatro', forbidden:['Sahne','Oyuncu','Perde','Oyun','Seyirci'], category:'Sanat' },
  { word:'Heykel', forbidden:['Taş','Sanat','Yontmak','Müze','Heykeltıraş'], category:'Sanat' },
  { word:'Kamera', forbidden:['Fotoğraf','Çekmek','Lens','Video','Poz'], category:'Sanat' },
  { word:'Şarkı', forbidden:['Müzik','Söylemek','Ses','Söz','Melodi'], category:'Sanat' },
  { word:'Roman', forbidden:['Kitap','Yazar','Hikâye','Okumak','Sayfa'], category:'Sanat' },
];

export const categories = ['Genel', 'Günlük Hayat', 'Yemek', 'Spor', 'Teknoloji', 'Genel Kültür', 'Sanat'];

export function pickCard(category: string, excluded: number[] = []) {
  const eligible = cards.map((card, index) => ({ card, index })).filter(({ card, index }) =>
    (category === 'Genel' || card.category === category) && !excluded.includes(index),
  );
  const pool = eligible.length ? eligible : cards.map((card, index) => ({ card, index })).filter(({ index }) => !excluded.includes(index));
  return pool[Math.floor(Math.random() * pool.length)] ?? { card: cards[0], index: 0 };
}
