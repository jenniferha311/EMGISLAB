import React, { useState } from 'react';
import { 
  FileText, 
  Award, 
  Download, 
  Upload, 
  CheckCircle2, 
  Printer, 
  Trash2, 
  Users, 
  BarChart3, 
  AlertCircle,
  HelpCircle,
  Search,
  ShieldCheck
} from 'lucide-react';
import { 
  getResearchLogs, 
  deleteResearchLog, 
  getCurrentStudent, 
  setCurrentStudent, 
  getRubricEvaluations, 
  saveRubricEvaluation, 
  getSurveyRecords, 
  saveSurveyRecord, 
  exportToCSV, 
  exportToJSON 
} from '../utils/storage';
import { ResearchLogEntry, RubricEvaluation, PrePostSurveyRecord } from '../types';
import { MuongPatternBorder } from '../components/MuongPatternBorder';

export const ResearchHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'journal' | 'rubric' | 'pre_post' | 'export'>('journal');
  const [currentStudentCode, setCode] = useState<string>(getCurrentStudent());
  const [logs, setLogs] = useState<ResearchLogEntry[]>(getResearchLogs());
  const [rubrics, setRubrics] = useState<RubricEvaluation[]>(getRubricEvaluations());
  const [surveys, setSurveys] = useState<PrePostSurveyRecord[]>(getSurveyRecords());
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Rubric entry form state (0 - 3 scale)
  const [rubricForm, setRubricForm] = useState({
    studentCode: currentStudentCode,
    stationId: 1,
    scores: {
      taskOwnership: 2,       // Chủ động nhận nhiệm vụ
      technicalHandling: 2,   // Thao tác kỹ thuật
      inquiryQuestioning: 2,  // Đặt câu hỏi
      solutionDesign: 2,      // Đề xuất giải pháp
      evidenceUse: 2,         // Dùng bằng chứng
      collaboration: 3,       // Hợp tác
      presentation: 2,        // Trình bày & phản tư
    },
    teacherNotes: '',
  });

  // Pre-Post survey entry form
  const [surveyForm, setSurveyForm] = useState({
    studentCode: currentStudentCode,
    phase: 'T0' as 'T0' | 'T1' | 'T2',
    stemInterestScore: 4,
    culturalPrideScore: 4,
    scientificInquiryScore: 3,
    experimentalCompetenceScore: 3,
    notes: '',
  });

  const handleUpdateStudent = (newCode: string) => {
    const formatted = newCode.toUpperCase().trim();
    setCode(formatted);
    setCurrentStudent(formatted);
    setRubricForm((prev) => ({ ...prev, studentCode: formatted }));
    setSurveyForm((prev) => ({ ...prev, studentCode: formatted }));
    setSuccessMsg(`Đã chuyển sang mã học sinh: ${formatted}`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleDeleteLog = (id: string) => {
    deleteResearchLog(id);
    setLogs(getResearchLogs());
    setConfirmDeleteId(null);
    setSuccessMsg('Đã xóa mục nhật ký thành công.');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleSaveRubric = () => {
    saveRubricEvaluation({
      studentCode: rubricForm.studentCode,
      stationId: rubricForm.stationId,
      scores: rubricForm.scores,
      teacherNotes: rubricForm.teacherNotes,
    });
    setRubrics(getRubricEvaluations());
    setSuccessMsg('Đã lưu phiếu đánh giá Rubric quan sát thành công!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveSurvey = () => {
    saveSurveyRecord({
      studentCode: surveyForm.studentCode,
      phase: surveyForm.phase,
      stemInterestScore: surveyForm.stemInterestScore,
      culturalPrideScore: surveyForm.culturalPrideScore,
      scientificInquiryScore: surveyForm.scientificInquiryScore,
      experimentalCompetenceScore: surveyForm.experimentalCompetenceScore,
      notes: surveyForm.notes,
    });
    setSurveys(getSurveyRecords());
    setSuccessMsg(`Đã ghi nhận phiếu khảo sát giai đoạn ${surveyForm.phase}!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Export all logs as CSV
  const handleExportLogsCSV = () => {
    const headers = [
      'MaHocSinh',
      'TramSo',
      'TenTram',
      'ThoiGian',
      'GiaThuyet',
      'DuDoan',
      'GhiChu',
      'PhanTu',
      'DuLieuThuc'
    ];
    const rows = logs.map((l) => [
      l.studentCode,
      l.stationId,
      l.stationTitle,
      l.timestamp,
      l.hypothesis,
      l.selectedPrediction || '',
      l.observationNotes,
      l.reflectionAnswers,
      l.isVerifiedRealData ? 'Co' : 'Khong'
    ]);
    exportToCSV(`emgis_nhat_ky_khoa_hoc_${currentStudentCode}.csv`, headers, rows);
  };

  // Print Lab Report
  const handlePrintReport = () => {
    window.print();
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.studentCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.stationTitle.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0">
          <MuongPatternBorder variant="subtle" height={5} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-[#174C3C] bg-[#EBF2EE] px-2.5 py-1 rounded-lg border border-[#174C3C]/20">
                NGHIÊN CỨU GIÁO DỤC
              </span>
              <span className="text-xs text-[#D6AA55]">·</span>
              <span className="text-xs text-[#556D65] font-medium">Mã hóa ẩn danh học sinh</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174C3C] tracking-tight">
              Nhật ký STEM & Bảng nghiên cứu tác động
            </h1>
            <p className="text-sm text-[#556D65] mt-1">
              Theo dõi tiến trình khoa học, lưu trữ dữ liệu thực nghiệm và rubric quan sát năng lực.
            </p>
          </div>

          {/* Student Profile Switcher */}
          <div className="flex items-center gap-3 bg-[#FAF7F0] p-3 rounded-xl border border-[#E8E2D5]">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#174C3C] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <label className="text-[10px] text-[#556D65] uppercase font-bold block leading-tight">Mã học sinh:</label>
              <input
                type="text"
                value={currentStudentCode}
                onChange={(e) => handleUpdateStudent(e.target.value)}
                className="w-32 px-2 py-0.5 bg-white border border-[#E8E2D5] rounded-md text-xs font-mono font-bold text-[#174C3C] uppercase focus:ring-1 focus:ring-[#174C3C] focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1.5 border-b border-[#E8E2D5]">
        {[
          { id: 'journal', label: '1. Nhật ký thực nghiệm khoa học' },
          { id: 'rubric', label: '2. Rubric quan sát giáo viên (0–3)' },
          { id: 'pre_post', label: '3. Khảo sát Trước – Sau (T0/T1/T2)' },
          { id: 'export', label: '4. Báo cáo & Xuất dữ liệu' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`min-h-[44px] px-4 py-2 text-xs font-bold whitespace-nowrap rounded-t-xl border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#174C3C] text-[#174C3C] bg-white shadow-2xs'
                : 'border-transparent text-[#556D65] hover:text-[#20332D] hover:bg-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 text-xs bg-[#EBF2EE] text-[#174C3C] border border-[#174C3C]/30 rounded-2xl shadow-2xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#174C3C] shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Delete Confirmation Modal / Banner */}
      {confirmDeleteId && (
        <div className="p-4 bg-[#FBF0EE] border border-[#A94438]/30 rounded-2xl text-xs sm:text-sm text-[#20332D] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <span>Bạn có chắc chắn muốn xóa mục nhật ký này không? Hành động này không thể hoàn tác.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="min-h-[36px] px-3.5 py-1.5 bg-white border border-[#E8E2D5] rounded-lg text-xs font-semibold hover:bg-[#FAF7F0]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleDeleteLog(confirmDeleteId)}
              className="min-h-[36px] px-3.5 py-1.5 bg-[#A94438] text-white rounded-lg text-xs font-bold hover:bg-[#8D372C]"
            >
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: EXPERIMENT JOURNAL */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-xs">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Search className="w-4 h-4 text-[#556D65]" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã học sinh hoặc tên trạm..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs sm:text-sm p-2 w-full sm:w-72 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl focus:ring-1 focus:ring-[#174C3C] focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleExportLogsCSV}
                className="min-h-[40px] px-4 py-2 border border-[#E8E2D5] rounded-xl text-[#20332D] hover:bg-[#FAF7F0] flex items-center gap-1.5 font-bold transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4 text-[#174C3C]" /> Xuất CSV ({filteredLogs.length})
              </button>
              <button
                type="button"
                onClick={handlePrintReport}
                className="min-h-[40px] px-4 py-2 bg-[#174C3C] text-white rounded-xl hover:bg-[#11382C] flex items-center gap-1.5 font-bold transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4 text-[#D6AA55]" /> In báo cáo
              </button>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center bg-white border border-[#E8E2D5] rounded-2xl text-xs sm:text-sm text-[#556D65] shadow-xs">
              Chưa có mục nhật ký nào. Hãy vào các trạm thí nghiệm (Trạm 01 đến 16 hoặc Chuyên đề Tam Đảo) và bấm <strong>Lưu vào Nhật ký</strong> để ghi nhận quá trình nghiên cứu.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white p-5 rounded-2xl border border-[#E8E2D5] space-y-3 shadow-xs hover:border-[#174C3C]/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D5] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#174C3C] bg-[#EBF2EE] px-2.5 py-1 rounded-lg border border-[#174C3C]/20">
                        {log.studentCode}
                      </span>
                      <span className="text-sm font-bold text-[#20332D]">{log.stationTitle}</span>
                      {log.isVerifiedRealData && (
                        <span className="text-[10px] font-bold bg-[#174C3C] text-white px-2 py-0.5 rounded-lg">
                          ĐO THỰC TẾ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#556D65]">
                      <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(log.id)}
                        className="text-[#556D65] hover:text-[#A94438] p-1 transition-colors"
                        title="Xóa mục này"
                        aria-label="Xóa mục này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#20332D] pt-1">
                    <div>
                      <div className="font-bold text-[#174C3C]">Giả thuyết ban đầu:</div>
                      <p className="text-[#556D65] mt-0.5 leading-relaxed">{log.hypothesis}</p>
                    </div>
                    <div>
                      <div className="font-bold text-[#174C3C]">Kết quả & Bằng chứng ghi nhận:</div>
                      <div className="font-mono bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8E2D5] text-[11px] text-[#20332D] max-h-24 overflow-y-auto mt-0.5">
                        {JSON.stringify(log.recordedResults, null, 1)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-[#20332D] pt-2 border-t border-[#E8E2D5] flex flex-wrap justify-between gap-2">
                    <div>
                      <strong className="text-[#174C3C]">Ghi chú quan sát:</strong> {log.observationNotes}
                    </div>
                    <div>
                      <strong className="text-[#174C3C]">Phản tư:</strong> {log.reflectionAnswers}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OBSERVATIONAL RUBRIC (0–3 SCALE) */}
      {activeTab === 'rubric' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#EBF2EE] border border-[#174C3C]/30 rounded-2xl text-xs sm:text-sm text-[#20332D] space-y-1 shadow-2xs">
            <div className="font-bold text-[#174C3C] uppercase tracking-wider">
              Khung Rubric quan sát định lượng 7 tiêu chí (Thang đo 0–3)
            </div>
            <p className="leading-relaxed">
              Giáo viên và nhà nghiên cứu sử dụng khung rubric này để đánh giá năng lực khoa học và hành vi học tập của học sinh trong giờ thực hành STEM di sản.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Rubric Evaluation Entry Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
                Đánh giá phiên thực hành của học sinh
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#20332D] font-bold block mb-1">Mã học sinh:</label>
                  <input
                    type="text"
                    value={rubricForm.studentCode}
                    onChange={(e) => setRubricForm({ ...rubricForm, studentCode: e.target.value.toUpperCase() })}
                    className="w-full min-h-[40px] px-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl font-mono font-bold text-[#174C3C]"
                  />
                </div>
                <div>
                  <label className="text-[#20332D] font-bold block mb-1">Trạm thí nghiệm:</label>
                  <select
                    value={rubricForm.stationId}
                    onChange={(e) => setRubricForm({ ...rubricForm, stationId: parseInt(e.target.value) })}
                    className="w-full min-h-[40px] px-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs font-semibold text-[#20332D]"
                  >
                    <option value={1}>Trạm 01: Âm vang chiêng Mường</option>
                    <option value={2}>Trạm 02: Thổ cẩm – Mật mã toán</option>
                    <option value={3}>Trạm 03: Nhà sàn – Vi khí hậu</option>
                    <option value={5}>Trạm 05: Guồng nước – Thủy năng</option>
                    <option value={7}>Trạm 07: Sáo trúc – Cột khí</option>
                    <option value={10}>Trạm 10: Ruộng bậc thang – Xói mòn</option>
                    <option value={99}>Tam Đảo Climate Lab</option>
                  </select>
                </div>
              </div>

              {/* 7 Specific Criteria Sliders with behavioral descriptors */}
              {[
                {
                  key: 'taskOwnership',
                  label: '1. Chủ động nhận nhiệm vụ',
                  desc: ['0: Thụ động cần nhắc nhở', '1: Bắt đầu khi được giao', '2: Tự giác nhận phần việc', '3: Tự khởi xướng, điều phối nhóm'],
                },
                {
                  key: 'technicalHandling',
                  label: '2. Thao tác kỹ thuật & mô phỏng',
                  desc: ['0: Lúng túng thao tác sai', '1: Thao tác đúng cơ bản', '2: Thao tác chính xác, kiểm soát biến', '3: Điêu luyện, xử lý tình huống phát sinh'],
                },
                {
                  key: 'inquiryQuestioning',
                  label: '3. Đặt câu hỏi khoa học',
                  desc: ['0: Chưa nêu được câu hỏi', '1: Hỏi xác nhận dữ kiện', '2: Đặt câu hỏi "Tại sao/Thế nào"', '3: Đặt câu hỏi kiểm chứng giả thuyết sâu'],
                },
                {
                  key: 'solutionDesign',
                  label: '4. Đề xuất giải pháp & thiết kế',
                  desc: ['0: Không có phương án', '1: Lặp lại giải pháp có sẵn', '2: Đề xuất cải tiến tham số', '3: Đề xuất giải pháp sáng tạo, tối ưu'],
                },
                {
                  key: 'evidenceUse',
                  label: '5. Dùng bằng chứng thực nghiệm',
                  desc: ['0: Phán đoán cảm tính', '1: Dẫn chứng số liệu rời rạc', '2: Dùng bảng số liệu/đồ thị đối chiếu', '3: Phân tích định lượng, đánh giá sai số'],
                },
                {
                  key: 'collaboration',
                  label: '6. Hợp tác học tập',
                  desc: ['0: Rời rạc / xung đột', '1: Chia sẻ khi được yêu cầu', '2: Tương tác xây dựng, lắng nghe', '3: Hỗ trợ tích cực, kết nối giải pháp'],
                },
                {
                  key: 'presentation',
                  label: '7. Trình bày & phản tư di sản',
                  desc: ['0: Sơ sài, thiếu ý', '1: Báo cáo kết quả cơ bản', '2: Trình bày mạch lạc, nêu bài học', '3: Lập luận chặt chẽ, kết nối sâu sắc di sản'],
                },
              ].map((crit) => {
                const score = rubricForm.scores[crit.key as keyof typeof rubricForm.scores];
                return (
                  <div key={crit.key} className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs space-y-1.5">
                    <div className="flex justify-between font-bold text-[#20332D]">
                      <span>{crit.label}</span>
                      <span className="font-mono text-[#174C3C] font-bold text-sm">{score} / 3</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="1"
                      value={score}
                      onChange={(e) =>
                        setRubricForm({
                          ...rubricForm,
                          scores: {
                            ...rubricForm.scores,
                            [crit.key]: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-[#174C3C]"
                    />
                    <div className="text-[11px] text-[#556D65] font-medium italic">
                      Hành vi quan sát: {crit.desc[score]}
                    </div>
                  </div>
                );
              })}

              <div className="space-y-1 text-xs">
                <label className="font-bold text-[#20332D]">Nhận xét định tính của giáo viên:</label>
                <textarea
                  value={rubricForm.teacherNotes}
                  onChange={(e) => setRubricForm({ ...rubricForm, teacherNotes: e.target.value })}
                  placeholder="Ghi nhận điểm nổi bật trong tư duy thực nghiệm hoặc lập luận di sản..."
                  rows={2}
                  className="w-full p-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl text-xs focus:ring-1 focus:ring-[#174C3C] focus:outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveRubric}
                className="w-full min-h-[44px] bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs active:scale-98"
              >
                Lưu phiếu đánh giá Rubric
              </button>
            </div>

            {/* Past Rubric Evaluations (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
                Lịch sử đánh giá Rubric ({rubrics.length} phiếu)
              </h3>

              {rubrics.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#556D65] border border-dashed border-[#E8E2D5] rounded-2xl">
                  Chưa có đánh giá rubric nào được lưu.
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {rubrics.map((r) => {
                    const totalScore = Object.values(r.scores).reduce((a, b) => a + b, 0);
                    return (
                      <div key={r.id} className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs space-y-1.5">
                        <div className="flex justify-between font-bold text-[#20332D]">
                          <span className="font-mono text-[#174C3C]">{r.studentCode}</span>
                          <span className="text-[#556D65] font-normal">{r.date}</span>
                        </div>
                        <div className="flex justify-between items-center text-[#20332D]">
                          <span>Trạm {r.stationId}</span>
                          <span className="font-bold text-[#174C3C]">Tổng điểm: {totalScore} / 21</span>
                        </div>
                        {r.teacherNotes && (
                          <div className="text-[11px] text-[#556D65] italic pt-1 border-t border-[#E8E2D5]">
                            "{r.teacherNotes}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRE-POST SURVEY DATA */}
      {activeTab === 'pre_post' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#FAF7F0] border border-[#E8E2D5] rounded-2xl text-xs sm:text-sm text-[#20332D] space-y-1 shadow-2xs">
            <div className="font-bold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#174C3C]" />
              Quy chuẩn khoa học giáo dục:
            </div>
            <p className="leading-relaxed text-[#556D65]">
              Hệ thống hỗ trợ nhập và quản lý phiếu khảo sát theo 3 mốc (T0: Trước can thiệp, T1: Giữa kỳ, T2: Sau can thiệp). Ứng dụng <strong>không tự tạo thang đo giả định là đã chuẩn hóa quốc gia</strong> và <strong>không tự bịa kết luận thống kê p-value</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider border-b border-[#E8E2D5] pb-2.5">
                Nhập phiếu khảo sát học sinh
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#20332D] font-bold block mb-1">Mã học sinh:</label>
                  <input
                    type="text"
                    value={surveyForm.studentCode}
                    onChange={(e) => setSurveyForm({ ...surveyForm, studentCode: e.target.value.toUpperCase() })}
                    className="w-full min-h-[40px] px-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl font-mono font-bold text-[#174C3C]"
                  />
                </div>
                <div>
                  <label className="text-[#20332D] font-bold block mb-1">Giai đoạn:</label>
                  <select
                    value={surveyForm.phase}
                    onChange={(e) => setSurveyForm({ ...surveyForm, phase: e.target.value as 'T0' | 'T1' | 'T2' })}
                    className="w-full min-h-[40px] px-3 bg-[#FAF7F0] border border-[#E8E2D5] rounded-xl font-bold text-[#20332D]"
                  >
                    <option value="T0">T0 – Trước khi học</option>
                    <option value="T1">T1 – Giữa khóa học</option>
                    <option value="T2">T2 – Sau khóa học</option>
                  </select>
                </div>
              </div>

              {/* 4 Dimension Sliders (1 - 5 Likert) */}
              {[
                { key: 'stemInterestScore', label: 'Hứng thú với môn STEM (1 - 5)' },
                { key: 'culturalPrideScore', label: 'Tự hào & kết nối di sản bản địa (1 - 5)' },
                { key: 'scientificInquiryScore', label: 'Năng lực đặt câu hỏi khoa học (1 - 5)' },
                { key: 'experimentalCompetenceScore', label: 'Tự tin thao tác thực nghiệm số (1 - 5)' },
              ].map((dim) => (
                <div key={dim.key} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-[#20332D]">
                    <span>{dim.label}:</span>
                    <span className="font-mono text-[#174C3C] font-bold text-sm">
                      {surveyForm[dim.key as keyof typeof surveyForm]} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={surveyForm[dim.key as keyof typeof surveyForm] as number}
                    onChange={(e) =>
                      setSurveyForm({
                        ...surveyForm,
                        [dim.key]: parseInt(e.target.value),
                      })
                    }
                    className="w-full accent-[#174C3C]"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleSaveSurvey}
                className="w-full min-h-[44px] bg-[#174C3C] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#11382C] transition-all shadow-xs active:scale-98"
              >
                Ghi nhận kết quả khảo sát
              </button>
            </div>

            {/* Survey Records Table & Distribution (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E2D5] space-y-4 shadow-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#E8E2D5] pb-2.5">
                <h3 className="text-xs font-bold text-[#174C3C] uppercase tracking-wider">
                  Dữ liệu khảo sát thu thập ({surveys.length} mẫu)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const headers = ['MaHocSinh', 'GiaiDoan', 'Ngay', 'HungThuSTEM', 'TuHaoDiSan', 'NangLucHoi', 'ThaoTacThucNghiem'];
                    const rows = surveys.map((s) => [
                      s.studentCode,
                      s.phase,
                      s.date,
                      s.stemInterestScore,
                      s.culturalPrideScore,
                      s.scientificInquiryScore,
                      s.experimentalCompetenceScore,
                    ]);
                    exportToCSV('emgis_khao_sat_t0_t1_t2.csv', headers, rows);
                  }}
                  className="min-h-[36px] px-3.5 py-1.5 border border-[#E8E2D5] rounded-xl text-xs font-bold text-[#20332D] hover:bg-[#FAF7F0] flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#174C3C]" /> Xuất CSV
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E8E2D5] rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F0] border-b border-[#E8E2D5] text-[#20332D] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Học sinh</th>
                      <th className="py-2.5 px-3">Giai đoạn</th>
                      <th className="py-2.5 px-3">STEM (1-5)</th>
                      <th className="py-2.5 px-3">Di sản (1-5)</th>
                      <th className="py-2.5 px-3">Khoa học (1-5)</th>
                      <th className="py-2.5 px-3">Thực hành (1-5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D5] font-mono">
                    {surveys.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAF7F0]/50">
                        <td className="py-2.5 px-3 font-bold text-[#20332D]">{s.studentCode}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            s.phase === 'T0' ? 'bg-[#E8E2D5] text-[#20332D]' : s.phase === 'T1' ? 'bg-[#FBF6EA] text-[#D6AA55]' : 'bg-[#EBF2EE] text-[#174C3C]'
                          }`}>
                            {s.phase}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#174C3C] font-bold">{s.stemInterestScore}</td>
                        <td className="py-2.5 px-3 text-[#20332D]">{s.culturalPrideScore}</td>
                        <td className="py-2.5 px-3 text-[#20332D]">{s.scientificInquiryScore}</td>
                        <td className="py-2.5 px-3 text-[#20332D]">{s.experimentalCompetenceScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit of Missing Data */}
              <div className="p-3.5 bg-[#FAF7F0] rounded-xl border border-[#E8E2D5] text-xs text-[#556D65] flex flex-wrap items-center justify-between gap-2">
                <span>Kiểm toán dữ liệu thiếu (Missing data audit):</span>
                <span className="font-mono text-[#174C3C] font-bold">
                  T0: {surveys.filter((s) => s.phase === 'T0').length} · T1: {surveys.filter((s) => s.phase === 'T1').length} · T2: {surveys.filter((s) => s.phase === 'T2').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT & SCIENTIFIC ETHICS */}
      {activeTab === 'export' && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-[#E8E2D5] space-y-6 shadow-xs">
          <div>
            <h2 className="text-xl font-bold text-[#174C3C]">Báo cáo tổng hợp & Đạo đức nghiên cứu</h2>
            <p className="text-xs sm:text-sm text-[#556D65] mt-1 leading-relaxed">
              Xuất toàn bộ cơ sở dữ liệu học tập ra định dạng mở chuẩn JSON và CSV để phục vụ phân tích thống kê ngoài phần mềm (SPSS, R, Python, Jamovi).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] space-y-3 text-xs">
              <div className="font-bold text-[#174C3C] text-sm">Nhật ký thí nghiệm</div>
              <div className="text-[#556D65]">{logs.length} bản ghi đã lưu</div>
              <button
                type="button"
                onClick={handleExportLogsCSV}
                className="w-full min-h-[40px] bg-[#174C3C] text-white rounded-xl font-bold hover:bg-[#11382C] transition-colors shadow-xs"
              >
                Xuất CSV Nhật ký
              </button>
            </div>

            <div className="p-5 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] space-y-3 text-xs">
              <div className="font-bold text-[#174C3C] text-sm">Phiếu khảo sát T0/T1/T2</div>
              <div className="text-[#556D65]">{surveys.length} phiếu khảo sát</div>
              <button
                type="button"
                onClick={() => exportToJSON('emgis_surveys_data.json', surveys)}
                className="w-full min-h-[40px] bg-white border border-[#E8E2D5] text-[#20332D] rounded-xl font-bold hover:bg-[#FAF7F0] transition-colors shadow-2xs"
              >
                Xuất JSON Khảo sát
              </button>
            </div>

            <div className="p-5 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] space-y-3 text-xs">
              <div className="font-bold text-[#174C3C] text-sm">Đánh giá Rubric</div>
              <div className="text-[#556D65]">{rubrics.length} phiếu quan sát</div>
              <button
                type="button"
                onClick={() => exportToJSON('emgis_rubrics_data.json', rubrics)}
                className="w-full min-h-[40px] bg-white border border-[#E8E2D5] text-[#20332D] rounded-xl font-bold hover:bg-[#FAF7F0] transition-colors shadow-2xs"
              >
                Xuất JSON Rubric
              </button>
            </div>
          </div>

          <div className="p-5 bg-[#FAF7F0] rounded-2xl border border-[#E8E2D5] text-xs sm:text-sm text-[#20332D] space-y-2.5">
            <div className="font-bold text-[#174C3C] uppercase tracking-wider text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D6AA55]" />
              Cam kết bảo mật dữ liệu & Đạo đức khoa học:
            </div>
            <p className="leading-relaxed">
              1. <strong>Mã hóa danh tính:</strong> Không lưu trữ họ tên đầy đủ, số điện thoại hay thông tin nhận dạng cá nhân. Mọi dữ liệu gắn liền với mã định danh ngẫu nhiên (ví dụ HS-TD-101).
            </p>
            <p className="leading-relaxed">
              2. <strong>Ngôn ngữ trung tính & Hòa nhập:</strong> Thiết kế phục vụ mọi học sinh và người học; không gắn nhãn phân biệt giới tính ở bất kỳ phần giao diện hay tài liệu công khai nào.
            </p>
            <p className="leading-relaxed">
              3. <strong>Không gửi dữ liệu ngầm:</strong> Không âm thầm tải bản ghi âm hoặc số liệu lên đám mây; người học hoàn toàn làm chủ thiết bị của mình.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
