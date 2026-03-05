#!/bin/bash

# Script tự động pull code từ nhánh prod với rollback khi có conflict
# Chỉ chạy trong Docker container hiện tại

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation functions
validate_git() {
    if ! command -v git &> /dev/null; then
        log_error "Git không được cài đặt. Vui lòng cài đặt git."
        exit 1
    fi
    log_info "✓ Git đã được cài đặt"
}

validate_repo() {
    if [ ! -d ".git" ]; then
        log_error "Thư mục hiện tại không phải là git repository."
        log_error "Script này cần chạy trong container có source code (development container hoặc container có mount volume)."
        exit 1
    fi
    log_info "✓ Đang ở trong git repository"
}

validate_clean_working_dir() {
    if [ -n "$(git status --porcelain)" ]; then
        log_warn "Working directory có thay đổi chưa commit."
        log_warn "Đang stash các thay đổi..."
        git stash push -m "Auto-stash before deploy-prod $(date +%Y%m%d_%H%M%S)"
        log_info "✓ Đã stash các thay đổi"
    else
        log_info "✓ Working directory sạch"
    fi
}

validate_branch() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    log_info "Nhánh hiện tại: $current_branch"
    
    # Check if prod branch exists
    if ! git show-ref --verify --quiet refs/heads/prod && ! git show-ref --verify --quiet refs/remotes/origin/prod; then
        log_error "Nhánh 'prod' không tồn tại."
        exit 1
    fi
    log_info "✓ Nhánh 'prod' tồn tại"
}

# Main deployment function
deploy() {
    log_info "=== Bắt đầu quá trình deploy từ nhánh prod ==="
    
    # Step 1: Validate prerequisites
    log_info "Bước 1: Kiểm tra prerequisites..."
    validate_git
    validate_repo
    validate_clean_working_dir
    validate_branch
    
    # Step 2: Save current commit for rollback
    log_info "Bước 2: Lưu commit hiện tại để rollback..."
    CURRENT_COMMIT=$(git rev-parse HEAD)
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "Commit hiện tại: $CURRENT_COMMIT"
    log_info "Nhánh hiện tại: $CURRENT_BRANCH"
    
    # Step 3: Check remote configuration
    log_info "Bước 3: Kiểm tra remote configuration..."
    if ! git remote get-url origin &>/dev/null; then
        log_error "Không tìm thấy remote 'origin'. Vui lòng cấu hình git remote."
        exit 1
    fi
    REMOTE_URL=$(git remote get-url origin)
    log_info "Remote origin: $REMOTE_URL"
    
    # Step 4: Fetch latest changes
    log_info "Bước 4: Fetch thay đổi mới nhất từ remote..."
    if git fetch origin prod 2>&1; then
        log_info "✓ Đã fetch thành công"
    else
        log_error "Không thể fetch từ origin/prod"
        log_error "Kiểm tra kết nối mạng và quyền truy cập repository."
        exit 1
    fi
    
    # Step 5: Check if we need to merge
    log_info "Bước 5: Kiểm tra cần merge hay không..."
    LOCAL_COMMIT=$(git rev-parse HEAD)
    REMOTE_COMMIT=$(git rev-parse origin/prod)
    
    if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
        log_info "✓ Code đã là mới nhất, không cần cập nhật"
        log_info "=== Hoàn thành ==="
        exit 0
    fi
    
    log_info "Commit local: $LOCAL_COMMIT"
    log_info "Commit remote: $REMOTE_COMMIT"
    log_info "Cần merge code mới..."
    
    # Step 6: Attempt merge
    log_info "Bước 6: Đang merge code từ origin/prod..."
    
    # Try to merge without committing first (dry-run check)
    if git merge --no-commit --no-ff origin/prod 2>&1; then
        # Check for conflicts
        if [ -n "$(git ls-files -u)" ]; then
            log_error "⚠️  PHÁT HIỆN CONFLICT!"
            log_error "Có file bị conflict, đang rollback..."
            
            # Rollback: abort merge
            git merge --abort 2>/dev/null || true
            git reset --hard "$CURRENT_COMMIT" 2>/dev/null || true
            git clean -fd 2>/dev/null || true
            
            log_error "✓ Đã rollback về commit: $CURRENT_COMMIT"
            log_error "Vui lòng giải quyết conflict thủ công trước khi deploy lại."
            exit 1
        else
            # No conflicts, complete the merge
            git commit -m "Auto-merge from origin/prod $(date +%Y%m%d_%H%M%S)" || true
            
            # If merge was already completed, reset and try again
            if [ $? -ne 0 ]; then
                git reset --hard "$CURRENT_COMMIT"
                if git merge --no-commit --no-ff origin/prod 2>&1; then
                    if [ -n "$(git ls-files -u)" ]; then
                        log_error "⚠️  PHÁT HIỆN CONFLICT!"
                        git merge --abort 2>/dev/null || true
                        git reset --hard "$CURRENT_COMMIT" 2>/dev/null || true
                        log_error "✓ Đã rollback về commit: $CURRENT_COMMIT"
                        exit 1
                    fi
                    git commit -m "Auto-merge from origin/prod $(date +%Y%m%d_%H%M%S)"
                fi
            fi
            
            log_info "✓ Merge thành công, không có conflict"
        fi
    else
        # Merge failed, check for conflicts
        MERGE_STATUS=$?
        
        if [ -n "$(git ls-files -u)" ]; then
            log_error "⚠️  PHÁT HIỆN CONFLICT!"
            log_error "Có file bị conflict, đang rollback..."
            
            # Rollback
            git merge --abort 2>/dev/null || true
            git reset --hard "$CURRENT_COMMIT" 2>/dev/null || true
            git clean -fd 2>/dev/null || true
            
            log_error "✓ Đã rollback về commit: $CURRENT_COMMIT"
            log_error "Vui lòng giải quyết conflict thủ công trước khi deploy lại."
            exit 1
        else
            log_error "Merge thất bại với lỗi: $MERGE_STATUS"
            git merge --abort 2>/dev/null || true
            git reset --hard "$CURRENT_COMMIT" 2>/dev/null || true
            log_error "✓ Đã rollback về commit: $CURRENT_COMMIT"
            exit 1
        fi
    fi
    
    # Step 7: Validate merge result
    log_info "Bước 7: Kiểm tra kết quả merge..."
    NEW_COMMIT=$(git rev-parse HEAD)
    if [ "$NEW_COMMIT" = "$CURRENT_COMMIT" ]; then
        log_warn "Commit không thay đổi sau merge, có thể có vấn đề"
    else
        log_info "✓ Merge thành công, commit mới: $NEW_COMMIT"
    fi
    
    # Step 8: Check for unmerged files (additional validation)
    if [ -n "$(git ls-files -u)" ]; then
        log_error "⚠️  Vẫn còn file chưa merge!"
        log_error "Đang rollback..."
        git reset --hard "$CURRENT_COMMIT" 2>/dev/null || true
        git clean -fd 2>/dev/null || true
        log_error "✓ Đã rollback về commit: $CURRENT_COMMIT"
        exit 1
    fi
    
    # Step 9: Build application
    log_info "Bước 8: Đang build application..."
    if npm run build; then
        log_info "✓ Build thành công"
    else
        log_error "Build thất bại, đang rollback..."
        git reset --hard "$CURRENT_COMMIT" 2>/dev/null || true
        git clean -fd 2>/dev/null || true
        log_error "✓ Đã rollback về commit: $CURRENT_COMMIT"
        exit 1
    fi
    
    log_info "=== Deploy thành công! ==="
    log_info "Commit cũ: $CURRENT_COMMIT"
    log_info "Commit mới: $NEW_COMMIT"
}

# Error handler
handle_error() {
    log_error "Script bị lỗi tại dòng $1"
    if [ -n "$CURRENT_COMMIT" ]; then
        log_warn "Đang rollback về commit: $CURRENT_COMMIT"
        git reset --hard "$CURRENT_COMMIT" 2>/dev/null || true
        git clean -fd 2>/dev/null || true
    fi
    exit 1
}

# Set error trap
trap 'handle_error $LINENO' ERR

# Run deployment
deploy

