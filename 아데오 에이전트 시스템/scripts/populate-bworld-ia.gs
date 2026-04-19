/**
 * bworld IA 설계서 데이터 입력 스크립트
 * 대상 스프레드시트: DE-03_bworld_IA설계서_v1.0
 * ID: 1VKYD0jwp00ID2p7PJImWA_hHRHcqYq-MUnqyb4latpU
 *
 * 실행: script.google.com → 새 프로젝트 → 붙여넣기 → populateBworldIA 실행
 */

var SS_ID = '1VKYD0jwp00ID2p7PJImWA_hHRHcqYq-MUnqyb4latpU';

function populateBworldIA() {
  var ss = SpreadsheetApp.openById(SS_ID);

  // 기존 시트 정리
  var existing = ss.getSheets();
  existing.forEach(function(s) {
    if (s.getName() !== existing[0].getName()) ss.deleteSheet(s);
  });
  existing[0].setName('표지');

  buildCover(ss.getSheetByName('표지'));
  buildFO(ss.insertSheet('FO_IA'));
  buildBO(ss.insertSheet('BO_IA'));
  buildSummary(ss.insertSheet('화면수_집계'));

  Logger.log('✅ 완료: https://docs.google.com/spreadsheets/d/' + SS_ID);
}

// ── 헬퍼 ────────────────────────────────────────────────────────────────────

var BG_DARK  = '#0F1629';
var BG_CARD  = '#1E2647';
var ACCENT   = '#4A6EF7';
var TEAL     = '#00D4AA';
var WHITE    = '#FFFFFF';
var GRAY     = '#A0AAC8';

function styleHeader(range, bg) {
  range.setBackground(bg || ACCENT)
       .setFontColor(WHITE)
       .setFontWeight('bold')
       .setFontSize(11)
       .setVerticalAlignment('middle');
}

function styleRows(sheet, startRow, numRows, numCols) {
  for (var i = 0; i < numRows; i++) {
    var bg = (i % 2 === 0) ? BG_DARK : BG_CARD;
    sheet.getRange(startRow + i, 1, 1, numCols)
         .setBackground(bg)
         .setFontColor(WHITE)
         .setFontSize(10)
         .setVerticalAlignment('middle');
  }
}

// ── 표지 ────────────────────────────────────────────────────────────────────

function buildCover(sheet) {
  sheet.setTabColor(ACCENT);
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 420);
  sheet.setRowHeights(1, 12, 36);

  var data = [
    ['항목', '내용'],
    ['문서 코드', 'DE-03'],
    ['문서명', 'IA / 메뉴 정의서'],
    ['고객사명', 'bworld (비월드)'],
    ['프로젝트명', 'bworld.co.kr 웹사이트 리뉴얼'],
    ['프로젝트 코드', 'BW-2025-001'],
    ['문서 버전', 'v1.0'],
    ['작성일', '2025-04-19'],
    ['작성자', '아데오 그룹 구축 파트 / 웹기획팀'],
    ['검토자', ''],
    ['승인자', ''],
    ['비고', ''],
  ];

  sheet.getRange(1, 1, data.length, 2).setValues(data);
  styleHeader(sheet.getRange(1, 1, 1, 2));
  sheet.getRange(2, 1, data.length - 1, 1).setBackground(BG_CARD).setFontColor(GRAY).setFontSize(10);
  sheet.getRange(2, 2, data.length - 1, 1).setBackground(BG_DARK).setFontColor(WHITE).setFontSize(10);
  sheet.getRange(1, 1, data.length, 2).setBorder(true, true, true, true, true, true, '#4A6EF7', SpreadsheetApp.BorderStyle.SOLID);
}

// ── FO IA ────────────────────────────────────────────────────────────────────

function buildFO(sheet) {
  sheet.setTabColor(TEAL);
  sheet.setFrozenRows(1);

  var headers = [
    'IA_ID','1depth','1depth 약어','2depth','2depth 약어','XY',
    '3depth','Type','DB','화면ID','기능정의','URL','Title','Description','Keyword'
  ];

  var rows = [
    // ── 홈
    ['FO-1-01','홈','H','','','H0','','Page','N','FO_H0_001',
     '메인 페이지 — 히어로·서비스 요약·포트폴리오 미리보기·CTA',
     '/','bworld — IT 전문 기업',
     'B2B 전문 IT 구축·앱개발·UI/UX 컨설팅','IT구축,앱개발,B2B,UI/UX'],
    // ── 회사소개
    ['FO-2-01','회사소개','C','비전','V','CV','','Page','N','FO_CV_001',
     '비전·미션·핵심 가치 소개','/about/vision',
     '비전 — bworld','bworld의 미션과 핵심 가치를 소개합니다','비전,미션,핵심가치'],
    ['FO-2-02','회사소개','C','연혁','I','CI','','Page','N','FO_CI_001',
     '회사 연혁 타임라인','/about/history',
     '연혁 — bworld','bworld의 설립부터 현재까지의 성장 이야기','연혁,역사'],
    ['FO-2-03','회사소개','C','팀 소개','T','CT','','Page','N','FO_CT_001',
     '핵심 구성원 소개','/about/team',
     '팀 소개 — bworld','bworld를 이끄는 전문가 팀을 소개합니다','팀,구성원,전문가'],
    ['FO-2-04','회사소개','C','파트너사','P','CP','','Page','N','FO_CP_001',
     '협력 파트너사 목록 및 소개','/about/partners',
     '파트너사 — bworld','신뢰할 수 있는 파트너사와 함께합니다','파트너,협력사'],
    // ── 서비스
    ['FO-3-01','서비스','S','IT 구축','I','SI','','Page','N','FO_SI_001',
     'IT 시스템 구축 서비스 상세','/service/it',
     'IT 구축 — bworld','엔터프라이즈 IT 시스템 설계·구축·운영','IT구축,시스템개발,엔터프라이즈'],
    ['FO-3-02','서비스','S','앱 개발','A','SA','','Page','N','FO_SA_001',
     'iOS·Android·하이브리드 앱 개발','/service/app',
     '앱 개발 — bworld','네이티브·하이브리드 모바일 앱 개발','앱개발,iOS,Android,Flutter'],
    ['FO-3-03','서비스','S','UI/UX 컨설팅','U','SU','','Page','N','FO_SU_001',
     'UX 리서치·UI 디자인·설계 컨설팅','/service/ux',
     'UI/UX 컨설팅 — bworld','사용자 중심 UX 리서치부터 UI 시스템 설계까지','UX,UI,디자인컨설팅'],
    ['FO-3-04','서비스','S','유지보수','M','SM','','Page','N','FO_SM_001',
     '개발 완료 후 운영·유지보수 서비스','/service/maintenance',
     '유지보수 — bworld','안정적인 운영을 위한 유지보수 서비스','유지보수,운영,지원'],
    // ── 포트폴리오
    ['FO-4-01','포트폴리오','F','전체 목록','L','FL','','Page','Y','FO_FL_001',
     '전체 프로젝트 목록 (산업군·서비스 필터)','/portfolio',
     '포트폴리오 — bworld','다양한 산업군의 프로젝트 수행 사례','포트폴리오,프로젝트,사례'],
    ['FO-4-02','포트폴리오','F','상세','D','FD','','Page','Y','FO_FD_001',
     '프로젝트 케이스스터디 상세 페이지','/portfolio/:id',
     '[프로젝트명] — bworld 포트폴리오','[프로젝트 설명]',''],
    ['FO-4-03','포트폴리오','F','전체 목록','L','FL','이미지 확대','Layer Popup','N','FO_FL_002',
     '포트폴리오 썸네일 이미지 확대 레이어','','','',''],
    // ── 뉴스
    ['FO-5-01','뉴스','N','목록','L','NL','','Page','Y','FO_NL_001',
     '공지사항·회사 뉴스 목록','/news',
     '뉴스 — bworld','bworld의 최신 소식과 공지사항','뉴스,공지,소식'],
    ['FO-5-02','뉴스','N','상세','D','ND','','Page','Y','FO_ND_001',
     '뉴스 상세 본문 페이지','/news/:id','[뉴스제목] — bworld','',''],
    // ── 문의
    ['FO-6-01','문의','Q','상담 신청','F','QF','','Page','Y','FO_QF_001',
     '프로젝트 상담 신청 폼 (다단계)','/contact',
     '상담 신청 — bworld',
     '프로젝트 상담을 신청해 주세요. 영업일 1일 이내 연락드립니다','상담신청,문의,견적'],
    ['FO-6-02','문의','Q','상담 신청','F','QF','제출 완료','Layer Popup','N','FO_QF_002',
     '상담 신청 완료 안내 팝업','','','',''],
    ['FO-6-03','문의','Q','파트너 문의','P','QP','','Page','Y','FO_QP_001',
     '파트너십·협력 제안 문의 폼','/contact/partner',
     '파트너 문의 — bworld','bworld와 함께 성장할 파트너를 환영합니다','파트너문의,협력제안'],
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

  styleHeader(sheet.getRange(1, 1, 1, headers.length));
  styleRows(sheet, 2, rows.length, headers.length);

  // Type 컬럼 (8번째) 색상
  rows.forEach(function(r, i) {
    var col = r[7] === 'Page' ? TEAL : ACCENT;
    sheet.getRange(i + 2, 8).setFontColor(col).setFontWeight('bold');
  });

  // DB 컬럼 (9번째) 색상
  rows.forEach(function(r, i) {
    var col = r[8] === 'Y' ? '#FFD700' : GRAY;
    sheet.getRange(i + 2, 9).setFontColor(col).setFontWeight('bold');
  });

  var colWidths = [90,100,80,120,90,55,120,110,45,120,300,190,170,240,200];
  colWidths.forEach(function(w, i) { sheet.setColumnWidth(i + 1, w); });
  sheet.setRowHeights(1, rows.length + 1, 34);
  sheet.getRange(1, 1, rows.length + 1, headers.length)
       .setBorder(false, false, false, false, true, false, '#1E2647', SpreadsheetApp.BorderStyle.SOLID);
}

// ── BO IA ────────────────────────────────────────────────────────────────────

function buildBO(sheet) {
  sheet.setTabColor(ACCENT);
  sheet.setFrozenRows(1);

  var headers = [
    'IA_ID','1depth','1depth 약어','2depth','2depth 약어','XY',
    '3depth','Type','DB','화면ID','기능정의','URL','비고'
  ];

  var rows = [
    // ── 대시보드
    ['BO-1-01','대시보드','D','','','D0','','Page','Y','BO_D0_001',
     '관리자 메인 — 방문자·문의·포트폴리오 통계 요약','/admin',''],
    // ── 포트폴리오 관리
    ['BO-2-01','포트폴리오','F','목록','L','FL','','Page','Y','BO_FL_001',
     '포트폴리오 전체 목록 조회·검색·필터','/admin/portfolio',''],
    ['BO-2-02','포트폴리오','F','등록','R','FR','','Page','Y','BO_FR_001',
     '새 포트폴리오 등록 (이미지·태그·카테고리)','/admin/portfolio/new',''],
    ['BO-2-03','포트폴리오','F','수정','E','FE','','Page','Y','BO_FE_001',
     '기존 포트폴리오 내용 수정','/admin/portfolio/:id/edit',''],
    ['BO-2-04','포트폴리오','F','목록','L','FL','삭제 확인','Layer Popup','N','BO_FL_002',
     '포트폴리오 삭제 확인 팝업','',''],
    // ── 문의 관리
    ['BO-3-01','문의관리','Q','상담 목록','L','QL','','Page','Y','BO_QL_001',
     '상담 신청 목록·상태별 필터 (대기/처리중/완료)','/admin/inquiry',''],
    ['BO-3-02','문의관리','Q','상담 상세','D','QD','','Page','Y','BO_QD_001',
     '상담 신청 상세 조회·담당자 지정·상태 변경','/admin/inquiry/:id',''],
    ['BO-3-03','문의관리','Q','파트너 목록','P','QP','','Page','Y','BO_QP_001',
     '파트너 문의 목록 조회','/admin/inquiry/partner',''],
    // ── 뉴스 관리
    ['BO-4-01','뉴스관리','N','목록','L','NL','','Page','Y','BO_NL_001',
     '뉴스·공지 목록 조회·검색','/admin/news',''],
    ['BO-4-02','뉴스관리','N','등록','R','NR','','Page','Y','BO_NR_001',
     '새 뉴스·공지 등록 (리치 에디터)','/admin/news/new',''],
    ['BO-4-03','뉴스관리','N','수정','E','NE','','Page','Y','BO_NE_001',
     '기존 뉴스·공지 내용 수정','/admin/news/:id/edit',''],
    // ── 시스템 관리
    ['BO-5-01','시스템관리','Y','공통 코드','C','YC','','Page','Y','BO_YC_001',
     '공통 코드 조회·등록·수정·삭제','/admin/system/code',''],
    ['BO-5-02','시스템관리','Y','메뉴 관리','M','YM','','Page','Y','BO_YM_001',
     'GNB·LNB 메뉴 구성 관리','/admin/system/menu',''],
    ['BO-5-03','시스템관리','Y','권한 관리','A','YA','','Page','Y','BO_YA_001',
     '관리자 계정·역할·접근 권한 설정','/admin/system/auth',''],
    ['BO-5-04','시스템관리','Y','배너 관리','B','YB','','Page','Y','BO_YB_001',
     '홈페이지 배너 등록·순서·기간 설정','/admin/system/banner',''],
    ['BO-5-05','시스템관리','Y','팝업 관리','P','YP','','Page','Y','BO_YP_001',
     '사이트 팝업 등록·수정·노출 기간 설정','/admin/system/popup',''],
    ['BO-5-06','시스템관리','Y','파트너 관리','T','YT','','Page','Y','BO_YT_001',
     '파트너사 로고·정보 등록·순서 관리','/admin/system/partner',''],
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);

  styleHeader(sheet.getRange(1, 1, 1, headers.length), BG_CARD);
  sheet.getRange(1, 1, 1, headers.length).setFontColor(GRAY);
  styleRows(sheet, 2, rows.length, headers.length);

  rows.forEach(function(r, i) {
    var col = r[7] === 'Page' ? TEAL : ACCENT;
    sheet.getRange(i + 2, 8).setFontColor(col).setFontWeight('bold');
    var dcol = r[8] === 'Y' ? '#FFD700' : GRAY;
    sheet.getRange(i + 2, 9).setFontColor(dcol).setFontWeight('bold');
  });

  var colWidths = [90,100,80,120,90,55,120,110,45,120,300,220,140];
  colWidths.forEach(function(w, i) { sheet.setColumnWidth(i + 1, w); });
  sheet.setRowHeights(1, rows.length + 1, 34);
  sheet.getRange(1, 1, rows.length + 1, headers.length)
       .setBorder(false, false, false, false, true, false, '#1E2647', SpreadsheetApp.BorderStyle.SOLID);
}

// ── 화면 수 집계 ──────────────────────────────────────────────────────────────

function buildSummary(sheet) {
  sheet.setTabColor(BG_CARD);
  sheet.setColumnWidths(1, 5, 130);
  sheet.setRowHeights(1, 5, 40);

  var data = [
    ['구분','Page','Layer Popup','Popup','합계'],
    ['FO',14,2,0,16],
    ['BO',16,1,0,17],
    ['합계',30,3,0,33],
  ];
  sheet.getRange(1, 1, data.length, 5).setValues(data);
  styleHeader(sheet.getRange(1, 1, 1, 5));
  sheet.getRange(2, 1, 2, 5).setBackground(BG_DARK).setFontColor(WHITE).setFontSize(11);
  sheet.getRange(4, 1, 1, 5).setBackground(ACCENT).setFontColor(WHITE).setFontWeight('bold').setFontSize(12);
  sheet.getRange(1, 1, data.length, 5).setHorizontalAlignment('center').setVerticalAlignment('middle');
  sheet.getRange(1, 1, data.length, 5).setBorder(true, true, true, true, true, true, '#4A6EF7', SpreadsheetApp.BorderStyle.SOLID);
}
