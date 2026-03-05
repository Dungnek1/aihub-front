// lib/api.ts
export async function getNewsData() {
  // giả lập gọi API (sau này bạn thay URL thật vào)
  return {
    featuredNews: {
      title: "Google AI Studio",
      description:
        "Nâng Cấp Khả Năng Xử Lý Thông Tin: Gặp Gỡ Làn Chabot AI Thông Thường",
      tag: "Featured",
      author: "Nhật Linh",
      readTime: "8 min",
      image: "/ai-studio.png",
    },
    newStories: [
      {
        title: "Quantum AI: The Next Frontier",
        category: "Research",
        author: "Nhật Linh",
        readTime: "12 min",
      },
      {
        title: "AI Ethics in 2025: New Frameworks",
        category: "Research",
        author: "Nhật Linh",
        readTime: "8 min",
      },
      {
        title: "Breakthrough in Neural Interfaces",
        category: "Research",
        author: "Nhật Linh",
        readTime: "14 min",
      },
    ],
    featuredStories: [
      {
        title:
          "TOKEN2049 Singapore 2025: Từ Quá Khứ Đến Hiện Tại – Hành Trình Trở Thành Sự Kiện Web3 Lớn Nhất Thế Giới",
        image: "/thumb1.jpg",
      },
      {
        title:
          "TOKEN2049 Singapore 2025: Từ Quá Khứ Đến Hiện Tại – Hành Trình Trở Thành Sự Kiện Web3 Lớn Nhất Thế Giới",
        image: "/thumb2.jpg",
      },
      {
        title:
          "TOKEN2049 Singapore 2025: Từ Quá Khứ Đến Hiện Tại – Hành Trình Trở Thành Sự Kiện Web3 Lớn Nhất Thế Giới",
        image: "/thumb3.jpg",
      },
    ],
  };
}
