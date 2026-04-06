import { processReport } from "@/lib/royalties/processReport"

export async function POST(req: Request) {

  const body = await req.json()

  const result = await processReport(body)

  return Response.json(result)

}