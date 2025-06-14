// src/app/coin/[coinId]/components/LoadingPageSkeleton.tsx

export const LoadingPageSkeleton = () => (
    <div className="flex flex-col text-white p-4 lg:p-6">
      <div className="flex flex-row justify-between items-center lg:w-[73.7%] mb-3">
        <div className="flex flex-row items-start lg:items-center text-sm gap-4 animate-pulse">
          {/* Name and ticker skeleton */}
          <div className="h-6 w-24 bg-gray-700 rounded"></div>
          <div className="h-6 w-16 bg-gray-700 rounded"></div>
          <div className="h-6 w-32 bg-gray-700 rounded"></div>
          <div className="h-6 w-36 bg-gray-700 rounded"></div>
        </div>
        
        {/* Creator badge skeleton */}
        <div className="flex items-center bg-gray-700 rounded-lg px-3 py-1 gap-2 animate-pulse">
          <div className="w-6 h-6 rounded-full bg-gray-600 mr-2"></div>
          <div className="h-4 w-20 bg-gray-600 rounded"></div>
          <div className="h-3 w-16 bg-gray-600 rounded"></div>
        </div>
      </div>
  
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Chart skeleton */}
        <div className="w-full lg:w-2/3 xl:w-3/4">
          <div className="h-[50vh] lg:h-[calc(100vh-200px)] bg-gray-700 rounded animate-pulse" />
        </div>
  
        {/* Buy/Sell component skeleton */}
        <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4 animate-pulse">
          <div className="flex gap-2">
            <div className="flex-1 h-10 bg-gray-700 rounded"></div>
            <div className="flex-1 h-10 bg-gray-700 rounded"></div>
          </div>
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
)