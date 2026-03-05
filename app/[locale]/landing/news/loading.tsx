export default function LandingNewsLoading() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-8 px-4 sm:px-8">
      <div className="max-w-[1240px] mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded-lg mb-4" />
          <div className="h-6 w-96 bg-gray-100 rounded-lg" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-3 mb-8 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg flex-shrink-0" />
          ))}
        </div>

        {/* Featured Post Skeleton */}
        <div className="bg-gray-100 rounded-2xl overflow-hidden mb-8 h-[400px]">
          <div className="w-full h-56 bg-gray-200" />
          <div className="p-6">
            <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
            <div className="h-6 w-3/4 bg-gray-300 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded" />
          </div>
        </div>

        {/* Grid Posts Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl overflow-hidden">
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-4">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-full bg-gray-300 rounded mb-2" />
                <div className="h-4 w-4/5 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Loading Spinner */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-3 border-gray-200 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-gray-600 font-medium text-sm">Loading news...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

