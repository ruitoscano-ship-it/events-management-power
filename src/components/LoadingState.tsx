export function LoadingState({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff2d6a] border-t-transparent" />
      {message && <p className="text-sm text-slate-400">{message}</p>}
    </div>
  )
}
