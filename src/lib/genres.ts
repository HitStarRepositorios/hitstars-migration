export const GENRES = [
  { value: "pop", label: "Pop" },
  { value: "hip_hop", label: "Hip-Hop / Rap" },
  { value: "electronic", label: "Electronic / Dance" },
  { value: "rock", label: "Rock" },
  { value: "latin", label: "Latin / Urbano" },
  { value: "rnb", label: "R&B / Soul" },
  { value: "world", label: "World / Reggae / Afro" },
  { value: "jazz", label: "Jazz" },
  { value: "classical", label: "Classical" },
  { value: "country", label: "Country" },
  { value: "folk", label: "Folk / Americana" },
  { value: "metal", label: "Metal" },
  { value: "blues", label: "Blues" },
  { value: "alternative", label: "Alternative" },
  { value: "soundtrack", label: "Soundtrack" },
  { value: "gospel", label: "Gospel / Inspirational" },
  { value: "children", label: "Children's" },
  { value: "comedy", label: "Comedy / Spoken Word" },
  { value: "other", label: "Other" },
];

export const GENRE_MAP: Record<
  string,
  { value: string; label: string }[]
> = {
  pop: [
    { value: "dance_pop", label: "Dance Pop" },
    { value: "indie_pop", label: "Indie Pop" },
    { value: "synth_pop", label: "Synth-pop" },
    { value: "k_pop", label: "K-Pop" },
    { value: "j_pop", label: "J-Pop" },
    { value: "teen_pop", label: "Teen Pop" },
    { value: "pop_rock", label: "Pop Rock" },
    { value: "power_pop", label: "Power Pop" },
    { value: "bubblegum_pop", label: "Bubblegum Pop" },
    { value: "chamber_pop", label: "Chamber Pop" },
  ],

  hip_hop: [
    { value: "trap", label: "Trap" },
    { value: "drill", label: "Drill" },
    { value: "boom_bap", label: "Boom Bap" },
    { value: "gangsta_rap", label: "Gangsta Rap" },
    { value: "alternative_hip_hop", label: "Alternative Hip Hop" },
    { value: "grime", label: "Grime" },
    { value: "lofi", label: "Lo-Fi Hip-Hop" },
    { value: "uk_rap", label: "UK Rap" },
    { value: "conscious_hip_hop", label: "Conscious Hip-Hop" },
    { value: "old_school", label: "Old School Hip-Hop" },
    { value: "underground", label: "Underground" },
  ],

  electronic: [
    { value: "house", label: "House" },
    { value: "tech_house", label: "Tech House" },
    { value: "deep_house", label: "Deep House" },
    { value: "techno", label: "Techno" },
    { value: "melodic_techno", label: "Melodic Techno" },
    { value: "edm", label: "EDM / Mainstage" },
    { value: "trance", label: "Trance" },
    { value: "dubstep", label: "Dubstep" },
    { value: "drum_and_bass", label: "Drum & Bass" },
    { value: "ambient", label: "Ambient" },
    { value: "chiptune", label: "Chiptune" },
    { value: "disco", label: "Disco" },
    { value: "electro", label: "Electro" },
    { value: "hardstyle", label: "Hardstyle" },
    { value: "idm", label: "IDM / Experimental" },
    { value: "synthwave", label: "Synthwave" },
  ],

  rock: [
    { value: "alternative_rock", label: "Alternative Rock" },
    { value: "indie_rock", label: "Indie Rock" },
    { value: "hard_rock", label: "Hard Rock" },
    { value: "punk_rock", label: "Punk Rock" },
    { value: "grunge", label: "Grunge" },
    { value: "psychedelic_rock", label: "Psychedelic Rock" },
    { value: "soft_rock", label: "Soft Rock" },
    { value: "progressive_rock", label: "Progressive Rock" },
    { value: "shoegaze", label: "Shoegaze" },
    { value: "post_rock", label: "Post-Rock" },
    { value: "surf_rock", label: "Surf Rock" },
  ],

  latin: [
    { value: "reggaeton", label: "Reggaeton" },
    { value: "urbano_latino", label: "Urbano Latino" },
    { value: "latin_trap", label: "Latin Trap" },
    { value: "latin_pop", label: "Latin Pop" },
    { value: "latin_rock", label: "Latin Rock" },
    { value: "salsa", label: "Salsa" },
    { value: "bachata", label: "Bachata" },
    { value: "merengue", label: "Merengue" },
    { value: "cumbia", label: "Cumbia" },
    { value: "regional_mexican", label: "Regional Mexican" },
    { value: "banda", label: "Banda" },
    { value: "norteno", label: "Norteño" },
    { value: "mariachi", label: "Mariachi" },
    { value: "flamenco", label: "Flamenco" },
    { value: "tango", label: "Tango" },
    { value: "bolero", label: "Bolero" },
    { value: "dembow", label: "Dembow" },
  ],

  rnb: [
    { value: "contemporary_rnb", label: "Contemporary R&B" },
    { value: "neo_soul", label: "Neo Soul" },
    { value: "soul", label: "Soul" },
    { value: "funk", label: "Funk" },
    { value: "motown", label: "Motown" },
  ],

  world: [
    { value: "afrobeats", label: "Afrobeats" },
    { value: "amapiano", label: "Amapiano" },
    { value: "dancehall", label: "Dancehall" },
    { value: "roots_reggae", label: "Roots Reggae" },
    { value: "dub", label: "Dub" },
    { value: "ska", label: "Ska" },
    { value: "bossa_nova", label: "Bossa Nova" },
    { value: "bollywood", label: "Bollywood" },
    { value: "asian", label: "Asian" },
    { value: "middle_eastern", label: "Middle Eastern" },
    { value: "african", label: "African / Traditional" },
  ],

  jazz: [
    { value: "smooth_jazz", label: "Smooth Jazz" },
    { value: "bebop", label: "Bebop" },
    { value: "big_band", label: "Big Band" },
    { value: "cool_jazz", label: "Cool Jazz" },
    { value: "fusion", label: "Fusion" },
    { value: "hard_bop", label: "Hard Bop" },
    { value: "swing", label: "Swing" },
    { value: "vocal_jazz", label: "Vocal Jazz" },
    { value: "acid_jazz", label: "Acid Jazz" },
  ],

  classical: [
    { value: "orchestral", label: "Orchestral" },
    { value: "chamber_music", label: "Chamber Music" },
    { value: "opera", label: "Opera" },
    { value: "choral", label: "Choral" },
    { value: "baroque", label: "Baroque" },
    { value: "romantic", label: "Romantic" },
    { value: "modern_classical", label: "Modern Classical" },
  ],

  country: [
    { value: "modern_country", label: "Modern Country" },
    { value: "country_pop", label: "Country Pop" },
    { value: "bluegrass", label: "Bluegrass" },
    { value: "honky_tonk", label: "Honky Tonk" },
    { value: "traditional_country", label: "Traditional Country" },
  ],

  folk: [
    { value: "indie_folk", label: "Indie Folk" },
    { value: "acoustic_folk", label: "Acoustic Folk" },
    { value: "americana", label: "Americana" },
    { value: "celtic_folk", label: "Celtic Folk" },
    { value: "folk_rock", label: "Folk Rock" },
  ],

  metal: [
    { value: "heavy_metal", label: "Heavy Metal" },
    { value: "thrash_metal", label: "Thrash Metal" },
    { value: "death_metal", label: "Death Metal" },
    { value: "black_metal", label: "Black Metal" },
    { value: "doom_metal", label: "Doom Metal" },
    { value: "metalcore", label: "Metalcore" },
    { value: "nu_metal", label: "Nu Metal" },
    { value: "power_metal", label: "Power Metal" },
    { value: "progressive_metal", label: "Progressive Metal" },
    { value: "symphonic_metal", label: "Symphonic Metal" },
    { value: "hardcore", label: "Hardcore" },
  ],

  blues: [
    { value: "acoustic_blues", label: "Acoustic Blues" },
    { value: "chicago_blues", label: "Chicago Blues" },
    { value: "electric_blues", label: "Electric Blues" },
    { value: "modern_blues", label: "Modern Blues" },
  ],

  alternative: [
    { value: "alternative", label: "Alternative" },
    { value: "college_rock", label: "College Rock" },
    { value: "emo", label: "Emo" },
    { value: "goth", label: "Goth" },
    { value: "new_wave", label: "New Wave" },
  ],

  soundtrack: [
    { value: "film_score", label: "Film Score" },
    { value: "video_game_music", label: "Video Game Music" },
    { value: "musical_theater", label: "Musical Theater" },
  ],

  gospel: [
    { value: "contemporary_christian", label: "Contemporary Christian" },
    { value: "gospel", label: "Gospel" },
    { value: "worship", label: "Worship" },
  ],

  children: [
    { value: "children_music", label: "Children's Music" },
    { value: "lullaby", label: "Lullaby" },
    { value: "educational", label: "Educational" },
  ],

  comedy: [
    { value: "comedy_routine", label: "Comedy Routine" },
    { value: "spoken_word", label: "Spoken Word" },
    { value: "poetry", label: "Poetry" },
  ],

  other: [
    { value: "instrumental", label: "Instrumental" },
    { value: "experimental", label: "Experimental" },
    { value: "meditation_new_age", label: "Meditation / New Age" },
    { value: "holiday", label: "Holiday / Christmas" },
  ],
};

export function getGenreLabel(value?: string | null) {
  if (!value) return "";
  return GENRES.find((g) => g.value === value)?.label || value;
}

export function getSubGenreLabel(genre?: string | null, subValue?: string | null) {
  if (!subValue) return "";
  if (!genre) return subValue;
  const subs = GENRE_MAP[genre] || [];
  return subs.find((s) => s.value === subValue)?.label || subValue;
}