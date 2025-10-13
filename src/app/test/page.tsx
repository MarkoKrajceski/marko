export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-xl">If you can see this, Next.js is working!</p>
        <div className="mt-8 space-y-2">
          <p>Environment: {process.env.NODE_ENV}</p>
          <p>API URL: {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
          <p>Site URL: {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
}