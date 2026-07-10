import { NextRequest, NextResponse } from 'next/server'
import { existsSync, writeFileSync } from 'fs'
import { join } from 'path'

// Gradient placeholder SVG returned while generation is pending or unavailable
function buildPlaceholderSvg(cityName: string): string {
    return `<svg id="landmark-${cityName.toLowerCase()}" viewBox="0 0 390 650" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="placeholder-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#060F1E"/>
      <stop offset="40%" stop-color="#0D5463"/>
      <stop offset="75%" stop-color="#C2500A"/>
      <stop offset="100%" stop-color="#7A2E0A"/>
    </linearGradient>
  </defs>
  <rect width="390" height="650" fill="url(#placeholder-sky)"/>
  <text
    x="195" y="320"
    font-family="Poppins, sans-serif"
    font-weight="700"
    font-size="36"
    fill="white"
    text-anchor="middle"
    opacity="0.9"
  >${cityName}</text>
  <text
    x="195" y="360"
    font-family="Poppins, sans-serif"
    font-weight="400"
    font-size="14"
    fill="rgba(255,255,255,0.5)"
    text-anchor="middle"
  >Generating illustration...</text>
</svg>`
}

export async function POST(req: NextRequest) {
    try {
        const { slug, cityName, landmark } = await req.json()

        if (!slug || !cityName) {
            return NextResponse.json({ error: 'slug and cityName are required' }, { status: 400 })
        }

        const sanitizedSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        const svgPath = join(process.cwd(), 'public', 'assets', 'destinations', `${sanitizedSlug}.svg`)
        const publicUrl = `/assets/destinations/${sanitizedSlug}.svg`

        // Already exists — return ready immediately
        if (existsSync(svgPath)) {
            return NextResponse.json({ status: 'ready', url: publicUrl })
        }

        // Write placeholder so the page can hot-swap immediately
        const placeholder = buildPlaceholderSvg(cityName)
        writeFileSync(svgPath, placeholder, 'utf-8')

        // Claude Design API integration point.
        // When available, replace the file contents with the generated SVG.
        // For now: return 'generating' so the frontend shows the gradient placeholder
        // and does not retry aggressively.
        //
        // Future implementation:
        // const generated = await callClaudeDesignApi({ slug, cityName, landmark })
        // writeFileSync(svgPath, generated, 'utf-8')
        // return NextResponse.json({ status: 'ready', url: publicUrl })

        return NextResponse.json({ status: 'generating', url: publicUrl })
    } catch (err) {
        console.error('[generate-destination-svg]', err)
        return NextResponse.json({ status: 'generating', url: null }, { status: 500 })
    }
}
