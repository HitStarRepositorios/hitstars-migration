"use server";

import { ingestAllRoyaltiesFromR2 } from "@/lib/royalties/ingestAllRoyalties"
import { revalidatePath } from "next/cache"

/**
 * Server Action to trigger the full royalty ingestion and 
 * calculation process from the 'royalties/' folder in Cloudflare R2.
 */
export async function processRoyaltiesAction() {
  console.log("🛠️ Admin action: Processing royalties from R2")

  try {
    const result = await ingestAllRoyaltiesFromR2()
    
    // Revalidar el dashboard para ver cambios en analytics
    revalidatePath("/admin")
    revalidatePath("/dashboard/analytics")

    return { 
      success: true, 
      message: `Procesados ${result.fileCount} archivos y generadas ${result.earningCount} liquidaciones individuales.` 
    }
  } catch (err: any) {
    console.error("❌ Error processing royalties:", err)
    return { success: false, error: err.message }
  }
}
