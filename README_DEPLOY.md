# Hướng dẫn Deploy Tự Động

## Script Deploy Tự Động từ Nhánh Prod

Script `deploy-prod.sh` tự động pull code từ nhánh `prod`, kiểm tra conflict, và rollback nếu có lỗi.

### Tính năng

- ✅ Tự động pull code từ nhánh `prod`
- ✅ Kiểm tra conflict trước khi merge
- ✅ Tự động rollback nếu có conflict hoặc build thất bại
- ✅ Validate đầy đủ các bước
- ✅ Logging chi tiết với màu sắc
- ✅ Chỉ hoạt động trong Docker container hiện tại

### Cách sử dụng

#### Trong Docker Container

```bash
# Chạy script trong container đang chạy
docker exec -it <container-name> npm run deploy:prod

# Hoặc nếu container có tên là aihub-frontend
docker exec -it aihub-frontend npm run deploy:prod
```

#### Yêu cầu

1. **Container phải có source code**: Script cần chạy trong container có `.git` folder (development container hoặc container có mount volume)
2. **Git đã được cài đặt**: Dockerfile đã cài git và bash
3. **Remote 'origin' đã được cấu hình**: Repository phải có remote origin trỏ đến git repository
4. **Nhánh 'prod' tồn tại**: Phải có nhánh `prod` local hoặc remote

### Quy trình hoạt động

1. **Validate prerequisites**: Kiểm tra git, repository, working directory
2. **Lưu commit hiện tại**: Lưu commit để rollback nếu cần
3. **Fetch từ remote**: Lấy code mới nhất từ `origin/prod`
4. **Kiểm tra cần merge**: So sánh commit local và remote
5. **Merge code**: Merge `origin/prod` vào nhánh hiện tại
6. **Kiểm tra conflict**: Nếu có conflict → rollback và dừng
7. **Validate merge**: Kiểm tra kết quả merge
8. **Build application**: Chạy `npm run build`
9. **Rollback nếu build thất bại**: Tự động rollback về commit cũ

### Ví dụ Output

```
[INFO] === Bắt đầu quá trình deploy từ nhánh prod ===
[INFO] Bước 1: Kiểm tra prerequisites...
[INFO] ✓ Git đã được cài đặt
[INFO] ✓ Đang ở trong git repository
[INFO] ✓ Working directory sạch
[INFO] ✓ Nhánh 'prod' tồn tại
[INFO] Bước 2: Lưu commit hiện tại để rollback...
[INFO] Commit hiện tại: abc123...
[INFO] Bước 3: Kiểm tra remote configuration...
[INFO] Remote origin: https://github.com/user/repo.git
[INFO] Bước 4: Fetch thay đổi mới nhất từ remote...
[INFO] ✓ Đã fetch thành công
[INFO] Bước 5: Kiểm tra cần merge hay không...
[INFO] Cần merge code mới...
[INFO] Bước 6: Đang merge code từ origin/prod...
[INFO] ✓ Merge thành công, không có conflict
[INFO] Bước 7: Kiểm tra kết quả merge...
[INFO] ✓ Merge thành công, commit mới: def456...
[INFO] Bước 8: Đang build application...
[INFO] ✓ Build thành công
[INFO] === Deploy thành công! ===
```

### Xử lý Conflict

Nếu có conflict, script sẽ:
1. Phát hiện conflict ngay lập tức
2. Rollback về commit cũ
3. Dừng quá trình deploy
4. Hiển thị thông báo lỗi rõ ràng

```
[ERROR] ⚠️  PHÁT HIỆN CONFLICT!
[ERROR] Có file bị conflict, đang rollback...
[ERROR] ✓ Đã rollback về commit: abc123...
[ERROR] Vui lòng giải quyết conflict thủ công trước khi deploy lại.
```

### Lưu ý

- Script chỉ hoạt động trong Docker container có source code
- Nếu container production không có source code, cần mount volume hoặc dùng development container
- Script tự động stash các thay đổi chưa commit trước khi pull
- Build sẽ được chạy sau khi merge thành công
- Nếu build thất bại, script sẽ tự động rollback

### Troubleshooting

**Lỗi: "Thư mục hiện tại không phải là git repository"**
- Đảm bảo container có source code (mount volume hoặc dùng development container)

**Lỗi: "Không thể fetch từ origin/prod"**
- Kiểm tra kết nối mạng
- Kiểm tra quyền truy cập repository
- Kiểm tra remote origin đã được cấu hình đúng

**Lỗi: "Nhánh 'prod' không tồn tại"**
- Đảm bảo nhánh `prod` tồn tại local hoặc remote
- Chạy `git fetch origin` để lấy nhánh từ remote

