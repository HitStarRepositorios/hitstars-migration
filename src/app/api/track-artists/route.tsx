import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req:NextRequest){

const {trackId,artists} = await req.json()

await prisma.trackArtist.deleteMany({
where:{trackId}
})

await prisma.trackArtist.createMany({
data: artists.map((a:any)=>({
trackId,
artistName:a.artistName,
role:a.role,
spotifyId:a.spotifyId ?? null
}))
})

return NextResponse.json({success:true})

}