import { StationMeta } from '../types';

export const STATIONS_DATA: StationMeta[] = [
  {
    id: 1,
    numberStr: '01',
    title: 'Âm vang chiêng Mường',
    subtitle: 'Phòng thí nghiệm âm học di sản & phổ tần số',
    stemDomain: 'acoustics',
    stemDomainLabel: 'Âm học & Xử lý tín hiệu',
    culturalHeritage: 'Cồng chiêng trong đời sống người Mường (Phú Thọ, Hòa Bình)',
    locationContext: 'Vùng Mường Bi, Mường Vang, Mường Thàng, Mường Động và đồng bào Mường ven dải Tam Đảo, Thanh Sơn (Phú Thọ)',
    keyFormula: 'x(t) = \\sum_{i=1}^N A_i e^{-\\lambda_i t} \\sin(2\\pi f_i t + \\phi_i)',
    formulaDescription: 'Phương trình chồng chập các mode dao động tắt dần của đĩa kim loại phi tuyến. Các tần số thành phần (f_i) thường phi điều hòa (inharmonic), không phải bội số nguyên đơn giản.',
    steps: {
      context: {
        title: 'Bối cảnh văn hóa Cồng chiêng Mường',
        description: 'Chiêng là linh hồn trong đời sống văn hóa Mường. Khác với cồng chiêng Tây Nguyên (thuộc Kiệt tác Di sản thế giới riêng biệt), dàn chiêng Mường có hệ thống tên gọi, phương thức gõ và vai trò gắn liền với nghi lễ Sắc bùa, lễ hội Mở cổng trời, cưới hỏi và đón rước.',
        culturalDetails: [
          'Dàn chiêng Mường truyền thống thường gồm các cặp chiêng từ chiêng mẹ (Dàm), chiêng dóng (Bồng, Khèn, Băng) đến chiêng con (Ke).',
          'Vật liệu đúc chiêng truyền thống là hợp kim đồng pha thiếc và chì với tỷ lệ kinh nghiệm gia truyền.',
          'Kỹ thuật gõ bằng dùi mềm (bọc vải) tạo âm ấm, sâu; gõ bằng dùi gỗ trần kích thích nhiều họa tần cao đanh sắc.',
          'Vị trí gõ vào rốn chiêng kích thích mode đối xứng trục chính; vành chiêng kích thích các mode uốn bậc cao.'
        ],
        verifiedSources: [
          'Viện Văn hóa Nghệ thuật Quốc gia Việt Nam (VICAS) - Tư liệu Chiêng Mường',
          'Tài liệu Dân tộc học người Mường - GS. Từ Chi & Bảo tàng Dân tộc học',
          'Nghiên cứu âm học cồng chiêng Đông Nam Á - Viện Vật lý, Viện Hàn lâm KH&CN VN'
        ],
        artisanNote: 'Lưu ý khoa học: Cồng chiêng Mường có bản sắc và hệ thống diễn tấu riêng; không tự ý gán danh hiệu UNESCO của Không gian văn hóa cồng chiêng Tây Nguyên cho cồng chiêng Mường khi chưa có tài liệu chính thức xác nhận.'
      },
      stemQuestion: {
        question: 'Tại sao âm thanh của chiêng vang xa, ngân lâu và mang sắc thái đặc trưng khác với tiếng chuông hay tiếng đàn guitar?',
        contextExplanation: 'Khảo sát cấu trúc phổ tần số FFT, tính chất phi điều hòa (inharmonicity) của màng dao động kim loại có vành gờ và tốc độ suy giảm biên độ theo thời gian.',
        subQuestions: [
          'Mối quan hệ giữa các đỉnh tần số (f1, f2, f3...) trên phổ FFT có phải là tỉ lệ nguyên 1:2:3:4 như dây đàn hay cột khí?',
          'Vị trí gõ (rốn chiêng so với vành chiêng) thay đổi năng lượng của các mode dao động như thế nào?',
          'Vật liệu dùi gõ (mềm vs cứng) làm biến đổi thời gian xung lực và các thành phần tần số cao ra sao?'
        ]
      },
      prediction: {
        prompt: 'Khi chuyển vị trí gõ từ RỐN CHIÊNG sang VÀNH CHIÊNG, bạn dự đoán phổ âm thanh sẽ thay đổi như thế nào?',
        options: [
          {
            id: 'pred_1',
            label: 'Các tần số cao (trên 600 Hz) sẽ có biên độ mạnh hơn, âm thanh nghe sắc và đanh hơn',
            explanation: 'Vành ngoài mỏng hơn và gần biên tự do hơn, dễ kích hoạt các mode dao động uốn bậc cao.'
          },
          {
            id: 'pred_2',
            label: 'Tần số cơ bản (f1) sẽ tăng vọt lên gấp đôi, âm trầm biến mất hoàn toàn',
            explanation: 'Tần số cơ bản phụ thuộc khối lượng và kích thước đĩa, không nhân đôi đơn thuần khi đổi vị trí gõ.'
          },
          {
            id: 'pred_3',
            label: 'Phổ tần số giữ nguyên tuyệt đối, chỉ có âm lượng to hơn',
            explanation: 'Vị trí kích thích thay đổi điều kiện biên ban đầu, làm thay đổi phân bố biên độ giữa các mode.'
          }
        ]
      },
      challenge: {
        title: 'Thử thách thám tử âm học di sản',
        scenario: 'Bạn nhận được 2 tín hiệu âm thanh chiêng (Chiêng A và Chiêng B). Bằng chứng thực nghiệm từ phổ FFT và hệ số suy giảm cho thấy hai chiêng khác nhau về kích thước và cách gõ.',
        criteria: [
          'Xác định ít nhất 3 đỉnh phổ tần số nổi bật của mỗi chiêng (Hz và dB)',
          'So sánh tỷ số f2/f1 và f3/f1 xem có tính chất phi điều hòa không',
          'Đo thời gian suy giảm T60 (thời gian năng lượng giảm 60 dB hoặc về mức ngưỡng)',
          'Kết luận dựa trên dữ liệu định lượng, nhận thức rõ sai số của micro thiết bị'
        ],
        task: 'Hãy dùng bằng chứng từ phổ âm thanh để giải thích sự khác biệt giữa hai tiếng chiêng và ghi vào Nhật ký khoa học.'
      },
      reflection: {
        questions: [
          'Những tri thức luyện kim và tạo dáng thủ công của nghệ nhân Mường đã tác động như thế nào đến phổ âm thanh của chiêng?',
          'Sai số từ micro điện thoại/máy tính (dải tần hạn chế, tự động lọc ồn) ảnh hưởng thế nào đến việc thu âm thực tế?',
          'Làm thế nào để kết hợp công nghệ xử lý tín hiệu hiện đại với việc bảo tồn di sản âm nhạc truyền thống một cách tôn trọng?'
        ],
        culturalConnection: 'Tiếng chiêng trong nghi lễ Mường được tin là thanh âm kết nối con người với tự nhiên, thể hiện trình độ đúc đồng và sự nhạy bén âm học đáng kinh ngạc của cư dân bản địa qua nhiều thế kỷ.',
        physicalLimitations: [
          'Micro thông thường trên điện thoại có đáp ứng tần số suy giảm mạnh ở dải trầm dưới 100 Hz và dải cao trên 8000 Hz.',
          'Mô phỏng số dựa trên xấp xỉ màng mỏng Kirchhoff-Love tuyến tính hóa; chiêng thật có biến dạng phi tuyến và dị hướng vật liệu do kỹ thuật rèn đập thủ công.'
        ]
      }
    },
    scientificBasis: {
      principles: [
        'Dao động màng tròn có biên dày: Phương trình sóng hai chiều Bessel, tạo ra các đường nút kính tròn và đường nút hướng tâm.',
        'Tính phi điều hòa (Inharmonicity): Tần số các mode dao động của chiêng/thanh không tỉ lệ theo dãy số nguyên 1, 2, 3, 4 như đàn hay sáo.',
        'Biến đổi Fourier nhanh (FFT): Phân tách tín hiệu miền thời gian x(t) sang miền tần số X(f), làm rõ các thành phần năng lượng thành phần.',
        'Sự tiêu tán năng lượng âm học (Damping): Suy giảm cơ học nội tại của đồng thau/đồng thiếc (internal friction) và bức xạ âm thanh vào không khí.'
      ],
      variables: [
        { symbol: 'f1', name: 'Tần số cơ bản (Mode 1)', unit: 'Hz', range: '120 - 450 Hz', description: 'Tần số của mode dao động đối xứng trục có năng lượng chính' },
        { symbol: 'fi / f1', name: 'Tỉ số tần số thành phần', unit: 'không thứ nguyên', range: '1.4 - 5.8', description: 'Đặc trưng phi điều hòa của vật thể đúc kim loại' },
        { symbol: 'λi', name: 'Hệ số suy giảm (Decay rate)', unit: 's⁻¹', range: '0.4 - 6.0 s⁻¹', description: 'Tốc độ tắt dần của từng mode theo thời gian' },
        { symbol: 'A_i', name: 'Biên độ ban đầu của mode i', unit: 'tương đối (0 - 1)', range: '0 - 1.0', description: 'Phụ thuộc vào lực gõ, vị trí gõ và độ cứng của dùi' }
      ],
      assumptions: [
        'Mô hình tổng hợp giả định vật liệu đẳng hướng tương đối trong dải biên độ nhỏ.',
        'Sự ghép nối âm học giữa đĩa chiêng và phòng thí nghiệm được coi là trường tự do đơn giản.'
      ],
      limitations: [
        'Âm thanh tổng hợp trong phần mềm là MÔ PHỎNG MINH HỌA toán học, không thể thay thế bản ghi di sản nguyên gốc của dàn chiêng Mường cổ.',
        'Thu âm từ micro điện thoại chịu ảnh hưởng lớn từ bộ lọc AGC (tự động cân bằng âm lượng) của hệ điều hành.'
      ],
      safetyNotes: [
        'Khi thử nghiệm gõ chiêng thật trong lớp: Điều chỉnh mức âm lượng vừa phải, đeo bảo hộ thính giác nếu ở phòng kín có độ vang lớn.',
        'Khi dùng micro thu âm: Cần sự đồng ý của nghệ nhân hoặc chủ thể di sản khi lưu trữ và ghi chép tư liệu văn hóa.'
      ],
      references: [
        'Fletcher, N. H., & Rossing, T. D. (1998). The Physics of Musical Instruments. Springer-Verlag.',
        'Tô Ngọc Thanh (1999). Âm nhạc dân gian Mường. NXB Âm nhạc, Hà Nội.',
        'ISO 226:2003 Acoustics - Normal equal-loudness-level contours.'
      ]
    }
  },
  {
    id: 2,
    numberStr: '02',
    title: 'Thổ cẩm – Mật mã toán học',
    subtitle: 'Hình học biến hình, đối xứng & nhóm hoa văn Frieze',
    stemDomain: 'mathematics',
    stemDomainLabel: 'Toán học & Thuật toán',
    culturalHeritage: 'Nghệ thuật dệt thổ cẩm của các dân tộc miền núi phía Bắc',
    locationContext: 'Bản làng Mường, Dao, Thái tại Phú Thọ, Hòa Bình, Yên Bái',
    keyFormula: 'T_{(a,b)}(x,y) = (x+a, y+b) \\quad | \\quad R_\\theta, S_x, S_y',
    formulaDescription: 'Phép tịnh tiến, phép quay và phép đối xứng trục/tâm kiến tạo nên dải hoa văn Frieze vô hạn và lưới phẳng 2D.',
    steps: {
      context: {
        title: 'Tri thức toán học trong khung cửi truyền thống',
        description: 'Người phụ nữ miền núi khi dệt vải không dùng bản vẽ kỹ thuật số nhưng đã tính toán chính xác số sợi dọc, sợi ngang, chu kỳ lặp và tính đối xứng hoàn hảo bằng trí nhớ và nhịp đếm.',
        culturalDetails: [
          'Hoa văn quả trám (hình thoi lồng nhau) tượng trưng cho lòng người và sự sinh sôi.',
          'Hoa văn răng cưa (tam giác tuần hoàn) cách điệu từ dãy núi, dòng suối.',
          'Màu sắc lấy từ tự nhiên: Chàm (xanh thẫm), củ nghệ (vàng), vỏ cây vang (đỏ), bùn non (đen).'
        ],
        verifiedSources: ['Bảo tàng Dân tộc học Việt Nam', 'Viện Mỹ thuật - Nghiên cứu hoa văn dệt cổ truyền'],
      },
      stemQuestion: {
        question: 'Làm thế nào các phép biến hình toán học cơ bản (tịnh tiến, quay, đối xứng) tạo ra vô số hoa văn thổ cẩm phong phú?',
        contextExplanation: 'Khám phá sự liên hệ giữa thuật toán lặp ma trận và cấu trúc toán học của các dải hoa văn.',
        subQuestions: ['Một motif đơn lẻ cần tối thiểu bao nhiêu phép biến đổi để tạo thành dải biên Frieze?']
      },
      prediction: {
        prompt: 'Nếu thực hiện đồng thời phép đối xứng trục ngang và trục dọc cho motif quả trám, hoa văn tạo thành sẽ có tâm đối xứng không?',
        options: [
          { id: 'p1', label: 'Có, tích hai phép đối xứng trục vuông góc luôn tương đương một phép quay 180° quanh giao điểm hai trục', explanation: 'Chính xác theo định lý hình học biến hình cơ bản.' },
          { id: 'p2', label: 'Không, hoa văn sẽ bị biến dạng hoàn toàn và mất tâm đối xứng', explanation: 'Sai, tính đối xứng sẽ được tăng cường.' }
        ]
      },
      challenge: {
        title: 'Mã hóa dải hoa văn di sản',
        scenario: 'Hãy tạo một dải hoa văn thổ cẩm hoàn chỉnh bằng cách kết hợp ít nhất 2 motif và 3 phép biến hình (tịnh tiến, đối xứng trục, quay).',
        criteria: ['Xác định vector tịnh tiến (dx, dy)', 'Kiểm chứng tính chu kỳ', 'Xuất file SVG chuẩn vector'],
        task: 'Tạo dải viền thổ cẩm và giải thích công thức toán học ẩn sau chu kỳ lặp.'
      },
      reflection: {
        questions: ['Người nghệ nhân dệt thổ cẩm đã tư duy thuật toán như thế nào trước khi có khoa học máy tính?'],
        culturalConnection: 'Khung dệt chính là tiền thân của máy tính cơ học nhị phân (sợi nâng = 1, sợi hạ = 0).',
        physicalLimitations: ['Độ phân giải hoa văn dệt thực tế bị giới hạn bởi mật độ sợi dệt (sợi/cm).']
      }
    },
    scientificBasis: {
      principles: ['Nhóm đối xứng Frieze (7 nhóm vô hạn một chiều)', 'Đại số tuyến tính ma trận biến hình 2D', 'Tọa độ Descartes trên lưới điểm nguyên'],
      variables: [
        { symbol: 'T(dx,dy)', name: 'Vector tịnh tiến', unit: 'pixel/ô', range: '1 - 8 ô', description: 'Khoảng cách dịch chuyển của motif lặp' },
        { symbol: 'θ', name: 'Góc quay', unit: 'độ (°)', range: '0°, 90°, 180°, 270°', description: 'Góc quay bảo toàn lưới ô vuông' }
      ],
      assumptions: ['Lưới điểm dệt được xem là không gian rời rạc đồng nhất'],
      limitations: ['Mô phỏng hình học phẳng; vải thực tế có độ co giãn và gân nổi 3D'],
      safetyNotes: ['Không gây nguy hiểm. Lưu ý thư giãn mắt khi làm việc với họa tiết lặp dày đặc.'],
      references: ['Washburn, D. K., & Crowe, D. W. (1988). Symmetries of Culture. University of Washington Press.']
    }
  },
  {
    id: 3,
    numberStr: '03',
    title: 'Nhà sàn – Kiến trúc & vi khí hậu',
    subtitle: 'Nhiệt động học, thông gió tự nhiên & vật liệu sinh thái',
    stemDomain: 'thermodynamics',
    stemDomainLabel: 'Nhiệt & Kiến trúc sinh thái',
    culturalHeritage: 'Kiến trúc nhà sàn truyền thống người Mường, Tày, Thái',
    locationContext: 'Vùng đồi núi trung du và miền núi Bắc Bộ',
    keyFormula: 'Q_{vent} = C_d A \\sqrt{2 g h \\frac{\\Delta T}{T_{avg}}}',
    formulaDescription: 'Lưu lượng thông gió theo hiệu ứng ống khói (Stack Effect) phụ thuộc vào chiều cao sàn, độ dốc mái và chênh lệch nhiệt độ trong/ngoài.',
    steps: {
      context: {
        title: 'Giải pháp thích ứng vi khí hậu của nhà sàn',
        description: 'Nhà sàn cổ truyền là đỉnh cao của kiến trúc thích ứng: sàn cao tránh ẩm ướt mặt đất và thú dữ; mái dốc thoát nhiệt và thoát nước mưa; sàn nứa dát thưa cho gió lùa làm mát tự nhiên.',
        culturalDetails: ['Gỗ nghiến, xoan, tre nứa làm khung và sàn', 'Mái lợp gianh hoặc cọ dày cách nhiệt bức xạ mặt trời', 'Gầm sàn thoáng khí ngăn truyền nhiệt dẫn từ nền đất ẩm'],
        verifiedSources: ['Viện Kiến trúc Quốc gia', 'Nghiên cứu Kiến trúc bản địa Việt Nam - KTS. Hoàng Đạo Kính']
      },
      stemQuestion: {
        question: 'Tại sao bên trong nhà sàn vào mùa hè vùng núi lại mát mẻ hơn đáng kể so với nhà bê tông xây sát đất?',
        contextExplanation: 'Khảo sát dòng đối lưu nhiệt, độ dẫn nhiệt của vật liệu tự nhiên và hiệu ứng thông gió sàn - mái.',
        subQuestions: ['Tác dụng của chiều cao gầm sàn (1.5m - 2.5m) đối với vận tốc gió làm mát là gì?']
      },
      prediction: {
        prompt: 'Nếu tăng độ dốc mái từ 30° lên 50° và mở cửa thông gió trên đỉnh mái, nhiệt độ đỉnh nhà sẽ thay đổi thế nào?',
        options: [
          { id: 'p1', label: 'Khí nóng tích tụ sẽ bốc lên và thoát nhanh hơn nhờ đối lưu nhiệt tự nhiên', explanation: 'Khí nóng nhẹ hơn bốc lên đỉnh (hiệu ứng ống khói) giúp giải nhiệt nhanh.' },
          { id: 'p2', label: 'Nhiệt độ sẽ tăng thêm vì mái dốc giữ nhiệt nhiều hơn', explanation: 'Sai, góc dốc lớn tăng khoảng cách vùng đệm không khí và tạo áp suất hút gió lên.' }
        ]
      },
      challenge: {
        title: 'Tối ưu hóa vi khí hậu nhà sàn mùa hè',
        scenario: 'Điều chỉnh chiều cao sàn, độ dốc mái và độ mở cửa để giảm nhiệt độ vùng sinh hoạt xuống mức tối ưu mà không tốn năng lượng nhân tạo.',
        criteria: ['Vận tốc gió trong nhà đạt 0.3 - 0.8 m/s', 'Chênh lệch nhiệt độ trong/ngoài giảm ≥ 3.5°C'],
        task: 'Tìm cấu hình kiến trúc cân bằng giữa che nắng, cản mưa và thông gió.'
      },
      reflection: {
        questions: ['Những bài học kiến trúc nhà sàn nào có thể áp dụng vào nhà ở sinh thái hiện đại ngày nay?'],
        culturalConnection: 'Triết lý sống hòa hợp với địa hình và tự nhiên, không san phẳng núi đồi.',
        physicalLimitations: ['Mô phỏng sử dụng mô hình nhiệt 1D đơn giản; không đại diện cho toàn bộ trường gió xoáy 3D phức tạp ngoài thực địa.']
      }
    },
    scientificBasis: {
      principles: ['Truyền nhiệt bức xạ, dẫn nhiệt qua vật liệu hữu cơ và đối lưu nhiệt tự nhiên', 'Hiệu ứng Bernoulli và thông gió xuyên phòng (Cross-ventilation)'],
      variables: [
        { symbol: 'h_floor', name: 'Chiều cao sàn', unit: 'm', range: '1.2 - 2.8 m', description: 'Khoảng cách từ mặt đất đến mặt sàn sinh hoạt' },
        { symbol: 'θ_roof', name: 'Góc nghiêng mái', unit: 'độ (°)', range: '25° - 60°', description: 'Độ dốc mái lợp lá cọ/gianh' },
        { symbol: 'Vent', name: 'Độ mở cửa thông gió', unit: '%', range: '10% - 90%', description: 'Tỷ lệ diện tích cửa đón và thoát gió' }
      ],
      assumptions: ['Bức xạ mặt trời vào ban trưa hè không mây, nhiệt độ môi trường ngoài 34°C'],
      limitations: ['Số liệu nhiệt độ hiển thị là kết quả tính toán mô hình vật lý giả định; người học có ô nhập số liệu thực đo ngoài đời.'],
      safetyNotes: ['Không thực hiện đo đạc trên mái nhà cao khi không có thiết bị bảo hộ an toàn.'],
      references: ['Givoni, B. (1998). Climate Considerations in Building and Urban Design. John Wiley & Sons.']
    }
  },
  {
    id: 4,
    numberStr: '04',
    title: 'Đan lát – Cấu trúc & sức bền',
    subtitle: 'Hình học phân bố lực, đan nong mốt vs đan mắt cáo lục giác',
    stemDomain: 'mechanics',
    stemDomainLabel: 'Cơ học kết cấu',
    culturalHeritage: 'Nghề đan mây tre giang truyền thống',
    locationContext: 'Các làng nghề vùng trung du và miền núi Bắc Bộ',
    keyFormula: '\\sigma = \\frac{F}{A_{eff}} \\quad | \\quad \\tau = \\frac{T r}{J}',
    formulaDescription: 'Ứng suất kéo nén và phân bố tải trọng trên mạng lưới nan đan xen kẽ.',
    steps: {
      context: {
        title: 'Kỹ nghệ đan giang tre và mạng lưới chịu tải',
        description: 'Vật liệu tre giang nhẹ nhưng có mô-đun đàn hồi dọc sợi rất cao. Bằng cách đan nan theo các kiểu khác nhau (nong mốt, nong đôi, mắt cáo triaxial), người thợ tạo ra những chiếc thúng, gùi, bồ vừa dẻo dai vừa chịu được tải trọng hàng chục kilôgam.',
        culturalDetails: ['Nan cật tre bền kéo gấp nhiều lần nan ruột', 'Kỹ thuật vát mép nan chống cắt đứt dây liên kết'],
        verifiedSources: ['Nghiên cứu cơ lý tính tre Việt Nam - Đại học Lâm nghiệp']
      },
      stemQuestion: {
        question: 'Tại sao kiểu đan mắt cáo (lục giác - triaxial) lại chịu xoắn và biến dạng đa hướng tốt hơn đan nong mốt vuông góc?',
        contextExplanation: 'Khảo sát cấu trúc tam giác/lục giác so với hình chữ nhật trong việc triệt tiêu ứng suất cắt.',
        subQuestions: ['Tác dụng của việc tăng mật độ nan đan đối với độ võng đáy thúng/gùi?']
      },
      prediction: {
        prompt: 'Khi chịu tải trọng tập trung ở đáy, đáy thúng đan mắt cáo lục giác biến dạng thế nào so với đan vuông thông thường?',
        options: [
          { id: 'p1', label: 'Biến dạng phân bố đều theo 3 trục 60°, hạn chế nứt gãy cục bộ', explanation: 'Cấu trúc triaxial phân tán lực đồng đều hơn mạng lưới 2 trục trực giao.' },
          { id: 'p2', label: 'Dễ gãy hơn vì có nhiều lỗ rỗng', explanation: 'Sai, cấu trúc mắt cáo tối ưu tỷ số độ bền trên trọng lượng.' }
        ]
      },
      challenge: {
        title: 'Tối ưu hóa tỷ số tải trọng / khối lượng nan',
        scenario: 'Lựa chọn kiểu đan và mật độ nan sao cho giỏ chịu được 20kg hàng mà dùng ít nan nhất.',
        criteria: ['Độ võng cực đại < 15mm', 'Khối lượng bản thân nhẹ nhất'],
        task: 'So sánh ứng suất trên sơ đồ lực và ghi nhận bảng dữ liệu.'
      },
      reflection: {
        questions: ['Vì sao các kỹ sư hàng không vũ trụ hiện đại cũng áp dụng cấu trúc đan tam giác/lục giác cho thân máy bay?'],
        culturalConnection: 'Tri thức bản địa đi trước trực giác kỹ thuật hiện đại qua hàng trăm năm thử và sai.',
        physicalLimitations: ['Không tự ý nén vật nặng nguy hiểm lên người học trong lớp học.']
      }
    },
    scientificBasis: {
      principles: ['Lực kéo dọc thớ sợi cellulose trong tre', 'Cơ học giàn không gian đa hướng'],
      variables: [
        { symbol: 'WeaveType', name: 'Kiểu đan', unit: 'loại', range: 'Nong mốt / Nong đôi / Mắt cáo', description: 'Cấu trúc liên kết các nan' },
        { symbol: 'Density', name: 'Mật độ nan', unit: 'nan/cm', range: '1.0 - 5.0 nan/cm', description: 'Số nan trên mỗi centimet chiều dài' },
        { symbol: 'Load', name: 'Tải trọng tác dụng', unit: 'kg (N)', range: '2 - 30 kg', description: 'Khối lượng hàng hóa đặt lên đáy' }
      ],
      assumptions: ['Các nan tre có tính đàn hồi tuyến tính trong giới hạn chảy'],
      limitations: ['Mô phỏng 2D/giàn; số liệu thực nghiệm cần đo bằng lực kế trên mẫu đan thật.'],
      safetyNotes: ['Cẩn thận dằm tre khi thao tác với nan thật trong giờ thực hành.'],
      references: ['Amada, S. et al. (1997). The mechanical properties of bamboo. Composites Part B.']
    }
  },
  {
    id: 5,
    numberStr: '05',
    title: 'Guồng nước – Năng lượng chuyển động',
    subtitle: 'Thủy lực học, động năng dòng chảy & công suất cơ học',
    stemDomain: 'mechanics',
    stemDomainLabel: 'Cơ học & Năng lượng tái tạo',
    culturalHeritage: 'Guồng nước (cọn nước) của đồng bào miền núi phía Bắc',
    locationContext: 'Các thung lũng ven sông suối tại Cao Bằng, Hòa Bình, Phú Thọ',
    keyFormula: 'P_{thuy} = \\frac{1}{2} \\rho A v^3 \\quad | \\quad \\tau = \\rho Q (v_{dong} - v_{canh}) R',
    formulaDescription: 'Công suất dòng chảy và mô-men quay tác dụng lên cánh guồng nước.',
    steps: {
      context: {
        title: 'Cỗ máy dẫn nước tự động hoàn toàn bằng tre gỗ',
        description: 'Guồng nước là tuyệt tác kỹ thuật thủy cơ học dân gian: dòng nước suối đẩy cánh quạt quay guồng, các ống bương nghiêng múc nước lên cao hàng chục mét rồi đổ vào máng tre dẫn về ruộng bậc thang mà không cần bất kỳ động cơ nhân tạo nào.',
        culturalDetails: ['Toàn bộ làm từ tre, nứa, gỗ rọ và dây chằng tự nhiên', 'Góc đặt ống bương múc nước được vát chính xác để giữ nước khi lên cao và dốc hết khi đến đỉnh'],
        verifiedSources: ['Bảo tàng Dân tộc học', 'Hội Khoa học Thủy lực Việt Nam']
      },
      stemQuestion: {
        question: 'Những yếu tố nào (vận tốc nước, bán kính guồng, số cánh đón nước) quyết định lưu lượng nước đưa lên ruộng?',
        contextExplanation: 'Khảo sát sự biến đổi động năng của dòng nước thành thế năng trọng trường của cột nước.',
        subQuestions: ['Tốc độ quay tối ưu của guồng là bao nhiêu so với vận tốc dòng nước để đạt hiệu suất cao nhất?']
      },
      prediction: {
        prompt: 'Nếu bán kính guồng nước tăng gấp đôi nhưng lưu lượng nước suối giữ nguyên, tốc độ quay (vòng/phút - RPM) sẽ thế nào?',
        options: [
          { id: 'p1', label: 'Tốc độ quay RPM sẽ giảm xuống nhưng đưa được nước lên độ cao lớn hơn', explanation: 'Chu vi lớn hơn cần thời gian quay một vòng dài hơn, nhưng cánh tay đòn đưa nước lên cao hơn.' },
          { id: 'p2', label: 'Tốc độ quay RPM sẽ tăng gấp đôi ngay lập tức', explanation: 'Sai, bán kính lớn tăng quán tính và giảm vận tốc góc với cùng lưu lượng dòng.' }
        ]
      },
      challenge: {
        title: 'Thiết kế cọn nước tưới tiêu thung lũng',
        scenario: 'Điều chỉnh bán kính guồng (2m - 5m), số lượng cánh đón nước và ống múc để đạt lưu lượng nước tưới ≥ 1.2 m³/giờ từ con suối có tốc độ 1.5 m/s.',
        criteria: ['Hiệu suất thủy lực đạt > 25%', 'Lưu lượng cấp nước ổn định'],
        task: 'Quan sát đồ thị RPM, mô-men quay và ghi số vòng quay thực nghiệm.'
      },
      reflection: {
        questions: ['Tại sao cọn nước là mô hình kinh tế tuần hoàn và năng lượng xanh bền vững hàng trăm năm?'],
        culturalConnection: 'Khả năng ứng dụng năng lượng tự nhiên của đồng bào miền núi một cách thông minh, thân thiện với môi trường.',
        physicalLimitations: ['Mô hình tính toán giả định dòng nước phẳng ổn định, bỏ qua ma sát ổ trục bôi trơn bằng mỡ động vật.']
      }
    },
    scientificBasis: {
      principles: ['Định lý biến thiên động lượng dòng chất lỏng', 'Cân bằng mô-men quay và tổn hao thế năng'],
      variables: [
        { symbol: 'v_water', name: 'Vận tốc dòng suối', unit: 'm/s', range: '0.5 - 3.0 m/s', description: 'Tốc độ nước chảy qua cánh guồng' },
        { symbol: 'R', name: 'Bán kính guồng', unit: 'm', range: '1.5 - 5.0 m', description: 'Khoảng cách từ trục đến mép cánh' },
        { symbol: 'N_blades', name: 'Số lượng cánh đón gió/nước', unit: 'cánh', range: '8 - 24 cánh', description: 'Số cánh tre gắn quanh vành' }
      ],
      assumptions: ['Dòng chảy tầng cục bộ tiếp tuyến cánh quạt'],
      limitations: ['Có đồng hồ bấm giờ hỗ trợ đếm vòng quay thực tế từ video thực địa.'],
      safetyNotes: ['Không lại gần trục cọn nước thật khi đang quay với tốc độ cao.'],
      references: ['Münch, K. (2010). Historic Water Wheels and Power Transmission. Springer.']
    }
  },
  {
    id: 6,
    numberStr: '06',
    title: 'Nhuộm vải – Khoa học màu sắc',
    subtitle: 'Hóa học sắc tố thực vật, quang phổ hấp thụ & hệ màu RGB/Lab',
    stemDomain: 'optics',
    stemDomainLabel: 'Quang học & Hóa học chất màu',
    culturalHeritage: 'Kỹ thuật nhuộm chàm, củ nâu, hoàng đằng của các dân tộc miền núi',
    locationContext: 'Vùng cao Sa Pa, Yên Bái, Hà Giang, Phú Thọ',
    keyFormula: 'A = -\\log_{10}(I/I_0) = \\varepsilon c l \\quad | \\quad \\Delta E = \\sqrt{\\Delta L^2 + \\Delta a^2 + \\Delta b^2}',
    formulaDescription: 'Định luật Beer-Lambert về độ hấp thụ quang phổ và công thức tính khoảng cách màu sắc sai khác CIE-Lab.',
    steps: {
      context: {
        title: 'Bí quyết trích ly màu từ cỏ cây núi rừng',
        description: 'Người phụ nữ các dân tộc thiểu số là những nhà hóa học sắc ký thực thụ: họ biết dùng nước tro củi để tạo môi trường kiềm (pH > 10) khử chàm, dùng nước vôi trong, và ngâm ủ nhiều ngày để phân tử màu gắn chặt vào sợi bông lanh.',
        culturalDetails: ['Cây chàm (Strobilanthes cusia) cho màu chàm xanh biếc', 'Củ nâu cho màu nâu đất bền nắng', 'Hoàng đằng/nghệ cho màu vàng rực rỡ'],
        verifiedSources: ['Viện Hóa học các hợp chất thiên nhiên - VAST']
      },
      stemQuestion: {
        question: 'Tại sao việc ngâm nhuộm nhiều lần và phơi nắng tạo ra màu sắc đậm và bền hơn so với nhuộm một lần?',
        contextExplanation: 'Khảo sát quá trình oxy hóa sắc tố không tan trong không khí và sự hấp phụ nhiều lớp phân tử màu.',
        subQuestions: ['Môi trường pH của dung dịch nhuộm ảnh hưởng như thế nào đến độ tan và khả năng bắt màu?']
      },
      prediction: {
        prompt: 'Nếu tăng số lần nhúng nhuộm và phơi khô từ 1 lần lên 5 lần, giá trị độ sáng L* và thành phần màu xanh b* sẽ thay đổi thế nào?',
        options: [
          { id: 'p1', label: 'Độ sáng L* giảm mạnh (vải tối màu hơn), sắc xanh chàm đậm đà vượt bậc', explanation: 'Các lớp chàm tích tụ và oxy hóa thành indigotin không tan bám chặt lên sợi.' },
          { id: 'p2', label: 'Màu vải sẽ bị tẩy trắng hoàn toàn do ánh nắng', explanation: 'Sai, nắng giúp oxy hóa indigotin thành dạng bền màu.' }
        ]
      },
      challenge: {
        title: 'Phân tích trắc sắc học mẫu vải',
        scenario: 'Tải ảnh mẫu vải nhuộm, trích xuất mã màu RGB trung bình và tính toán độ chênh lệch màu so với bảng màu chuẩn.',
        criteria: ['Trích xuất đúng giá trị RGB và HSV từ vùng chọn', 'Cảnh báo sai lệch do ánh sáng nguồn chụp'],
        task: 'Lập nhật ký điều kiện ánh sáng và so sánh sắc thái màu.'
      },
      reflection: {
        questions: ['Tại sao thuốc nhuộm thực vật tự nhiên thân thiện với môi trường hơn hóa chất tổng hợp?'],
        culturalConnection: 'Ý thức bảo vệ nguồn nước đầu nguồn của đồng bào khi dùng phụ gia thảo mộc tự nhiên.',
        physicalLimitations: ['Ảnh chụp trên điện thoại bị ảnh hưởng lớn bởi cân bằng trắng (White Balance) và nguồn sáng phòng.']
      }
    },
    scientificBasis: {
      principles: ['Phản ứng oxy hóa khử của Indican -> Indoxyl -> Indigotin', 'Hiện tượng hấp phụ bề mặt sợi cellulose', 'Không gian màu sắc RGB và CIE L*a*b*'],
      variables: [
        { symbol: 'Dips', name: 'Số lần nhúng nhuộm', unit: 'lần', range: '1 - 10 lần', description: 'Mỗi lần kèm theo phơi oxy hóa ngoài không khí' },
        { symbol: 'pH', name: 'Độ kiềm dung dịch', unit: 'pH', range: '7.0 - 12.0', description: 'Độ pH kiểm soát tốc độ hòa tan sắc tố' }
      ],
      assumptions: ['Ánh sáng ban ngày chuẩn D65 khi quan sát'],
      limitations: ['Mô phỏng màu sắc trên màn hình sRGB phụ thuộc vào cấu hình màn hình hiển thị.'],
      safetyNotes: ['Nước vôi và nước tro có tính kiềm, cần đeo găng tay khi làm thí nghiệm thực tế.'],
      references: ['Cardon, D. (2007). Natural Dyes: Sources, Tradition, Technology and Science. Archetype Publications.']
    }
  },
  {
    id: 7,
    numberStr: '07',
    title: 'Sáo trúc – Cột khí & cộng hưởng',
    subtitle: 'Sóng dừng âm học, tần số riêng & hiệu chỉnh miệng thổi',
    stemDomain: 'acoustics',
    stemDomainLabel: 'Âm học & Vật lý sóng',
    culturalHeritage: 'Nghệ thuật chế tác sáo tiêu nứa của người Mường, Mông, Tày',
    locationContext: 'Rừng trúc nứa vùng Phú Thọ, Ba Chẽ, Tây Bắc',
    keyFormula: 'f_n = n \\frac{v}{2 (L + 2 \\Delta L)} \\quad | \\quad v(T) = 331.3 \\sqrt{1 + \\frac{T}{273.15}}',
    formulaDescription: 'Tần số cộng hưởng của cột khí hai đầu hở kèm theo số hiệu chỉnh đầu mút (End Correction ΔL ≈ 0.61 r).',
    steps: {
      context: {
        title: 'Thước đo lỗ bấm và đôi tai của nghệ nhân khoét sáo',
        description: 'Cây sáo Mông, sáo Mường làm từ ống nứa thẳng, tròn đều. Nghệ nhân dùng que sắt nung đỏ để khoét lỗ thổi và các lỗ bấm theo tỷ lệ cơ thể hoặc thước đo truyền thống.',
        culturalDetails: ['Nứa tép, nứa già qua mùa sương muối ít bị nứt', 'Khoảng cách giữa các lỗ bấm quyết định thang âm ngũ cung bản địa'],
        verifiedSources: ['Viện Âm nhạc Quốc gia Việt Nam']
      },
      stemQuestion: {
        question: 'Tại sao cùng một cây sáo nhưng khi trời lạnh âm thanh lại có cao độ hơi trầm hơn so with khi trời nóng bức?',
        contextExplanation: 'Khảo sát sự phụ thuộc của vận tốc âm thanh vào nhiệt độ không khí và chiều dài hiệu dụng của cột khí.',
        subQuestions: ['Hiệu ứng mở ngón bấm làm thay đổi chiều dài cột khí như thế nào?']
      },
      prediction: {
        prompt: 'Nếu tăng nhiệt độ không khí từ 15°C lên 35°C, tần số nốt Đô (C4) của sáo sẽ thay đổi thế nào?',
        options: [
          { id: 'p1', label: 'Tần số tăng lên khoảng vài Hz vì vận tốc âm thanh trong không khí tăng theo căn bậc hai nhiệt độ tuyệt đối', explanation: 'Vận tốc âm thanh tăng ~0.6 m/s cho mỗi độ C làm tần số f = v/2L tăng theo.' },
          { id: 'p2', label: 'Tần số giảm mạnh vì ống nứa nở dài ra', explanation: 'Sai, hệ số nở nhiệt của tre nứa rất nhỏ so với sự biến đổi vận tốc âm trong chất khí.' }
        ]
      },
      challenge: {
        title: 'Chế tạo sáo ảo chuẩn tần số hòa âm',
        scenario: 'Điều chỉnh chiều dài thân sáo L và bán kính lòng ống r để tạo ra nốt La chuẩn A4 (440 Hz) ở nhiệt độ 25°C.',
        criteria: ['Độ lệch tần số |f - 440| < 1.0 Hz', 'Có tính đến số hiệu chỉnh đầu mút ΔL'],
        task: 'Quan sát đồ thị nút và bụng sóng dừng bên trong ống sáo.'
      },
      reflection: {
        questions: ['Nghệ nhân truyền thống điều chỉnh cao độ bằng cách nào khi không có máy đo tần số số hóa?'],
        culturalConnection: 'Sự rèn luyện thính giác tuyệt đối và sự tinh tế trong cảm nhận âm sắc của nghệ nhân dân tộc.',
        physicalLimitations: ['Ống sáo thực tế có độ côn (không đều tuyệt đối) và lực thổi của môi tạo luồng khí xoáy phức tạp.']
      }
    },
    scientificBasis: {
      principles: ['Sóng dừng trong ống hở 2 đầu', 'Phương trình sóng âm 1 chiều Euler', 'Vận tốc truyền sóng âm trong khí lý tưởng'],
      variables: [
        { symbol: 'L', name: 'Chiều dài cột khí hiệu dụng', unit: 'cm', range: '20.0 - 65.0 cm', description: 'Khoảng cách từ mép lỗ thổi đến lỗ hở đầu tiên' },
        { symbol: 'r', name: 'Bán kính trong ống nứa', unit: 'mm', range: '6.0 - 15.0 mm', description: 'Bán kính quyết định số hiệu chỉnh đầu mút' },
        { symbol: 'T', name: 'Nhiệt độ không khí', unit: '°C', range: '5 - 45 °C', description: 'Ảnh hưởng trực tiếp đến vận tốc âm v(T)' }
      ],
      assumptions: ['Ống trụ lý tưởng, sóng phẳng một chiều'],
      limitations: ['Mô phỏng cột khí lý tưởng; sáo thực có hiện tượng bẻ nốt (lip bending) do góc thổi.'],
      safetyNotes: ['Khi dùi sắt nung đỏ trong thực hành: Chỉ thực hiện dưới sự giám sát nghiêm ngặt của giáo viên.'],
      references: ['Kinsler, L. E. et al. (2000). Fundamentals of Acoustics. John Wiley & Sons.']
    }
  },
  {
    id: 8,
    numberStr: '08',
    title: 'Cơm lam – Truyền nhiệt',
    subtitle: 'Dẫn nhiệt một chiều, gradient nhiệt độ & nhiệt dung riêng',
    stemDomain: 'thermodynamics',
    stemDomainLabel: 'Nhiệt học & Năng lượng',
    culturalHeritage: 'Văn hóa ẩm thực cơm lam trong ống tre nứa của người Mường, Thái',
    locationContext: 'Vùng đồi rừng miền núi phía Bắc',
    keyFormula: 'P = \\frac{k A \\Delta T}{L} \\quad | \\quad \\frac{\\partial T}{\\partial t} = \\alpha \\frac{\\partial^2 T}{\\partial x^2}',
    formulaDescription: 'Định luật dẫn nhiệt Fourier và phương trình khuếch tán nhiệt 1 chiều qua thành ống tre ẩm.',
    steps: {
      context: {
        title: 'Nấu chín hạt gạo bên trong thân tre tươi',
        description: 'Khi đi nương rẫy, người dân dùng ống tre tươi chứa gạo nếp ngâm và nước suối vùi vào tro than hồng. Lớp nước tự nhiên trong thành tre tươi bảo vệ cơm không bị cháy khét, truyền nhiệt đều và giữ hương thơm ngát của nứa.',
        culturalDetails: ['Nút đầu ống bằng lá chuối để giữ áp suất hơi nước', 'Xoay đều ống tre để nhiệt lượng phân bố đối xứng qua trục'],
        verifiedSources: ['Nghiên cứu nhiệt động học ẩm thực truyền thống - ĐHBK Hà Nội']
      },
      stemQuestion: {
        question: 'Tại sao lớp nước ẩm trong thành ống tre tươi lại đóng vai trò quyết định giúp hạt gạo chín dẻo mà vỏ ngoài không bị cháy rụi ngay?',
        contextExplanation: 'Khảo sát nhiệt hóa hơi cao của nước và hệ số dẫn nhiệt k của tre tươi so với tre khô.',
        subQuestions: ['Gradient nhiệt độ từ vỏ ngoài ống tre vào tâm lõi cơm biến đổi thế nào theo thời gian nướng?']
      },
      prediction: {
        prompt: 'Nếu dùng ống tre khô kiệt nước thay cho ống tre tươi, điều gì sẽ xảy ra khi nướng trên than hồng?',
        options: [
          { id: 'p1', label: 'Vỏ tre khô sẽ bắt lửa bốc cháy nhanh chóng trước khi nhiệt lượng kịp truyền vào làm chín gạo bên trong', explanation: 'Thiếu nhiệt dung và sự bay hơi của nước trong vách tre khiến nhiệt độ bề mặt vượt ngưỡng bắt cháy.' },
          { id: 'p2', label: 'Gạo sẽ chín nhanh gấp đôi và ngon hơn', explanation: 'Sai, nhiệt truyền quá nhanh và cháy vỏ gây khê cơm.' }
        ]
      },
      challenge: {
        title: 'Mô phỏng đường cong nhiệt độ nấu cơm lam an toàn',
        scenario: 'Điều chỉnh độ dày thành tre L và nhiệt độ nguồn nhiệt than tro sao cho tâm lõi đạt 98°C - 100°C trong 45 phút mà vỏ tre không vượt quá 260°C.',
        criteria: ['Nhiệt độ tâm lõi đạt điểm hồ hóa tinh bột', 'Vỏ ngoài không đạt ngưỡng bốc cháy'],
        task: 'Vẽ đồ thị phân bố nhiệt độ theo bề dày thành tre.'
      },
      reflection: {
        questions: ['Tri thức ẩm thực dân gian phản ánh sự am hiểu về nhiệt dung và dẫn nhiệt như thế nào?'],
        culturalConnection: 'Khả năng tận dụng vật liệu tại chỗ một cách tài tình trong sinh hoạt miền núi.',
        physicalLimitations: ['KHÔNG ĐỐT LỬA TRONG LỚP HỌC. Mọi thực nghiệm nhiệt trong trường học thực hiện bằng nước ấm và cảm biến nhiệt độ an toàn.']
      }
    },
    scientificBasis: {
      principles: ['Định luật Fourier về dẫn nhiệt', 'Nhiệt dung riêng và ẩn nhiệt hóa hơi của nước', 'Quá trình hồ hóa tinh bột ở ~70-95°C'],
      variables: [
        { symbol: 'k', name: 'Độ dẫn nhiệt vật liệu', unit: 'W/(m·K)', range: '0.15 - 0.35 W/(m·K)', description: 'Tre tươi có độ dẫn nhiệt tốt hơn tre khô' },
        { symbol: 'L_wall', name: 'Độ dày thành tre', unit: 'mm', range: '4.0 - 15.0 mm', description: 'Khoảng cách dẫn nhiệt từ mặt ngoài vào ruột' },
        { symbol: 'T_fire', name: 'Nhiệt độ than hồng', unit: '°C', range: '250 - 550 °C', description: 'Nguồn cấp nhiệt bên ngoài' }
      ],
      assumptions: ['Mô hình đối xứng trục trụ, không truyền nhiệt qua 2 đáy nút'],
      limitations: ['Mô hình mô phỏng truyền nhiệt 1D gần đúng; hơi nước đối lưu bên trong được xấp xỉ hệ số trao đổi nhiệt.'],
      safetyNotes: ['Tuyệt đối không đốt lửa trong phòng học STEM. Thực hành kiểm chứng sử dụng cốc cách nhiệt và nước nóng dưới 60°C.'],
      references: ['Incropera, F. P. et al. (2007). Fundamentals of Heat and Mass Transfer. Wiley.']
    }
  },
  {
    id: 9,
    numberStr: '09',
    title: 'Cầu tre & cầu dây – Kỹ thuật chịu lực',
    subtitle: 'Cơ học kết cấu giàn, ứng suất uốn & biến dạng võng',
    stemDomain: 'mechanics',
    stemDomainLabel: 'Kỹ thuật công trình & Tĩnh học',
    culturalHeritage: 'Cầu khỉ, cầu tre gác suối, cầu treo dây song mây miền núi',
    locationContext: 'Các suối ngòi hiểm trở vùng Tây Bắc và Đông Bắc',
    keyFormula: 'y_{max} = \\frac{F L^3}{48 E I} \\quad | \\quad M_{max} = \\frac{F L}{4}',
    formulaDescription: 'Độ võng cực đại của dầm đơn giản chịu tải tập trung ở giữa nhịp và mô-men uốn kháng uốn.',
    steps: {
      context: {
        title: 'Bắc cầu vượt lũ bằng mây tre bản địa',
        description: 'Vào mùa mưa lũ, đồng bào miền núi dùng tre đực già, dây song mây kết thành những cây cầu treo hoặc cầu giàn kiên cố bắc qua lòng suối dốc, chịu được sức nặng của người và hàng hóa gùi qua lại.',
        culturalDetails: ['Các thanh giằng chéo tạo tam giác chịu lực chống rung lắc', 'Dây chằng mây kéo néo vào gốc cây cổ thụ hai bên bờ'],
        verifiedSources: ['Tổng hội Xây dựng Việt Nam']
      },
      stemQuestion: {
        question: 'Tại sao việc bổ sung các thanh giằng chéo (cấu trúc tam giác) lại làm tăng độ cứng vững của cầu gấp nhiều lần so with cấu trúc dầm phẳng đơn độc?',
        contextExplanation: 'Khảo sát cơ học kết cấu giàn (Truss) và sự chuyển đổi ứng suất uốn thành ứng suất kéo/nén thuần túy.',
        subQuestions: ['Điểm đặt tải trọng ở đâu gây ra mô-men uốn và độ võng lớn nhất trên nhịp cầu?']
      },
      prediction: {
        prompt: 'Khi người gùi hàng bước vào chính giữa nhịp cầu (L/2), độ võng của dầm cầu sẽ thế nào so với khi đứng ở vị trí 1/4 nhịp?',
        options: [
          { id: 'p1', label: 'Độ võng ở giữa nhịp là lớn nhất vì cánh tay đòn mô-men uốn đạt giá trị cực đại', explanation: 'Theo cơ học kết cấu dầm hai đầu tựa, M_max = FL/4 tại vị trí x = L/2.' },
          { id: 'p2', label: 'Độ võng bằng nhau ở mọi vị trí trên cầu', explanation: 'Sai, phân bố độ võng phụ thuộc vào hàm bậc ba của vị trí tải.' }
        ]
      },
      challenge: {
        title: 'Gia cố nhịp cầu tre vượt suối',
        scenario: 'Thiết kế nhịp cầu tre 6 mét chịu được tải trọng 1500 N (khoảng 2 người gùi hàng) với độ võng cho phép dưới 40 mm.',
        criteria: ['Chọn số lượng thân tre ghép bó', 'Bố trí cột chống giữa hoặc thanh giằng tam giác', 'Tối ưu khối lượng vật liệu'],
        task: 'So sánh phương án dầm thẳng và phương án có thanh giằng chống xiên.'
      },
      reflection: {
        questions: ['Các nguyên lý của cầu tre truyền thống tương đồng với cầu dầm thép hiện đại ở điểm nào?'],
        culturalConnection: 'Khả năng ứng biến với địa hình hiểm trở và tinh thần tương trợ cộng đồng cùng bắc cầu.',
        physicalLimitations: ['Tre có tính chất cơ lý không đồng nhất dọc thân; đốt tre và mắt tre có ứng suất tập trung.']
      }
    },
    scientificBasis: {
      principles: ['Phương trình vi phân đường đàn hồi Euler-Bernoulli', 'Mô-men quán tính tiết diện ống tròn I = π(D⁴ - d⁴)/64', 'Tĩnh học vật rắn cân bằng'],
      variables: [
        { symbol: 'L_span', name: 'Chiều dài nhịp cầu', unit: 'm', range: '2.0 - 10.0 m', description: 'Khoảng cách giữa hai mố cầu' },
        { symbol: 'F_load', name: 'Tải trọng người/hàng', unit: 'N', range: '200 - 3000 N', description: 'Lực tập trung tác dụng lên mặt cầu' },
        { symbol: 'Brace', name: 'Hệ giằng tam giác', unit: 'bật/tắt', range: 'Không giằng / Giằng chéo', description: 'Gia cường chống biến dạng' }
      ],
      assumptions: ['Hai đầu mố cầu tựa khớp đơn giản'],
      limitations: ['Mô hình tính toán giả định biến dạng đàn hồi bé; không tính hiện tượng trượt giữa các bó nan buộc lạt.'],
      safetyNotes: ['Không thử nghiệm quá tải trên mô hình thật khi có học sinh đứng bên dưới.'],
      references: ['Beer, F. P. et al. (2015). Mechanics of Materials. McGraw-Hill.']
    }
  },
  {
    id: 10,
    numberStr: '10',
    title: 'Ruộng bậc thang – Dòng chảy & xói mòn',
    subtitle: 'Thủy văn sườn dốc, năng lượng dòng chảy tràn & bảo tồn đất',
    stemDomain: 'environment',
    stemDomainLabel: 'Khoa học Môi trường & Địa chất',
    culturalHeritage: 'Kiến trúc canh tác ruộng bậc thang (Mù Cang Chải, Sa Pa, Hoàng Su Phì)',
    locationContext: 'Vùng núi cao dốc đứng miền Bắc',
    keyFormula: 'A_{soil} = R \\cdot K \\cdot LS \\cdot C \\cdot P \\quad | \\quad v = \\frac{1}{n} R_h^{2/3} S^{1/2}',
    formulaDescription: 'Phương trình mất đất phổ dụng USLE và công thức Manning tính vận tốc dòng chảy tràn trên sườn dốc.',
    steps: {
      context: {
        title: 'Công trình thủy nông và thổ nhưỡng trên sườn núi dốc',
        description: 'Thay vì để sườn núi dốc đứng dẫn đến xói mòn lũ quét, cư dân bản địa đã kỳ công xẻ sườn đồi thành từng bậc phẳng có bờ giữ nước. Mỗi bậc là một bể lắng phù sa, ngắt quãng động năng dòng chảy của nước mưa.',
        culturalDetails: ['Bờ ruộng đắp bằng đất sét nện chặt giữ nước', 'Hệ thống xẻ rãnh chia nước thông minh từ bậc trên xuống bậc dưới'],
        verifiedSources: ['Viện Khoa học Nông nghiệp Việt Nam (VAAS)']
      },
      stemQuestion: {
        question: 'Cấu trúc bậc thang làm giảm vận tốc dòng chảy tràn và lượng đất màu bị xói mòn như thế nào so with sườn đồi dốc tự nhiên?',
        contextExplanation: 'Khảo sát sự suy giảm gradient thế năng (độ dốc thủy lực S) và thời gian tập trung nước mặt.',
        subQuestions: ['Tác dụng của lớp thảm thực vật lúa/cỏ ở mặt ruộng đối với hệ số nhám n là gì?']
      },
      prediction: {
        prompt: 'Nếu chia một sườn dốc 30° thành 5 bậc thang phẳng, vận tốc dòng nước chảy tràn bề mặt sẽ thay đổi thế nào?',
        options: [
          { id: 'p1', label: 'Vận tốc dòng chảy giảm mạnh do độ dốc cục bộ ở từng bậc gần như bằng 0, nước bị giữ lại lắng cặn', explanation: 'Độ dốc sườn S trong công thức Manning giảm giúp dòng chảy chậm lại và tăng độ thấm.' },
          { id: 'p2', label: 'Vận tốc dòng chảy tăng gấp đôi vì nước rơi từ bậc nọ sang bậc kia', explanation: 'Sai, năng lượng rơi tại bờ ruộng bị triệt tiêu ở vũng lắng của bậc dưới.' }
        ]
      },
      challenge: {
        title: 'Mô phỏng khay đất thực nghiệm',
        scenario: 'Điều chỉnh số bậc thang (1 đến 8 bậc), lượng mưa mô phỏng và độ thấm của đất để giữ lượng đất mất dưới 15 g/m².',
        criteria: ['Giảm thiểu lượng đất rửa trôi', 'Duy trì độ ẩm đất mặt đủ nước canh tác'],
        task: 'Lập bảng đối chiếu lượng đất mất giữa sườn dốc trần và sườn ruộng bậc thang.'
      },
      reflection: {
        questions: ['Ruộng bậc thang đã đóng góp như thế nào vào an ninh lương thực và giảm thiểu thiên tai sạt lở đất?'],
        culturalConnection: 'Trí tuệ canh tác bền vững tôn trọng chu trình tự nhiên của đồng bào miền núi.',
        physicalLimitations: ['Không tuyên bố đây là mô hình dự báo sạt lở thực địa; đây là mô hình giáo dục trực quan hóa cơ chế thủy văn.']
      }
    },
    scientificBasis: {
      principles: ['Phương trình Manning về dòng chảy đều mặt tự do', 'Định luật thẩm thấu Darcy trong môi trường xốp', 'Mô hình USLE (Universal Soil Loss Equation)'],
      variables: [
        { symbol: 'Slope', name: 'Độ dốc sườn núi', unit: 'độ (°)', range: '10° - 45°', description: 'Độ nghiêng tự nhiên của địa hình' },
        { symbol: 'Steps', name: 'Số bậc thang', unit: 'bậc', range: '1 - 8 bậc', description: 'Số lượng tầng chia nhỏ sườn núi' },
        { symbol: 'Rain', name: 'Cường độ mưa', unit: 'mm/h', range: '20 - 150 mm/h', description: 'Mức mưa giả định thử thách' }
      ],
      assumptions: ['Địa chất sườn núi đồng nhất, đất thịt pha sét'],
      limitations: ['Mô hình tính toán giáo dục; khay đất thực tế trong lớp học cho số liệu cụ thể theo từng loại mẫu đất.'],
      safetyNotes: ['Dọn sạch nước và bùn đất rơi vãi trên sàn phòng học sau khi làm thí nghiệm khay đất.'],
      references: ['Wischmeier, W. H., & Smith, D. D. (1978). Predicting Rainfall Erosion Losses. USDA Agricultural Handbook.']
    }
  },
  {
    id: 11,
    numberStr: '11',
    title: 'Màu chàm – Quang học & trắc sắc',
    subtitle: 'Quang phổ hấp thụ, phản ứng oxy hóa & chênh lệch màu sắc ΔE',
    stemDomain: 'optics',
    stemDomainLabel: 'Quang học & Trắc sắc học',
    culturalHeritage: 'Tri thức bản địa về ủ men và nhuộm chàm cổ truyền',
    locationContext: 'Các bản làng H’Mông, Dao, Tày miền núi phía Bắc',
    keyFormula: '\\Delta E_{ab}^* = \\sqrt{(\\Delta L^*)^2 + (\\Delta a^*)^2 + (\\Delta b^*)^2}',
    formulaDescription: 'Khoảng cách màu sắc trong không gian màu đồng đều CIE 1976 L*a*b*.',
    steps: {
      context: {
        title: 'Hóa học và quang học trong thùng chàm truyền thống',
        description: 'Nước chàm khi vừa múc ra có màu vàng xanh lục nhạt (dạng khử leuco-indigo tan trong nước). Khi vải được vắt ra và tiếp xúc với oxy không khí, phản ứng oxy hóa biến đổi hợp chất thành màu xanh chàm thẫm không tan bám chặt vào sợi.',
        culturalDetails: ['Nghệ nhân dùng vị giác nếm độ cay nồng và nhìn bọt chàm để biết độ "chín" của thùng men'],
        verifiedSources: ['Viện Khoa học Sự sống - Đại học Quốc gia Hà Nội']
      },
      stemQuestion: {
        question: 'Tại sao màu sắc của vải chàm thay đổi ngoạn mục từ xanh lục nhạt sang xanh lam đậm chỉ sau vài phút tiếp xúc với không khí?',
        contextExplanation: 'Khảo sát bước sóng hấp thụ photon ánh sáng khả kiến của phân tử indigotin khi hình thành hệ liên hợp pi nối đôi.',
        subQuestions: ['Chỉ số chênh lệch màu ΔE giữa hai mẫu vải phản ánh điều gì về số lần nhúng nhuộm?']
      },
      prediction: {
        prompt: 'Trong quá trình oxy hóa ngoài không khí, tọa độ b* (trục vàng - xanh lam) trong không gian CIE-Lab sẽ thay đổi ra sao?',
        options: [
          { id: 'p1', label: 'Tọa độ b* sẽ giảm mạnh về phía âm (chuyển dịch mạnh sang vùng màu xanh lam thẫm)', explanation: 'Hệ liên hợp pi mở rộng hấp thụ mạnh photon vùng vàng đỏ (~600 nm), phản xạ photon xanh lam.' },
          { id: 'p2', label: 'Tọa độ b* sẽ tăng vọt về phía dương (chuyển sang màu vàng tươi)', explanation: 'Sai, leuco-indigo mới có màu hơi ngả vàng lục.' }
        ]
      },
      challenge: {
        title: 'So sánh trắc sắc học 2 mẫu chàm',
        scenario: 'Tải 2 ảnh mẫu nhuộm chàm (mẫu ít ngày vs mẫu nhiều ngày), tính toán tọa độ L*, a*, b* và chỉ số ΔE.',
        criteria: ['Xác định độ lệch màu có nhận biết được bằng mắt thường không (ΔE > 2.3)', 'Giải thích nguyên nhân dựa trên độ dày lớp hạt màu'],
        task: 'Xuất bảng dữ liệu trắc sắc học và ghi nhận xét khoa học.'
      },
      reflection: {
        questions: ['Kinh nghiệm của nghệ nhân có tương đồng với các phép đo trắc quang hiện đại ở mức độ nào?'],
        culturalConnection: 'Khả năng quan sát tinh tế và tôn trọng chu kỳ vi sinh vật tự nhiên của người thợ nhuộm bản địa.',
        physicalLimitations: ['Không gian màu trên màn hình máy tính chỉ bao phủ dải sRGB, hẹp hơn phổ màu thực tế của chàm tự nhiên ngoài trời.']
      }
    },
    scientificBasis: {
      principles: ['Quang phổ học phân tử và hệ liên hợp electron pi', 'Lý thuyết màu sắc ba thành phần đối lập Grassmann'],
      variables: [
        { symbol: 'OxidationTime', name: 'Thời gian oxy hóa', unit: 'phút', range: '1 - 30 phút', description: 'Thời gian tiếp xúc với không khí' },
        { symbol: 'Layers', name: 'Số lớp hạt màu bám', unit: 'lớp', range: '1 - 12 lớp', description: 'Mật độ hạt indigotin trên sợi' }
      ],
      assumptions: ['Ánh sáng môi trường đo đạt chuẩn D65'],
      limitations: ['Ảnh chụp trên điện thoại cần chuẩn hóa cân bằng trắng với tấm thẻ xám 18% để giảm sai số.'],
      safetyNotes: ['Không nếm thử nước nhuộm thật; việc nghệ nhân nếm chỉ dành cho người giàu kinh nghiệm với thùng men thảo mộc.'],
      references: ['Hunt, R. W. G. (2004). The Reproduction of Colour. John Wiley & Sons.']
    }
  },
  {
    id: 12,
    numberStr: '12',
    title: 'Gùi & đòn gánh – Trọng tâm & mô-men lực',
    subtitle: 'Quy tắc mô-men lực, điều kiện cân bằng & công thái học',
    stemDomain: 'mechanics',
    stemDomainLabel: 'Cơ học & Công thái học',
    culturalHeritage: 'Phương tiện vận chuyển truyền thống: Đòn gánh của người Kinh/Mường, Chiếc Gùi của đồng bào vùng cao',
    locationContext: 'Vùng đồi dốc, đường mòn nương rẫy khắp các tỉnh miền núi',
    keyFormula: 'M = F \\cdot d \\quad | \\quad \\sum M_O = F_1 d_1 - F_2 d_2 = 0',
    formulaDescription: 'Quy tắc mô-men lực của đòn bẩy loại 1 và sự hạ thấp trọng tâm để duy trì thế thăng bằng trên đường dốc.',
    steps: {
      context: {
        title: 'Nghệ thuật mang vác trên dốc núi cheo leo',
        description: 'Đòn gánh tận dụng độ đàn hồi dẻo của tre già giúp nhịp chân bước đồng pha với nhịp dao động của tải trọng, giảm áp lực cực đại lên vai. Chiếc gùi có dây đeo qua trán/vai giúp trọng tâm gùi ép sát lưng người, giữ ổn định khi leo dốc.',
        culturalDetails: ['Gùi có đế chân gỗ giữ thăng bằng khi đặt xuống đất', 'Đòn gánh vót cong hai đầu giữ quang gánh không tuột'],
        verifiedSources: ['Viện Cơ học - VAST']
      },
      stemQuestion: {
        question: 'Làm thế nào để hai thúng hàng có khối lượng chênh lệch nhau (ví dụ 15kg và 25kg) vẫn giữ được thăng bằng trên vai người gánh?',
        contextExplanation: 'Khảo sát cánh tay đòn của lực và sự dịch chuyển điểm tựa trên đòn gánh để cân bằng tổng mô-men lực.',
        subQuestions: ['Khi leo dốc, việc người đeo gùi cúi gập người về phía trước nhằm mục đích cơ học gì?']
      },
      prediction: {
        prompt: 'Nếu thúng phía trước nặng 20kg cách vai 0.6m, thúng phía sau nặng 30kg thì điểm tựa vai phải cách thúng sau bao nhiêu mét để cân bằng?',
        options: [
          { id: 'p1', label: 'Cách 0.4 m, vì 20kg × 0.6m = 30kg × 0.4m = 12 kg·m', explanation: 'Đúng theo quy tắc cân bằng mô-men lực: F1 × d1 = F2 × d2.' },
          { id: 'p2', label: 'Cách 0.6 m bằng nhau', explanation: 'Sai, cánh tay đòn bằng nhau sẽ khiến đòn gánh bị chúi mạnh về phía thúng 30kg.' }
        ]
      },
      challenge: {
        title: 'Thiết lập trạng thái cân bằng đòn gánh',
        scenario: 'Thay đổi khối lượng 2 thúng và vị trí đặt vai để đưa góc nghiêng lệch của đòn gánh về 0.0° (cân bằng hoàn hảo).',
        criteria: ['Tổng mô-men lực triệt tiêu ∑M = 0', 'Tính lực nén tổng hợp tác dụng lên vai N = (m1 + m2 + m_đòn)g'],
        task: 'Thử nghiệm dịch chuyển điểm tựa vai trên thanh đòn ảo.'
      },
      reflection: {
        questions: ['Công thái học của đòn gánh và chiếc gùi dạy cho chúng ta bài học gì về việc giảm mệt mỏi khi lao động?'],
        culturalConnection: 'Khả năng chịu thương chịu khó và thích ứng tuyệt vời của người lao động với địa hình hiểm trở.',
        physicalLimitations: ['TUYỆT ĐỐI KHÔNG THỬ TẢI QUÁ NẶNG LÊN CƠ THỂ HỌC SINH trong các buổi học thực nghiệm.']
      }
    },
    scientificBasis: {
      principles: ['Điều kiện cân bằng tĩnh học tổng lực bằng 0 và tổng mô-men bằng 0', 'Vị trí trọng tâm hệ vật và mặt chân đế'],
      variables: [
        { symbol: 'm1', name: 'Khối lượng thúng trước', unit: 'kg', range: '5 - 35 kg', description: 'Tải trọng đầu trước' },
        { symbol: 'm2', name: 'Khối lượng thúng sau', unit: 'kg', range: '5 - 35 kg', description: 'Tải trọng đầu sau' },
        { symbol: 'd1', name: 'Khoảng cách từ vai đến thúng trước', unit: 'm', range: '0.2 - 1.0 m', description: 'Cánh tay đòn d1' }
      ],
      assumptions: ['Thanh đòn cứng lý tưởng trong giai đoạn khảo sát tĩnh'],
      limitations: ['Mô phỏng tĩnh học; chuyển động nhịp nhàng khi đi bộ có hiện tượng cộng hưởng động lực học.'],
      safetyNotes: ['Không thực hiện thử thách mang vác vật nặng thật vượt quá 10% trọng lượng cơ thể học sinh.'],
      references: ['Hibbeler, R. C. (2016). Engineering Mechanics: Statics. Pearson.']
    }
  },
  {
    id: 13,
    numberStr: '13',
    title: 'Nhạc cụ tre – Dao động vật rắn',
    subtitle: 'Dầm dao động ngang Euler-Bernoulli, tần số riêng & các đường nút',
    stemDomain: 'acoustics',
    stemDomainLabel: 'Âm học & Cơ học dao động',
    culturalHeritage: 'Nhạc cụ tre nứa (T’rưng, Đinh Pá, Chapi, Khèn bè)',
    locationContext: 'Văn hóa âm nhạc các dân tộc miền núi Bắc Bộ và Tây Nguyên',
    keyFormula: 'f_n = \\frac{\\beta_n^2}{2\\pi L^2} \\sqrt{\\frac{E I}{\\rho A}} \\quad | \\quad \\beta_1 \\approx 4.730',
    formulaDescription: 'Tần số dao động uốn tự do của thanh hai đầu tự do. Các điểm nút dao động mode cơ bản nằm cách hai đầu 0.224 L.',
    steps: {
      context: {
        title: 'Thanh tre biết hát và các điểm gối nút dao động',
        description: 'Khi gõ vào thanh đàn T’rưng hay Chapi, thanh tre dao động uốn. Nghệ nhân buộc dây treo thanh tre chính xác tại hai điểm "chết" (điểm nút dao động cách đầu thanh ~22.4% chiều dài) để dây buộc không dập tắt rung động, giúp âm thanh ngân vang thanh thoát.',
        culturalDetails: ['Ống nứa được vát một đầu tạo hộp cộng hưởng âm', 'Độ dày thành ống và chiều dài quyết định cao độ từng thanh'],
        verifiedSources: ['Viện Âm nhạc Quốc gia Việt Nam']
      },
      stemQuestion: {
        question: 'Tại sao điểm buộc dây treo thanh đàn tre bắt buộc phải đặt tại vị trí cách hai đầu khoảng 0.224 L chứ không phải ở giữa hay sát đầu mút?',
        contextExplanation: 'Khảo sát vị trí của các điểm nút (biên độ dao động bằng 0) của mode dao động uốn cơ bản trên dầm hai đầu tự do.',
        subQuestions: ['Tần số âm thanh phụ thuộc vào chiều dài L và bề dày thành tre theo quy luật nào?']
      },
      prediction: {
        prompt: 'Nếu cắt ngắn chiều dài thanh tre đi một nửa (L/2) trong khi giữ nguyên bề dày, tần số dao động sẽ thay đổi thế nào?',
        options: [
          { id: 'p1', label: 'Tần số tăng lên gấp 4 lần vì f tỉ lệ nghịch với bình phương chiều dài (1/L²)', explanation: 'Đúng theo phương trình dao động dầm ngang Euler-Bernoulli: f ~ 1/L².' },
          { id: 'p2', label: 'Tần số chỉ tăng gấp đôi như dây đàn căng', explanation: 'Sai, dây đàn f ~ 1/L, còn dầm uốn tự do f ~ 1/L².' }
        ]
      },
      challenge: {
        title: 'Mô phỏng tổng hợp âm thanh thanh tre gõ',
        scenario: 'Điều chỉnh chiều dài L, đường kính d và bề dày t để tạo ra nốt Son (G4 ≈ 392 Hz), nghe âm thanh tổng hợp phát ra.',
        criteria: ['Xác định chính xác vị trí 2 điểm nút dao động (mm)', 'Nghe âm sắc đanh ấm đặc trưng của tre'],
        task: 'So sánh dạng sóng dao động của thanh tre với chiêng đồng.'
      },
      reflection: {
        questions: ['Kinh nghiệm của cha ông về điểm treo dây đàn tre thể hiện sự hiểu biết sâu sắc về sóng dừng như thế nào?'],
        culturalConnection: 'Khả năng lắng nghe tự nhiên và biến cây tre bờ suối thành nhạc cụ tinh xảo.',
        physicalLimitations: ['Mô hình tính toán giả định thanh tre đồng nhất; tre thật có mắt đốt làm biến đổi khối lượng phân bố.']
      }
    },
    scientificBasis: {
      principles: ['Lý thuyết dầm Euler-Bernoulli dao động ngang', 'Điều kiện biên tự do - tự do (Free-Free boundary conditions)'],
      variables: [
        { symbol: 'L_bar', name: 'Chiều dài thanh tre', unit: 'cm', range: '15.0 - 60.0 cm', description: 'Chiều dài thanh gõ' },
        { symbol: 't_wall', name: 'Độ dày thành tre', unit: 'mm', range: '2.0 - 10.0 mm', description: 'Độ dày quyết định độ cứng uốn' },
        { symbol: 'E', name: 'Mô-đun đàn hồi Young', unit: 'GPa', range: '10 - 22 GPa', description: 'Đặc trưng cơ lý tre già' }
      ],
      assumptions: ['Bỏ qua ảnh hưởng của biến dạng trượt và quán tính quay (xấp xỉ dầm mỏng)'],
      limitations: ['Mô phỏng tổng hợp âm bằng Web Audio API là mô hình minh họa giáo dục.'],
      safetyNotes: ['Không dùng dùi gõ đập vỡ thanh nứa sắc nhọn trong lớp học.'],
      references: ['Rossing, T. D. (2007). Science of Percussion Instruments. World Scientific.']
    }
  },
  {
    id: 14,
    numberStr: '14',
    title: 'Nơm bắt cá – Hình học không gian',
    subtitle: 'Hình nón cụt, thể tích, diện tích xung quanh & mật độ nan',
    stemDomain: 'mathematics',
    stemDomainLabel: 'Hình học không gian & Đo lường',
    culturalHeritage: 'Nông cụ nơm, đó, giỏ bắt cá vùng sông suối trung du và miền núi',
    locationContext: 'Các suối ngòi vùng Phú Thọ, Hòa Bình, Tuyên Quang',
    keyFormula: 'V = \\frac{\\pi h}{3} (R^2 + R r + r^2) \\quad | \\quad S_{xq} = \\pi (R + r) \\sqrt{h^2 + (R-r)^2}',
    formulaDescription: 'Công thức tính thể tích và diện tích xung quanh của khối nón cụt tròn xoay.',
    steps: {
      context: {
        title: 'Hình học thực dụng trong chiếc nơm tre',
        description: 'Chiếc nơm có hình nón cụt: miệng trên nhỏ vừa tay thọc vào bắt cá, miệng dưới xòe rộng để úp trùm đàn cá dưới bùn. Thân nơm làm từ hàng trăm nan tre cật vót nhọn, buộc chụm bằng vành mây.',
        culturalDetails: ['Khoảng cách giữa các nan tính toán vừa đủ để nước thoát nhanh khi úp nhưng cá không lọt qua'],
        verifiedSources: ['Bảo tàng Nông nghiệp Việt Nam']
      },
      stemQuestion: {
        question: 'Làm thế nào để tính chính xác thể tích không gian chụp cá và lượng tre nứa cần thiết để đan một chiếc nơm?',
        contextExplanation: 'Khảo sát hình học khối nón cụt tròn xoay và mối liên hệ giữa chu vi đáy với số lượng nan tre.',
        subQuestions: ['Khi tăng bán kính đáy R gấp rưỡi, thể tích không gian bên trong nơm tăng lên bao nhiêu phần trăm?']
      },
      prediction: {
        prompt: 'Nếu tăng bán kính đáy dưới R từ 30 cm lên 45 cm (tăng 50%) trong khi giữ nguyên bán kính miệng r = 10 cm và chiều cao h = 60 cm, thể tích nơm sẽ thế nào?',
        options: [
          { id: 'p1', label: 'Thể tích tăng hơn 80% vì thể tích phụ thuộc vào bình phương bán kính R²', explanation: 'Đúng theo công thức hình nón cụt, số hạng R² và R·r tăng rất nhanh.' },
          { id: 'p2', label: 'Thể tích chỉ tăng đúng 50%', explanation: 'Sai, quan hệ thể tích phi tuyến với kích thước bán kính.' }
        ]
      },
      challenge: {
        title: 'Thiết kế nơm cá tối ưu vật liệu',
        scenario: 'Cho thể tích yêu cầu V = 45 lít (0.045 m³), hãy chọn kích thước h, R, r sao cho diện tích xung quanh S_xq nhỏ nhất (dùng ít nan tre nhất).',
        criteria: ['Miệng trên r đủ rộng cho tay người (8 - 12 cm)', 'Miệng dưới R đủ bắt cá (25 - 40 cm)', 'Tính số lượng nan nơm cần vót'],
        task: 'Mô phỏng tương tác 3D nón cụt và kiểm tra kết quả tính toán.'
      },
      reflection: {
        questions: ['Người thợ đan nơm đã ước lượng thể tích và nan tre bằng kinh nghiệm như thế nào?'],
        culturalConnection: 'Sự khéo léo biến vật liệu tự nhiên thành công cụ mưu sinh gắn bó mật thiết với dòng suối quê hương.',
        physicalLimitations: ['Hình dáng chiếc nơm thực tế có độ phình cong nhẹ chứ không phải hình nón cụt thẳng tuyệt đối.']
      }
    },
    scientificBasis: {
      principles: ['Hình học không gian khối tròn xoay', 'Tích phân tính thể tích vật thể quay', 'Tối ưu hóa hình học cực trị'],
      variables: [
        { symbol: 'r_top', name: 'Bán kính đáy trên', unit: 'cm', range: '6.0 - 15.0 cm', description: 'Miệng thọc tay bắt cá' },
        { symbol: 'R_bot', name: 'Bán kính đáy dưới', unit: 'cm', range: '20.0 - 50.0 cm', description: 'Miệng úp cá tiếp xúc đáy bùn' },
        { symbol: 'h', name: 'Chiều cao nơm', unit: 'cm', range: '40.0 - 90.0 cm', description: 'Khoảng cách vuông góc giữa hai đáy' }
      ],
      assumptions: ['Mô hình nón cụt tròn đều lý tưởng'],
      limitations: ['Số nan tre ước tính dựa trên khoảng cách khe nan trung bình 8-12 mm.'],
      safetyNotes: ['Đầu nhọn của nan nơm thật có thể gây trầy xước da tay, cần mài cùn đầu khi làm mẫu thí nghiệm.'],
      references: ['Weisstein, E. W. (2002). CRC Concise Encyclopedia of Mathematics. Chapman & Hall/CRC.']
    }
  },
  {
    id: 15,
    numberStr: '15',
    title: 'Cây bản địa – Sinh học & dữ liệu ảnh',
    subtitle: 'Hình thái học lá cây, gân lá, phân loại khoa học & tập dữ liệu AI',
    stemDomain: 'biology',
    stemDomainLabel: 'Sinh học & Khoa học dữ liệu',
    culturalHeritage: 'Tri thức thảo mộc dân gian của đồng bào Dao, Mường (dược liệu, cây rau rừng)',
    locationContext: 'Vườn quốc gia Tam Đảo, rừng đồi Phú Thọ, Ba Vì',
    keyFormula: 'Accuracy = \\frac{TP + TN}{TP + TN + FP + FN} \\quad | \\quad Split: 80\\% / 20\\%',
    formulaDescription: 'Ma trận nhầm lẫn và độ chính xác phân loại hình ảnh sinh học giữa tập huấn luyện và kiểm thử.',
    steps: {
      context: {
        title: 'Tri thức nhận diện cây rừng của đồng bào',
        description: 'Người dân bản địa phân biệt hàng trăm loài cây rừng qua hình dạng phiến lá, mạng gân lá, mùi hương tinh dầu và dạng mép lá (răng cưa hay nguyên). Đây là nguồn dữ liệu quý giá cho sinh học thực vật.',
        culturalDetails: ['Lá ngón (độc) thường dễ bị nhầm lẫn với cây chè vằng hoặc cây lá lốt nếu không nắm rõ hình thái gân lá và cuống lá'],
        verifiedSources: ['Viện Sinh thái và Tài nguyên sinh vật (IEBR)', 'Vườn Quốc gia Tam Đảo']
      },
      stemQuestion: {
        question: 'Làm thế nào để xây dựng một bộ dữ liệu hình thái lá cây bản địa có cấu trúc khoa học để phân biệt chính xác các loài cây?',
        contextExplanation: 'Khảo sát các đặc trưng hình thái: mạng gân hình lông chim, gân chân vịt, mép lá răng cưa, hình bầu dục, mũi mác.',
        subQuestions: ['Tỷ lệ phân chia tập dữ liệu (Train/Test) ảnh hưởng như thế nào đến độ tin cậy của mô hình nhận diện?']
      },
      prediction: {
        prompt: 'Nếu một mô hình nhận diện chỉ được nạp ảnh chụp lá cây trên nền trắng sạch, khi đưa ảnh chụp lá cây ngoài rừng tự nhiên (có nền đất, bóng râm) thì kết quả sẽ ra sao?',
        options: [
          { id: 'p1', label: 'Độ chính xác sẽ giảm mạnh vì mô hình bị nhiễu nền và điều kiện ánh sáng phức tạp chưa từng học', explanation: 'Hiện tượng Overfitting và thiếu đa dạng trong tập dữ liệu huấn luyện.' },
          { id: 'p2', label: 'Mô hình vẫn nhận diện chính xác 100% không suy giảm', explanation: 'Sai, mạng nơ-ron rất nhạy cảm với sự dịch chuyển phân bố dữ liệu (Domain Shift).' }
        ]
      },
      challenge: {
        title: 'Gắn nhãn và phân chia tập dữ liệu lá cây',
        scenario: 'Tải ảnh lá cây bản địa, gắn nhãn các đặc trưng hình thái (dạng gân, mép lá) và chia tập dữ liệu theo tỷ lệ chuẩn 70% huấn luyện - 30% kiểm tra.',
        criteria: ['Gắn đúng nhãn hình thái học', 'Kiểm tra cân bằng số lượng mẫu giữa các lớp loài'],
        task: 'Xuất bản tóm tắt dữ liệu kiểm định sinh học.'
      },
      reflection: {
        questions: ['Tại sao việc nhận diện chính xác cây rừng là vấn đề sống còn khi thu hái dược liệu?'],
        culturalConnection: 'Ý thức bảo vệ cây thuốc quý bản địa tránh bị khai thác tận diệt.',
        physicalLimitations: ['Ứng dụng KHÔNG tự chẩn đoán y tế hoặc khuyến nghị uống thuốc thảo mộc nếu chưa có kiểm chứng y khoa chuyên môn.']
      }
    },
    scientificBasis: {
      principles: ['Hình thái học thực vật (Plant Morphology)', 'Học có giám sát và phân chia tập dữ liệu Cross-Validation'],
      variables: [
        { symbol: 'Margin', name: 'Đặc trưng mép lá', unit: 'loại', range: 'Nguyên / Răng cưa / Khía lượn', description: 'Hình thái mép phiến lá' },
        { symbol: 'Venation', name: 'Mạng gân lá', unit: 'loại', range: 'Lông chim / Chân vịt / Song song', description: 'Cấu trúc dẫn truyền dinh dưỡng' }
      ],
      assumptions: ['Ảnh chụp rõ nét bề mặt phiến lá'],
      limitations: ['Hỗ trợ công cụ phân loại dữ liệu giáo dục; không thay thế nhà thực vật học trong việc định danh loài nguy hiểm.'],
      safetyNotes: ['Tuyệt đối không chạm hoặc nếm các loài thực vật lạ trong rừng có nguy cơ độc tính cao (như lá ngón).'],
      references: ['Radford, A. E. et al. (1974). Vascular Plant Systematics. Harper & Row.']
    }
  },
  {
    id: 16,
    numberStr: '16',
    title: 'Mái nhà – Góc nghiêng & thoát nước',
    subtitle: 'Thủy động lực học dòng chảy mái, vận tốc thoát nước & thu nước mưa',
    stemDomain: 'environment',
    stemDomainLabel: 'Thủy lực học & Khí hậu công trình',
    culturalHeritage: 'Kỹ thuật lợp mái cọ, mái gianh dốc đứng vùng đồi núi trung du',
    locationContext: 'Vùng đồi cọ Phú Thọ, dải núi Tam Đảo mưa lớn',
    keyFormula: 'v_{drain} = \\sqrt{2 g \\Delta h} \\quad | \\quad Q_{thu} = C \\cdot I \\cdot A_{mai} \\cos(\\theta)',
    formulaDescription: 'Vận tốc dòng nước chảy tràn theo phương nghiêng và công thức tính lưu lượng nước mưa thu gom được vào máng.',
    steps: {
      context: {
        title: 'Mái cọ dốc đứng che mưa ngàn gió núi',
        description: 'Vùng Phú Thọ, Tuyên Quang nổi tiếng với rừng cọ bạt ngàn. Mái nhà truyền thống lợp bằng nhiều lớp lá cọ với góc dốc rất lớn (40° - 55°). Góc dốc lớn giúp hạt mưa tuôn chảy nhanh chóng, không kịp đọng ngấm qua kẽ lá, giúp mái bền hàng chục năm.',
        culturalDetails: ['Kỹ thuật cài lá cọ úp so le nhiều tầng', 'Máng nước tre gác dưới mép mái dẫn nước sạch vào chum vại trữ'],
        verifiedSources: ['Viện Khoa học Khí tượng Thủy văn và Biến đổi khí hậu']
      },
      stemQuestion: {
        question: 'Tại sao mái lợp bằng lá tự nhiên bắt buộc phải có góc nghiêng lớn hơn nhiều so with mái bê tông hay mái tôn hiện đại?',
        contextExplanation: 'Khảo sát hiện tượng mao dẫn của nước qua khe lá và sự phụ thuộc của thời gian thoát nước vào góc dốc mái.',
        subQuestions: ['Góc nghiêng mái ảnh hưởng như thế nào đến diện tích hứng nước mưa thực tế và vận tốc dòng chảy trong máng thu?']
      },
      prediction: {
        prompt: 'Nếu giảm góc nghiêng mái từ 45° xuống 20° trong điều kiện mưa dông lớn, điều gì sẽ xảy ra với mái lá cọ?',
        options: [
          { id: 'p1', label: 'Vận tốc thoát nước chậm lại, áp lực mao dẫn và sức gió đẩy nước chảy luồn qua các khe lá gây dột nặng', explanation: 'Góc dốc nhỏ khiến lực thành phần trọng lực dọc mặt mái giảm (g·sinθ nhỏ), nước đọng lâu và thấm ngược.' },
          { id: 'p2', label: 'Mái sẽ thoát nước nhanh hơn vì bề mặt phẳng hơn', explanation: 'Sai, nước cần lực trọng trường dốc để tăng tốc chảy xuôi.' }
        ]
      },
      challenge: {
        title: 'Thiết kế hệ thống mái thu nước mưa thích ứng Tam Đảo',
        scenario: 'Thiết kế góc dốc mái θ và kích thước máng thu nước tre sao cho thoát hết trận mưa rào 80 mm/h mà không tràn máng, thu gom vào bể chứa tối thiểu 1.5 m³ nước sạch.',
        criteria: ['Thời gian nước thoát hết khỏi bề mặt mái < 8 giây', 'Hiệu suất hứng nước mưa đạt > 85%'],
        task: 'Mô phỏng góc dốc mái và quan sát vận tốc hạt mưa chảy tràn.'
      },
      reflection: {
        questions: ['Kinh nghiệm làm mái lá cọ dạy cho chúng ta điều gì về thiết kế kiến trúc thích ứng với biến đổi khí hậu?'],
        culturalConnection: 'Tận dụng sản vật cây cọ quê hương để tạo dựng mái ấm kiên cố qua bao mùa dông bão.',
        physicalLimitations: ['Mô hình tính toán dòng chảy phẳng; không tính hiện tượng gió giật ngược làm tốc mái.']
      }
    },
    scientificBasis: {
      principles: ['Định luật Torricelli và động học dòng chảy trên mặt nghiêng', 'Hiện tượng căng bề mặt và mao dẫn trong kẽ hẹp', 'Bảo toàn lưu lượng thủy lực'],
      variables: [
        { symbol: 'θ_pitch', name: 'Góc nghiêng mái', unit: 'độ (°)', range: '15° - 60°', description: 'Độ dốc của mặt phẳng mái' },
        { symbol: 'A_roof', name: 'Diện tích mặt mái', unit: 'm²', range: '30 - 150 m²', description: 'Diện tích bề mặt đón mưa' },
        { symbol: 'RainIntensity', name: 'Cường độ mưa', unit: 'mm/h', range: '20 - 120 mm/h', description: 'Lượng mưa rơi theo thời gian' }
      ],
      assumptions: ['Hạt mưa rơi đều thẳng đứng theo trọng lực'],
      limitations: ['Mô phỏng 2D dòng chảy; thực tế mái lá có độ gồ ghề và giữ lại một phần ẩm bốc hơi.'],
      safetyNotes: ['Không trèo lên mái nhà ướt trong lúc trời mưa để đo lưu lượng thật.'],
      references: ['Chow, V. T. (1959). Open-Channel Hydraulics. McGraw-Hill.']
    }
  }
];
