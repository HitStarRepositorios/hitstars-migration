/*
ISO-639-2 LANGUAGE MAP
Used for DDEX LanguageOfPerformance
*/

const languages: Record<string,string> = {

  afrikaans:"afr",
  albanian:"sqi",
  amharic:"amh",
  arabic:"ara",
  armenian:"hye",
  azerbaijani:"aze",
  basque:"eus",
  belarusian:"bel",
  bengali:"ben",
  bosnian:"bos",
  bulgarian:"bul",
  catalan:"cat",
  chinese:"zho",
  croatian:"hrv",
  czech:"ces",
  danish:"dan",
  dutch:"nld",
  english:"eng",
  esperanto:"epo",
  estonian:"est",
  filipino:"fil",
  finnish:"fin",
  french:"fra",
  galician:"glg",
  georgian:"kat",
  german:"deu",
  greek:"ell",
  gujarati:"guj",
  haitian:"hat",
  hebrew:"heb",
  hindi:"hin",
  hungarian:"hun",
  icelandic:"isl",
  indonesian:"ind",
  irish:"gle",
  italian:"ita",
  japanese:"jpn",
  kannada:"kan",
  kazakh:"kaz",
  khmer:"khm",
  korean:"kor",
  kurdish:"kur",
  kyrgyz:"kir",
  lao:"lao",
  latin:"lat",
  latvian:"lav",
  lithuanian:"lit",
  macedonian:"mkd",
  malagasy:"mlg",
  malay:"msa",
  malayalam:"mal",
  maltese:"mlt",
  maori:"mri",
  marathi:"mar",
  mongolian:"mon",
  nepali:"nep",
  norwegian:"nor",
  persian:"fas",
  polish:"pol",
  portuguese:"por",
  punjabi:"pan",
  romanian:"ron",
  russian:"rus",
  serbian:"srp",
  sinhala:"sin",
  slovak:"slk",
  slovenian:"slv",
  somali:"som",
  spanish:"spa",
  swahili:"swa",
  swedish:"swe",
  tamil:"tam",
  telugu:"tel",
  thai:"tha",
  turkish:"tur",
  ukrainian:"ukr",
  urdu:"urd",
  uzbek:"uzb",
  vietnamese:"vie",
  welsh:"cym",
  xhosa:"xho",
  yiddish:"yid",
  yoruba:"yor",
  zulu:"zul"

}

/*
Aliases comunes (usuarios escribiendo en español)
*/

const aliases: Record<string,string> = {

  español:"spa",
  espanol:"spa",

  ingles:"eng",
  inglés:"eng",

  frances:"fra",
  francés:"fra",

  aleman:"deu",
  alemán:"deu",

  portugues:"por",
  portugués:"por",

  italiano:"ita",

  chino:"zho",

  japones:"jpn",
  japonés:"jpn",

  coreano:"kor",

  ruso:"rus",

  arabe:"ara",
  árabe:"ara"

}

/*
Normalizador
*/

export function normalizeLanguage(language?: string): string {

  if (!language) return "eng"

  const key = language
    .trim()
    .toLowerCase()

  /*
  Si ya es ISO-639-2
  */

  if (key.length === 3) return key

  /*
  Alias conocidos
  */

  if (aliases[key]) return aliases[key]

  /*
  Idioma por nombre
  */

  if (languages[key]) return languages[key]

  /*
  fallback seguro
  */

  return "eng"

}