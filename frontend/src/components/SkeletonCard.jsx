export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white animate-pulse shadow-sm border border-gray-100">
      <div className="h-48 bg-gray-200" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
        <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
      </div>
    </div>
  )
}
