// 관리자 계정 설정
// 실제 운영 환경에서는 이 정보를 환경변수나 데이터베이스에서 관리하세요

// 기본 관리자 계정 (초기 설정)
const DEFAULT_ADMIN_ACCOUNTS = [
  {
    id: 'admin',
    password: 'admin1234',
    name: '시스템 관리자'
  },
  {
    id: 'admin-2024',
    password: 'admin2024',
    name: '2024년 관리자'
  },
  {
    id: 'science-admin',
    password: 'science1234',
    name: '과학동아리 관리자'
  }
];

// 로컬 스토리지에서 관리자 계정 가져오기
const getAdminAccountsFromStorage = () => {
  try {
    const stored = localStorage.getItem('adminAccounts');
    return stored ? JSON.parse(stored) : DEFAULT_ADMIN_ACCOUNTS;
  } catch (error) {
    console.error('관리자 계정 로드 오류:', error);
    return DEFAULT_ADMIN_ACCOUNTS;
  }
};

// 관리자 계정 목록 (동적으로 변경 가능)
export let ADMIN_ACCOUNTS = getAdminAccountsFromStorage();

// 관리자 계정 업데이트 함수
export const updateAdminAccounts = (newAccounts) => {
  ADMIN_ACCOUNTS = newAccounts;
  localStorage.setItem('adminAccounts', JSON.stringify(newAccounts));
};

// 관리자 계정 추가 함수
export const addAdminAccount = (newAdmin) => {
  const updatedAccounts = [...ADMIN_ACCOUNTS, newAdmin];
  updateAdminAccounts(updatedAccounts);
};

// 관리자 계정 삭제 함수
export const removeAdminAccount = (adminId) => {
  const updatedAccounts = ADMIN_ACCOUNTS.filter(admin => admin.id !== adminId);
  updateAdminAccounts(updatedAccounts);
};

// 관리자 비밀번호 변경 함수
export const changeAdminPassword = (adminId, newPassword) => {
  const updatedAccounts = ADMIN_ACCOUNTS.map(admin => 
    admin.id === adminId ? { ...admin, password: newPassword } : admin
  );
  updateAdminAccounts(updatedAccounts);
};

// 관리자 계정 확인 함수
export const isAdminAccount = (userId) => {
  return ADMIN_ACCOUNTS.some(admin => admin.id === userId);
};

// 관리자 계정 정보 가져오기
export const getAdminAccount = (userId) => {
  return ADMIN_ACCOUNTS.find(admin => admin.id === userId);
};

// 관리자 비밀번호 검증
export const validateAdminPassword = (userId, password) => {
  const adminAccount = getAdminAccount(userId);
  return adminAccount && adminAccount.password === password;
}; 