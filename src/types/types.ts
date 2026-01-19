
export interface LessonPlanInfo {
  subject: string;
  grade: string;
  planFile: File | null;
  curriculumFile: File | null;
  analyzeOnly: boolean;
  includeReport: boolean;
}

export enum Subject {
  // Môn học bắt buộc và tự chọn phổ biến
  TOAN = "Toán",
  NGU_VAN = "Ngữ Văn",
  TIENG_ANH = "Tiếng Anh",
  VAT_LY = "Vật lý",
  HOA_HOC = "Hóa học",
  SINH_HOC = "Sinh học",
  LICH_SU = "Lịch sử",
  DIA_LY = "Địa lý",
  GDCD = "Giáo dục công dân",
  TIN_HOC = "Tin học",
  CONG_NGHE = "Công nghệ",
  GDKT_PHAP_LUAT = "Giáo dục Kinh tế và Pháp luật",
  KHOA_HOC_TU_NHIEN = "Khoa học tự nhiên (THCS)",
  LICH_SU_DIA_LY = "Lịch sử và Địa lý (THCS)",
  AM_NHAC = "Âm nhạc",
  MY_THUAT = "Mỹ thuật",
  THE_DUC = "Giáo dục thể chất",
  HOAT_DONG_TRAI_NGHIEM = "Hoạt động trải nghiệm, hướng nghiệp",
  NOI_DUNG_DIA_PHUONG = "Nội dung giáo dục địa phương"
}

export enum Grade {
  LOP_1 = "Lớp 1",
  LOP_2 = "Lớp 2",
  LOP_3 = "Lớp 3",
  LOP_4 = "Lớp 4",
  LOP_5 = "Lớp 5",
  LOP_6 = "Lớp 6",
  LOP_7 = "Lớp 7",
  LOP_8 = "Lớp 8",
  LOP_9 = "Lớp 9",
  LOP_10 = "Lớp 10",
  LOP_11 = "Lớp 11",
  LOP_12 = "Lớp 12"
}
