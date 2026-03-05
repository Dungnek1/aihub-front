/**
 * DOMPurify vs Regex Sanitization - So sánh
 * 
 * VÍ DỤ 1: XSS Attack phức tạp
 * 
 * Input nguy hiểm:
 * <img src=x onerror="alert('XSS')">
 * <svg onload="alert('XSS')">
 * <iframe src="javascript:alert('XSS')">
 * 
 * Regex hiện tại: Có thể bỏ sót một số trường hợp
 * DOMPurify: ✅ Loại bỏ TẤT CẢ các event handlers và javascript: protocol
 * 
 * 
 * VÍ DỤ 2: HTML hợp lệ nhưng có thể nguy hiểm
 * 
 * Input:
 * <a href="javascript:alert('XSS')">Click me</a>
 * 
 * Regex hiện tại: Có thể chỉ remove "javascript:" nhưng không xử lý đúng cách
 * DOMPurify: ✅ Chuyển thành <a>safe</a> hoặc loại bỏ href nguy hiểm
 * 
 * 
 * VÍ DỤ 3: Nested tags phức tạp
 * 
 * Input:
 * <div><script>alert('XSS')</script></div>
 * 
 * Regex hiện tại: Có thể xử lý được
 * DOMPurify: ✅ Xử lý tốt hơn và giữ lại <div> nếu cần
 * 
 * 
 * VÍ DỤ 4: HTML entities và encoding
 * 
 * Input:
 * &#60;script&#62;alert('XSS')&#60;/script&#62;
 * 
 * Regex hiện tại: ❌ Có thể không decode và detect được
 * DOMPurify: ✅ Decode và sanitize đúng cách
 */

