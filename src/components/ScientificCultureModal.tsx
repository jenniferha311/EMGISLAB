import React, { useEffect } from 'react';
import { X, ShieldCheck, BookOpen, AlertTriangle } from 'lucide-react';
import { MuongPatternBorder } from './MuongPatternBorder';

interface ScientificCultureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificCultureModal: React.FC<ScientificCultureModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Support Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#20332D]/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl border border-[#E8E2D5] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-[#20332D]">
        {/* Subtle decorative top border */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden rounded-t-2xl">
          <MuongPatternBorder variant="vibrant" height={6} />
        </div>

        <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2EE] text-[#174C3C] flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-[#174C3C]" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-[#174C3C] tracking-tight">
                Cơ sở khoa học & Di sản bản địa Mường
              </h2>
              <p className="text-xs text-[#556D65] mt-0.5">
                Nguyên tắc xác thực tư liệu văn hóa, phân định dữ liệu và quy chuẩn an toàn
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-[#556D65] hover:text-[#20332D] hover:bg-[#FAF7F0] transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5 text-[#A94438]" />
          </button>
        </div>

        {/* Section 1: Cultural Verification */}
        <div className="space-y-3 text-sm">
          <h3 className="font-bold text-[#174C3C] uppercase tracking-wider text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#174C3C]" />
            1. Tính xác thực của tư liệu văn hóa bản địa Mường
          </h3>
          <p className="leading-relaxed text-[#20332D]">
            • <strong>Cồng chiêng Mường:</strong> Gắn liền với không gian diễn xướng và đời sống người Mường tại Hòa Bình, Phú Thọ (nghi lễ Sắc bùa, lễ hội Mở cổng trời, đám cưới). Không tự ý gán danh hiệu UNESCO của Không gian văn hóa cồng chiêng Tây Nguyên cho cồng chiêng Mường khi chưa có tài liệu chính thức xác nhận.
          </p>
          <p className="leading-relaxed text-[#20332D]">
            • <strong>Hoa văn thổ cẩm & Nghệ thuật dệt:</strong> Phân biệt hoa văn sáng tạo lấy cảm hứng hình học với các đồ án truyền thống đã được Bảo tàng Dân tộc học và VICAS xác minh.
          </p>
          <p className="leading-relaxed text-[#20332D]">
            • <strong>Tôn vinh trí tuệ bản địa:</strong> Thể hiện sự tôn trọng tri thức dân gian của đồng bào miền núi được đúc kết qua hàng thế kỷ.
          </p>
        </div>

        {/* Section 2: Data Separation */}
        <div className="space-y-3 text-sm border-t border-[#E8E2D5] pt-4">
          <h3 className="font-bold text-[#174C3C] uppercase tracking-wider text-xs">
            2. Minh bạch phân loại dữ liệu STEM
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#FAF7F0] rounded-xl border border-[#D6AA55]/50">
              <span className="font-bold font-mono text-[#D6AA55] block mb-1 text-xs">MÔ PHỎNG</span>
              <span className="text-xs text-[#556D65]">Kết quả tính từ mô hình toán học và phương trình vật lý giáo dục.</span>
            </div>
            <div className="p-3 bg-[#EBF2EE] rounded-xl border border-[#174C3C]/30">
              <span className="font-bold font-mono text-[#174C3C] block mb-1 text-xs">ĐO THỰC TẾ</span>
              <span className="text-xs text-[#556D65]">Số liệu đo bằng microphone, thước, cảm biến hoặc nhiệt ẩm kế thật.</span>
            </div>
            <div className="p-3 bg-[#FBF0EE] rounded-xl border border-[#A94438]/30">
              <span className="font-bold font-mono text-[#A94438] block mb-1 text-xs">DỮ LIỆU MINH HỌA</span>
              <span className="text-xs text-[#556D65]">Số liệu tham chiếu từ giáo trình và tài liệu nghiên cứu đã công bố.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Safety */}
        <div className="space-y-3 text-sm border-t border-[#E8E2D5] pt-4">
          <h3 className="font-bold text-[#A94438] uppercase tracking-wider text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#A94438]" />
            3. Hướng dẫn an toàn phòng thí nghiệm STEM
          </h3>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#556D65]">
            <li>Tuyệt đối <strong>không đốt lửa trong lớp học</strong> (thực nghiệm cơm lam dùng bình nước ấm có nhiệt kế).</li>
            <li>Tuyệt đối <strong>không thử tải nặng lên cơ thể người học</strong> trong thí nghiệm đòn gánh hoặc gùi.</li>
            <li>Thao tác nan tre nứa cẩn thận tránh dằm xước tay.</li>
            <li>Microphone chỉ kích hoạt khi có sự xác nhận chủ động của người dùng; ứng dụng không gửi bản ghi âm lên máy chủ.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E8E2D5]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 bg-[#174C3C] hover:bg-[#11382C] text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Đã hiểu & Đóng cửa sổ (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
