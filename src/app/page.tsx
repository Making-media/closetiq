import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-base tracking-tight">ClosetIQ</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/onboarding"
              className="text-sm bg-white text-black px-4 py-1.5 rounded-md font-medium hover:bg-zinc-100 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <section className="py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
            Your wardrobe,{" "}
            <span className="text-zinc-400">intelligently styled</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
            ClosetIQ uses AI to scan, classify, and style everything in your
            closet — so you always know what to wear and what to buy next.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-black rounded-md font-semibold text-base hover:bg-zinc-100 transition-colors"
          >
            Start for free
          </Link>
        </section>

        {/* Feature Cards */}
        <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-xl">
              📷
            </div>
            <h3 className="text-base font-semibold mb-2">Scan &amp; Classify</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Photograph any garment and our AI instantly identifies type,
              color, pattern, and material — building your digital wardrobe
              automatically.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-xl">
              🧊
            </div>
            <h3 className="text-base font-semibold mb-2">3D Closet</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              See your entire wardrobe rendered in 3D. Browse by category,
              color, or season and visualize outfits before you get dressed.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-xl">
              ✨
            </div>
            <h3 className="text-base font-semibold mb-2">AI Stylist</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Get personalized outfit suggestions scored for color harmony,
              proportion, and your style goals — every single day.
            </p>
          </div>
        </section>

        {/* Shop Smart */}
        <section className="py-16 border-t border-zinc-800">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Shop smarter, not more
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              ClosetIQ analyzes the gaps in your wardrobe and surfaces items
              that unlock the most outfit combinations. Stop buying things that
              don't go with anything — start building a closet that works.
            </p>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 border-t border-zinc-800">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Simple pricing</h2>
          <p className="text-zinc-400 mb-10">No subscriptions. Pay once, use forever.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {/* Free */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
              <p className="text-sm text-zinc-400 mb-1">Free</p>
              <p className="text-3xl font-bold mb-6">$0</p>
              <ul className="space-y-2 text-sm text-zinc-400 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600">✓</span> Scan up to 20 garments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600">✓</span> Basic outfit suggestions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600">✓</span> Style goal setup
                </li>
              </ul>
              <Link
                href="/onboarding"
                className="block text-center px-4 py-2 rounded-md border border-zinc-600 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Lifetime */}
            <div className="rounded-xl border border-white/20 bg-zinc-900/50 p-6 relative">
              <span className="absolute top-4 right-4 text-xs bg-white text-black px-2 py-0.5 rounded-full font-medium">
                Best value
              </span>
              <p className="text-sm text-zinc-400 mb-1">Lifetime</p>
              <p className="text-3xl font-bold mb-1">$49.99</p>
              <p className="text-xs text-zinc-500 mb-6">one-time payment</p>
              <ul className="space-y-2 text-sm text-zinc-400 mb-8">
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span> Unlimited garments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span> 3D Closet view
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span> Full AI Stylist access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span> Smart shopping suggestions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-white">✓</span> All future features
                </li>
              </ul>
              <Link
                href="/onboarding"
                className="block text-center px-4 py-2 rounded-md bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors"
              >
                Get lifetime access
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-8">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-sm font-semibold">ClosetIQ</span>
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} ClosetIQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
