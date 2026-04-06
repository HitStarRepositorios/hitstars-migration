"use client"

export default function TopTracks({transactions}:{transactions:any[]}){

  const trackMap:any = {}

  transactions.forEach(t=>{
    if(!trackMap[t.track]) trackMap[t.track]=0
    trackMap[t.track]+=t.amount
  })

  const topTracks = Object.keys(trackMap)
    .map(track=>({
      track,
      amount:trackMap[track]
    }))
    .sort((a,b)=>b.amount-a.amount)
    .slice(0,5)

  return(

    <div className="glass-panel p-6">

      <div className="text-sm text-muted mb-4">
        Top Canciones
      </div>

      <div className="space-y-3">

        {topTracks.map(t=>(
          <div key={t.track} className="flex justify-between">

            <div className="text-white">
              {t.track}
            </div>

            <div className="font-semibold">
              €{t.amount.toFixed(2)}
            </div>

          </div>
        ))}

      </div>

    </div>

  )

}