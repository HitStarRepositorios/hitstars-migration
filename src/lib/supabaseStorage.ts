import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usamos el Service Role Key para poder saltarnos las RLS y crear buckets si es necesario
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Sube un archivo a un bucket de Supabase Storage.
 * @param bucket Nombre del bucket (ej. 'kyc', 'covers')
 * @param path Ruta dentro del bucket (ej. 'user-id/dni.jpg')
 * @param file Buffer o File a subir
 */
export async function uploadToSupabase(
  bucket: string,
  path: string,
  file: Buffer | File,
  contentType?: string
) {
  // Asegurarnos de que el bucket existe (esto es opcional si ya los has creado manualmente)
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === bucket)) {
    await supabase.storage.createBucket(bucket, {
      public: true, // Para que las portadas sean accesibles por URL. KYC debería ser privado pero para este MVP lo hacemos simple.
    });
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: contentType || 'image/jpeg',
  });

  if (error) {
    throw new Error(`Error subiendo a Supabase: ${error.message}`);
  }

  // Obtenemos la URL pública
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);

  return publicUrl.publicUrl;
}
