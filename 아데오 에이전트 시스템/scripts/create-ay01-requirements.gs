/**
 * AY-01 요구사항정의서 / 현황분석서 — Google Sheets 자동 생성 스크립트
 * 문서 코드: AY-01
 * 실행 방법: script.google.com → 새 프로젝트 → 붙여넣기 → createRequirementsSheet() 실행
 */

function createRequirementsSheet() {
  var ss = SpreadsheetApp.create('AY-01_요구사항정의서_테스트프로젝트_v1.0');
  var url = ss.getUrl();

  // ── 시트 구성 ──────────────────────────────────────────
  buildCoverSheet(ss);
  buildSection1(ss);
  buildSection2(ss);
  buildSection3(ss);
  buildSection4(ss);
  buildSection5(ss);

  // 기본 Sheet1 제거
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  Logger.log('✅ 생성 완료: ' + url);
}

// ── 공통 스타일 함수 ────────────────────────────────────

function headerStyle(range, bgColor) {
  range.setBackground(bgColor || '#1a73e8')
       .setFontColor('#ffffff')
       .setFontWeight('bold')
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle');
}

function subHeaderStyle(range) {
  range.setBackground('#e8f0fe')
       .setFontWeight('bold')
       .setVerticalAlignment('middle');
}

function titleStyle(range) {
  range.setBackground('#0d47a1')
       .setFontColor('#ffffff')
       .setFontSize(13)
       .setFontWeight('bold')
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle');
}

function setBorder(range) {
  range.setBorder(true, true, true, true, true, true, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
}

// ── 표지 시트 ────────────────────────────────────────────

function buildCoverSheet(ss) {
  var sh = ss.insertSheet('표지');
  sh.setColumnWidth(1, 200);
  sh.setColumnWidth(2, 400);

  sh.getRange('A1:B1').merge();
  titleStyle(sh.getRange('A1:B1'));
  sh.getRange('A1').setValue('요구사항정의서 / 현황분석서').setFontSize(16);
  sh.setRowHeight(1, 50);

  var coverData = [
    ['문서 코드', 'AY-01'],
    ['프로젝트명', '테스트프로젝트'],
    ['고객사', '(주)테스트컴퍼니'],
    ['버전', 'v1.0'],
    ['작성일', '2026-04-18'],
    ['작성자', '웹기획팀'],
    ['검토자', ''],
    ['승인자', ''],
  ];

  coverData.forEach(function(row, i) {
    var r = sh.getRange(i + 2, 1, 1, 2);
    sh.getRange(i + 2, 1).setValue(row[0]);
    sh.getRange(i + 2, 2).setValue(row[1]);
    subHeaderStyle(sh.getRange(i + 2, 1));
    sh.setRowHeight(i + 2, 30);
  });

  setBorder(sh.getRange(1, 1, coverData.length + 1, 2));

  // 개정이력
  sh.getRange('A12:F12').merge();
  titleStyle(sh.getRange('A12:F12'));
  sh.getRange('A12').setValue('개정 이력');
  sh.setRowHeight(12, 36);

  var revHeaders = ['버전', '일자', '작성자', '변경 내용', '비고'];
  revHeaders.forEach(function(h, i) {
    headerStyle(sh.getRange(13, i + 1), '#1a73e8');
    sh.getRange(13, i + 1).setValue(h);
    sh.setColumnWidth(i + 1, i === 3 ? 300 : 150);
  });
  sh.getRange(14, 1).setValue('v1.0');
  sh.getRange(14, 2).setValue('2026-04-18');
  sh.getRange(14, 3).setValue('웹기획팀');
  sh.getRange(14, 4).setValue('최초 작성');
  setBorder(sh.getRange(12, 1, 3, 5));
}

// ── 섹션 1: 현황 분석 ────────────────────────────────────

function buildSection1(ss) {
  var sh = ss.insertSheet('1.현황분석');
  sh.setColumnWidth(1, 180);
  sh.setColumnWidth(2, 420);

  var row = 1;

  // 1.1 고객사 개요
  sh.getRange(row, 1, 1, 2).merge();
  titleStyle(sh.getRange(row, 1));
  sh.getRange(row, 1).setValue('1.1 고객사 개요');
  sh.setRowHeight(row, 36); row++;

  var headers11 = ['항목', '내용'];
  headers11.forEach(function(h, i) { headerStyle(sh.getRange(row, i + 1)); sh.getRange(row, i + 1).setValue(h); });
  sh.setRowHeight(row, 28); row++;

  var data11 = [
    ['업종', 'IT 서비스'],
    ['기업 규모', '중소기업 (직원 50명)'],
    ['주요 사업', 'B2B SaaS 솔루션 개발 및 공급'],
    ['프로젝트 배경', '2018년 구축된 기존 홈페이지의 노후화로 인한 전면 개편 필요'],
  ];
  data11.forEach(function(d) {
    subHeaderStyle(sh.getRange(row, 1));
    sh.getRange(row, 1).setValue(d[0]);
    sh.getRange(row, 2).setValue(d[1]);
    sh.setRowHeight(row, 28); row++;
  });
  setBorder(sh.getRange(1, 1, row - 1, 2));
  row++;

  // 1.2 현재 시스템 현황
  sh.getRange(row, 1, 1, 2).merge();
  titleStyle(sh.getRange(row, 1));
  sh.getRange(row, 1).setValue('1.2 현재 시스템 현황');
  sh.setRowHeight(row, 36); row++;

  var headers12 = ['항목', '내용'];
  headers12.forEach(function(h, i) { headerStyle(sh.getRange(row, i + 1)); sh.getRange(row, i + 1).setValue(h); });
  sh.setRowHeight(row, 28); row++;

  var data12 = [
    ['기존 웹사이트 URL', 'https://www.testcompany.example.com'],
    ['기술 스택', 'WordPress 4.x, PHP 5.6, MySQL 5.7'],
    ['운영 기간', '2018년 3월부터 운영'],
    ['주요 문제점', '반응형 미지원, 관리자 시스템 불편, 페이지 속도 저하'],
  ];
  data12.forEach(function(d) {
    subHeaderStyle(sh.getRange(row, 1));
    sh.getRange(row, 1).setValue(d[0]);
    sh.getRange(row, 2).setValue(d[1]);
    sh.setRowHeight(row, 28); row++;
  });
  setBorder(sh.getRange(row - data12.length - 2, 1, data12.length + 2, 2));
  row++;

  // 1.3 개선 목표
  sh.getRange(row, 1, 1, 2).merge();
  titleStyle(sh.getRange(row, 1));
  sh.getRange(row, 1).setValue('1.3 개선 목표 (TO-BE)');
  sh.setRowHeight(row, 36); row++;

  ['목표', '기대 효과'].forEach(function(h, i) { headerStyle(sh.getRange(row, i + 1)); sh.getRange(row, i + 1).setValue(h); });
  sh.setRowHeight(row, 28); row++;

  var data13 = [
    ['반응형 웹사이트 구축', '모바일 접속 비율 40% → 70% 향상'],
    ['직관적인 CMS 관리자 도입', '콘텐츠 업데이트 시간 50% 단축'],
    ['페이지 속도 3초 이내 개선', '이탈률 15% 감소 기대'],
  ];
  data13.forEach(function(d) {
    subHeaderStyle(sh.getRange(row, 1));
    sh.getRange(row, 1).setValue(d[0]);
    sh.getRange(row, 2).setValue(d[1]);
    sh.setRowHeight(row, 28); row++;
  });
  setBorder(sh.getRange(row - data13.length - 2, 1, data13.length + 2, 2));
  row++;

  // 1.4 참조 사이트
  sh.getRange(row, 1, 1, 3).merge();
  titleStyle(sh.getRange(row, 1));
  sh.getRange(row, 1).setValue('1.4 참조 사이트');
  sh.setRowHeight(row, 36); row++;

  sh.setColumnWidth(3, 250);
  ['사이트명', 'URL', '참조 포인트'].forEach(function(h, i) { headerStyle(sh.getRange(row, i + 1)); sh.getRange(row, i + 1).setValue(h); });
  sh.setRowHeight(row, 28); row++;

  var data14 = [
    ['경쟁사 A', 'https://competitor-a.example.com', '서비스 소개 레이아웃'],
    ['해외 레퍼런스 B', 'https://reference-b.example.com', '인터랙티브 메인 구성'],
  ];
  data14.forEach(function(d) {
    subHeaderStyle(sh.getRange(row, 1));
    d.forEach(function(v, i) { sh.getRange(row, i + 1).setValue(v); });
    sh.setRowHeight(row, 28); row++;
  });
  setBorder(sh.getRange(row - data14.length - 2, 1, data14.length + 2, 3));
}

// ── 섹션 2: 기능 요구사항 ─────────────────────────────────

function buildSection2(ss) {
  var sh = ss.insertSheet('2.기능요구사항');
  var cols = ['REQ_ID', '구분', '기능명', '기능 설명', '우선순위', '비고'];
  var widths = [110, 70, 140, 340, 90, 160];
  cols.forEach(function(c, i) {
    sh.setColumnWidth(i + 1, widths[i]);
    headerStyle(sh.getRange(1, i + 1));
    sh.getRange(1, i + 1).setValue(c);
  });
  sh.setRowHeight(1, 32);

  // 우선순위 가이드
  sh.getRange('A1').setNote('우선순위 기준\nMust: 없으면 서비스 불가\nShould: 품질에 영향\nNice: 선택적 구현');

  var foData = [
    ['REQ-F-001', 'FO', '메인 페이지', '인트로 섹션, 주요 서비스 CTA, 슬라이더 배너', 'Must', '반응형 필수'],
    ['REQ-F-002', 'FO', '회사 소개', '비전·미션, 연혁, 조직도, 오시는 길', 'Must', ''],
    ['REQ-F-003', 'FO', '서비스 소개', '주요 제품/서비스 상세 페이지, 도입사례', 'Must', ''],
    ['REQ-F-004', 'FO', '공지사항', '목록/상세, 첨부파일, 페이지네이션', 'Must', ''],
    ['REQ-F-005', 'FO', '고객 문의', '문의 폼, 자동응답 이메일 발송', 'Must', '개인정보 동의'],
    ['REQ-F-006', 'FO', '검색', '전체 콘텐츠 키워드 검색', 'Should', ''],
    ['REQ-F-007', 'FO', '개인정보처리방침', '법적 고지 페이지', 'Must', '개인정보보호법 준수'],
  ];

  var boData = [
    ['REQ-F-008', 'BO', '관리자 로그인', 'ID/PW 인증, 세션 관리', 'Must', ''],
    ['REQ-F-009', 'BO', '권한 관리', '관리자 계정 등록·수정·삭제', 'Must', ''],
    ['REQ-F-010', 'BO', '콘텐츠 관리', '공지사항·배너·팝업 CRUD', 'Must', ''],
    ['REQ-F-011', 'BO', '문의 관리', '문의 목록·답변 처리·상태 변경', 'Must', ''],
    ['REQ-F-012', 'BO', '통계 대시보드', '방문자·문의 건수 조회', 'Should', 'GA 연동'],
  ];

  // FO 헤더
  sh.getRange(2, 1, 1, 6).merge();
  sh.getRange(2, 1).setValue('FO (Front Office) 기능 요구사항')
    .setBackground('#1565c0').setFontColor('#fff').setFontWeight('bold').setHorizontalAlignment('center');
  sh.setRowHeight(2, 28);

  foData.forEach(function(d, i) {
    var r = i + 3;
    d.forEach(function(v, j) { sh.getRange(r, j + 1).setValue(v); });
    if (d[4] === 'Must') sh.getRange(r, 5).setBackground('#fce8e6').setFontColor('#c62828');
    else if (d[4] === 'Should') sh.getRange(r, 5).setBackground('#fff9c4');
    sh.setRowHeight(r, 28);
  });

  var boStart = foData.length + 3;
  sh.getRange(boStart, 1, 1, 6).merge();
  sh.getRange(boStart, 1).setValue('BO (Back Office) 기능 요구사항')
    .setBackground('#1565c0').setFontColor('#fff').setFontWeight('bold').setHorizontalAlignment('center');
  sh.setRowHeight(boStart, 28);

  boData.forEach(function(d, i) {
    var r = boStart + 1 + i;
    d.forEach(function(v, j) { sh.getRange(r, j + 1).setValue(v); });
    if (d[4] === 'Must') sh.getRange(r, 5).setBackground('#fce8e6').setFontColor('#c62828');
    else if (d[4] === 'Should') sh.getRange(r, 5).setBackground('#fff9c4');
    sh.setRowHeight(r, 28);
  });

  setBorder(sh.getRange(1, 1, boStart + boData.length, 6));
}

// ── 섹션 3: 비기능 요구사항 ──────────────────────────────

function buildSection3(ss) {
  var sh = ss.insertSheet('3.비기능요구사항');
  var cols = ['REQ_ID', '항목', '요구 기준', '우선순위'];
  var widths = [120, 180, 380, 100];
  cols.forEach(function(c, i) {
    sh.setColumnWidth(i + 1, widths[i]);
    headerStyle(sh.getRange(1, i + 1));
    sh.getRange(1, i + 1).setValue(c);
  });
  sh.setRowHeight(1, 32);

  var sections = [
    {
      title: '3.1 성능 요구사항',
      data: [
        ['REQ-NF-001', '페이지 응답시간', '3초 이내 (이미지 많은 페이지 5초 이내)', 'Must'],
        ['REQ-NF-002', '동시접속자', '최소 100명', 'Must'],
        ['REQ-NF-003', '가용성', '99.5% 이상', 'Should'],
      ]
    },
    {
      title: '3.2 보안 요구사항',
      data: [
        ['REQ-NF-004', 'HTTPS', '전체 페이지 SSL/TLS', 'Must'],
        ['REQ-NF-005', '개인정보 암호화', 'AES-256 이상', 'Must'],
        ['REQ-NF-006', '입력값 검증', 'XSS·SQL Injection 방지', 'Must'],
      ]
    },
    {
      title: '3.3 호환성 요구사항',
      data: [
        ['REQ-NF-007', '브라우저', 'Chrome·Edge·Safari 최신 2버전', 'Must'],
        ['REQ-NF-008', '반응형', 'PC 1280px+, Tablet 768px, Mobile 375px', 'Must'],
      ]
    },
    {
      title: '3.4 접근성 요구사항',
      data: [
        ['REQ-NF-009', '웹 접근성', 'WCAG 2.1 Level AA 준수', 'Should'],
        ['REQ-NF-010', '대체 텍스트', '이미지·아이콘 alt 속성 필수 제공', 'Should'],
      ]
    },
  ];

  var row = 2;
  sections.forEach(function(sec) {
    sh.getRange(row, 1, 1, 4).merge();
    sh.getRange(row, 1).setValue(sec.title)
      .setBackground('#1565c0').setFontColor('#fff').setFontWeight('bold').setHorizontalAlignment('center');
    sh.setRowHeight(row, 28); row++;

    sec.data.forEach(function(d) {
      d.forEach(function(v, j) { sh.getRange(row, j + 1).setValue(v); });
      if (d[3] === 'Must') sh.getRange(row, 4).setBackground('#fce8e6').setFontColor('#c62828');
      else if (d[3] === 'Should') sh.getRange(row, 4).setBackground('#fff9c4');
      sh.setRowHeight(row, 28); row++;
    });
  });

  setBorder(sh.getRange(1, 1, row - 1, 4));
}

// ── 섹션 4: 제약사항 ─────────────────────────────────────

function buildSection4(ss) {
  var sh = ss.insertSheet('4.제약사항');
  var cols = ['REQ_ID', '구분', '내용'];
  var widths = [120, 140, 500];
  cols.forEach(function(c, i) {
    sh.setColumnWidth(i + 1, widths[i]);
    headerStyle(sh.getRange(1, i + 1));
    sh.getRange(1, i + 1).setValue(c);
  });
  sh.setRowHeight(1, 32);

  var sections = [
    {
      title: '4.1 기술 제약',
      data: [
        ['REQ-C-001', '기술 스택', 'React + Node.js 기반 (고객사 개발팀 유지보수 고려)'],
        ['REQ-C-002', '인프라', 'AWS EC2 기반 (고객사 기존 계정 활용)'],
      ]
    },
    {
      title: '4.2 일정 제약',
      data: [
        ['REQ-C-003', '납기일', '2026-09-30 (오픈 예정)'],
        ['REQ-C-004', '중간 검수', '2026-07-31 (디자인 완료), 2026-08-31 (개발 완료)'],
      ]
    },
    {
      title: '4.3 법적 제약',
      data: [
        ['REQ-C-005', '개인정보보호법', '수집·이용 동의, 처리방침 고지 의무'],
        ['REQ-C-006', '저작권', '폰트·이미지 라이선스 준수 (Pretendard 적용 예정)'],
      ]
    },
  ];

  var row = 2;
  sections.forEach(function(sec) {
    sh.getRange(row, 1, 1, 3).merge();
    sh.getRange(row, 1).setValue(sec.title)
      .setBackground('#1565c0').setFontColor('#fff').setFontWeight('bold').setHorizontalAlignment('center');
    sh.setRowHeight(row, 28); row++;

    sec.data.forEach(function(d) {
      d.forEach(function(v, j) { sh.getRange(row, j + 1).setValue(v); });
      subHeaderStyle(sh.getRange(row, 2));
      sh.setRowHeight(row, 28); row++;
    });
  });

  setBorder(sh.getRange(1, 1, row - 1, 3));
}

// ── 섹션 5: 이슈 및 미결사항 ─────────────────────────────

function buildSection5(ss) {
  var sh = ss.insertSheet('5.이슈및미결사항');
  var cols = ['번호', '내용', '담당자', '기한', '상태'];
  var widths = [60, 380, 120, 130, 100];
  cols.forEach(function(c, i) {
    sh.setColumnWidth(i + 1, widths[i]);
    headerStyle(sh.getRange(1, i + 1));
    sh.getRange(1, i + 1).setValue(c);
  });
  sh.setRowHeight(1, 32);

  var data = [
    ['1', '기존 데이터 마이그레이션 범위 확정 필요', 'PM', '2026-05-01', '미결'],
    ['2', '다국어 지원 여부 (영문 페이지) 고객사 확인', '영업팀', '2026-05-10', '미결'],
  ];

  data.forEach(function(d, i) {
    d.forEach(function(v, j) { sh.getRange(i + 2, j + 1).setValue(v); });
    sh.getRange(i + 2, 5).setBackground('#fce8e6').setFontColor('#c62828');
    sh.setRowHeight(i + 2, 28);
  });

  setBorder(sh.getRange(1, 1, data.length + 1, 5));
}
