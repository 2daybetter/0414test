/**
 * wbs_weekly_report.js — WBS 주간보고 저장 Apps Script
 *
 * 설치 방법:
 *   1. WBS Google Sheet 열기
 *   2. 확장 프로그램 > Apps Script
 *   3. 이 파일 내용을 붙여넣기 후 저장
 *   4. 실행 > onOpen 실행 (권한 승인)
 *   → 상단 메뉴에 [📋 주간보고] 메뉴 생성됨
 *
 * 파일명 규칙: {프로젝트명}_주간보고_{M}월{W}주차_{YYYYMMDD}.xlsx
 */

// ── 메뉴 등록 ────────────────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📋 주간보고')
    .addItem('💾 주간보고 저장하기', 'saveWeeklyReport')
    .addToUi();
}

// ── 주간보고 저장 ─────────────────────────────────────────────────────────────
function saveWeeklyReport() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssId = ss.getId();

  // 1. 대상 탭 확인
  var reportSheet = ss.getSheetByName('주간보고_template');
  if (!reportSheet) {
    SpreadsheetApp.getUi().alert('오류: "주간보고_template" 탭을 찾을 수 없습니다.');
    return;
  }

  // 2. 프로젝트명 읽기 (설정 탭 B열에서)
  var projectName = getProjectName_();

  // 3. 파일명 생성
  var today = new Date();
  var fileName = buildFileName_(projectName, today);

  // 4. 스프레드시트가 저장된 Drive 폴더 찾기
  var folderId = getParentFolderId_(ssId);

  // 5. xlsx로 내보내기 (특정 탭만: gid 사용)
  var sheetId = reportSheet.getSheetId();
  var exportUrl = 'https://docs.google.com/spreadsheets/d/' + ssId +
    '/export?format=xlsx&gid=' + sheetId;

  var token = ScriptApp.getOAuthToken();
  var response = UrlFetchApp.fetch(exportUrl, {
    headers: { 'Authorization': 'Bearer ' + token },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
    SpreadsheetApp.getUi().alert('오류: xlsx 내보내기 실패 (코드 ' + response.getResponseCode() + ')');
    return;
  }

  // 6. Drive에 저장
  var blob = response.getBlob().setName(fileName + '.xlsx');
  var folder = folderId
    ? DriveApp.getFolderById(folderId)
    : DriveApp.getRootFolder();

  // 같은 이름 파일이 있으면 덮어쓰기
  var existing = folder.getFilesByName(fileName + '.xlsx');
  while (existing.hasNext()) {
    existing.next().setTrashed(true);
  }

  var saved = folder.createFile(blob);

  SpreadsheetApp.getUi().alert(
    '✅ 주간보고 저장 완료!\n\n' +
    '파일명: ' + fileName + '.xlsx\n' +
    '저장 위치: ' + folder.getName()
  );
}

// ── 헬퍼: 프로젝트명 ─────────────────────────────────────────────────────────
function getProjectName_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingSheet = ss.getSheetByName('설정');
  if (!settingSheet) return '프로젝트';

  var data = settingSheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().trim() === '프로젝트명') {
      return (data[i][1] || '프로젝트').toString().trim();
    }
  }
  return '프로젝트';
}

// ── 헬퍼: 파일명 생성 ────────────────────────────────────────────────────────
function buildFileName_(projectName, today) {
  var month = today.getMonth() + 1;
  var weekNum = getWeekOfMonth_(today);
  var dateStr = Utilities.formatDate(today, 'Asia/Seoul', 'yyyyMMdd');
  return projectName + '_주간보고_' + month + '월' + weekNum + '주차_' + dateStr;
}

// ── 헬퍼: 월 중 주차 계산 ────────────────────────────────────────────────────
function getWeekOfMonth_(d) {
  // 해당 월의 1일이 속한 주를 1주차로 계산 (월요일 기준 주)
  var firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  // 1일의 요일(0=일, 1=월, ..., 6=토) → 월요일 기준으로 보정
  var firstDayOfWeek = (firstDay.getDay() + 6) % 7; // 0=월, 6=일
  var dayOfMonth = d.getDate();
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
}

// ── 헬퍼: 스프레드시트의 부모 폴더 ID ────────────────────────────────────────
function getParentFolderId_(ssId) {
  try {
    var file = DriveApp.getFileById(ssId);
    var parents = file.getParents();
    if (parents.hasNext()) {
      return parents.next().getId();
    }
  } catch (e) {
    Logger.log('폴더 조회 실패: ' + e);
  }
  return null;
}
