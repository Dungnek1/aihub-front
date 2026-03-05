#!/bin/bash

# Script để force revalidate cache
# Sử dụng: ./scripts/revalidate-cache.sh [all|blog|path]

# Màu sắc cho output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kiểm tra arguments
PATH_TO_REVALIDATE=${1:-"all"}

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep REVALIDATE_SECRET | xargs)
fi

if [ -f .env ]; then
    export $(cat .env | grep REVALIDATE_SECRET | xargs)
fi

# Default secret nếu không có trong env
REVALIDATE_SECRET=${REVALIDATE_SECRET:-"dev-secret-key"}

# URL của API
API_URL=${NEXT_PUBLIC_SITE_URL:-"http://localhost:5000"}
API_ENDPOINT="${API_URL}/api/revalidate"

echo -e "${YELLOW}🔄 Đang revalidate cache...${NC}"
echo -e "${YELLOW}📍 Path: ${PATH_TO_REVALIDATE}${NC}"
echo -e "${YELLOW}🌐 API: ${API_ENDPOINT}${NC}"

# Gọi API
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: ${REVALIDATE_SECRET}" \
  -d "{\"path\": \"${PATH_TO_REVALIDATE}\"}")

# Tách response body và status code
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)

# Kiểm tra kết quả
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Revalidation thành công!${NC}"
    echo -e "${GREEN}Response:${NC}"
    echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
else
    echo -e "${RED}❌ Revalidation thất bại! (HTTP $HTTP_STATUS)${NC}"
    echo -e "${RED}Response:${NC}"
    echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
    exit 1
fi

echo -e "${GREEN}✨ Xong! Cache đã được refresh.${NC}"

