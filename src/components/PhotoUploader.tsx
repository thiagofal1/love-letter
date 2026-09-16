import { useRef, useState } from 'react';
import { AlertCircle, ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const BUCKET = 'love-photos';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

function extensionFor(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  return file.type.split('/')[1] || 'jpg';
}

function uploadName(file: File) {
  const id = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `uploads/${id}.${extensionFor(file)}`;
}

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setError('Configure o Supabase e o bucket love-photos para enviar imagens.');
      return;
    }
    const client = supabase;

    const selected = Array.from(files);
    const invalid = selected.find((file) => !ACCEPTED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE);
    if (invalid) {
      setError('Use imagens JPG, PNG, WebP ou GIF de até 10 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrls = await Promise.all(selected.map(async (file) => {
        const path = uploadName(file);
        const { error: uploadError } = await client.storage
          .from(BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;

        return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      }));
      onChange([...photos, ...uploadedUrls]);
    } catch (uploadError) {
      console.error('Erro ao enviar foto:', uploadError);
      const uploadMessage = uploadError instanceof Error ? uploadError.message : 'erro desconhecido';
      const normalizedMessage = uploadMessage.toLowerCase();
      if (normalizedMessage.includes('bucket not found') || normalizedMessage.includes('nosuchbucket')) {
        setError(`Bucket "${BUCKET}" não encontrado neste projeto Supabase. Execute supabase/storage.sql no projeto configurado no .env.`);
      } else if (normalizedMessage.includes('row-level security') || normalizedMessage.includes('policy')) {
        setError('Upload bloqueado por política de Storage. Execute novamente supabase/storage.sql neste projeto.');
      } else {
        setError(`Não foi possível enviar a foto: ${uploadMessage}`);
      }
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-mono text-muted-foreground uppercase">Galeria do casal</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">JPG, PNG, WebP ou GIF · até 10 MB por imagem.</p>
      </div>

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="w-full min-h-28 rounded border border-dashed border-border bg-background px-4 py-5 text-center transition-colors hover:border-primary disabled:opacity-60"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2 text-sm text-primary"><LoaderCircle className="h-4 w-4 animate-spin" /> Enviando fotos...</span>
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><ImagePlus className="h-5 w-5 text-primary" /><span><strong className="font-medium text-foreground">Selecionar fotos</strong> ou adicionar mais imagens</span></span>
        )}
      </button>

      {error && (
        <p className="flex gap-2 text-xs leading-relaxed text-red-300"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{error}</p>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={photo} className="group relative aspect-square overflow-hidden rounded border border-border bg-muted">
              <img src={photo} alt={`Foto ${index + 1} do casal`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                aria-label={`Remover foto ${index + 1}`}
                className="absolute right-1 top-1 rounded bg-background/90 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!isSupabaseConfigured && (
        <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground"><Upload className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />O upload fica disponível depois de configurar as variáveis do Supabase.</p>
      )}
    </section>
  );
}
