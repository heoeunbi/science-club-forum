import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { isAdminAccount, getAdminAccount, validateAdminPassword, changeAdminPassword } from '../config/adminConfig';

const Profile = ({ userId, isAdmin, setUserId }) => {
  const [profile, setProfile] = useState({
    email: '',
    bio: ''
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
    // 사용자가 비밀번호를 설정했는지 확인
    const userPassword = localStorage.getItem(`user_${userId}_password`);
    setHasPassword(!!userPassword);
  }, [userId]);

  const loadProfile = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setProfile({
          email: userData.email || '',
          bio: userData.bio || ''
        });
      } else {
        // 새 사용자인 경우 기본값 설정
        setProfile({
          email: '',
          bio: ''
        });
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error);
      setMessage('프로필을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...profile,
        updatedAt: new Date()
      }, { merge: true });

      setMessage('프로필이 성공적으로 저장되었습니다.');
      setIsEditing(false);
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      setMessage('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      if (isAdmin) {
        // 관리자 비밀번호 변경
        if (hasPassword && !currentPassword) {
          setMessage('현재 비밀번호를 입력해주세요.');
          return;
        }

        const adminAccount = getAdminAccount(userId);
        if (hasPassword && (!adminAccount || !validateAdminPassword(userId, currentPassword))) {
          setMessage('현재 비밀번호가 올바르지 않습니다.');
          return;
        }

        // 관리자 비밀번호 변경
        changeAdminPassword(userId, newPassword);
        setMessage('관리자 비밀번호가 변경되었습니다.');
      } else {
        // 일반 사용자 비밀번호 설정/변경
        if (hasPassword && !currentPassword) {
          setMessage('현재 비밀번호를 입력해주세요.');
          return;
        }

        if (hasPassword) {
          const storedPassword = localStorage.getItem(`user_${userId}_password`);
          if (currentPassword !== storedPassword) {
            setMessage('현재 비밀번호가 올바르지 않습니다.');
            return;
          }
        }

        // 일반 사용자 비밀번호 저장
        localStorage.setItem(`user_${userId}_password`, newPassword);
        setHasPassword(true);
        setMessage(hasPassword ? '비밀번호가 성공적으로 변경되었습니다.' : '비밀번호가 설정되었습니다.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      setMessage('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  const handleRemovePassword = () => {
    if (window.confirm('비밀번호를 제거하시겠습니까? 다음 로그인부터는 비밀번호 없이 로그인할 수 있습니다.')) {
      localStorage.removeItem(`user_${userId}_password`);
      setHasPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setMessage('비밀번호가 제거되었습니다.');
    }
  };

  if (isLoading) {
    return <LoadingContainer>프로필을 불러오는 중...</LoadingContainer>;
  }

  return (
    <ProfileContainer>
      <Header>
        <h1>프로필 관리</h1>
        <p>사용자 ID: {userId}</p>
        {isAdmin && <AdminBadge>관리자</AdminBadge>}
      </Header>

      <ProfileSection>
        <SectionHeader>
          <h2>기본 정보</h2>
          <EditButton onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? '취소' : '편집'}
          </EditButton>
        </SectionHeader>

        <ProfileForm>
          <FormGroup>
            <label>사용자 ID</label>
            <input
              type="text"
              value={userId}
              disabled={true}
              style={{ background: '#f5f5f5', color: '#666' }}
            />
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              사용자 ID는 변경할 수 없습니다.
            </small>
          </FormGroup>

          <FormGroup>
            <label>이메일</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={!isEditing}
              placeholder="이메일 주소"
            />
          </FormGroup>

          <FormGroup>
            <label>자기소개</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="자기소개를 입력하세요"
              rows="4"
            />
          </FormGroup>

          {isEditing && (
            <SaveButton onClick={handleSaveProfile}>
              저장
            </SaveButton>
          )}
        </ProfileForm>
      </ProfileSection>

      <PasswordSection>
        <SectionHeader>
          <h2>비밀번호 관리</h2>
          <ToggleButton onClick={() => setShowPasswordSection(!showPasswordSection)}>
            {showPasswordSection ? '숨기기' : '보기'}
          </ToggleButton>
        </SectionHeader>
        
        {showPasswordSection && (
          <PasswordForm>
            {hasPassword && (
              <FormGroup>
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                />
              </FormGroup>
            )}

            <FormGroup>
              <label>새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 (최소 6자)"
              />
            </FormGroup>

            <FormGroup>
              <label>새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 재입력"
              />
            </FormGroup>

            <ButtonGroup>
              <ChangePasswordButton onClick={handleChangePassword}>
                {hasPassword ? '비밀번호 변경' : '비밀번호 설정'}
              </ChangePasswordButton>
              {hasPassword && !isAdmin && (
                <RemovePasswordButton onClick={handleRemovePassword}>
                  비밀번호 제거
                </RemovePasswordButton>
              )}
            </ButtonGroup>
          </PasswordForm>
        )}
        
        {!showPasswordSection && (
          <PasswordInfo>
            <p>
              {hasPassword 
                ? '비밀번호가 설정되어 있습니다. 보기 버튼을 클릭하여 변경할 수 있습니다.'
                : '비밀번호가 설정되어 있지 않습니다. 보기 버튼을 클릭하여 설정할 수 있습니다.'
              }
            </p>
          </PasswordInfo>
        )}
      </PasswordSection>

      {message && (
        <MessageBox type={message.includes('성공') ? 'success' : 'error'}>
          {message}
        </MessageBox>
      )}

      <InfoSection>
        <h2>프로필 정보</h2>
        <InfoBox>
          <p><strong>사용자 ID:</strong> {userId}</p>
          <p><strong>계정 유형:</strong> {isAdmin ? '관리자' : '일반 사용자'}</p>
          <p><strong>가입일:</strong> {new Date().toLocaleDateString()}</p>
          {isAdmin && (
            <p><strong>관리자 권한:</strong> 게시글/댓글 삭제, 포럼 관리</p>
          )}
        </InfoBox>
      </InfoSection>
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
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
    margin-bottom: 0.5rem;
  }
`;

const AdminBadge = styled.span`
  background: #ff4444;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ProfileSection = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    color: #333;
    margin: 0;
  }
`;

const EditButton = styled.button`
  background: #1976d2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #1565c0;
  }
`;

const ProfileForm = styled.div`
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
  
  input, textarea {
    padding: 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #1976d2;
    }
    
    &:disabled {
      background: #f5f5f5;
      color: #666;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const SaveButton = styled.button`
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

const PasswordSection = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  
  h2 {
    color: #333;
    margin-bottom: 1.5rem;
  }
`;

const PasswordForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChangePasswordButton = styled.button`
  background: #ff9800;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  
  &:hover {
    background: #f57c00;
  }
`;

const RemovePasswordButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  
  &:hover {
    background: #d32f2f;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const ToggleButton = styled.button`
  background: #1976d2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #1565c0;
  }
`;

const PasswordInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
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

const InfoSection = styled.section`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  h2 {
    color: #333;
    margin-bottom: 1.5rem;
  }
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #1976d2;
  
  p {
    margin: 0.5rem 0;
    color: #333;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

export default Profile; 