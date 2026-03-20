import { Textarea, Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { NarrationGuide } from '@/types'

export interface NarrationDraft {
  title: string
  sourceText: string
  sourceLanguageCode: string
}

interface ContentStepProps {
  draft: NarrationDraft
  onChange: (next: NarrationDraft) => void
  generatedGuides: NarrationGuide[]
}

const DEFAULT_LANGUAGES = ['vi', 'en', 'fr', 'zh', 'ko']

export function ContentStep({ draft, onChange, generatedGuides }: ContentStepProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
        Backend sẽ lấy nội dung tiếng Việt, tự dịch mặc định sang <span className="font-semibold">5 ngôn ngữ</span> ({DEFAULT_LANGUAGES.join(', ')}) rồi generate mp3 và lưu file lên server.
      </div>

      <Input
        label="Tiêu đề thuyết minh"
        placeholder="Ví dụ: Thuyết minh Landmark 81"
        value={draft.title}
        onChange={(event) => onChange({ ...draft, title: event.target.value })}
      />

      <Textarea
        label="Nội dung thuyết minh gốc (tiếng Việt)"
        placeholder="Nhập nội dung sẽ được dịch tự động và sinh mp3..."
        rows={8}
        value={draft.sourceText}
        onChange={(event) => onChange({ ...draft, sourceText: event.target.value, sourceLanguageCode: 'vi' })}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Ngôn ngữ đích mặc định</p>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_LANGUAGES.map((code) => (
            <Badge key={code} variant="info">
              {code.toUpperCase()}
            </Badge>
          ))}
        </div>
      </div>

      {generatedGuides.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">Audio guide đã có cho địa điểm này</p>
          <div className="space-y-3">
            {generatedGuides.map((guide) => (
              <div key={guide.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/70">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{guide.languageName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{guide.title}</p>
                  </div>
                  <Badge variant={guide.active ? 'success' : 'default'}>{guide.approvalStatus ?? 'PENDING'}</Badge>
                </div>
                <p className="mb-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">{guide.scriptText}</p>
                {guide.audioUrl ? <audio controls src={guide.audioUrl} className="h-8 w-full" /> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
