export type CardMode = 'classic' | 'sacmala';
export type CardKind = CardMode | 'bonus';
export type Card = { word:string; forbidden:string[]; category:string; kind:CardKind; multiplier:1|3 };

type Concept = { word:string; forbidden:[string,string,string,string]; category:string };
const CONCEPTS:Concept[] = [
  {word:'Pusula',forbidden:['Kuzey','Yön','İbre','Harita'],category:'Genel Kültür'}, {word:'Piramit',forbidden:['Mısır','Firavun','Üçgen','Mezar'],category:'Genel Kültür'},
  {word:'Rönesans',forbidden:['Sanat','Avrupa','Yeniden','Leonardo'],category:'Genel Kültür'}, {word:'Göbeklitepe',forbidden:['Şanlıurfa','Tapınak','Tarih','Kazı'],category:'Genel Kültür'},
  {word:'Truva Atı',forbidden:['Çanakkale','Tahta','Savaş','Hile'],category:'Genel Kültür'}, {word:'İpek Yolu',forbidden:['Ticaret','Çin','Kervan','Asya'],category:'Genel Kültür'},
  {word:'Rosetta Taşı',forbidden:['Mısır','Yazı','Hiyeroglif','Çözmek'],category:'Genel Kültür'}, {word:'Magna Carta',forbidden:['İngiltere','Kral','Hak','Belge'],category:'Genel Kültür'},
  {word:'Matbaa',forbidden:['Gutenberg','Kitap','Basmak','Harf'],category:'Genel Kültür'}, {word:'Demokrasi',forbidden:['Oy','Halk','Seçim','Yönetim'],category:'Genel Kültür'},
  {word:'Mitoloji',forbidden:['Tanrı','Efsane','Antik','Kahraman'],category:'Genel Kültür'}, {word:'Fosil',forbidden:['Taş','Dinozor','Kalıntı','Kazı'],category:'Genel Kültür'},
  {word:'Kara Delik',forbidden:['Uzay','Işık','Çekim','Yıldız'],category:'Genel Kültür'}, {word:'Samanyolu',forbidden:['Galaksi','Uzay','Yıldız','Dünya'],category:'Genel Kültür'},
  {word:'Güneş Tutulması',forbidden:['Ay','Gökyüzü','Karanlık','Güneş'],category:'Genel Kültür'}, {word:'Yerçekimi',forbidden:['Newton','Düşmek','Dünya','Kuvvet'],category:'Genel Kültür'},
  {word:'DNA',forbidden:['Gen','Hücre','Kalıtım','Sarmal'],category:'Genel Kültür'}, {word:'Fotosentez',forbidden:['Bitki','Güneş','Oksijen','Yaprak'],category:'Genel Kültür'},
  {word:'Ekosistem',forbidden:['Doğa','Canlı','Çevre','Denge'],category:'Genel Kültür'}, {word:'Yanardağ',forbidden:['Lav','Patlama','Dağ','Ateş'],category:'Genel Kültür'},
  {word:'Deprem',forbidden:['Sarsıntı','Fay','Yer','Richter'],category:'Genel Kültür'}, {word:'Muson',forbidden:['Yağmur','Asya','Mevsim','Rüzgâr'],category:'Genel Kültür'},
  {word:'Mona Lisa',forbidden:['Tablo','Leonardo','Gülümseme','Louvre'],category:'Sanat'}, {word:'Guernica',forbidden:['Picasso','Savaş','Tablo','İspanya'],category:'Sanat'},
  {word:'Senfoni',forbidden:['Orkestra','Müzik','Besteci','Bölüm'],category:'Sanat'}, {word:'Tiyatro',forbidden:['Sahne','Oyuncu','Perde','Seyirci'],category:'Sanat'},
  {word:'Roman',forbidden:['Kitap','Yazar','Hikâye','Sayfa'],category:'Sanat'}, {word:'Origami',forbidden:['Kâğıt','Katlamak','Japonya','Şekil'],category:'Sanat'},
  {word:'Kahve',forbidden:['Fincan','Kafein','Türk','İçmek'],category:'Günlük Hayat'}, {word:'Şemsiye',forbidden:['Yağmur','Islanmak','Sap','Açmak'],category:'Günlük Hayat'},
  {word:'Asansör',forbidden:['Kat','Düğme','Yukarı','Bina'],category:'Günlük Hayat'}, {word:'Diş Fırçası',forbidden:['Macun','Ağız','Banyo','Temiz'],category:'Günlük Hayat'},
  {word:'Navigasyon',forbidden:['Harita','Yol','Telefon','Konum'],category:'Teknoloji'}, {word:'Yapay Zekâ',forbidden:['Robot','Bilgisayar','Öğrenme','Algoritma'],category:'Teknoloji'},
  {word:'Şifre',forbidden:['Gizli','Hesap','Giriş','Güvenlik'],category:'Teknoloji'}, {word:'Hologram',forbidden:['Görüntü','Üç boyut','Işık','Sanal'],category:'Teknoloji'},
  {word:'Pizza',forbidden:['İtalya','Peynir','Dilim','Hamur'],category:'Yemek'}, {word:'Baklava',forbidden:['Tatlı','Fıstık','Şerbet','Tepsi'],category:'Yemek'},
  {word:'Mantı',forbidden:['Yoğurt','Hamur','Kayseri','Sarımsak'],category:'Yemek'}, {word:'Sushi',forbidden:['Japonya','Pirinç','Balık','Çiğ'],category:'Yemek'},
  {word:'Maraton',forbidden:['Koşu','Yarış','Atlet','Uzun'],category:'Spor'}, {word:'Satranç',forbidden:['Şah','Mat','Tahta','Piyon'],category:'Spor'},
  {word:'Basketbol',forbidden:['Pota','Top','Smaç','NBA'],category:'Spor'}, {word:'Eskrim',forbidden:['Kılıç','Maske','Düello','Spor'],category:'Spor'},
] as const;

const CONTEXTS = [
  'antik','modern','gizemli','unutulmuş','efsanevi','yeraltındaki','uzaydaki','okyanustaki','çöldeki','kutuplardaki',
  'Osmanlı dönemindeki','Roma dönemindeki','gelecekteki','orta çağdaki','taş devrindeki','müzede sergilenen','laboratuvarda incelenen','haritada gösterilen','belgeselde anlatılan','kitaplarda geçen',
  'dünyaca ünlü','bilimsel','tarihî','kültürel','coğrafi','felsefi','matematiksel','sanatsal','teknolojik','mitolojik',
  'kayıp','yasaklı','şifreli','devasa','minyatür','ters çevrilmiş','yeniden keşfedilen','yanlış anlaşılan','koruma altındaki','ödüllü',
  'Anadolu’daki','Avrupa’daki','Asya’daki','Afrika’daki','Amerika’daki','Akdeniz’deki','Karadeniz’deki','Ege’deki','Ay’daki','Mars’taki',
  'ilk','son','en eski','en yeni','en büyük','en küçük','en hızlı','en yavaş','en parlak','en karanlık',
  'kırmızı','mavi','yeşil','altın','gümüş','saydam','manyetik','elektrikli','mekanik','dijital',
  'gece görülen','gündüz kullanılan','seyahatte taşınan','okulda öğrenilen','yarışmada sorulan','arşivde saklanan','kazıda bulunan','deneyde kullanılan','sahnede gösterilen','masalda anlatılan',
  'ünlü bir','şaşırtıcı bir','karmaşık bir','basit görünen','çok katmanlı','zamana direnen','nesilden nesile aktarılan','dünyayı değiştiren','tesadüfen bulunan','özenle korunan',
  'kışın görülen','yazın kullanılan','şehirde bulunan','köyde yapılan','sarayda saklanan','kalede kullanılan','gemide taşınan','trende unutulan','uçakta anlatılan','adada keşfedilen',
] as const;

const CLASSIC_FRAMES = [
  {prefix:'', suffix:''},
  {prefix:'hakkında konuşulan ', suffix:' olayı'},
  {prefix:'yarışmada sorulan ', suffix:' kavramı'},
] as const;

type SillyPart = { text:string; clues:[string,string] };
const SILLY_SUBJECTS:SillyPart[] = [
  {text:'süpürge tutan köpek balığı',clues:['deniz','temizlik']},{text:'kravatlı penguen',clues:['buz','takım elbise']},{text:'pilates yapan patates',clues:['spor','sebze']},{text:'dedikoducu buzdolabı',clues:['mutfak','soğuk']},
  {text:'otobüse küsen zürafa',clues:['uzun','durak']},{text:'selfie çeken ahtapot',clues:['sekiz','telefon']},{text:'rap yapan dede',clues:['müzik','yaşlı']},{text:'vegan zombi',clues:['et','ölü']},
  {text:'dişçiden kaçan ejderha',clues:['ateş','doktor']},{text:'çorap arayan korsan',clues:['gemi','ayak']},{text:'interneti kesilen robot',clues:['makine','bağlantı']},{text:'kardan adama güneş kremi süren tavuk',clues:['kar','kümes']},
  {text:'markette kaybolan astronot',clues:['uzay','alışveriş']},{text:'asansörde halay çeken vampir',clues:['kat','diş']},{text:'pizza dağıtan dinozor',clues:['kurye','tarih öncesi']},{text:'şemsiye açan balık',clues:['yağmur','su']},
  {text:'maaş isteyen kedi',clues:['para','miyav']},{text:'sınava giren hayalet',clues:['okul','görünmez']},{text:'trafik polisi kapibara',clues:['yol','kemirgen']},{text:'belediye başkanı olan tost',clues:['seçim','ekmek']},
] as const;
const SILLY_SCENES:SillyPart[] = [
  {text:'Ay’da düğün yapıyor',clues:['uzay','gelin']},{text:'canlı yayında uyuyor',clues:['kamera','rüya']},{text:'yanlış otobüse biniyor',clues:['durak','bilet']},{text:'komşudan Wi-Fi istiyor',clues:['internet','şifre']},
  {text:'kıyameti beş dakika erteliyor',clues:['dünya','zaman']},{text:'robotla tavla oynuyor',clues:['zar','makine']},{text:'pastanın içine saklanıyor',clues:['tatlı','gizlenmek']},{text:'market arabasıyla yarışıyor',clues:['alışveriş','hız']},
  {text:'gölgesine yol tarifi veriyor',clues:['karanlık','harita']},{text:'uzaylıya çay ikram ediyor',clues:['bardak','UFO']},{text:'yanardağda piknik yapıyor',clues:['lav','sepet']},{text:'müdür odasında karaoke söylüyor',clues:['okul','mikrofon']},
  {text:'buzdolabına tatile gidiyor',clues:['soğuk','otel']},{text:'zamanda geri giderken geç kalıyor',clues:['saat','geçmiş']},{text:'kendi heykeliyle tartışıyor',clues:['taş','kavga']},{text:'görünmez bisiklet sürüyor',clues:['pedal','görmek']},
  {text:'dondurma kuyruğunda hükümet kuruyor',clues:['külah','bakan']},{text:'süpürgeyle uzaya çıkıyor',clues:['temizlik','roket']},{text:'kediye matematik öğretiyor',clues:['miyav','sayı']},{text:'telefonunu ekmek kızartma makinesinde arıyor',clues:['arama','mutfak']},
] as const;
const SILLY_EXTRAS = ['pazartesi sabahı','herkes bakarken','elektrikler kesilince','annesi arayınca','son on saniyede','yağmur başlayınca','yanlışlıkla','çok ciddi biçimde','gizli görevde','kahvaltıdan önce','uyurgezerken','canı sıkılınca','trafik durunca','müzik çalarken','patron gelince','zil çalınca','internet gidince','Ay tutulurken','kamera kayıttayken','kimse inanmazken','düğün konvoyunda','sınav haftasında','tatildeyken','maç ortasında','asansör bozulunca'] as const;

export const BONUS_CARDS:Card[] = [
  {word:'Çok Oturgaçlı Götürgeç',forbidden:['Otobüs','Araç','Yolcu','Toplu taşıma','Durak'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Muvaffakiyetsizleştiricileştiriveremeyebileceklerimizdenmişsinizcesine',forbidden:['Uzun','Kelime','Başarı','Türkçe','Söylemek'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Elektroensefalografi',forbidden:['Beyin','EEG','Dalga','Hastane','Ölçüm'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Fotosentezlemek',forbidden:['Bitki','Güneş','Oksijen','Yaprak','Işık'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Jeostratejik Konumlandırma',forbidden:['Harita','Ülke','Askerî','Bölge','Siyaset'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Paradigma Değişimi',forbidden:['Bakış','Düşünce','Model','Değişmek','Bilim'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Termodinamik Dengesizlik',forbidden:['Isı','Enerji','Fizik','Sıcaklık','Denge'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Kuantum Dolanıklığı',forbidden:['Parçacık','Fizik','Uzaklık','Bağ','Einstein'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Antropomorfizm',forbidden:['İnsan','Hayvan','Özellik','Karakter','Benzetme'],category:'Bonus',kind:'bonus',multiplier:3},
  {word:'Deoksiribonükleik Asit',forbidden:['DNA','Gen','Hücre','Kalıtım','Sarmal'],category:'Bonus',kind:'bonus',multiplier:3},
];

export const categories = ['Genel','Günlük Hayat','Yemek','Spor','Teknoloji','Genel Kültür','Sanat'];
export const CATALOG_SIZE = 10_000;

export function cardAt(kind:CardKind, index:number):Card {
  if (kind === 'bonus') return BONUS_CARDS[((index % BONUS_CARDS.length) + BONUS_CARDS.length) % BONUS_CARDS.length];
  const safe = ((index % CATALOG_SIZE) + CATALOG_SIZE) % CATALOG_SIZE;
  if (kind === 'sacmala') {
    const subject = SILLY_SUBJECTS[safe % SILLY_SUBJECTS.length];
    const scene = SILLY_SCENES[Math.floor(safe / SILLY_SUBJECTS.length) % SILLY_SCENES.length];
    const extra = SILLY_EXTRAS[Math.floor(safe / (SILLY_SUBJECTS.length * SILLY_SCENES.length)) % SILLY_EXTRAS.length];
    return {word:`${subject.text} ${scene.text} ${extra}`,forbidden:[...subject.clues,...scene.clues,extra.split(' ')[0]],category:'Saçmala',kind,multiplier:1};
  }
  const concept = CONCEPTS[safe % CONCEPTS.length];
  const context = CONTEXTS[Math.floor(safe / CONCEPTS.length) % CONTEXTS.length];
  const frame = CLASSIC_FRAMES[Math.floor(safe / (CONCEPTS.length * CONTEXTS.length)) % CLASSIC_FRAMES.length];
  return {word:`${frame.prefix}${context} ${concept.word}${frame.suffix}`,forbidden:[...concept.forbidden,context.split(' ')[0]],category:concept.category,kind,multiplier:1};
}

export function pickCard(kind:CardKind, category:string, excluded:string[]) {
  const size = kind === 'bonus' ? BONUS_CARDS.length : CATALOG_SIZE;
  const excludedSet = new Set(excluded);
  const start = crypto.getRandomValues(new Uint32Array(1))[0] % size;
  for (let offset=0; offset<size; offset+=1) {
    const index=(start+offset)%size, key=`${kind}:${index}`, card=cardAt(kind,index);
    if (!excludedSet.has(key) && (kind !== 'classic' || category === 'Genel' || card.category === category)) return {card,index,key,kind};
  }
  throw new Error('Bu oyundaki kelime havuzu tükendi.');
}
