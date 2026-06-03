'use client'

import { useRef, useState, useTransition } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { updateAvatar, removeAvatar } from './actions'

interface AvatarUploadProps {
  initials: string
  avatarUrl: string | null
}

export function AvatarUpload({ initials, avatarUrl }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(avatarUrl)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen no puede superar 2 MB.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setPreview(base64)
      startTransition(async () => {
        const result = await updateAvatar(base64)
        if (result?.error) {
          setError(result.error)
          setPreview(avatarUrl)
        }
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center py-6 gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group"
        aria-label="Cambiar foto de perfil"
      >
        {/* Avatar circle */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100 bg-blue-600 flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-2xl font-bold">{initials}</span>
          )}
        </div>

        {/* Camera overlay */}
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center
                        opacity-0 group-hover:opacity-100 transition-opacity">
          {isPending
            ? <Loader2 size={20} className="text-white animate-spin" />
            : <Camera size={20} className="text-white" />}
        </div>

        {/* Small camera badge */}
        <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full border-2 border-white
                        flex items-center justify-center">
          <Camera size={12} className="text-white" />
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Toca para cambiar la foto</p>

      {/* Delete button — only shown when there is an avatar */}
      {preview && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const result = await removeAvatar()
              if (!result?.error) {
                setPreview(null)
              } else {
                setError(result.error)
              }
            })
          }}
          className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1
                     hover:text-red-600 disabled:opacity-50 transition-colors tap-none"
        >
          <Trash2 size={13} />
          Eliminar foto
        </button>
      )}
    </div>
  )
}
