export const IMAGE_EXTENSIONS = [
  'jpeg',
  'jpg',
  'png',
  'svg',
  'tif',
  'tiff',
  'webp',
  'jif',
  'jfif',
  'jp2',
  'jpx',
  'j2k',
  'j2c',
  'fpx',
  'pcd',
];
export const VIDEOS_EXTESION = ['webm', 'mp4', 'ogg', 'ogv'];
export const GIF_EXTESIONS = ['gif'];
export const HEADING_TAGS = ['h6', 'h5', 'h4', 'h3', 'h2', 'h1'];

export const VIDEO_LANG_TRANSLATIONS = {
  en: 'Video:',
  fr: 'Vidéo:',
  hi: 'वीडियो:',
  ar: 'فيديو:',
  es: 'Video/ES:',
  ja: 'ビデオ:',
  uk: 'відео:',
  or: 'ଭିଡିଓ:',
  te: `వీడియో:`,
  gu: `વિડિયો:`,
  bn: `ভিডিও:`,
  pa: `ਵੀਡੀਓ:`,
  sat: `ᱵᱷᱤᱰᱤᱭᱳ:`,
  sv: 'Video:',
  it: 'Video:',
  kn: 'ವೀಡಿಯೊ:',
  ml: 'വീഡിയോ:',
  ta: 'காணொளி:',
  eu: 'Bideoa:'
};

export const CUSTOM_VIDEOWIKI_LANG_PREFIXES = {
  en: 'Wikipedia:Videowiki/',
  fr: 'Wikipédia:Videowiki/',
  hi: 'विकिपीडिया:वीडियोविकि/',
  ar: 'ويكيبيديا:فيديوويكي/',
  es: 'Wikipedia:Videowiki/ES/',
  ja: 'Wikipedia:ビデオウィキ/',
  uk: 'Вікіпедія:відеовікі/',
  or: 'ଉଇକିପିଡ଼ିଆ:ଭିଡିଓୱିକି/',
  te: `వికీపీడియా:వీడియోవికీ/`,
  gu: `વિકિપીડિયા:વિડિયોવિકિ/`,
  bn: `উইকিপিডিয়া:ভিডিওউইকি/`,
  pa: `ਵਿਕੀਪੀਡੀਆ:ਵੀਡੀਓਵਿਕੀ/`,
  sat: `ᱣᱤᱠᱤᱯᱤᱰᱤᱭᱟ:ᱵᱷᱤᱰᱤᱭᱳᱣᱤᱠᱤ/`,
  sv: 'Wikipedia:Videowiki/',
  it: 'Wikipedia:Videowiki/',
  kn: 'ವಿಕಿಪೀಡಿಯಾ:ವಿಡಿಯೋವಿಕಿ/',
  ml: 'വിക്കിപീഡിയ:വീഡിയോവിക്കി/',
  ta: 'விக்கிபீடியா:வீடியோவிக்கி/',
  eu: 'Wikipedia:Videowiki/'
};

export const customVideowikiPrefixes = Object.keys(
  CUSTOM_VIDEOWIKI_LANG_PREFIXES,
)
  .map((key) => CUSTOM_VIDEOWIKI_LANG_PREFIXES[key])
  .concat(['/sandbox', '/sandlåda', '/ملعب', 'ملعب/', 'taller']);

export const SECTIONS_BLACKLIST = {
  en: [
    'notes',
    'further reading',
    'references',
    'external links',
    'sources',
    'footnotes',
    'bibliography',
    'see also',
  ],
  hi: [
    'सन्दर्भ',
    'संदर्भ',
    'इन्हें भी देखें',
    'बाहरी कड़ियाँ',
    'टिप्पणी',
    'समर्थन',
  ],
  fr: [
    'Notes et références',
    'Notes',
    'Références',
    'Annexes',
    'Bibliographie',
    'Articles connexes',
    'Liens externes',
    'Voir aussi',
    'Sources',
  ],
  es: [
    'Notas',
    'Véase también',
    'Referencias',
    'Bibliografía',
    'Enlaces externos',
  ],
  ar: [
    'انظر ايضاً',
    'وصلات خارجية',
    'الوصلات الخارجية',
    'المراجع',
    'مراجع',
    'روابط',
  ],
  ja: ['出典'],
  uk: [
    'Посилання',
    'примітки',
    'Подальше читання',
    'зовнішні посилання',
    'джерела',
    'Дивіться також',
  ],
  or: ['ଆଧାର', 'references'],
  te: ['మూలాలు'],
  gu: ['સંદર્ભ'],
  bn: ['তথ্যসূত্র'],
  pa: ['ਹਵਾਲੇ'],
  sat: ['ᱥᱟᱹᱠᱷᱭᱟᱹᱛ'],
  sv: [],
  it: [],
  kn: [],
  ml: [],
  ta: [],
  eu: ['Erreferentziak'],
  ha: ['Manazarta']
};

export const CUSTOM_TEMPLATES = {
  PLAYALL: 'VW Playall',
  OPENSTREET_VIDEOZOOM: 'VideoZoom'
}

export const SLIDES_BLACKLIST = {
  en: ['template:info videowiki', 'Template:VW Playall', 'Template:VideoZoom'],
  hi: [],
  fr: [],
  es: [],
  ar: [],
  ja: [],
  or: [],
  te: [],
  gu: [],
  bn: [],
  pa: [],
  sat: [],
  sv: [],
  it: [],
  kn: [],
  ml: [],
  ta: [],
  eu: [],
  ha: []
};

export const FILE_MATCH_REGEX = {
  en: /\[\[\s*File:(.*)\]\]/gim,
  ar: /\[\[ملف:(.*)\]\]/gim,
  es: /\[\[Archivo:(.*)\]\]|\[\[File:(.*)\]\]/gim,
  ja: /\[\[\s*ファイル:(.*)\]\]/gim,
  uk: /\[\[Файл:(.*)\]\]|\[\[File:(.*)\]\]/gim,
  fr: /\[\[Fichier:(.*)\]\]|\[\[File:(.*)\]\]/gim,
  or: /\[\[\s*File:(.*)\]\]/gim,
  te: /\[\[\s*File:(.*)\]\]/gim,
  gu: /\[\[\s*File:(.*)\]\]/gim,
  bn: /\[\[\s*File:(.*)\]\]/gim,
  pa: /\[\[\s*File:(.*)\]\]/gim,
  sat: /\[\[\s*File:(.*)\]\]/gim,
  sv: /\[\[\s*File:(.*)\]\]/gim,
  it: /\[\[\s*File:(.*)\]\]/gim,
  kn: /\[\[\s*File:(.*)\]\]/gim,
  ml: /\[\[\s*File:(.*)\]\]/gim,
  ta: /\[\[\s*File:(.*)\]\]/gim,
  eu: /\[\[\s*File:(.*)\]\]/gim,
};

export const FILE_PREFIXES = {
  en: 'File:',
  ar: 'ملف:',
  es: 'Archivo:',
  ja: 'ファイル:',
  uk: 'Файл:',
  fr: 'Fichier:',
  or: 'File:',
  te: 'File:',
  gu: 'File:',
  bn: 'File:',
  pa: 'File:',
  sat: 'File:',
  sv: 'File:',
  it: 'File:',
  kn: 'File:',
  ml: 'File:',
  ta: 'File:',
  eu: 'File:',
  ha: 'File:',
};

export const SUPPORTED_TTS_LANGS = [
  'en',
  'hi',
  'es',
  'ar',
  'ja',
  'uk',
  'fr',
  // 'or',
  'te',
  'gu',
  'bn',
  // 'pa',
  // 'sat',
  'sv',
  'it',
  'kn',
  'ml',
  'ta',
  'eu',
  'ha'
];

export const TTS_CONCURRENT_REQUESTS = 5;