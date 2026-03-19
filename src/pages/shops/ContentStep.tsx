import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Upload, Square, Mic } from 'lucide-react'
import { Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useMetadataStore } from '@/stores/metadataStore'
import { cn } from '@/lib/utils'
import type { POIContent } from '@/types'

interface ContentStepProps {
  contents: POIContent[]
  onChange: (c: POIContent[]) => void
}

export function ContentStep({ contents, onChange }: ContentStepProps) {
  const { languages, fetchMetadata, getLanguage } = useMetadataStore()
  const [activeLang, setActiveLang] = useState(contents[0]?.language || 'vi')
  const [speaking, setSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    void fetchMetadata()
  }, [fetchMetadata])

  const activeContent = contents.find((c) => c.language === activeLang)

  const addLanguage = (code: string) => {
    if (contents.find((c) => c.language === code)) return
    onChange([
      ...contents,
      { id: `new-${code}`, poiId: 'new', language: code, script: '', audioUrl: undefined, status: 'draft' },
    ])
    setActiveLang(code)
  }

  const removeLanguage = (code: string) => {
    const next = contents.filter((c) => c.language !== code)
    onChange(next)
    if (activeLang === code && next.length > 0) {
      setActiveLang(next[0].language)
    }
  }

  const updateContent = (code: string, data: Partial<POIContent>) => {
    onChange(contents.map((c) => (c.language === code ? { ...c, ...data } : c)))
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      updateContent(activeLang, { audioUrl: url, audioFile: file })
    }
  }

  const handleTTS = () => {
    if (!activeContent?.script) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(activeContent.script)
    utterance.lang = activeLang === 'vi' ? 'vi-VN' : activeLang === 'en' ? 'en-US' : activeLang
    utterance.onend = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const unusedLanguages = languages.filter((language) => !contents.find((c) => c.language === language.code))

  return (
    <div className="space-y-4">
      {/* Language tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {contents.map((c) => {
          const lang = getLanguage(c.language)
          return (
            <div key={c.language} className="flex items-center">
              <button
                onClick={() => setActiveLang(c.language)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  activeLang === c.language
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                )}
              >
                <span>{lang?.flag}</span>
                <span>{lang?.name ?? c.language}</span>
                {c.script && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
              </button>
              {contents.length > 1 && (
                <button
                  onClick={() => removeLanguage(c.language)}
                  className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )
        })}

        {/* Add language dropdown */}
        {unusedLanguages.length > 0 && (
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Plus size={14} /> Thêm ngôn ngữ
            </Button>
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-36 hidden group-hover:block">
              {unusedLanguages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => addLanguage(l.code)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content editor */}
      {activeContent && (
        <div className="space-y-4 border border-gray-200 dark:border-gray-600 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLanguage(activeLang)?.flag}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {getLanguage(activeLang)?.name ?? activeLang}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activeContent.status === 'published' ? 'success' : 'default'}>
                {activeContent.status === 'published' ? 'Published' : 'Draft'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateContent(activeLang, {
                  status: activeContent.status === 'draft' ? 'published' : 'draft'
                })}
              >
                {activeContent.status === 'draft' ? 'Publish' : 'Về Draft'}
              </Button>
            </div>
          </div>

          <Textarea
            label="Script thuyết minh"
            placeholder="Nhập nội dung thuyết minh cho ngôn ngữ này..."
            rows={5}
            value={activeContent.script}
            onChange={(e) => updateContent(activeLang, { script: e.target.value })}
          />

          {/* TTS Preview */}
          <div className="flex items-center gap-2">
            <Button
              variant={speaking ? 'danger' : 'outline'}
              size="sm"
              onClick={handleTTS}
              disabled={!activeContent.script}
            >
              {speaking ? <><Square size={12} /> Dừng TTS</> : <><Mic size={12} /> Preview TTS</>}
            </Button>
            <span className="text-xs text-gray-400">Dùng SpeechSynthesis của trình duyệt</span>
          </div>

          {/* Audio upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File audio (.mp3, .wav)
            </label>
            {activeContent.audioUrl ? (
              <div className="flex items-center gap-3">
                <audio
                  ref={audioRef}
                  controls
                  src={activeContent.audioUrl}
                  className="h-8 flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  onClick={() => updateContent(activeLang, { audioUrl: undefined, audioFile: undefined, audioAssetId: undefined })}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="audio/mp3,audio/wav,audio/*"
                  id={`audio-${activeLang}`}
                  className="hidden"
                  onChange={handleAudioUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(`audio-${activeLang}`)?.click()}
                >
                  <Upload size={14} /> Upload audio
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
