/**
 * Generic page skeleton — shown by Next.js loading.tsx while the
 * server component fetches data.
 */
export function PageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen pb-24 animate-pulse" style={{ backgroundColor: '#F9F9FF' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex flex-col gap-1.5">
            <div className="w-16 h-3 rounded-full bg-gray-200" />
            <div className="w-24 h-4 rounded-full bg-gray-300" />
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200" />
      </div>

      {/* Summary card */}
      <div className="mx-4 bg-white rounded-2xl border border-gray-100 p-5">
        <div className="w-32 h-3 rounded-full bg-gray-200 mb-3" />
        <div className="w-48 h-9 rounded-full bg-gray-300 mb-4" />
        <div className="h-1.5 bg-gray-100 rounded-full mb-4" />
        <div className="flex gap-3">
          <div className="flex-1 h-16 rounded-xl bg-gray-100" />
          <div className="flex-1 h-16 rounded-xl bg-gray-100" />
        </div>
      </div>

      {/* Payment items */}
      <div className="px-4 mt-6 flex flex-col gap-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="w-11 h-11 rounded-xl bg-gray-200 flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="w-3/4 h-4 rounded-full bg-gray-200" />
              <div className="w-1/2 h-3 rounded-full bg-gray-100" />
            </div>
            <div className="w-16 h-4 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Bottom nav placeholder */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-white border-t border-gray-100" />
    </div>
  )
}
