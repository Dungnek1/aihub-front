#!/bin/bash

# Enhanced Zalo Sharing Test Script
# Tests various aspects of social media sharing optimization

echo "🚀 AIHub Vietnam - Comprehensive Social Media Sharing Test"
echo "=========================================================="

# Configuration
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://aihubvietnam.com}"
TEST_BLOG_URL="$SITE_URL/vi/blog/test-post"
API_BASE="$SITE_URL/api"

echo "🔍 Testing Site: $SITE_URL"
echo ""

# Function to test URL with specific user agent
test_crawler() {
    local platform=$1
    local user_agent=$2
    local test_url=$3
    
    echo "📱 Testing $platform crawler..."
    echo "   User-Agent: $user_agent"
    echo "   URL: $test_url"
    
    response=$(curl -s -w "HTTP_STATUS:%{http_code}\nREDIRECT_URL:%{redirect_url}\nCONTENT_TYPE:%{content_type}\n" \
        -H "User-Agent: $user_agent" \
        -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
        -H "Cache-Control: no-cache" \
        -H "Accept-Language: vi-VN,vi;q=0.9,en;q=0.8" \
        "$test_url")
    
    # Extract metadata from response
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    content_type=$(echo "$response" | grep "CONTENT_TYPE:" | cut -d: -f2)
    
    # Extract key meta tags
    og_title=$(echo "$response" | grep -i 'property="og:title"' | sed -n 's/.*content="\([^"]*\)".*/\1/p' | head -1)
    og_description=$(echo "$response" | grep -i 'property="og:description"' | sed -n 's/.*content="\([^"]*\)".*/\1/p' | head -1)
    og_image=$(echo "$response" | grep -i 'property="og:image"' | sed -n 's/.*content="\([^"]*\)".*/\1/p' | head -1)
    
    echo "   ✅ HTTP Status: $http_status"
    echo "   ✅ Content-Type: $content_type"
    echo "   📝 OG Title: ${og_title:-'Not found'}"
    echo "   📄 OG Description: ${og_description:0:100}${og_description:100+:...}"
    echo "   🖼️  OG Image: ${og_image:-'Not found'}"
    echo ""
}

# Test different social media crawlers
echo "🤖 Testing Social Media Crawlers"
echo "================================="

# Zalo (Primary target)
test_crawler "Zalo" "ZaloPC-win32" "$SITE_URL/vi"

# Facebook
test_crawler "Facebook" "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" "$SITE_URL/vi"

# Twitter
test_crawler "Twitter" "Twitterbot/1.0" "$SITE_URL/vi"

# LinkedIn
test_crawler "LinkedIn" "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com/)" "$SITE_URL/vi"

# WhatsApp
test_crawler "WhatsApp" "WhatsApp/2.0" "$SITE_URL/vi"

echo "🔧 Testing API Endpoints"
echo "========================"

# Test meta validation API
echo "📋 Testing Meta Validation API..."
meta_response=$(curl -s "$API_BASE/meta-validate?url=$SITE_URL/vi&platform=zalo")
echo "   Response: ${meta_response:0:200}..."
echo ""

# Test OG image generation
echo "🖼️  Testing OG Image Generation..."
og_image_url="$API_BASE/og?title=Test%20Title&description=Test%20Description&platform=zalo"
og_response=$(curl -s -w "HTTP_STATUS:%{http_code}" -o /dev/null "$og_image_url")
echo "   OG Image Status: $og_response"
echo "   OG Image URL: $og_image_url"
echo ""

# Test sitemap
echo "🗺️  Testing Sitemap..."
sitemap_response=$(curl -s -w "HTTP_STATUS:%{http_code}" -o /dev/null "$SITE_URL/sitemap.xml")
echo "   Sitemap Status: $sitemap_response"
echo ""

echo "🎯 Zalo-Specific Tests"
echo "====================="

# Test with direct meta validation for Zalo
echo "🔍 Testing Zalo Direct Meta Validation..."
zalo_direct=$(curl -s "$API_BASE/meta-validate?url=$SITE_URL/vi&platform=zalo&direct=true")
if [[ $zalo_direct == *"<title>"* ]]; then
    echo "   ✅ Direct HTML response generated"
    zalo_title=$(echo "$zalo_direct" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
    echo "   📝 Extracted Title: $zalo_title"
else
    echo "   ❌ Failed to generate direct HTML response"
fi
echo ""

# Test cache headers for Zalo
echo "🗂️  Testing Cache Headers for Zalo..."
cache_headers=$(curl -s -I \
    -H "User-Agent: ZaloPC-win32" \
    "$SITE_URL/vi" | grep -i 'cache-control\|pragma\|expires')
echo "   Cache Headers:"
echo "$cache_headers" | sed 's/^/      /'
echo ""

echo "📊 Summary and Recommendations"
echo "=============================="

# Check if OG image is accessible
og_image_check=$(curl -s -w "HTTP_STATUS:%{http_code}" -o /dev/null "$SITE_URL/og-image.png?v=v5-zalo-fix&t=$(date +%s)")
if [[ $og_image_check == "200" ]]; then
    echo "✅ Static OG image is accessible"
else
    echo "❌ Static OG image failed (Status: $og_image_check)"
fi

# Check if favicon exists
favicon_check=$(curl -s -w "HTTP_STATUS:%{http_code}" -o /dev/null "$SITE_URL/frame-83.png")
if [[ $favicon_check == "200" ]]; then
    echo "✅ Favicon is accessible"
else
    echo "❌ Favicon failed (Status: $favicon_check)"
fi

echo ""
echo "🎉 Test completed!"
echo ""
echo "💡 Next Steps for Zalo Optimization:"
echo "   1. Ensure static OG image (/og-image.png) exists and is accessible"
echo "   2. Verify no-cache headers are properly set for Zalo user agents"
echo "   3. Test sharing in Zalo app with actual URLs"
echo "   4. Monitor meta validation API for any errors"
echo ""
echo "🔗 Useful URLs for manual testing:"
echo "   - Meta Validator: $API_BASE/meta-validate?url=$SITE_URL/vi&platform=zalo"
echo "   - OG Image: $API_BASE/og?title=Test&platform=zalo"
echo "   - Direct Meta: $API_BASE/meta-validate?url=$SITE_URL/vi&platform=zalo&direct=true"
echo ""