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
  Search
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

export const ResearchHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'journal' | 'rubric' | 'pre_post' | 'export'>('journal');
  const [currentStudentCode, setCode] = useState<string>(getCurrentStudent());
  const [logs, setLogs] = useState<ResearchLogEntry[]>(getResearchLogs());
  const [rubrics, setRubrics] = useState<RubricEvaluation[]>(getRubricEvaluations());
  const [surveys, setSurveys] = useState<PrePostSurveyRecord[]>(getSurveyRecords());
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    setCode(newCode);
    setCurrentStudent(newCode);
    setRubricForm((prev) => ({ ...prev, studentCode: newCode }));
    setSurveyForm((prev) => ({ ...prev, studentCode: newCode }));
    setSuccessMsg(`Đã chuyển sang mã học sinh: ${newCode}`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mục nhật ký này?')) {
      deleteResearchLog(id);
      setLogs(getResearchLogs());
    }
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
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                NGHIÊN CỨU GIÁO DỤC
              </span>
              <span className="text-xs text-stone-500">Mã hóa ẩn danh học sinh</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Nhật ký STEM & Bảng nghiên cứu tác động
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              Theo dõi tiến trình khoa học, lưu trữ dữ liệu thực nghiệm và rubric quan sát năng lực.
            </p>
          </div>

          {/* Student Profile Switcher */}
          <div className="flex items-center gap-2 bg-stone-50 p-2 rounded border border-stone-200">
            <Users className="w-4 h-4 text-emerald-800 shrink-0" />
            <span className="text-xs text-stone-600 font-medium">Mã học sinh:</span>
            <input
              type="text"
              value={currentStudentCode}
              onChange={(e) => handleUpdateStudent(e.target.value)}
              className="w-28 px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono font-bold text-emerald-950 uppercase"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center overflow-x-auto pb-1 gap-1 border-b border-stone-200">
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
            className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap rounded-t border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-700 text-emerald-900 bg-white font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 text-xs bg-emerald-50 text-emerald-900 border border-emerald-300 rounded">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: EXPERIMENT JOURNAL */}
      {activeTab === 'journal' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-stone-200">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã học sinh hoặc tên trạm..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs p-1.5 w-64 border-b border-stone-300 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleExportLogsCSV}
                className="px-3 py-1.5 border border-stone-300 rounded text-stone-700 hover:bg-stone-50 flex items-center gap-1 font-medium"
              >
                <Download className="w-3.5 h-3.5" /> Xuất CSV ({filteredLogs.length})
              </button>
              <button
                type="button"
                onClick={handlePrintReport}
                className="px-3 py-1.5 bg-emerald-800 text-white rounded hover:bg-emerald-900 flex items-center gap-1 font-medium"
              >
                <Printer className="w-3.5 h-3.5" /> In báo cáo
              </button>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-lg text-xs text-stone-500">
              Chưa có mục nhật ký nào. Hãy vào các trạm thí nghiệm (Trạm 01 đến 16 hoặc Chuyên đề Tam Đảo) và bấm <strong>Lưu vào Nhật ký</strong> để ghi nhận quá trình nghiên cứu.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white p-4 rounded-lg border border-stone-200 space-y-2 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {log.studentCode}
                      </span>
                      <span className="text-sm font-bold text-stone-900">{log.stationTitle}</span>
                      {log.isVerifiedRealData && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          ĐO THỰC TẾ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                      <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-stone-400 hover:text-red-700"
                        title="Xóa mục này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-700 pt-1">
                    <div>
                      <div className="font-semibold text-stone-800">Giả thuyết ban đầu:</div>
                      <p className="text-stone-600">{log.hypothesis}</p>
                    </div>
                    <div>
                      <div className="font-semibold text-stone-800">Kết quả & Bằng chứng ghi nhận:</div>
                      <div className="font-mono bg-stone-50 p-2 rounded border border-stone-200 text-[11px] text-emerald-900 max-h-24 overflow-y-auto">
                        {JSON.stringify(log.recordedResults, null, 1)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-stone-700 pt-1 border-t border-stone-100 flex flex-wrap justify-between gap-2">
                    <div>
                      <strong className="text-stone-800">Ghi chú quan sát:</strong> {log.observationNotes}
                    </div>
                    <div>
                      <strong className="text-stone-800">Phản tư:</strong> {log.reflectionAnswers}
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
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950 space-y-1">
            <div className="font-bold uppercase tracking-wider">
              Khung Rubric quan sát định lượng 7 tiêu chí (Thang đo 0–3)
            </div>
            <p>
              Giáo viên và nhà nghiên cứu sử dụng khung rubric này để đánh giá năng lực khoa học và hành vi học tập của học sinh trong giờ thực hành STEM di sản.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Rubric Evaluation Entry Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Đánh giá phiên thực hành của học sinh
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-stone-600 font-medium">Mã học sinh:</label>
                  <input
                    type="text"
                    value={rubricForm.studentCode}
                    onChange={(e) => setRubricForm({ ...rubricForm, studentCode: e.target.value })}
                    className="w-full mt-1 p-2 bg-stone-50 border border-stone-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-stone-600 font-medium">Trạm thí nghiệm:</label>
                  <select
                    value={rubricForm.stationId}
                    onChange={(e) => setRubricForm({ ...rubricForm, stationId: parseInt(e.target.value) })}
                    className="w-full mt-1 p-2 bg-stone-50 border border-stone-300 rounded"
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
                  <div key={crit.key} className="p-3 bg-stone-50 rounded border border-stone-200 text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-stone-900">
                      <span>{crit.label}</span>
                      <span className="font-mono text-emerald-800 font-bold">{score} / 3</span>
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
                      className="w-full accent-emerald-700"
                    />
                    <div className="text-[11px] text-stone-600 font-medium italic">
                      Hành vi quan sát: {crit.desc[score]}
                    </div>
                  </div>
                );
              })}

              <div className="space-y-1 text-xs">
                <label className="font-semibold text-stone-700">Nhận xét định tính của giáo viên:</label>
                <textarea
                  value={rubricForm.teacherNotes}
                  onChange={(e) => setRubricForm({ ...rubricForm, teacherNotes: e.target.value })}
                  placeholder="Ghi nhận điểm nổi bật trong tư duy thực nghiệm hoặc lập luận di sản..."
                  rows={2}
                  className="w-full p-2 border border-stone-300 rounded text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveRubric}
                className="w-full py-2.5 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
              >
                Lưu phiếu đánh giá Rubric
              </button>
            </div>

            {/* Past Rubric Evaluations (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Lịch sử đánh giá Rubric ({rubrics.length} phiếu)
              </h3>

              {rubrics.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-stone-300 rounded">
                  Chưa có đánh giá rubric nào được lưu.
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {rubrics.map((r) => {
                    const totalScore = Object.values(r.scores).reduce((a, b) => a + b, 0);
                    return (
                      <div key={r.id} className="p-3 bg-stone-50 rounded border border-stone-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-stone-900">
                          <span className="font-mono text-emerald-900">{r.studentCode}</span>
                          <span className="text-stone-500 font-normal">{r.date}</span>
                        </div>
                        <div className="flex justify-between items-center text-stone-700">
                          <span>Trạm {r.stationId}</span>
                          <span className="font-bold text-emerald-800">Tổng điểm: {totalScore} / 21</span>
                        </div>
                        {r.teacherNotes && (
                          <div className="text-[11px] text-stone-600 italic pt-1 border-t border-stone-200">
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
          <div className="p-4 bg-stone-100 border border-stone-300 rounded-lg text-xs text-stone-800 space-y-1">
            <div className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-emerald-700" />
              Quy chuẩn khoa học giáo dục:
            </div>
            <p>
              Hệ thống hỗ trợ nhập và quản lý phiếu khảo sát theo 3 mốc (T0: Trước can thiệp, T1: Giữa kỳ, T2: Sau can thiệp). Ứng dụng <strong>không tự tạo thang đo giả định là đã chuẩn hóa quốc gia</strong> và <strong>không tự bịa kết luận thống kê p-value</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-stone-200 space-y-4">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Nhập phiếu khảo sát học sinh
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-stone-600 font-medium">Mã học sinh:</label>
                  <input
                    type="text"
                    value={surveyForm.studentCode}
                    onChange={(e) => setSurveyForm({ ...surveyForm, studentCode: e.target.value })}
                    className="w-full mt-1 p-2 bg-stone-50 border border-stone-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-stone-600 font-medium">Giai đoạn:</label>
                  <select
                    value={surveyForm.phase}
                    onChange={(e) => setSurveyForm({ ...surveyForm, phase: e.target.value as 'T0' | 'T1' | 'T2' })}
                    className="w-full mt-1 p-2 bg-stone-50 border border-stone-300 rounded font-semibold"
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
                <div key={dim.key} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium text-stone-700">
                    <span>{dim.label}:</span>
                    <span className="font-mono text-emerald-800 font-bold">
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
                    className="w-full accent-emerald-700"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleSaveSurvey}
                className="w-full py-2 bg-emerald-800 text-white rounded text-xs font-medium hover:bg-emerald-900"
              >
                Ghi nhận kết quả khảo sát
              </button>
            </div>

            {/* Survey Records Table & Distribution (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-stone-200 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
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
                  className="px-3 py-1.5 border border-stone-300 rounded text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-1 font-medium"
                >
                  <Download className="w-3.5 h-3.5" /> Xuất CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                    <tr>
                      <th className="py-2 px-2.5">Học sinh</th>
                      <th className="py-2 px-2.5">Giai đoạn</th>
                      <th className="py-2 px-2.5">STEM (1-5)</th>
                      <th className="py-2 px-2.5">Di sản (1-5)</th>
                      <th className="py-2 px-2.5">Khoa học (1-5)</th>
                      <th className="py-2 px-2.5">Thực hành (1-5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {surveys.map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50">
                        <td className="py-2 px-2.5 font-bold text-stone-900">{s.studentCode}</td>
                        <td className="py-2 px-2.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            s.phase === 'T0' ? 'bg-stone-200 text-stone-800' : s.phase === 'T1' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {s.phase}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-emerald-800">{s.stemInterestScore}</td>
                        <td className="py-2 px-2.5 text-stone-700">{s.culturalPrideScore}</td>
                        <td className="py-2 px-2.5 text-stone-700">{s.scientificInquiryScore}</td>
                        <td className="py-2 px-2.5 text-stone-700">{s.experimentalCompetenceScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audit of Missing Data */}
              <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
                <span>Kiểm toán dữ liệu thiếu (Missing data audit):</span>
                <span className="font-mono text-emerald-800 font-bold">
                  T0: {surveys.filter((s) => s.phase === 'T0').length} · T1: {surveys.filter((s) => s.phase === 'T1').length} · T2: {surveys.filter((s) => s.phase === 'T2').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT & SCIENTIFIC ETHICS */}
      {activeTab === 'export' && (
        <div className="bg-white p-6 rounded-lg border border-stone-200 space-y-6">
          <div>
            <h2 className="text-base font-bold text-stone-900">Báo cáo tổng hợp & Đạo đức nghiên cứu</h2>
            <p className="text-xs text-stone-600 mt-1">
              Xuất toàn bộ cơ sở dữ liệu học tập ra định dạng mở chuẩn JSON và CSV để phục vụ phân tích thống kê ngoài phần mềm (SPSS, R, Python, Jamovi).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-stone-50 rounded border border-stone-200 space-y-2 text-xs">
              <div className="font-bold text-stone-900">Nhật ký thí nghiệm</div>
              <div className="text-stone-500">{logs.length} bản ghi đã lưu</div>
              <button
                type="button"
                onClick={handleExportLogsCSV}
                className="w-full py-1.5 bg-emerald-800 text-white rounded font-medium hover:bg-emerald-900"
              >
                Xuất CSV Nhật ký
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded border border-stone-200 space-y-2 text-xs">
              <div className="font-bold text-stone-900">Phiếu khảo sát T0/T1/T2</div>
              <div className="text-stone-500">{surveys.length} phiếu khảo sát</div>
              <button
                type="button"
                onClick={() => exportToJSON('emgis_surveys_data.json', surveys)}
                className="w-full py-1.5 bg-stone-800 text-white rounded font-medium hover:bg-stone-900"
              >
                Xuất JSON Khảo sát
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded border border-stone-200 space-y-2 text-xs">
              <div className="font-bold text-stone-900">Đánh giá Rubric</div>
              <div className="text-stone-500">{rubrics.length} phiếu quan sát</div>
              <button
                type="button"
                onClick={() => exportToJSON('emgis_rubrics_data.json', rubrics)}
                className="w-full py-1.5 bg-stone-800 text-white rounded font-medium hover:bg-stone-900"
              >
                Xuất JSON Rubric
              </button>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded border border-stone-200 text-xs text-stone-700 space-y-2">
            <div className="font-bold text-stone-900 uppercase tracking-wider">
              Cam kết bảo mật dữ liệu & Đạo đức khoa học:
            </div>
            <p>
              1. <strong>Mã hóa danh tính:</strong> Không lưu trữ họ tên đầy đủ, số điện thoại hay thông tin nhận dạng cá nhân. Mọi dữ liệu gắn liền với mã định danh ngẫu nhiên (ví dụ HS-TD-101).
            </p>
            <p>
              2. <strong>Ngôn ngữ trung tính & Hòa nhập:</strong> Thiết kế phục vụ mọi học sinh và người học; không gắn nhãn phân biệt giới tính ở bất kỳ phần giao diện hay tài liệu công khai nào.
            </p>
            <p>
              3. <strong>Không gửi dữ liệu ngầm:</strong> Không âm thầm tải bản ghi âm hoặc số liệu lên đám mây; người học hoàn toàn làm chủ thiết bị của mình.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
