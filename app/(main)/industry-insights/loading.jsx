export default function Loading() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-5 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="space-y-6">
        {/* Generation Form Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-6"></div>
          <div className="flex gap-4">
            <div className="h-10 flex-1 bg-gray-100 rounded"></div>
            <div className="h-10 w-32 bg-gray-100 rounded"></div>
          </div>
        </div>

        {/* Insights Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
            <div className="h-32 w-full bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
