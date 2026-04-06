export function parseSpotify(rows: any[]) {

  return rows.map(r => ({

    platform: "SPOTIFY",

    date: r.date,

    isrc: r.isrc,

    country: r.country,

    streams: Number(r.streams || 0),

    revenue: Number(r.revenue || 0)

  }))

}