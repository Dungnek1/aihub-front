export default function NewsLoading() {
  return (
    <div className="relative bg-[#0A0F18] font-sans text-white min-h-screen">
      <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: "1440px", width: "100%" }}>
        {/* Hero Section Skeleton */}
        <section className="pt-24 sm:pt-32 pb-12">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-700/50 rounded-lg mb-4" />
            <div className="h-4 w-96 bg-gray-700/30 rounded-lg mb-12" />
            
            {/* Featured News Skeleton */}
            <div className="w-full bg-gray-800/30 rounded-2xl overflow-hidden mb-12" style={{ height: "500px" }}>
              <div className="w-full h-64 bg-gray-700/50" />
              <div className="p-6">
                <div className="h-6 w-3/4 bg-gray-700/50 rounded mb-3" />
                <div className="h-4 w-full bg-gray-700/30 rounded mb-2" />
                <div className="h-4 w-5/6 bg-gray-700/30 rounded" />
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-800/30 rounded-xl overflow-hidden">
                  <div className="w-full h-48 bg-gray-700/50" />
                  <div className="p-4">
                    <div className="h-4 w-24 bg-gray-700/30 rounded mb-2" />
                    <div className="h-5 w-full bg-gray-700/50 rounded mb-2" />
                    <div className="h-4 w-5/6 bg-gray-700/30 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Loading Indicator */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-cyan-400 font-medium">Đang tải tin tức...</p>
        </div>
      </div>
    </div>
  );
}

