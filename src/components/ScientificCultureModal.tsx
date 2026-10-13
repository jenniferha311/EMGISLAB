import React from 'react';
import { X, ShieldCheck, BookOpen, AlertTriangle } from 'lucide-react';

interface ScientificCultureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificCultureModal: React.FC<ScientificCultureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-stone-800">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-tight">
              Cơ sở khoa học, Di sản văn hóa & Nguyên tắc an toàn
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Cultural Verification */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            1. Tính xác thực của tư liệu văn hóa bản địa
          </h3>
          <p className="leading-relaxed text-stone-600">
            • <strong>Cồng chiêng Mường:</strong> Gắn với không gian văn hóa người Mường tại Phú Thọ, Hòa Bình. Không tự ý gán ghép danh hiệu UNESCO của "Không gian văn hóa cồng chiêng Tây Nguyên" cho cồng chiêng Mường khi chưa có tài liệu chính thức xác nhận.
          </p>
          <p className="leading-relaxed text-stone-600">
            • <strong>Hoa văn thổ cẩm & Kiến trúc:</strong> Phân biệt rõ hoa văn sáng tạo lấy cảm hứng hình học với các đồ án truyền thống đã được Bảo tàng Dân tộc học và VICAS xác minh.
          </p>
          <p className="leading-relaxed text-stone-600">
            • <strong>Không định kiến & Ngôn ngữ hòa nhập:</strong> Ứng dụng phục vụ mọi học sinh và người học; không gán nhãn giới tính lên sản phẩm hoặc nhân vật minh họa.
          </p>
        </div>

        {/* Section 2: Separation of Data Types */}
        <div className="space-y-2 text-xs border-t border-stone-200 pt-3">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs">
            2. Minh bạch phân loại dữ liệu
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 bg-amber-50 rounded border border-amber-200">
              <span className="font-bold font-mono text-amber-900 block mb-1">MÔ PHỎNG</span>
              <span className="text-stone-600">Kết quả tính từ mô hình toán học và phương trình vật lý giáo dục.</span>
            </div>
            <div className="p-2.5 bg-blue-50 rounded border border-blue-200">
              <span className="font-bold font-mono text-blue-900 block mb-1">ĐO THỰC TẾ</span>
              <span className="text-stone-600">Dữ liệu đo bằng microphone, thước, cảm biến hoặc nhiệt ẩm kế thật.</span>
            </div>
            <div className="p-2.5 bg-stone-100 rounded border border-stone-200">
              <span className="font-bold font-mono text-stone-900 block mb-1">DỮ LIỆU MINH HỌA</span>
              <span className="text-stone-600">Số liệu tham chiếu từ giáo trình và tài liệu đã công bố.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Safety */}
        <div className="space-y-2 text-xs border-t border-stone-200 pt-3">
          <h3 className="font-bold text-stone-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            3. Hướng dẫn an toàn thực hành
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>Tuyệt đối <strong>không đốt lửa trong lớp học</strong> (thực hành cơm lam thay thế bằng bình nước ấm kiểm soát nhiệt).</li>
            <li>Tuyệt đối <strong>không thử tải nặng lên cơ thể người học</strong> trong thí nghiệm đòn gánh hoặc gùi.</li>
            <li>Thao tác nan tre nan nứa cẩn thận tránh dằm xước tay.</li>
            <li>Microphone chỉ hoạt động khi có sự chủ động cấp quyền của người học; ứng dụng không tải dữ liệu âm thanh cá nhân lên máy chủ.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
