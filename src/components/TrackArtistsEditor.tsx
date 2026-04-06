"use client";

import { useState, useEffect } from "react";

type Artist = {
  id: string
  artistName: string
  role: "MAIN" | "FEATURED" | "PRODUCER" | "REMIXER"
  spotifyId?: string
}

export default function TrackArtistsEditor({
  trackId,
  artists,
  onChange
}:{
  trackId:string
  artists:Artist[]
  onChange?: (artists:Artist[]) => void
}) {

const [list,setList] = useState<Artist[]>(artists || [])

useEffect(() => {
  setList(artists || [])
}, [artists])

function addArtist(role:"FEATURED"|"PRODUCER"|"REMIXER"="FEATURED") {

setList(prev=>[
...prev,
{
id:crypto.randomUUID(),
artistName:"",
role
}
])

}

function removeArtist(index:number){

setList(prev => prev.filter((_,i)=>i!==index))

}

function updateArtist(index:number,field:string,value:any){

setList(prev =>
prev.map((a,i)=> i===index ? {...a,[field]:value} : a)
)

}

async function save(){

await fetch("/api/track-artists",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
trackId,
artists:list
})
})

onChange?.(list)

}

return (

<div
style={{
background:"rgba(255,255,255,0.03)",
border:"1px solid rgba(255,255,255,0.06)",
borderRadius:"16px",
padding:"1.2rem",
display:"flex",
flexDirection:"column",
gap:"0.8rem",
minWidth:"280px"
}}
>

<label
style={{
fontSize:"0.85rem",
fontWeight:600,
color:"var(--text-secondary)"
}}
>
Artistas del track
</label>

{list.map((artist,i)=>(

<div
key={artist.id}
style={{
display:"grid",
gridTemplateColumns:"1fr 110px 36px",
gap:"0.4rem",
alignItems:"center"
}}
>

<input
className="form-input"
placeholder="Nombre artista"
value={artist.artistName}
onChange={(e)=>updateArtist(i,"artistName",e.target.value)}
/>

<select
className="form-input"
value={artist.role}
onChange={(e)=>updateArtist(i,"role",e.target.value)}
style={{ appearance: "none" }}
>

<option value="MAIN">Main</option>
<option value="FEATURED">Feat.</option>
<option value="PRODUCER">Producer</option>
<option value="REMIXER">Remixer</option>

</select>

<button
type="button"
onClick={()=>removeArtist(i)}
style={{
background:"rgba(239,68,68,0.1)",
border:"1px solid rgba(239,68,68,0.3)",
color:"#ef4444",
borderRadius:"8px",
cursor:"pointer",
height:"36px"
}}
>
✕
</button>

</div>

))}

<div
style={{
display:"flex",
gap:"0.4rem",
flexWrap:"wrap",
marginTop:"0.4rem"
}}
>

<button
type="button"
className="btn btn-secondary"
onClick={()=>addArtist("FEATURED")}
style={{fontSize:"0.75rem"}}
>
+ Featuring
</button>

<button
type="button"
className="btn btn-secondary"
onClick={()=>addArtist("PRODUCER")}
style={{fontSize:"0.75rem"}}
>
+ Producer
</button>

<button
type="button"
className="btn btn-secondary"
onClick={()=>addArtist("REMIXER")}
style={{fontSize:"0.75rem"}}
>
+ Remixer
</button>

</div>

<button
className="btn btn-primary"
style={{
marginTop:"0.5rem",
fontSize:"0.85rem"
}}
onClick={save}
>
Guardar artistas
</button>

</div>

)

}