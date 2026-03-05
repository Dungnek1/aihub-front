import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

/**
 * Dynamic OG Image API Route
 * Generates Open Graph images on-the-fly for social media sharing
 * 
 * Usage: /api/og?title=...&description=...&author=...
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title') || 'AIHub Vietnam';
        const description = searchParams.get('description') || 'Advanced AI tools and insights';
        const author = searchParams.get('author') || 'AIHub Community';

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: '100%',
                        height: '100%',
                        padding: '60px',
                        background: 'linear-gradient(135deg, #0b0d11 0%, #1a1f2e 100%)',
                        color: '#ffffff',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    }}
                >
                    {/* Header with logo/branding */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                            style={{
                                fontSize: '32px',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #00d4ff 0%, #0099ff 100%)',
                                backgroundClip: 'text',
                                color: 'transparent',
                            }}
                        >
                            🤖 AIHub
                        </div>
                    </div>

                    {/* Main content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Title */}
                        <h1
                            style={{
                                margin: '0',
                                fontSize: '56px',
                                fontWeight: '700',
                                lineHeight: '1.2',
                                maxWidth: '800px',
                                color: '#ffffff',
                            }}
                        >
                            {title}
                        </h1>

                        {/* Description */}
                        <p
                            style={{
                                margin: '0',
                                fontSize: '24px',
                                lineHeight: '1.4',
                                color: '#b0b8c1',
                                maxWidth: '800px',
                            }}
                        >
                            {description}
                        </p>

                        {/* Author */}
                        <div
                            style={{
                                fontSize: '18px',
                                color: '#6b7280',
                                marginTop: '12px',
                            }}
                        >
                            By {author}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            paddingTop: '30px',
                        }}
                    >
                        <span style={{ fontSize: '18px', color: '#6b7280' }}>aihubvietnam.com</span>
                        <div
                            style={{
                                fontSize: '14px',
                                display: 'flex',
                                gap: '24px',
                                color: '#6b7280',
                            }}
                        >
                            <span>AI Tools</span>
                            <span>Blog</span>
                            <span>Community</span>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error('OG Image generation error:', error);

        // Return error response
        return new Response('Failed to generate OG image', {
            status: 500,
        });
    }
}
