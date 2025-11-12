export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-black to-secondary-black flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated Logo */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-accent-yellow animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-primary-black flex items-center justify-center">
            <span className="text-accent-yellow text-3xl font-bold">CR</span>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Loading...</h2>
          <p className="text-custom-gray">Finding your perfect property</p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-secondary-black rounded-full overflow-hidden mx-auto relative">
          <div className="absolute h-full w-1/2 bg-accent-yellow rounded-full animate-loading" />
        </div>
      </div>
    </div>
  );
}

