import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | Miru',
    description: 'Learn how Miru collects, uses, and protects your data.',
};

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <Link href="/" className="text-sm text-teal-600 hover:underline mb-8 inline-block">← Back to Miru</Link>

            <h1 className="text-4xl font-black text-slate-900 mb-2">Privacy Policy</h1>
            <p className="text-sm text-slate-400 mb-10">Last updated: February 20, 2026</p>

            <div className="prose prose-slate max-w-none space-y-8">

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">1. Who We Are</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Miru (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an AI-powered travel planning application. We are committed to protecting your personal information and your right to privacy.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">2. Information We Collect</h2>
                    <ul className="list-disc pl-5 text-slate-600 space-y-2 leading-relaxed">
                        <li><strong>Account Information:</strong> When you sign in via Google or email (through Clerk), we receive your name and email address for authentication purposes.</li>
                        <li><strong>Trip Data:</strong> Trip itineraries, destinations, dates, and preferences you create or save within the app.</li>
                        <li><strong>Usage Data:</strong> Pages you visit and features you interact with, collected via PostHog analytics.</li>
                        <li><strong>Payment Information:</strong> Processed securely by Mayar.id via QRIS or bank transfer. We do not store your payment credentials.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">3. How We Use Your Information</h2>
                    <ul className="list-disc pl-5 text-slate-600 space-y-2 leading-relaxed">
                        <li>To provide and improve the Miru service</li>
                        <li>To generate and save your travel itineraries</li>
                        <li>To process subscription payments via Mayar.id</li>
                        <li>To understand how users interact with the product (PostHog analytics)</li>
                        <li>To send important service-related communications</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">4. Data Sharing</h2>
                    <p className="text-slate-600 leading-relaxed">
                        We <strong>do not sell your personal data</strong> to third parties. We share data only with trusted service providers necessary to operate Miru:
                    </p>
                    <ul className="list-disc pl-5 text-slate-600 space-y-2 leading-relaxed mt-3">
                        <li><strong>Clerk</strong> — Authentication</li>
                        <li><strong>Mayar.id</strong> — Payment processing (QRIS &amp; bank transfer)</li>
                        <li><strong>PostHog</strong> — Product analytics</li>
                        <li><strong>Amadeus</strong> — Flight data</li>
                        <li><strong>OpenAI / Gemini</strong> — AI itinerary generation</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">5. Trip Sharing</h2>
                    <p className="text-slate-600 leading-relaxed">
                        When you share a trip using the &quot;Share Link&quot; feature, your trip itinerary (destination, dates, activities) becomes publicly accessible via that link. No personal account information (name, email) is included in the shared view.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">6. Data Retention &amp; Deletion</h2>
                    <p className="text-slate-600 leading-relaxed">
                        You can delete your trips at any time from within the app. To request full account deletion, contact us at <a href="mailto:hello@miru.travel" className="text-teal-600 hover:underline">hello@miru.travel</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">7. Contact</h2>
                    <p className="text-slate-600 leading-relaxed">
                        For privacy-related questions, email us at <a href="mailto:hello@miru.travel" className="text-teal-600 hover:underline">hello@miru.travel</a>.
                    </p>
                </section>

            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
                <Link href="/terms" className="hover:text-teal-600 transition-colors">Terms of Service</Link>
                <span className="mx-2">·</span>
                <Link href="/" className="hover:text-teal-600 transition-colors">Back to Miru</Link>
            </div>
        </div>
    );
}
