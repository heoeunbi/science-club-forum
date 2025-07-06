import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const WriteContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &.error {
    border-color: #dc3545;
  }
`;

const TextArea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 200px;
  resize: vertical;
  
  &.error {
    border-color: #dc3545;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &.error {
    border-color: #dc3545;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 10px;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
`;

const VideoPreview = styled.video`
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 5px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  margin-top: 5px;
  font-size: 14px;
`;

const CharacterCount = styled.div`
  color: ${props => props.isOverLimit ? '#dc3545' : '#6c757d'};
  font-size: 12px;
  text-align: right;
  margin-top: 5px;
`;

const FileInfo = styled.div`
  margin-top: 5px;
  font-size: 12px;
  color: #6c757d;
`;

const Write = ({ userId }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 유효성 검사 상수
  const VALIDATION = {
    TITLE_MIN: 2,
    TITLE_MAX: 100,
    CONTENT_MIN: 5,
    CONTENT_MAX: 5000,
    AUTHOR_MAX: 20,
    FILE_SIZE_MAX: 10 * 1024 * 1024, // 10MB
    LINK_MAX: 500
  };

  // 링크 형식 검사 함수
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // 실시간 유효성 검사
  const validateTitle = () => {
    if (!title.trim()) return '제목을 입력하세요.';
    if (title.length < VALIDATION.TITLE_MIN) return `제목은 최소 ${VALIDATION.TITLE_MIN}자 이상이어야 합니다.`;
    if (title.length > VALIDATION.TITLE_MAX) return `제목은 최대 ${VALIDATION.TITLE_MAX}자까지 가능합니다.`;
    return '';
  };

  const validateContent = () => {
    if (!content.trim()) return '내용을 입력하세요.';
    if (content.length < VALIDATION.CONTENT_MIN) return `내용은 최소 ${VALIDATION.CONTENT_MIN}자 이상이어야 합니다.`;
    if (content.length > VALIDATION.CONTENT_MAX) return `내용은 최대 ${VALIDATION.CONTENT_MAX}자까지 가능합니다.`;
    return '';
  };

  const validateCategory = () => {
    if (!category) return '카테고리를 선택하세요.';
    return '';
  };

  const validateAuthor = () => {
    if (!isAnonymous && !author.trim()) return '작성자 이름을 입력하세요.';
    if (!isAnonymous && author.length > VALIDATION.AUTHOR_MAX) return `작성자 이름은 최대 ${VALIDATION.AUTHOR_MAX}자까지 가능합니다.`;
    return '';
  };

  const validateFile = () => {
    if (file && file.size > VALIDATION.FILE_SIZE_MAX) {
      return `파일 크기는 최대 ${VALIDATION.FILE_SIZE_MAX / (1024 * 1024)}MB까지 가능합니다.`;
    }
    return '';
  };

  const validateLink = () => {
    if (link.trim() && !isValidUrl(link)) return '올바른 링크 형식을 입력하세요.';
    if (link.length > VALIDATION.LINK_MAX) return `링크는 최대 ${VALIDATION.LINK_MAX}자까지 가능합니다.`;
    return '';
  };

  // 전체 유효성 검사
  const validateForm = () => {
    const errors = [
      validateTitle(),
      validateContent(),
      validateCategory(),
      validateAuthor(),
      validateFile(),
      validateLink()
    ].filter(error => error);

    return errors;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // 파일 크기 검사
      if (selectedFile.size > VALIDATION.FILE_SIZE_MAX) {
        setError(`파일 크기는 최대 ${VALIDATION.FILE_SIZE_MAX / (1024 * 1024)}MB까지 가능합니다.`);
        e.target.value = '';
        return;
      }

      // 파일 타입 검사
      if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
        setError('이미지 또는 비디오 파일만 업로드 가능합니다.');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setMediaType(selectedFile.type.startsWith('video/') ? 'video' : 'image');
      setError('');
      setSuccess('파일이 성공적으로 선택되었습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사 실행
    const errors = validateForm();
    
    if (errors.length > 0) {
      setError(errors[0]); // 첫 번째 에러만 표시
      return;
    }

    setError('');
    setSuccess('게시글을 작성 중입니다...');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('category', category);
    formData.append('author', isAnonymous ? '익명' : author.trim());
    formData.append('hiddenUserId', userId);
    if (link.trim()) formData.append('link', link.trim());
    if (file) formData.append('file', file);

    try {
      const response = await fetch('https://science-club-forum.onrender.com/api/posts', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '게시글 작성에 실패했습니다.');
      }
      
      setSuccess('게시글이 성공적으로 작성되었습니다!');
      setTimeout(() => {
        navigate('/board?refresh=1');
      }, 1500);
      
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  // 실시간 에러 메시지 업데이트
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setError(validateTitle());
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setError(validateContent());
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setError(validateCategory());
  };

  const handleAuthorChange = (e) => {
    setAuthor(e.target.value);
    setError(validateAuthor());
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
    setError(validateLink());
  };

  const isFormValid = () => {
    return validateForm().length === 0;
  };

  return (
    <WriteContainer>
      <h2>글 작성</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>제목 *</Label>
          <Input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="제목을 입력하세요"
            className={validateTitle() ? 'error' : ''}
          />
          <CharacterCount isOverLimit={title.length > VALIDATION.TITLE_MAX}>
            {title.length}/{VALIDATION.TITLE_MAX}
          </CharacterCount>
        </FormGroup>

        <FormGroup>
          <Label>카테고리 *</Label>
          <Select 
            value={category} 
            onChange={handleCategoryChange}
            className={validateCategory() ? 'error' : ''}
          >
            <option value="">카테고리 선택</option>
            <option value="intro">탐구입문</option>
            <option value="design">탐구 설계・자료 추천</option>
            <option value="trial">연구 중 시행착오 나눔</option>
            <option value="result">이상한 결과・결론 도출 질문</option>
            <option value="feedback">탐구 피드백・보완 제안</option>
            <option value="humanities">인문 계열 지식 토론</option>
            <option value="science">자연 계열 지식 토론</option>
            <option value="fusion">융합형 토론・모델 제안</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>내용 *</Label>
          <TextArea
            value={content}
            onChange={handleContentChange}
            placeholder="내용을 입력하세요"
            className={validateContent() ? 'error' : ''}
          />
          <CharacterCount isOverLimit={content.length > VALIDATION.CONTENT_MAX}>
            {content.length}/{VALIDATION.CONTENT_MAX}
          </CharacterCount>
        </FormGroup>

        <FormGroup>
          <Label>작성자</Label>
          <div>
            <label>
              <input type="radio" checked={isAnonymous} onChange={() => setIsAnonymous(true)} /> 익명
            </label>
            <label style={{ marginLeft: 16 }}>
              <input type="radio" checked={!isAnonymous} onChange={() => setIsAnonymous(false)} /> 이름
            </label>
            {!isAnonymous && (
              <Input
                value={author}
                onChange={handleAuthorChange}
                placeholder="작성자 이름"
                style={{ marginLeft: 8 }}
                className={validateAuthor() ? 'error' : ''}
                maxLength={VALIDATION.AUTHOR_MAX}
              />
            )}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>파일 첨부</Label>
          <Input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          {file && (
            <FileInfo>
              파일명: {file.name} | 크기: {(file.size / (1024 * 1024)).toFixed(2)}MB
            </FileInfo>
          )}
        </FormGroup>

        <FormGroup>
          <Label>링크 첨부</Label>
          <Input
            type="text"
            value={link}
            onChange={handleLinkChange}
            placeholder="https://example.com"
            className={validateLink() ? 'error' : ''}
            maxLength={VALIDATION.LINK_MAX}
          />
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <Button type="submit" disabled={!isFormValid()}>
          작성하기
        </Button>
      </Form>
    </WriteContainer>
  );
};

export default Write; 