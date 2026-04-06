import { prisma } from "@/lib/prisma"

export async function GET() {

  const publishingEarnings = await prisma.royaltyEarning.findMany({
    where:{
      kind:"PUBLISHING"
    },
    include:{
      track:true
    }
  })

  const totalRevenue = publishingEarnings.reduce(
    (sum,e)=>sum + e.amount,
    0
  )

  const totalStreams = publishingEarnings.reduce(
    (sum,e)=>sum + (e.streams || 0),
    0
  )

  const byWork:Record<string,any> = {}

  for(const e of publishingEarnings){

    const title = e.track?.title || "Unknown"

    if(!byWork[title]){
      byWork[title] = {
        title,
        revenue:0,
        streams:0
      }
    }

    byWork[title].revenue += e.amount
    byWork[title].streams += e.streams || 0

  }

  return Response.json({
    totalRevenue,
    totalStreams,
    byWork:Object.values(byWork)
  })
}