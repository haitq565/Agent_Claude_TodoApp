import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface TestCase {
  id: string;
  module: string;
  name: string;
  precondition: string;
  steps: string;
  expected: string;
  priority: 'High' | 'Medium' | 'Low';
  type: 'UI' | 'API';
  status: 'Pass' | 'Fail' | 'N/A';
}

const HEADER_COLS = [
  'Test ID', 'Module', 'Test Case Name', 'Precondition',
  'Steps', 'Expected Result', 'Priority', 'Type', 'Status',
];

const COLUMN_WIDTHS = [14, 16, 40, 40, 60, 50, 10, 8, 10];

// ─── Test Data ──────────────────────────────────────────────────────────────

const crudTests: TestCase[] = [
  {
    id: 'TC-CRUD-001', module: 'CRUD', name: 'Hiển thị danh sách todos',
    precondition: 'JSON Server đang chạy, db.json có ít nhất 1 todo',
    steps: '1. Mở trình duyệt\n2. Điều hướng đến /todos',
    expected: 'Bảng mat-table hiển thị ít nhất 1 hàng dữ liệu',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-CRUD-002', module: 'CRUD', name: 'Mở dialog Thêm Todo',
    precondition: 'Đang ở trang /todos',
    steps: '1. Click nút "Thêm Todo"',
    expected: 'Dialog app-todo-form mở ra với tiêu đề "Thêm Todo mới"',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-CRUD-003', module: 'CRUD', name: 'Thêm todo mới thành công',
    precondition: 'Dialog Thêm Todo đang mở',
    steps: '1. Nhập title hợp lệ (≥3 ký tự)\n2. Chọn priority: Cao\n3. Chọn category: Work\n4. Click nút "Thêm Todo"',
    expected: 'Dialog đóng. Todo mới xuất hiện trong bảng với đúng title',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-CRUD-004', module: 'CRUD', name: 'Validation: title quá ngắn',
    precondition: 'Dialog Thêm Todo đang mở',
    steps: '1. Nhập title chỉ 2 ký tự\n2. Click ra ngoài field (blur)',
    expected: 'mat-error hiển thị thông báo "Tối thiểu"',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-CRUD-005', module: 'CRUD', name: 'Sửa todo hiện có',
    precondition: 'Bảng có ít nhất 1 todo',
    steps: '1. Hover vào row đầu tiên\n2. Click nút Chỉnh sửa\n3. Xóa title cũ, nhập "Updated Todo Title"\n4. Click "Lưu thay đổi"',
    expected: 'Dialog đóng. Bảng hiển thị "Updated Todo Title"',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-CRUD-006', module: 'CRUD', name: 'Xóa todo sau confirm',
    precondition: 'Bảng có ít nhất 1 todo',
    steps: '1. Hover vào row đầu tiên\n2. Click nút Xóa\n3. Confirm trong dialog',
    expected: 'Todo bị xóa khỏi bảng',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-CRUD-007', module: 'CRUD', name: 'Toggle trạng thái todo',
    precondition: 'Bảng có ít nhất 1 todo',
    steps: '1. Click nút toggle ở row đầu tiên',
    expected: 'Chip trạng thái đổi giữa "Hoàn thành" và "Đang làm"',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
];

const filterTests: TestCase[] = [
  {
    id: 'TC-FILTER-001', module: 'Filter', name: 'Lọc theo trạng thái Active',
    precondition: 'Trang /todos, có cả todo active và completed',
    steps: '1. Click chip "Đang làm"',
    expected: 'Chỉ hiển thị todos có status=active',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-FILTER-002', module: 'Filter', name: 'Lọc theo trạng thái Completed',
    precondition: 'Trang /todos, có cả todo active và completed',
    steps: '1. Click chip "Hoàn thành"',
    expected: 'Chỉ hiển thị todos có status=completed',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-FILTER-003', module: 'Filter', name: 'Lọc theo priority Cao',
    precondition: 'Trang /todos, có todos với priority=high',
    steps: '1. Chọn "Cao" trong dropdown priority',
    expected: 'Chỉ hiển thị todos có priority=high',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-FILTER-004', module: 'Filter', name: 'Reset bộ lọc về All',
    precondition: 'Đang áp dụng filter',
    steps: '1. Click chip "Tất cả"',
    expected: 'Hiển thị toàn bộ todos không phân biệt trạng thái',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-FILTER-005', module: 'Filter', name: 'Lọc theo category',
    precondition: 'Trang /todos, có todos với các category khác nhau',
    steps: '1. Chọn một category cụ thể trong dropdown',
    expected: 'Chỉ hiển thị todos thuộc category đã chọn',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-FILTER-006', module: 'Filter', name: 'Bulk selection hiển thị action bar',
    precondition: 'Trang /todos có nhiều todos',
    steps: '1. Click checkbox của ít nhất 1 todo',
    expected: 'Bulk action bar hiển thị với các nút xóa / đánh dấu hoàn thành',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
];

const searchTests: TestCase[] = [
  {
    id: 'TC-SEARCH-001', module: 'Search', name: 'Tìm kiếm todo theo keyword',
    precondition: 'Trang /todos có todos với các tiêu đề khác nhau',
    steps: '1. Nhập keyword vào ô tìm kiếm\n2. Chờ 300ms debounce',
    expected: 'Bảng chỉ hiển thị todos có title chứa keyword',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-SEARCH-002', module: 'Search', name: 'Empty state khi không có kết quả',
    precondition: 'Trang /todos',
    steps: '1. Nhập keyword không khớp bất kỳ todo nào',
    expected: 'Hiển thị empty state component thay vì bảng',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-SEARCH-003', module: 'Search', name: 'Xóa search bằng nút X',
    precondition: 'Đang có keyword trong ô search',
    steps: '1. Click nút X trong ô tìm kiếm',
    expected: 'Ô tìm kiếm trống, hiển thị lại tất cả todos',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-SEARCH-004', module: 'Search', name: 'Số kết quả cập nhật theo search',
    precondition: 'Trang /todos',
    steps: '1. Nhập keyword khớp một số todos',
    expected: 'Đếm số hàng trong bảng khớp với số todos tìm được',
    priority: 'Low', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-SEARCH-005', module: 'Search', name: 'Bulk select + xóa từ kết quả search',
    precondition: 'Đang có kết quả search với nhiều items',
    steps: '1. Chọn checkbox Select All\n2. Click xóa trong bulk action bar\n3. Confirm',
    expected: 'Tất cả todos trong kết quả search bị xóa',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-SEARCH-006', module: 'Search', name: 'Navigate đến Dashboard',
    precondition: 'Trang /todos',
    steps: '1. Click link "Dashboard" trong menu',
    expected: 'Chuyển đến /dashboard, hiển thị các stat cards',
    priority: 'Low', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-SEARCH-007', module: 'Search', name: 'Deselect all trong bulk select',
    precondition: 'Đã chọn nhiều todos',
    steps: '1. Bỏ chọn checkbox Select All',
    expected: 'Tất cả checkboxes bỏ chọn, bulk action bar ẩn đi',
    priority: 'Low', type: 'UI', status: 'Pass',
  },
];

const editExtraTests: TestCase[] = [
  {
    id: 'TC-EDIT-001', module: 'Edit/Add Extra', name: 'Form sửa được pre-fill đúng data',
    precondition: 'Bảng có ít nhất 1 todo',
    steps: '1. Hover row đầu tiên\n2. Click Chỉnh sửa',
    expected: 'Các field trong dialog được điền sẵn đúng giá trị của todo',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-EDIT-002', module: 'Edit/Add Extra', name: 'Validation maxLength 120 ký tự',
    precondition: 'Dialog Thêm/Sửa Todo đang mở',
    steps: '1. Nhập title dài hơn 120 ký tự',
    expected: 'mat-error hiển thị thông báo giới hạn ký tự',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-EDIT-003', module: 'Edit/Add Extra', name: 'Nút Save bị disabled khi form invalid',
    precondition: 'Dialog đang mở với form trống hoặc lỗi',
    steps: '1. Để title trống hoặc quá ngắn',
    expected: 'Nút Lưu/Thêm bị disabled, không thể submit',
    priority: 'High', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-EDIT-004', module: 'Edit/Add Extra', name: 'Cancel không lưu thay đổi',
    precondition: 'Dialog sửa đang mở với data đã sửa',
    steps: '1. Sửa title\n2. Click Cancel/Hủy',
    expected: 'Dialog đóng, bảng không thay đổi',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-EDIT-005', module: 'Edit/Add Extra', name: 'Lưu thay đổi priority/category',
    precondition: 'Dialog sửa đang mở',
    steps: '1. Đổi priority\n2. Đổi category\n3. Click Lưu thay đổi',
    expected: 'Bảng cập nhật đúng priority và category mới',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-EDIT-006', module: 'Edit/Add Extra', name: 'Submit bị disabled khi form rỗng',
    precondition: 'Dialog Thêm Todo vừa mở',
    steps: '1. Không nhập gì',
    expected: 'Nút Thêm Todo bị disabled',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-EDIT-007', module: 'Edit/Add Extra', name: 'Thêm todo với đầy đủ fields',
    precondition: 'Dialog Thêm Todo đang mở',
    steps: '1. Nhập title\n2. Nhập description\n3. Chọn dueDate\n4. Chọn priority\n5. Chọn category\n6. Click Thêm Todo',
    expected: 'Todo được tạo với đầy đủ thông tin',
    priority: 'Medium', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-EDIT-008', module: 'Edit/Add Extra', name: 'Cancel thêm không tạo todo',
    precondition: 'Dialog Thêm Todo đang mở, đã điền một số field',
    steps: '1. Click Cancel/Hủy',
    expected: 'Dialog đóng, không có todo mới được tạo',
    priority: 'Low', type: 'UI', status: 'Pass',
  },
  {
    id: 'TC-EDIT-009', module: 'Edit/Add Extra', name: 'Form reset sau khi thêm thành công',
    precondition: 'Vừa thêm 1 todo thành công',
    steps: '1. Mở lại dialog Thêm Todo',
    expected: 'Tất cả fields trống (không còn data từ lần trước)',
    priority: 'Low', type: 'UI', status: 'Pass',
  },
];

const apiTests: TestCase[] = [
  {
    id: 'TC-API-001', module: 'API', name: 'GET /todos trả về 200 và danh sách',
    precondition: 'JSON Server đang chạy tại port 3000',
    steps: '1. Gửi GET request đến http://localhost:3000/todos',
    expected: 'Status 200. Body là JSON array. Mỗi item có id, title, status, priority, category, createdAt, updatedAt',
    priority: 'High', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-002', module: 'API', name: 'POST /todos tạo mới → 201',
    precondition: 'JSON Server đang chạy',
    steps: '1. Gửi POST /todos với payload hợp lệ (title, status, priority, category, timestamps)',
    expected: 'Status 201. Body chứa id được sinh tự động, các fields khớp với payload',
    priority: 'High', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-003', module: 'API', name: 'GET /todos/:id lấy đúng record',
    precondition: 'Đã POST tạo 1 todo, có id',
    steps: '1. Gửi GET /todos/{id}',
    expected: 'Status 200. Body là object với id và fields khớp todo đã tạo',
    priority: 'High', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-004', module: 'API', name: 'GET /todos/9999 không tồn tại → 404',
    precondition: 'JSON Server đang chạy',
    steps: '1. Gửi GET /todos/9999',
    expected: 'Status 404',
    priority: 'Medium', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-005', module: 'API', name: 'PATCH /todos/:id cập nhật status',
    precondition: 'Đã có 1 todo với status=active',
    steps: '1. Gửi PATCH /todos/{id} với body { status: "completed" }',
    expected: 'Status 200. status=completed. Các fields khác không thay đổi',
    priority: 'High', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-006', module: 'API', name: 'PUT /todos/:id thay thế toàn bộ',
    precondition: 'Đã có 1 todo',
    steps: '1. Gửi PUT /todos/{id} với object đầy đủ, title mới và priority mới',
    expected: 'Status 200. Tất cả fields được thay thế theo request body',
    priority: 'Medium', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-007', module: 'API', name: 'DELETE /todos/:id, GET lại → 404',
    precondition: 'Đã có 1 todo với id biết trước',
    steps: '1. Gửi DELETE /todos/{id}\n2. Gửi GET /todos/{id}',
    expected: 'DELETE → 200. GET → 404',
    priority: 'High', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-008', module: 'API', name: 'GET /todos?status=active — filter đúng',
    precondition: 'db.json có cả todos active và completed',
    steps: '1. Gửi GET /todos?status=active',
    expected: 'Status 200. Tất cả items trong response có status=active',
    priority: 'Medium', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-009', module: 'API', name: 'GET /todos?priority=high — filter đúng',
    precondition: 'db.json có todos với priority=high',
    steps: '1. Gửi GET /todos?priority=high',
    expected: 'Status 200. Tất cả items có priority=high',
    priority: 'Medium', type: 'API', status: 'Pass',
  },
  {
    id: 'TC-API-010', module: 'API', name: 'GET /todos?title_like=keyword — search đúng',
    precondition: 'db.json có todos với title chứa "Todo"',
    steps: '1. Gửi GET /todos?title_like=Todo',
    expected: 'Status 200. Tất cả items có title chứa "Todo" (case-insensitive)',
    priority: 'Medium', type: 'API', status: 'Pass',
  },
];

// ─── Excel Builder ───────────────────────────────────────────────────────────

async function buildSheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  testCases: TestCase[],
) {
  const ws = workbook.addWorksheet(sheetName);

  // Header row
  ws.addRow(HEADER_COLS);
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A3AFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 28;

  // Data rows
  testCases.forEach((tc, i) => {
    const row = ws.addRow([
      tc.id, tc.module, tc.name, tc.precondition,
      tc.steps, tc.expected, tc.priority, tc.type, tc.status,
    ]);
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });
    // Alternate row color
    if (i % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0EFFF' } };
      });
    }
    // Color status cell
    const statusCell = row.getCell(9);
    if (tc.status === 'Pass') {
      statusCell.font = { color: { argb: 'FF1B7A3E' }, bold: true };
    } else if (tc.status === 'Fail') {
      statusCell.font = { color: { argb: 'FFCC0000' }, bold: true };
    }
    // Color priority cell
    const priorityCell = row.getCell(7);
    if (tc.priority === 'High') priorityCell.font = { color: { argb: 'FFCC0000' }, bold: true };
    else if (tc.priority === 'Medium') priorityCell.font = { color: { argb: 'FFB86E00' } };
    row.height = 60;
  });

  // Column widths
  COLUMN_WIDTHS.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  ws.views = [{ state: 'frozen', ySplit: 1 }];
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Claude Code';
  workbook.created = new Date();

  await buildSheet(workbook, 'CRUD Tests', crudTests);
  await buildSheet(workbook, 'Filter Tests', filterTests);
  await buildSheet(workbook, 'Search Tests', searchTests);
  await buildSheet(workbook, 'Edit-Add Extra', editExtraTests);
  await buildSheet(workbook, 'API Tests', apiTests);

  const outDir = path.join(__dirname, 'testcases');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'TodoApp_TestCase.xlsx');
  await workbook.xlsx.writeFile(outPath);
  console.log(`✅ File Excel đã tạo: ${outPath}`);
  console.log(`   Tổng test cases: ${crudTests.length + filterTests.length + searchTests.length + editExtraTests.length + apiTests.length}`);
}

main().catch(console.error);
