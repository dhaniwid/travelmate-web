import Link from 'next/link';

export const metadata = {
    title: 'Terms of Service | Miru',
    description: 'Read the Miru Terms of Service before using our AI travel planning application.',
};

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <Link href="/" className="text-sm text-teal-600 hover:underline mb-8 inline-block">← Back to Miru</Link>

            <h1 className="text-4xl font-black text-slate-900 mb-2">Terms of Service</h1>
            <p className="text-sm text-slate-400 mb-10">Last updated: February 20, 2026</p>

            <div className="prose prose-slate max-w-none space-y-8">

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
                    <p className="text-slate-600 leading-relaxed">
                        By accessing or using Miru (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">2. AI-Generated Content Disclaimer</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Miru uses artificial intelligence to generate travel itineraries, activity recommendations, and flight information. <strong>All AI-generated suggestions should be independently verified.</strong> We make no guarantees about the accuracy, availability, or pricing of any travel recommendation. Always confirm bookings directly with airlines, hotels, and service providers.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">3. Flight Data</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Flight prices and availability are sourced from Amadeus and are provided for informational purposes only. Prices may change at any time. Miru is not a booking platform and does not process flight reservations.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">4. Service Tiers</h2>
                    <div className="overflow-x-auto mt-3">
                        <table className="w-full text-sm text-left border border-slate-200 rounded-lg overflow-hidden">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Feature</th>
                                    <th className="px-4 py-3 font-semibold text-slate-700">Free</th>
                                    <th className="px-4 py-3 font-semibold text-teal-700">Pro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-4 py-3 text-slate-600">Trip generations</td>
                                    <td className="px-4 py-3 text-slate-500">3 / month</td>
                                    <td className="px-4 py-3 text-teal-600 font-medium">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-slate-600">Saved trips</td>
                                    <td className="px-4 py-3 text-slate-500">3</td>
                                    <td className="px-4 py-3 text-teal-600 font-medium">Unlimited</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-slate-600">PDF Export</td>
                                    <td className="px-4 py-3 text-slate-500">—</td>
                                    <td className="px-4 py-3 text-teal-600 font-medium">✓</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-slate-600">Trip Collaboration</td>
                                    <td className="px-4 py-3 text-slate-500">—</td>
                                    <td className="px-4 py-3 text-teal-600 font-medium">✓</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-slate-600">Miru AI Chat</td>
                                    <td className="px-4 py-3 text-slate-500">—</td>
                                    <td className="px-4 py-3 text-teal-600 font-medium">✓</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">5. Subscriptions &amp; Payments</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Pro subscriptions are billed monthly or annually via Mayar.id (QRIS and bank transfer). You may cancel at any time. Refunds are handled at our discretion. Continued access to Pro features requires an active subscription.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">6. User Responsibilities</h2>
                    <ul className="list-disc pl-5 text-slate-600 space-y-2 leading-relaxed">
                        <li>You must not use Miru for any unlawful purpose</li>
                        <li>You are responsible for all activity under your account</li>
                        <li>You must not attempt to scrape, reverse engineer, or abuse the service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">7. Limitation of Liability</h2>
                    <p className="text-slate-600 leading-relaxed">
                        Miru is provided &quot;as is&quot; without warranties of any kind. We are not liable for any travel-related losses, missed bookings, or inaccuracies arising from AI-generated content. Use the Service at your own risk.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">8. Changes to Terms</h2>
                    <p className="text-slate-600 leading-relaxed">
                        We may update these terms from time to time. Continued use of Miru after changes constitutes acceptance of the new terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-3">9. Contact</h2>
                    <p className="text-slate-600 leading-relaxed">
                        For questions about these terms, email <a href="mailto:hello@miru.travel" className="text-teal-600 hover:underline">hello@miru.travel</a>.
                    </p>
                </section>

            </div>

            <div className="mt-16 pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
                <Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
                <span className="mx-2">·</span>
                <Link href="/" className="hover:text-teal-600 transition-colors">Back to Miru</Link>
            </div>
        </div>
    );
}
