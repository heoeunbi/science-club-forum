import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ADMIN_ACCOUNTS, addAdminAccount, removeAdminAccount, changeAdminPassword } from '../config/adminConfig';

const AdminPanel = ({ userId, isAdmin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ id: '', password: '', name: '' });
  const [adminAccounts, setAdminAccounts] = useState(ADMIN_ACCOUNTS);
  const [message, setMessage] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    setAdminAccounts(ADMIN_ACCOUNTS);
  }, []);

  if (!isAdmin) {
    return (
      <AccessDenied>
        <h2>접근 권한이 없습니다</h2>
        <p>관리자만 이 페이지에 접근할 수 있습니다.</p>
      </AccessDenied>
    );
  }

  const handleAddAdmin = () => {
    if (!newAdmin.id || !newAdmin.password || !newAdmin.name) {
      setMessage('모든 필드를 입력해주세요.');
      return;
    }

    if (adminAccounts.some(admin => admin.id === newAdmin.id)) {
      setMessage('이미 존재하는 관리자 ID입니다.');
      return;
    }

    if (newAdmin.password.length < 6) {
      setMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      addAdminAccount(newAdmin);
      setAdminAccounts([...adminAccounts, newAdmin]);
      setNewAdmin({ id: '', password: '', name: '' });
      setMessage('관리자 계정이 성공적으로 추가되었습니다.');
    } catch (error) {
      setMessage('관리자 계정 추가 중 오류가 발생했습니다.');
    }
  };

  const handleRemoveAdmin = (adminId) => {
    if (adminId === userId) {
      setMessage('자신의 계정은 삭제할 수 없습니다.');
      return;
    }

    if (window.confirm('정말로 이 관리자 계정을 삭제하시겠습니까?')) {
      try {
        removeAdminAccount(adminId);
        setAdminAccounts(adminAccounts.filter(admin => admin.id !== adminId));
        setMessage('관리자 계정이 삭제되었습니다.');
      } catch (error) {
        setMessage('관리자 계정 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditPassword = (adminId) => {
    if (!editPassword.trim()) {
      setMessage('새 비밀번호를 입력해주세요.');
      return;
    }

    if (editPassword.length < 6) {
      setMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      changeAdminPassword(adminId, editPassword);
      setAdminAccounts(ADMIN_ACCOUNTS);
      setEditingAdmin(null);
      setEditPassword('');
      setMessage('비밀번호가 성공적으로 변경되었습니다.');
    } catch (error) {
      setMessage('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <AdminPanelContainer>
      <Header>
        <h1>관리자 패널</h1>
        <p>현재 로그인: {userId}</p>
      </Header>

      <Section>
        <h2>현재 관리자 계정 목록</h2>
        <AdminList>
          {adminAccounts.map((admin, index) => (
            <AdminItem key={index}>
              <AdminInfo>
                <strong>{admin.name}</strong>
                <span>ID: {admin.id}</span>
                {admin.id === userId ? (
                  <>
                    <span>비밀번호: {showPassword ? admin.password : '••••••••'}</span>
                    {editingAdmin === admin.id && (
                      <PasswordEditForm>
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="새 비밀번호"
                          style={{ marginRight: '0.5rem' }}
                        />
                        <button onClick={() => handleEditPassword(admin.id)}>변경</button>
                        <button onClick={() => {
                          setEditingAdmin(null);
                          setEditPassword('');
                        }}>취소</button>
                      </PasswordEditForm>
                    )}
                  </>
                ) : (
                  <span>비밀번호: ••••••••</span>
                )}
              </AdminInfo>
              <AdminActions>
                {admin.id === userId ? (
                  <>
                    <ToggleButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    </ToggleButton>
                    <EditButton onClick={() => setEditingAdmin(admin.id)}>
                      비밀번호 변경
                    </EditButton>
                  </>
                ) : (
                  <span style={{ color: '#666', fontSize: '0.8rem' }}>다른 관리자 계정</span>
                )}
              </AdminActions>
            </AdminItem>
          ))}
        </AdminList>
      </Section>

      <Section>
        <h2>새 관리자 계정 추가</h2>
        <AddAdminForm>
          <FormGroup>
            <label>관리자 이름:</label>
            <input
              type="text"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              placeholder="관리자 이름"
            />
          </FormGroup>
          <FormGroup>
            <label>계정 ID:</label>
            <input
              type="text"
              value={newAdmin.id}
              onChange={(e) => setNewAdmin({ ...newAdmin, id: e.target.value })}
              placeholder="계정 ID"
            />
          </FormGroup>
          <FormGroup>
            <label>비밀번호:</label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              placeholder="비밀번호 (최소 6자)"
            />
          </FormGroup>
          <AddButton onClick={handleAddAdmin}>관리자 추가</AddButton>
        </AddAdminForm>
      </Section>

      {message && (
        <MessageBox type={message.includes('성공') ? 'success' : 'error'}>
          {message}
        </MessageBox>
      )}

      <Section>
        <h2>관리자 권한 안내</h2>
        <InfoBox>
          <h3>관리자 권한</h3>
          <ul>
            <li>모든 게시글 삭제 가능</li>
            <li>모든 댓글 삭제 가능</li>
            <li>부적절한 내용 관리</li>
            <li>포럼 운영 정책 수립</li>
          </ul>
        </InfoBox>
      </Section>
    </AdminPanelContainer>
  );
};

const AdminPanelContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    color: #1976d2;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
  }
`;

const Section = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  
  h2 {
    color: #333;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #1976d2;
    padding-bottom: 0.5rem;
  }
`;

const AdminList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AdminItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f8f9fa;
`;

const AdminInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  
  strong {
    color: #1976d2;
  }
  
  span {
    color: #666;
    font-size: 0.9rem;
  }
`;

const AdminActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ToggleButton = styled.button`
  background: #1976d2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #1565c0;
  }
`;

const AddAdminForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 600;
    color: #333;
  }
  
  input {
    padding: 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #1976d2;
    }
  }
`;

const AddButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  
  &:hover {
    background: #45a049;
  }
`;

const MessageBox = styled.div`
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
  
  background: ${props => props.type === 'success' ? '#e8f5e8' : '#ffebee'};
  color: ${props => props.type === 'success' ? '#2e7d32' : '#c62828'};
  border: 1px solid ${props => props.type === 'success' ? '#4caf50' : '#f44336'};
`;

const PasswordEditForm = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  
  input {
    padding: 0.3rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.8rem;
  }
  
  button {
    padding: 0.3rem 0.8rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    
    &:first-of-type {
      background: #1976d2;
      color: white;
    }
    
    &:last-of-type {
      background: #666;
      color: white;
    }
  }
`;

const EditButton = styled.button`
  background: #ff9800;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #f57c00;
  }
`;

const DeleteButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #d32f2f;
  }
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
  
  h3 {
    color: #1976d2;
    margin-bottom: 1rem;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.5rem;
      color: #333;
    }
  }
`;

const AccessDenied = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  h2 {
    color: #f44336;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
  }
`;

export default AdminPanel; 