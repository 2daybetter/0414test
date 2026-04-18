/**
 * DE-03 IA 설계서 / 메뉴 정의서 — Google Sheets 자동 생성 스크립트
 * 문서 코드: DE-03
 * 실행 방법: script.google.com → 새 프로젝트 → 붙여넣기 → createIASheet() 실행
 */

function createIASheet() {
  var ss = SpreadsheetApp.create('DE-03_IA설계서_테스트프로젝트_v1.0');
  var url = ss.getUrl();

  buildIACoverSheet(ss);
  buildFOIASheet(ss);
  buildBOIASheet(ss);
  buildSummarySheet(ss);
  buildURLPrincipleSheet(ss);

  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  Logger.log('✅ 생성 완료: ' + url);
}

// ── 공통 스타일 ────────────────────────────────────────────

function iaHeaderStyle(range, bg) {
  range.setBackground(bg || '#0d47a1')
       .setFontColor('#ffffff')
       .setFontWeight('bold')
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle')
       .setWrap(true);
}

function iaSubHeader(range) {
  range.setBackground('#e3f2fd')
       .setFontWeight('bold')
       .setVerticalAlignment('middle');
}

function iaTitleRow(sh, row, cols, text, bg) {
  sh.getRange(row, 1, 1, cols).merge();
  sh.getRange(row, 1).setValue(text)
    .setBackground(bg || '#0d47a1')
    .setFontColor('#ffffff')
    .setFontSize(12)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sh.setRowHeight(row, 38);
}

function iaBorder(sh, startRow, startCol, numRows, numCols) {
  sh.getRange(startRow, startCol, numRows, numCols)
    .setBorder(true, true, true, true, true, true, '#9e9e9e', SpreadsheetApp.BorderStyle.SOLID);
}

// ── 표지 시트 ─────────────────────────────────────────────

function buildIACoverSheet(ss) {
  var sh = ss.insertSheet('표지');
  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(2, 420);

  // 타이틀
  sh.getRange('A1:B1').merge();
  sh.getRange('A1').setValue('IA 설계서 / 메뉴 정의서')
    .setBackground('#0d47a1').setFontColor('#fff').setFontSize(16).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setRowHeight(1, 56);

  var meta = [
    ['문서 코드', 'DE-03'],
    ['프로젝트명', '테스트프로젝트'],
    ['고객사', '(주)테스트컴퍼니'],
    ['프로젝트 코드', 'ADE-2026-001'],
    ['버전', 'v1.0'],
    ['작성일', '2026-04-18'],
    ['작성자', '웹기획팀'],
    ['검토자', ''],
    ['승인자', ''],
  ];

  meta.forEach(function(m, i) {
    var r = i + 2;
    sh.getRange(r, 1).setValue(m[0]);
    sh.getRange(r, 2).setValue(m[1]);
    iaSubHeader(sh.getRange(r, 1));
    sh.setRowHeight(r, 30);
  });
  iaBorder(sh, 1, 1, meta.length + 1, 2);

  // 개정이력
  var baseRow = meta.length + 3;
  iaTitleRow(sh, baseRow, 5, '개정 이력');
  sh.setColumnWidth(3, 120);
  sh.setColumnWidth(4, 300);
  sh.setColumnWidth(5, 120);

  var revH = ['버전', '일자', '작성자', '변경 내용', '비고'];
  revH.forEach(function(h, i) {
    iaHeaderStyle(sh.getRange(baseRow + 1, i + 1), '#1565c0');
    sh.getRange(baseRow + 1, i + 1).setValue(h);
  });
  sh.getRange(baseRow + 2, 1).setValue('v1.0');
  sh.getRange(baseRow + 2, 2).setValue('2026-04-18');
  sh.getRange(baseRow + 2, 3).setValue('웹기획팀');
  sh.getRange(baseRow + 2, 4).setValue('최초 작성');
  sh.setRowHeight(baseRow + 1, 28);
  sh.setRowHeight(baseRow + 2, 28);
  iaBorder(sh, baseRow, 1, 3, 5);

  // 화면 ID 체계 설명
  var idRow = baseRow + 5;
  iaTitleRow(sh, idRow, 2, '화면 ID 체계');
  sh.getRange(idRow + 1, 1).setValue('형식').setFontWeight('bold');
  sh.getRange(idRow + 1, 2).setValue('FO_XY_NNN / BO_XY_NNN');
  sh.getRange(idRow + 2, 1).setValue('X (1depth 약어)').setFontWeight('bold');
  sh.getRange(idRow + 2, 2).setValue('1depth 메뉴명의 대표 영문 대문자 1자 (HOME→H, COMPANY→C)');
  sh.getRange(idRow + 3, 1).setValue('Y (2depth 약어)').setFontWeight('bold');
  sh.getRange(idRow + 3, 2).setValue('2depth 메뉴명의 대표 영문 대문자 1자. 2depth 없으면 0');
  sh.getRange(idRow + 4, 1).setValue('NNN (순번)').setFontWeight('bold');
  sh.getRange(idRow + 4, 2).setValue('동일 XY 내에서 001부터 순차 부여 (팝업·레이어 포함)');
  [idRow+1, idRow+2, idRow+3, idRow+4].forEach(function(r) { sh.setRowHeight(r, 28); });
  iaBorder(sh, idRow, 1, 5, 2);
}

// ── FO IA 시트 ────────────────────────────────────────────

function buildFOIASheet(ss) {
  var sh = ss.insertSheet('FO_IA');

  var cols = ['IA_ID', '1depth', '1depth 약어', '2depth', '2depth 약어', 'XY', '3depth', 'Type', 'DB', '화면ID', '기능정의', 'URL', 'SEO Title', 'SEO Description', 'SEO Keyword'];
  var widths = [90, 120, 90, 140, 90, 60, 120, 100, 50, 120, 200, 180, 160, 240, 180];

  cols.forEach(function(c, i) {
    sh.setColumnWidth(i + 1, widths[i]);
    iaHeaderStyle(sh.getRange(1, i + 1), '#1565c0');
    sh.getRange(1, i + 1).setValue(c);
  });
  sh.setRowHeight(1, 36);
  sh.setFrozenRows(1);

  var foData = [
    ['FO-1-01', '홈', 'H', '', '', 'H0', '', 'Page', 'N', 'FO_H0_001', '메인 홈페이지', '/', '테스트기업 | 공식 홈페이지', '테스트기업 공식 홈페이지입니다.', '테스트기업,홈페이지,솔루션'],
    ['FO-2-01', '회사소개', 'C', '비전/미션', 'V', 'CV', '', 'Page', 'N', 'FO_CV_001', '회사 비전 소개', '/about/vision', '비전/미션 | 테스트기업', '테스트기업의 비전과 미션을 소개합니다.', '비전,미션,회사소개'],
    ['FO-2-02', '회사소개', 'C', '연혁', 'I', 'CI', '', 'Page', 'Y', 'FO_CI_001', '회사 연혁', '/about/history', '회사연혁 | 테스트기업', '테스트기업의 성장 역사를 소개합니다.', '연혁,히스토리,회사소개'],
    ['FO-2-03', '회사소개', 'C', '조직도', 'O', 'CO', '', 'Page', 'N', 'FO_CO_001', '조직도 소개', '/about/org', '조직도 | 테스트기업', '테스트기업의 조직 구조를 소개합니다.', '조직도,팀,부서'],
    ['FO-2-04', '회사소개', 'C', '오시는 길', 'L', 'CL', '', 'Page', 'N', 'FO_CL_001', '오시는 길 안내', '/about/location', '오시는 길 | 테스트기업', '테스트기업 찾아오시는 방법을 안내합니다.', '위치,지도,주소'],
    ['FO-3-01', '사업영역', 'S', '서비스 소개', 'V', 'SV', '', 'Page', 'N', 'FO_SV_001', '주요 서비스 소개', '/service/overview', '서비스 소개 | 테스트기업', '테스트기업의 주요 서비스를 소개합니다.', '서비스,솔루션,제품'],
    ['FO-3-02', '사업영역', 'S', '도입사례', 'R', 'SR', '', 'Page', 'Y', 'FO_SR_001', '도입사례 목록', '/service/cases', '도입사례 | 테스트기업', '테스트기업 솔루션 도입 고객사 사례를 소개합니다.', '도입사례,고객사,레퍼런스'],
    ['FO-3-03', '사업영역', 'S', '도입사례', 'R', 'SR', '상세', 'Layer Popup', 'Y', 'FO_SR_002', '도입사례 상세 팝업', '', '', '', ''],
    ['FO-4-01', '뉴스', 'N', '공지사항', 'O', 'NO', '', 'Page', 'Y', 'FO_NO_001', '공지사항 목록', '/news/notice', '공지사항 | 테스트기업', '테스트기업의 최신 공지사항을 확인하세요.', '공지사항,뉴스,소식'],
    ['FO-4-02', '뉴스', 'N', '공지사항', 'O', 'NO', '상세', 'Page', 'Y', 'FO_NO_002', '공지사항 상세', '/news/notice/:id', '공지사항 상세 | 테스트기업', '', ''],
    ['FO-5-01', '고객지원', 'U', '문의하기', 'Q', 'UQ', '', 'Page', 'Y', 'FO_UQ_001', '고객 문의 폼', '/support/contact', '고객문의 | 테스트기업', '테스트기업에 문의하세요.', '문의,고객지원,연락'],
    ['FO-5-02', '고객지원', 'U', '문의하기', 'Q', 'UQ', '개인정보동의', 'Layer Popup', 'N', 'FO_UQ_002', '개인정보 수집·이용 동의 팝업', '', '', '', ''],
    ['FO-6-01', '법적고지', 'G', '개인정보처리방침', 'P', 'GP', '', 'Page', 'N', 'FO_GP_001', '개인정보처리방침 고지', '/legal/privacy', '개인정보처리방침 | 테스트기업', '테스트기업의 개인정보처리방침을 안내합니다.', '개인정보,처리방침'],
  ];

  foData.forEach(function(d, i) {
    var r = i + 2;
    d.forEach(function(v, j) { sh.getRange(r, j + 1).setValue(v); });
    // Type별 색상
    if (d[7] === 'Layer Popup') sh.getRange(r, 8).setBackground('#fff9c4');
    else if (d[7] === 'Popup') sh.getRange(r, 8).setBackground('#fce8e6');
    // DB 색상
    if (d[8] === 'Y') sh.getRange(r, 9).setBackground('#e8f5e9').setFontColor('#2e7d32');
    sh.setRowHeight(r, 28);
  });

  iaBorder(sh, 1, 1, foData.length + 1, cols.length);

  // 범례
  var legendRow = foData.length + 3;
  sh.getRange(legendRow, 1, 1, 4).merge();
  iaHeaderStyle(sh.getRange(legendRow, 1), '#37474f');
  sh.getRange(legendRow, 1).setValue('범례 (Type 색상)');
  sh.setRowHeight(legendRow, 28);

  [['Page', '#ffffff', '일반 페이지 (독립 URL)'], ['Layer Popup', '#fff9c4', '레이어 팝업 (URL 없음)'], ['Popup', '#fce8e6', '별도 팝업 윈도우']].forEach(function(l, i) {
    sh.getRange(legendRow + 1, i * 2 + 1).setValue(l[0]).setBackground(l[1]).setFontWeight('bold');
    sh.getRange(legendRow + 1, i * 2 + 2).setValue(l[2]).setBackground(l[1]);
  });
}

// ── BO IA 시트 ────────────────────────────────────────────

function buildBOIASheet(ss) {
  var sh = ss.insertSheet('BO_IA');

  var cols = ['IA_ID', '1depth', '1depth 약어', '2depth', '2depth 약어', 'XY', '3depth', 'Type', 'DB', '화면ID', '기능정의', 'URL', '비고'];
  var widths = [90, 130, 90, 160, 90, 60, 140, 100, 50, 130, 220, 200, 160];

  cols.forEach(function(c, i) {
    sh.setColumnWidth(i + 1, widths[i]);
    iaHeaderStyle(sh.getRange(1, i + 1), '#4a148c');
    sh.getRange(1, i + 1).setValue(c);
  });
  sh.setRowHeight(1, 36);
  sh.setFrozenRows(1);

  var boData = [
    ['BO-1-01', '대시보드', 'D', '', '', 'D0', '', 'Page', 'Y', 'BO_D0_001', '관리자 메인 대시보드', '/admin', '방문자·문의 현황 요약'],
    ['BO-2-01', '콘텐츠관리', 'B', '공지사항 목록', 'O', 'BO', '', 'Page', 'Y', 'BO_BO_001', '공지사항 목록 관리', '/admin/notice', ''],
    ['BO-2-02', '콘텐츠관리', 'B', '공지사항 등록', 'E', 'BE', '', 'Page', 'Y', 'BO_BE_001', '공지사항 등록/수정', '/admin/notice/edit', ''],
    ['BO-2-03', '콘텐츠관리', 'B', '공지사항 목록', 'O', 'BO', '삭제 확인', 'Layer Popup', 'N', 'BO_BO_002', '공지사항 삭제 확인 팝업', '', ''],
    ['BO-2-04', '콘텐츠관리', 'B', '배너 관리', 'N', 'BN', '', 'Page', 'Y', 'BO_BN_001', '메인 배너 관리', '/admin/banner', ''],
    ['BO-3-01', '고객문의', 'Q', '문의 목록', 'L', 'QL', '', 'Page', 'Y', 'BO_QL_001', '문의 목록 및 답변 처리', '/admin/inquiry', ''],
    ['BO-3-02', '고객문의', 'Q', '문의 상세', 'T', 'QT', '', 'Page', 'Y', 'BO_QT_001', '문의 상세 및 답변 등록', '/admin/inquiry/:id', ''],
    ['BO-4-01', '시스템관리', 'Y', '메뉴 관리', 'M', 'YM', '', 'Page', 'Y', 'BO_YM_001', '메뉴 구조 관리', '/admin/system/menu', ''],
    ['BO-4-02', '시스템관리', 'Y', '권한 관리', 'A', 'YA', '', 'Page', 'Y', 'BO_YA_001', '관리자 권한 설정', '/admin/system/auth', ''],
    ['BO-4-03', '시스템관리', 'Y', '배너 관리', 'N', 'YN', '', 'Page', 'Y', 'BO_YN_001', '배너 등록/수정/삭제', '/admin/system/banner', ''],
    ['BO-4-04', '시스템관리', 'Y', '팝업 관리', 'P', 'YP', '', 'Page', 'Y', 'BO_YP_001', '팝업 등록/수정/삭제', '/admin/system/popup', ''],
    ['BO-4-05', '시스템관리', 'Y', '공통 코드 관리', 'C', 'YC', '', 'Page', 'Y', 'BO_YC_001', '공통 코드 관리', '/admin/system/code', ''],
  ];

  boData.forEach(function(d, i) {
    var r = i + 2;
    d.forEach(function(v, j) { sh.getRange(r, j + 1).setValue(v); });
    if (d[7] === 'Layer Popup') sh.getRange(r, 8).setBackground('#fff9c4');
    if (d[8] === 'Y') sh.getRange(r, 9).setBackground('#e8f5e9').setFontColor('#2e7d32');
    sh.setRowHeight(r, 28);
  });

  iaBorder(sh, 1, 1, boData.length + 1, cols.length);
}

// ── 전체 집계 시트 ────────────────────────────────────────

function buildSummarySheet(ss) {
  var sh = ss.insertSheet('화면수집계');
  sh.setColumnWidth(1, 100);
  [100, 120, 120, 120, 120].forEach(function(w, i) { sh.setColumnWidth(i + 1, w); });

  iaTitleRow(sh, 1, 5, '전체 화면 수 집계');

  var headers = ['구분', 'Page', 'Layer Popup', 'Popup', '합계'];
  headers.forEach(function(h, i) {
    iaHeaderStyle(sh.getRange(2, i + 1), '#1565c0');
    sh.getRange(2, i + 1).setValue(h);
  });
  sh.setRowHeight(2, 30);

  var summaryData = [
    ['FO', 10, 2, 0],
    ['BO', 12, 1, 0],
  ];

  summaryData.forEach(function(d, i) {
    var r = i + 3;
    var total = d[1] + d[2] + d[3];
    sh.getRange(r, 1).setValue(d[0]);
    sh.getRange(r, 2).setValue(d[1]);
    sh.getRange(r, 3).setValue(d[2]);
    sh.getRange(r, 4).setValue(d[3]);
    sh.getRange(r, 5).setValue(total).setFontWeight('bold');
    sh.setRowHeight(r, 28);
  });

  // 합계 행
  sh.getRange(5, 1).setValue('합계').setFontWeight('bold').setBackground('#e3f2fd');
  sh.getRange(5, 2).setFormula('=B3+B4').setFontWeight('bold').setBackground('#e3f2fd');
  sh.getRange(5, 3).setFormula('=C3+C4').setFontWeight('bold').setBackground('#e3f2fd');
  sh.getRange(5, 4).setFormula('=D3+D4').setFontWeight('bold').setBackground('#e3f2fd');
  sh.getRange(5, 5).setFormula('=E3+E4').setFontWeight('bold').setBackground('#bbdefb');
  sh.setRowHeight(5, 30);

  iaBorder(sh, 1, 1, 5, 5);
}

// ── URL 설계 원칙 시트 ────────────────────────────────────

function buildURLPrincipleSheet(ss) {
  var sh = ss.insertSheet('URL설계원칙');
  sh.setColumnWidth(1, 180);
  sh.setColumnWidth(2, 500);

  iaTitleRow(sh, 1, 2, 'URL 설계 원칙');

  ['원칙', '내용'].forEach(function(h, i) {
    iaHeaderStyle(sh.getRange(2, i + 1), '#1565c0');
    sh.getRange(2, i + 1).setValue(h);
  });
  sh.setRowHeight(2, 30);

  var principles = [
    ['소문자 사용', '모든 URL은 소문자로 작성'],
    ['단어 구분', '하이픈(-) 사용 (언더스코어 금지)'],
    ['계층 구조', '메뉴 계층을 URL에 반영'],
    ['RESTful', '목록: /resource, 상세: /resource/:id, 등록: /resource/new'],
    ['관리자 prefix', '모든 BO URL은 /admin으로 시작'],
    ['SEO 친화적', '의미 있는 영문 단어 사용, 숫자·특수문자 최소화'],
  ];

  principles.forEach(function(p, i) {
    var r = i + 3;
    sh.getRange(r, 1).setValue(p[0]);
    sh.getRange(r, 2).setValue(p[1]);
    iaSubHeader(sh.getRange(r, 1));
    sh.setRowHeight(r, 28);
  });

  iaBorder(sh, 1, 1, principles.length + 2, 2);
}
