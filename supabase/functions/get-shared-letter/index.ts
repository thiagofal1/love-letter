import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const bucket = "love-photos";
const signedUrlLifetimeSeconds = 60 * 60;
const maxPhotosPerLetter = 10;
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

type LetterRecord = {
  id: string;
  user_id: string | null;
  share_token: string;
  photos: unknown;
  [key: string]: unknown;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isSafePath(path: string) {
  return path.split("/").every((part) => /^[a-zA-Z0-9._-]+$/.test(part) && part !== "." && part !== "..");
}

function storagePath(photo: unknown, ownerId: string | null, supabaseUrl: string) {
  if (typeof photo !== "string" || photo.length > 2048) {
    throw new Error("A foto da carta contém um caminho inválido.");
  }

  let path = photo;
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    const url = new URL(photo);
    const projectUrl = new URL(supabaseUrl);
    const publicPrefix = `/storage/v1/object/public/${bucket}/`;

    if (url.origin !== projectUrl.origin || !url.pathname.startsWith(publicPrefix)) {
      throw new Error("A carta contém uma URL de foto não permitida.");
    }

    path = decodeURIComponent(url.pathname.slice(publicPrefix.length));
  }

  const isOwnedPath = ownerId !== null && path.startsWith(`${ownerId}/`);
  const isLegacyPath = path.startsWith("uploads/");
  if ((!isOwnedPath && !isLegacyPath) || !isSafePath(path)) {
    throw new Error("A foto da carta não pertence ao armazenamento permitido.");
  }

  return path;
}

async function createPhotoUrls(
  admin: ReturnType<typeof createClient>,
  photos: unknown,
  ownerId: string | null,
  supabaseUrl: string,
) {
  if (photos === null || photos === undefined) return [];
  if (!Array.isArray(photos) || photos.length > maxPhotosPerLetter) {
    throw new Error("A carta contém uma quantidade inválida de fotos.");
  }
  if (photos.length === 0) return [];

  const paths = photos.map((photo) => storagePath(photo, ownerId, supabaseUrl));
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrls(paths, signedUrlLifetimeSeconds);

  if (error) throw error;
  if (!data || data.length !== paths.length || data.some((entry) => !entry.signedUrl)) {
    throw new Error("Não foi possível preparar as fotos desta carta.");
  }

  return data.map((entry) => entry.signedUrl as string);
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Método não permitido." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase function configuration.");
    return jsonResponse({ error: "Serviço de cartas indisponível." }, 500);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return jsonResponse({ error: "Solicitação inválida." }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Solicitação inválida." }, 400);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    if (typeof body.letterId === "string") {
      const authorization = request.headers.get("Authorization");
      const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
      if (!accessToken) {
        return jsonResponse({ error: "Autenticação necessária." }, 401);
      }

      const { data: authData, error: authError } = await admin.auth.getUser(accessToken);
      if (authError || !authData.user) {
        return jsonResponse({ error: "Autenticação inválida." }, 401);
      }

      const { data: letter, error: letterError } = await admin
        .from("letters")
        .select("id, user_id, photos")
        .eq("id", body.letterId)
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (letterError) throw letterError;
      if (!letter) return jsonResponse({ error: "Carta não encontrada." }, 404);

      const requestedPhotos = body.photoPaths;
      if (requestedPhotos !== undefined && !Array.isArray(requestedPhotos)) {
        return jsonResponse({ error: "Lista de fotos inválida." }, 400);
      }

      const photos = requestedPhotos ?? letter.photos ?? [];
      if (!Array.isArray(photos)) {
        return jsonResponse({ error: "Lista de fotos inválida." }, 400);
      }

      const legacyPaths = new Set(
        (Array.isArray(letter.photos) ? letter.photos : [])
          .map((photo) => storagePath(photo, letter.user_id, supabaseUrl))
          .filter((path) => path.startsWith("uploads/")),
      );

      for (const photo of photos) {
        const path = storagePath(photo, letter.user_id, supabaseUrl);
        if (!path.startsWith(`${authData.user.id}/`) && !legacyPaths.has(path)) {
          return jsonResponse({ error: "A foto não pertence a esta carta." }, 403);
        }
      }

      const signedPhotos = await createPhotoUrls(admin, photos, letter.user_id, supabaseUrl);
      return jsonResponse({ photos: signedPhotos });
    }

    const shareToken = body.shareToken;
    if (
      typeof shareToken !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(shareToken)
    ) {
      return jsonResponse({ error: "Link da carta inválido ou expirado." }, 404);
    }

    const { data: letter, error: letterError } = await admin
      .from("letters")
      .select("*")
      .eq("share_token", shareToken)
      .maybeSingle();

    if (letterError) throw letterError;
    if (!letter) return jsonResponse({ error: "Link da carta inválido ou expirado." }, 404);

    const signedPhotos = await createPhotoUrls(admin, letter.photos, letter.user_id, supabaseUrl);
    const {
      id: _id,
      user_id: _userId,
      share_token: _shareToken,
      ...sharedLetter
    } = letter as LetterRecord;

    return jsonResponse({ letter: { ...sharedLetter, photos: signedPhotos } });
  } catch (error) {
    console.error("Failed to load shared letter:", error);
    return jsonResponse({ error: "Não foi possível carregar esta carta agora." }, 500);
  }
});
