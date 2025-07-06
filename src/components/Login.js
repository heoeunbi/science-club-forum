import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { isAdminAccount, getAdminAccount, validateAdminPassword } from '../config/adminConfig';

function Login({ setUserId, setIsAdmin }) {
  const [inputId, setInputId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isUserWithPassword, setIsUserWithPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!inputId.trim()) {
      setError('아이디를 입력하세요.');
      return;
    }

    // 관리자 계정 확인
    const isAdminUser = isAdminAccount(inputId);
    
    if (isAdminUser) {
      // 관리자 로그인인 경우 비밀번호 확인
      if (!password.trim()) {
        setError('관리자 계정은 비밀번호가 필요합니다.');
        return;
      }
      
      // 관리자 비밀번호 검증
      if (!validateAdminPassword(inputId, password)) {
        setError('관리자 비밀번호가 올바르지 않습니다.');
        return;
      }
    } else {
      // 일반 사용자 로그인
      const userPassword = localStorage.getItem(`user_${inputId}_password`);
      if (userPassword) {
        // 비밀번호가 설정된 사용자
        if (!password.trim()) {
          setError('비밀번호를 입력해주세요.');
          return;
        }
        
        if (password !== userPassword) {
          setError('비밀번호가 올바르지 않습니다.');
          return;
        }
      }
      // 비밀번호가 설정되지 않은 사용자는 비밀번호 없이 로그인 가능
    }

    try {
      const userRef = doc(db, 'users', inputId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // 새 계정 생성
        await setDoc(userRef, { createdAt: new Date() });
      }
      
      localStorage.setItem('userId', inputId);
      localStorage.setItem('isAdmin', isAdminUser.toString());
      setUserId(inputId);
      setIsAdmin(isAdminUser);
      navigate('/board');
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleLogin}>
        <h2>로그인</h2>
        <Input
          value={inputId}
          onChange={e => {
            setInputId(e.target.value);
            const isAdminUser = isAdminAccount(e.target.value);
            setIsAdminLogin(isAdminUser);
            
            // 일반 사용자의 비밀번호 설정 여부 확인
            if (!isAdminUser && e.target.value.trim()) {
              const userPassword = localStorage.getItem(`user_${e.target.value}_password`);
              setIsUserWithPassword(!!userPassword);
            } else {
              setIsUserWithPassword(false);
            }
          }}
          placeholder="아이디를 입력하세요 (형식은 자유입니다)"
        />
        {(isAdminLogin || isUserWithPassword) && (
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={isAdminLogin ? "관리자 비밀번호를 입력하세요" : "비밀번호를 입력하세요"}
          />
        )}
        <LoginButton type="submit">로그인</LoginButton>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <LoginInfo>
          <p>• 일반 사용자: 학번으로 로그인 (비밀번호 설정 시 비밀번호 입력)</p>
          <p>• 관리자: 지정된 관리자 계정 + 비밀번호</p>
          <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
            관리자 계정은 시스템 관리자에게 문의하세요
          </p>
        </LoginInfo>
      </LoginForm>
    </LoginContainer>
  );
}

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginForm = styled.form`
  max-width: 400px;
  width: 100%;
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }
`;

const Input = styled.input`
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
`;

const LoginButton = styled.button`
  padding: 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  text-align: center;
  font-size: 0.9rem;
`;

const LoginInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;

  p {
    margin: 0.3rem 0;
    font-size: 0.9rem;
    color: #666;
  }
`;

export default Login; 