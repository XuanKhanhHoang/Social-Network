export const VIETNAM_PROVINCES = [
  { name: 'Thành phố Hà Nội', code: 1, codename: 'ha_noi' },
  { name: 'Cao Bằng', code: 4, codename: 'cao_bang' },
  { name: 'Tuyên Quang', code: 8, codename: 'tuyen_quang' },
  { name: 'Điện Biên', code: 11, codename: 'dien_bien' },
  { name: 'Lai Châu', code: 12, codename: 'lai_chau' },
  { name: 'Sơn La', code: 14, codename: 'son_la' },
  { name: 'Lào Cai', code: 15, codename: 'lao_cai' },
  { name: 'Thái Nguyên', code: 19, codename: 'thai_nguyen' },
  { name: 'Lạng Sơn', code: 20, codename: 'lang_son' },
  { name: 'Quảng Ninh', code: 22, codename: 'quang_ninh' },
  { name: 'Bắc Ninh', code: 24, codename: 'bac_ninh' },
  { name: 'Phú Thọ', code: 25, codename: 'phu_tho' },
  { name: 'Thành phố Hải Phòng', code: 31, codename: 'hai_phong' },
  { name: 'Hưng Yên', code: 33, codename: 'hung_yen' },
  { name: 'Ninh Bình', code: 37, codename: 'ninh_binh' },
  { name: 'Thanh Hóa', code: 38, codename: 'thanh_hoa' },
  { name: 'Nghệ An', code: 40, codename: 'nghe_an' },
  { name: 'Hà Tĩnh', code: 42, codename: 'ha_tinh' },
  { name: 'Quảng Trị', code: 44, codename: 'quang_tri' },
  { name: 'Thành phố Huế', code: 46, codename: 'hue' },
  { name: 'Thành phố Đà Nẵng', code: 48, codename: 'da_nang' },
  { name: 'Quảng Ngãi', code: 51, codename: 'quang_ngai' },
  { name: 'Gia Lai', code: 52, codename: 'gia_lai' },
  { name: 'Khánh Hòa', code: 56, codename: 'khanh_hoa' },
  { name: 'Đắk Lắk', code: 66, codename: 'dak_lak' },
  { name: 'Lâm Đồng', code: 68, codename: 'lam_dong' },
  { name: 'Đồng Nai', code: 75, codename: 'dong_nai' },
  { name: 'Thành phố Hồ Chí Minh', code: 79, codename: 'ho_chi_minh' },
  { name: 'Tây Ninh', code: 80, codename: 'tay_ninh' },
  { name: 'Đồng Tháp', code: 82, codename: 'dong_thap' },
  { name: 'Vĩnh Long', code: 86, codename: 'vinh_long' },
  { name: 'An Giang', code: 91, codename: 'an_giang' },
  { name: 'Thành phố Cần Thơ', code: 92, codename: 'can_tho' },
  { name: 'Cà Mau', code: 96, codename: 'ca_mau' },
] as const;

export const VALID_PROVINCE_CODES = new Set(
  VIETNAM_PROVINCES.map((p) => p.code),
);

export const VIETNAM_PROVINCES_Map = new Map(
  VIETNAM_PROVINCES.map((p) => [p.code, p]),
);
export const getVietnamProvinceByCode = (code: number) => {
  return VIETNAM_PROVINCES_Map.get(code as any);
};
export type VietnamProvince = (typeof VIETNAM_PROVINCES)[number];
