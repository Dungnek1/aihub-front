export default function BlockchainNetworkSection() {
  return (
    <>
      <div
        className="relative overflow-hidden w-full"
        style={{
          background: "linear-gradient(135deg, #ECFEFF 0%, #EFF6FF 50%, #FAF5FF 100%)"
        }}
      >
        {/* Container to center content */}
        <div className="relative w-full max-w-[1440px] mx-auto">
          {/* Desktop Layout */}
          <div className="hidden lg:block relative" style={{ height: "727px" }}>
            {/* Blockchain-pic1 - Top Left */}
            <img
              src="/Blockchain-pic1.png"
              alt="Blockchain"
              className="absolute"
              style={{
                width: "32.3%",
                height: "auto",
                top: "21.6%",
                left: "6.94%",
                borderRadius: "20px",
                opacity: 1
              }}
            />

            {/* Text Content Box - Bottom Left */}
            <div
              className="absolute rounded-[16px] bg-white/80 backdrop-blur-sm flex flex-col justify-center gap-2"
              style={{
                width: "41.9%",
                maxWidth: "603px",
                minHeight: "200px",
                top: "51.9%",
                left: "6.94%",
                padding: "20px",
                opacity: 1
              }}
            >
              {/* First Paragraph */}
              <p className="text-gray-700 text-base leading-relaxed">
                <span className="font-bold text-cyan-500">Aihub Vietnam</span> là đơn vị <span className="font-bold">phát triển và vận hành các giải pháp blockchain</span> toàn diện, cung cấp nền tảng công nghệ cho doanh nghiệp, startup và các tổ chức đang định hình tương lai tài sản số.
              </p>

              {/* Second Paragraph */}
              <p className="text-gray-700 text-base leading-relaxed">
                Với tư duy đổi mới và tinh thần tiên phong, chúng tôi tạo ra các sản phẩm công nghệ <span className="font-bold">mạnh mẽ – bảo mật – sẵn sàng mở rộng</span>, giúp khách hàng bước vào kỷ nguyên số một cách tự tin và bền vững.
              </p>
            </div>

            {/* Decorative Elements */}
            {/* Mask group - Background layer */}
            <img
              src="/Mask group.png"
              alt="Mask Group Background"
              className="absolute"
              style={{
                width: "42%",
                height: "auto",
                top: "24.8%",
                left: "52.1%",
                opacity: 1,
              }}
            />

            {/* Group.png */}
            <img
              src="/Group.png"
              alt="Group"
              className="absolute"
              style={{
                width: "16.3%",
                height: "auto",
                top: "40%",
                left: "64.1%",
                opacity: 1,
              }}
            />

            {/* Ball.png - Large */}
            <img
              src="/Ball.png"
              alt="Ball Large"
              className="absolute"
              style={{
                width: "9.65%",
                height: "auto",
                top: "20.9%",
                left: "77.85%",
                opacity: 1,
              }}
            />

            {/* Ball.png - Medium */}
            <img
              src="/Ball.png"
              alt="Ball Medium"
              className="absolute"
              style={{
                width: "5.76%",
                height: "auto",
                top: "51%",
                left: "54.44%",
                opacity: 1,
              }}
            />

            {/* Ball.png - Small */}
            <img
              src="/Ball.png"
              alt="Ball Small"
              className="absolute"
              style={{
                width: "3.4%",
                height: "auto",
                top: "74%",
                left: "82.7%",
                opacity: 1,
              }}
            />
          </div>

          {/* Tablet Layout (640px - 1023px) */}
          <div className="flex lg:hidden flex-col items-center relative px-8 py-12 w-full mt-12 sm:mt-0">
            {/* Blockchain-pic1 Image */}
            <div className="flex justify-center mb-8 w-full">
              <img
                src="/Blockchain-pic1.png"
                alt="Blockchain"
                className="rounded-[20px] w-full max-w-[400px] h-auto"
              />
            </div>

            {/* Text Content */}
            <div className="rounded-[16px] bg-white/80 backdrop-blur-sm p-5 mx-auto w-full" style={{ maxWidth: "500px" }}>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                <span className="font-bold text-cyan-500">Aihub Vietnam</span> là đơn vị <span className="font-bold">phát triển và vận hành các giải pháp blockchain</span> toàn diện, cung cấp nền tảng công nghệ cho doanh nghiệp, startup và các tổ chức đang định hình tương lai tài sản số.
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Với tư duy đổi mới và tinh thần tiên phong, chúng tôi tạo ra các sản phẩm công nghệ <span className="font-bold">mạnh mẽ – bảo mật – sẵn sàng mở rộng</span>, giúp khách hàng bước vào kỷ nguyên số một cách tự tin và bền vững.
              </p>
            </div>

            {/* Decorative Elements Container */}
            <div
              className="relative mt-16 w-full max-w-[376px]"
              style={{
                aspectRatio: "376/344",
              }}
            >
              {/* Group.png */}
              <img
                src="/Group.png"
                alt="Group"
                className="absolute"
                style={{
                  width: "49.16%",
                  height: "auto",
                  top: "31.9%",
                  left: "25.53%",
                  opacity: 1,
                }}
              />

              {/* Ball 1 */}
              <img
                src="/Ball.png"
                alt="Ball 1"
                className="absolute"
                style={{
                  width: "17.55%",
                  height: "auto",
                  top: "50.29%",
                  left: "0%",
                  opacity: 1,
                }}
              />

              {/* Ball 2 */}
              <img
                src="/Ball.png"
                alt="Ball 2"
                className="absolute"
                style={{
                  width: "29.26%",
                  height: "auto",
                  top: "0%",
                  left: "70.74%",
                  opacity: 1,
                }}
              />

              {/* Ball 3 */}
              <img
                src="/Ball.png"
                alt="Ball 3"
                className="absolute"
                style={{
                  width: "10.11%",
                  height: "auto",
                  top: "88.37%",
                  left: "85.64%",
                  opacity: 1,
                }}
              />
            </div>
          </div>

          {/* Mobile Layout (< 640px) */}
          <div className="sm:hidden flex items-center justify-center py-12 px-4 min-h-[400px]">
            <div className="rounded-[16px] bg-white/80 backdrop-blur-sm p-5 w-full max-w-[600px] flex flex-col justify-center gap-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                <span className="font-bold text-cyan-500">Aihub Vietnam</span> là đơn vị phát triển và vận hành các giải pháp blockchain toàn diện, cung cấp nền tảng công nghệ cho doanh nghiệp, startup và các tổ chức đang định hình tương lai tài sản số.
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                Với tư duy đổi mới và tinh thần tiên phong, chúng tôi tạo ra các sản phẩm công nghệ <span className="font-bold">mạnh mẽ – bảo mật – sẵn sàng mở rộng</span>, giúp khách hàng bước vào kỷ nguyên số một cách tự tin và bền vững.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Rectangle Section - Full Width at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-[50px]">
          <img
            src="/Rectangle1.png"
            alt="Rectangle1"
            className="w-full h-full object-cover"
          />
        </div>
      </div>


    </>
  );
}