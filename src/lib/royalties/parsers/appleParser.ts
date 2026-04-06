export function parseApple(rows: any[]) {

  return rows.map(r => ({

    platform: "APPLE_MUSIC",

    date: r.Date || r["Begin Date"],

    isrc: r.ISRC,

    country: r.Territory || r["Country Of Sale"],

    streams: Number(r.Streams || r.Units || 0),

    revenue: Number(r.Revenue || r["Developer Proceeds"] || 0)

  }))

}