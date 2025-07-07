import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PreviewContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #555;
  button {
    margin-left: 8px;
    padding: 4px 8px;
    font-size: 0.7rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #e0e0e0;
    cursor: pointer;
    &:hover {
      background-color: #d5d5d5;
    }
    &:disabled {
      color: #ccc;
      cursor: not-allowed;
    }
  }
`;

const PostDetail = ({ posts, onDelete, onEdit, onAddComment, onEditComment, onDeleteComment, onLike, likedPosts, userId, isAdmin, onTogglePin }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [commentMode, setCommentMode] = useState('anonymous'); // 'anonymous' or 'name'
  const [commentName, setCommentName] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedIsAnonymous, setEditedIsAnonymous] = useState(true);
  const [editedAuthor, setEditedAuthor] = useState('');
  const [editedFile, setEditedFile] = useState(null);
  const [editedMediaType, setEditedMediaType] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);

  // 1. 상태 추가
  const [editedFiles, setEditedFiles] = useState([]); // 새로 추가된 파일들
  const [editedMediaTypes, setEditedMediaTypes] = useState([]); // 새로 추가된 파일 타입
  const [existingMediaUrls, setExistingMediaUrls] = useState([]); // 기존 파일 URL 배열
  const [existingMediaTypes, setExistingMediaTypes] = useState([]); // 기존 파일 타입 배열

  // posts가 배열인지 확인하고, 아니면 빈 배열로 설정
  const postsArray = Array.isArray(posts) ? posts : [];
  const post = postsArray.find(p => (p._id === id || p.id === id));

  useEffect(() => {
    if (post) {
      setExistingMediaUrls(post.mediaUrls || (post.mediaUrl ? [post.mediaUrl] : []));
      setExistingMediaTypes(post.mediaTypes || (post.mediaType ? [post.mediaType] : []));
    }
  }, [post]);

  if (!post) {
    return (
      <ErrorContainer>
        <h2>게시글을 찾을 수 없습니다.</h2>
        <Button onClick={() => navigate('/board')}>게시판으로 돌아가기</Button>
      </ErrorContainer>
    );
  }

  const savedTokens = JSON.parse(localStorage.getItem('postTokens') || '{}');
  const postKey = post.id || post._id;
  const isAuthor = post.hiddenUserId === userId;

  const handleEdit = () => {
    setEditedTitle(post.title);
    setEditedContent(post.content);
    setEditedCategory(post.category);
    setEditedIsAnonymous(post.author === '익명');
    setEditedAuthor(post.author === '익명' ? '' : post.author);
    setEditedFile(null);
    setEditedMediaType(post.mediaType || 'none');
    setIsEditing(true);
  };

  // 2. 파일 추가 핸들러
  const handleEditFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = [];
    const newTypes = [];
    for (const file of selectedFiles) {
      // 중복 체크: 기존 파일과 새 파일 모두에서 중복 방지
      const isDuplicate = editedFiles.some(f => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified)
        || existingMediaUrls.some((url, idx) => url.endsWith(file.name) && existingMediaTypes[idx] === (file.type.startsWith('video/') ? 'video' : 'image'));
      if (isDuplicate) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
      newFiles.push(file);
      newTypes.push(file.type.startsWith('video/') ? 'video' : 'image');
    }
    setEditedFiles(prev => [...prev, ...newFiles]);
    setEditedMediaTypes(prev => [...prev, ...newTypes]);
    e.target.value = '';
  };

  // 3. 파일 삭제 핸들러
  const handleRemoveExistingFile = (idx) => {
    setExistingMediaUrls(urls => urls.filter((_, i) => i !== idx));
    setExistingMediaTypes(types => types.filter((_, i) => i !== idx));
  };
  const handleRemoveEditedFile = (idx) => {
    setEditedFiles(files => files.filter((_, i) => i !== idx));
    setEditedMediaTypes(types => types.filter((_, i) => i !== idx));
  };

  // 4. 파일 순서 변경 핸들러 (기존/새 파일 모두)
  const moveExistingFile = (idx, direction) => {
    const newUrls = [...existingMediaUrls];
    const newTypes = [...existingMediaTypes];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newUrls.length) return;
    [newUrls[idx], newUrls[targetIdx]] = [newUrls[targetIdx], newUrls[idx]];
    [newTypes[idx], newTypes[targetIdx]] = [newTypes[targetIdx], newTypes[idx]];
    setExistingMediaUrls(newUrls);
    setExistingMediaTypes(newTypes);
  };
  const moveEditedFile = (idx, direction) => {
    const newFiles = [...editedFiles];
    const newTypes = [...editedMediaTypes];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newFiles.length) return;
    [newFiles[idx], newFiles[targetIdx]] = [newFiles[targetIdx], newFiles[idx]];
    [newTypes[idx], newTypes[targetIdx]] = [newTypes[targetIdx], newTypes[idx]];
    setEditedFiles(newFiles);
    setEditedMediaTypes(newTypes);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let newMediaUrls = [...existingMediaUrls];
      let newMediaTypes = [...existingMediaTypes];
      // 새 파일 업로드
      if (editedFiles.length > 0) {
        for (let i = 0; i < editedFiles.length; i++) {
          const file = editedFiles[i];
          const { fileService } = await import('../services/firebaseService');
          const fileName = `${Date.now()}-${file.name}`;
          const url = await fileService.uploadImage(file, fileName);
          newMediaUrls.push(url);
          newMediaTypes.push(editedMediaTypes[i]);
        }
      }
      const updateData = {
        title: editedTitle,
        content: editedContent,
        category: editedCategory,
        author: editedIsAnonymous ? '익명' : editedAuthor,
        mediaUrls: newMediaUrls,
        mediaTypes: newMediaTypes
      };
      await onEdit(post.id || post._id, updateData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing post:', error);
      alert('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        await onDelete(post.id || post._id);
        navigate('/board');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const isAnonymous = commentMode === 'anonymous';
    const author = isAnonymous ? '익명' : (commentName.trim() || userId);
    
    console.log('댓글 작성 시도:', {
      postId: post.id || post._id,
      commentData: {
        content: comment,
        author,
        userId,
        isAnonymous
      }
    });
    
    try {
      await onAddComment(post.id || post._id, {
        content: comment,
        author,
        userId,
        isAnonymous
      });
      setComment('');
      setCommentMode('anonymous');
      setCommentName('');
      console.log('댓글 작성 완료');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleEditCommentSubmit = async (e, comment) => {
    e.preventDefault();
    if (!editingCommentContent.trim()) return;
    try {
      await onEditComment(post.id || post._id, comment.id, {
        content: editingCommentContent,
        author: comment.author,
        isAnonymous: comment.isAnonymous,
        userId: comment.userId
      });
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch (error) {
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (comment) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await onDeleteComment(post.id || post._id, comment.id);
      setEditingCommentId(null);
      setEditingCommentContent('');
    } catch (error) {
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const BACKEND_URL = "https://science-club-forum.onrender.com";
  function getFullMediaUrl(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    // 상대경로면 백엔드 도메인 붙이기
    return BACKEND_URL + url;
  }

  const handleImageDownload = async () => {
    try {
      const response = await fetch(getFullMediaUrl(post.mediaUrl), { mode: 'cors', cache: 'no-store' });
      if (!response.ok) throw new Error('이미지 응답 오류');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      // 파일명에서 특수문자 제거 및 확장자 추가
      a.href = url;
      a.download = (post.title ? post.title.replace(/[\\/:*?"<>|]/g, '') : 'image') + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e) {
      alert('이미지 저장에 실패했습니다.');
    }
  };

  const handleImageShare = async () => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.canShare && window.File && navigator.canShare({ files: [new File([], '')] })) {
      // 모바일에서 파일 공유
      try {
        const response = await fetch(getFullMediaUrl(post.mediaUrl), { mode: 'cors', cache: 'no-store' });
        if (!response.ok) throw new Error('이미지 응답 오류');
        const blob = await response.blob();
        const file = new File([blob], (post.title ? post.title.replace(/[\\/:*?"<>|]/g, '') : 'image') + '.png', { type: blob.type });
        await navigator.share({
          files: [file],
          title: post.title,
          text: '이미지 공유',
        });
        return;
      } catch (e) {
        alert('이미지 공유에 실패했습니다.');
        return;
      }
    }
    // 데스크탑: 바로 링크 복사
    try {
      await navigator.clipboard.writeText(getFullMediaUrl(post.mediaUrl));
      alert('이미지 링크가 복사되었습니다! 원하는 곳에 붙여넣기 하세요.');
    } catch (e) {
      alert('공유/복사에 실패했습니다.');
    }
  };

  const handleCopyLink = async () => {
    const url = getFullMediaUrl(post.mediaUrl);
    const html = `<a href="${url}" target="_blank">${url}</a>`;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([html], { type: 'text/html' });
        await navigator.clipboard.write([new window.ClipboardItem({ 'text/html': blob })]);
        alert('하이퍼링크가 복사되었습니다! 붙여넣을 때 지원되는 앱/웹에서는 클릭 가능한 링크로 보입니다.');
      } else {
        await navigator.clipboard.writeText(url);
        alert('이미지 링크가 복사되었습니다! 원하는 곳에 붙여넣기 하세요.');
      }
    } catch (e) {
      alert('공유/복사에 실패했습니다.');
    }
  };

  const categoryMap = {
    notice: '공지',
    intro: '0. 탐구입문',
    design: '1. 탐구 설계・자료 추천',
    trial: '2. 연구 중 시행착오 나눔',
    result: '3. 이상한 결과・결론 도출 질문',
    feedback: '4. 탐구 피드백・보완 제안',
    humanities: '5. 인문 계열 지식 토론',
    science: '6. 자연 계열 지식 토론',
    fusion: '7. 융합형 토론・모델 제안',
  };

  return (
    <DetailContainer>
      {isEditing ? (
        <EditForm onSubmit={handleEditSubmit}>
          <FormGroup>
            <Label>제목 *</Label>
            <Input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="제목"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>카테고리 *</Label>
            <Select 
              value={editedCategory} 
              onChange={(e) => setEditedCategory(e.target.value)}
              required
            >
              <option value="">카테고리 선택</option>
              <option value="notice">공지</option>
              <option value="intro">0. 탐구입문</option>
              <option value="design">1. 탐구 설계・자료 추천</option>
              <option value="trial">2. 연구 중 시행착오 나눔</option>
              <option value="result">3. 이상한 결과・결론 도출 질문</option>
              <option value="feedback">4. 탐구 피드백・보완 제안</option>
              <option value="humanities">5. 인문 계열 지식 토론</option>
              <option value="science">6. 자연 계열 지식 토론</option>
              <option value="fusion">7. 융합형 토론・모델 제안</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>내용 *</Label>
            <TextArea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="내용"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>작성자</Label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label>
                <input 
                  type="radio" 
                  checked={editedIsAnonymous} 
                  onChange={() => setEditedIsAnonymous(true)} 
                /> 익명
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="radio" 
                  checked={!editedIsAnonymous} 
                  onChange={() => setEditedIsAnonymous(false)} 
                /> 이름
                <input
                  type="text"
                  value={editedAuthor}
                  onChange={e => setEditedAuthor(e.target.value)}
                  placeholder="이름 입력"
                  disabled={editedIsAnonymous}
                  style={{ width: 120, padding: '0.3rem', borderRadius: 4, border: '1px solid #ccc' }}
                />
              </label>
            </div>
          </FormGroup>

          <FormGroup>
            <Label>파일 첨부</Label>
            <Input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleEditFileChange}
              style={{ fontSize: '16px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              📱 모바일에서는 카메라로 직접 촬영하거나 갤러리에서 선택할 수 있습니다
            </div>
            {/* 기존 파일 미리보기 */}
            {existingMediaUrls.length > 0 && (
              <PreviewContainer>
                {existingMediaUrls.map((url, idx) => (
                  <div key={url + idx} style={{ marginBottom: 8 }}>
                    {existingMediaTypes[idx] === 'image' ? (
                      <Media src={getFullMediaUrl(url)} alt="첨부 이미지" style={{ maxWidth: '100%', borderRadius: 4 }} />
                    ) : (
                      <Video src={getFullMediaUrl(url)} controls style={{ maxWidth: '100%', borderRadius: 4 }} />
                    )}
                    <FileInfo>
                      기존 파일 | <a href={getFullMediaUrl(url)} target="_blank" rel="noopener noreferrer">{url.split('/').pop()}</a>
                      <button type="button" onClick={() => handleRemoveExistingFile(idx)} style={{ marginLeft: 8, color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
                      <button type="button" onClick={() => moveExistingFile(idx, -1)} disabled={idx === 0} style={{ marginLeft: 8 }}>▲</button>
                      <button type="button" onClick={() => moveExistingFile(idx, 1)} disabled={idx === existingMediaUrls.length - 1}>▼</button>
                    </FileInfo>
                  </div>
                ))}
              </PreviewContainer>
            )}
            {/* 새 파일 미리보기 */}
            {editedFiles.length > 0 && (
              <PreviewContainer>
                {editedFiles.map((file, idx) => (
                  <div key={file.name + idx} style={{ marginBottom: 8 }}>
                    {editedMediaTypes[idx] === 'image' ? (
                      <Media src={URL.createObjectURL(file)} alt="미리보기" />
                    ) : (
                      <Video src={URL.createObjectURL(file)} controls />
                    )}
                    <FileInfo>
                      새 파일: {file.name} | 크기: {(file.size / (1024 * 1024)).toFixed(2)}MB
                      <button type="button" onClick={() => handleRemoveEditedFile(idx)} style={{ marginLeft: 8, color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer' }}>삭제</button>
                      <button type="button" onClick={() => moveEditedFile(idx, -1)} disabled={idx === 0} style={{ marginLeft: 8 }}>▲</button>
                      <button type="button" onClick={() => moveEditedFile(idx, 1)} disabled={idx === editedFiles.length - 1}>▼</button>
                    </FileInfo>
                  </div>
                ))}
              </PreviewContainer>
            )}
          </FormGroup>

          <ButtonGroup>
            <Button type="submit">수정 완료</Button>
            <Button type="button" onClick={() => setIsEditing(false)}>
              취소
            </Button>
          </ButtonGroup>
        </EditForm>
      ) : (
        <>
          <PostHeader>
            <HeaderLeft>
              <Title>{post.title}</Title>
              {post.isPinned && <PinIcon>📌</PinIcon>}
            </HeaderLeft>
            <HeaderRight>
              {isAdmin && (
                <PinButton onClick={() => onTogglePin(post.id || post._id)}>
                  {post.isPinned ? '📌 고정 해제' : '📌 고정'}
                </PinButton>
              )}
              {(isAuthor || isAdmin) && (
                <ButtonGroup>
                  {isAuthor && <Button onClick={handleEdit}>수정</Button>}
                  <Button onClick={handleDelete}>
                    {isAdmin ? '관리자 삭제' : '삭제'}
                  </Button>
                </ButtonGroup>
              )}
            </HeaderRight>
          </PostHeader>

          <Content>{post.content}</Content>

          {post.link && (
            <div style={{ marginBottom: '1rem' }}>
              <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', wordBreak: 'break-all' }}>
                {post.link}
              </a>
            </div>
          )}

          {post.mediaUrl && (
            <MediaContainer>
              {post.mediaType === 'image' ? (
                <>
                  <Media
                    src={getFullMediaUrl(post.mediaUrl)}
                    alt="첨부 이미지"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowImagePreview(true)}
                  />
                  {showImagePreview && (
                    <ImagePreviewOverlay onClick={() => setShowImagePreview(false)}>
                      <PreviewImg src={getFullMediaUrl(post.mediaUrl)} alt="첨부 이미지 원본" onClick={e => e.stopPropagation()} />
                      <PreviewButtonRow>
                        <PreviewButton type="button" onClick={handleImageDownload}>
                          이미지 저장
                        </PreviewButton>
                        <PreviewButton
                          type="button"
                          onClick={handleImageShare}
                        >
                          공유하기
                        </PreviewButton>
                      </PreviewButtonRow>
                    </ImagePreviewOverlay>
                  )}
                </>
              ) : post.mediaType === 'video' ? (
                <Video src={post.mediaUrl} controls />
              ) : null}
            </MediaContainer>
          )}

          <LikeButton
            onClick={() => onLike(post.id || post._id, userId)}
            $liked={likedPosts.includes(post.id || post._id)}
          >
            {likedPosts.includes(post.id || post._id) ? '❤️' : '🤍'} 좋아요
          </LikeButton>

          <CommentSection>
            <h3>댓글</h3>
            <CommentForm onSubmit={handleCommentSubmit}>
              <TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 입력하세요"
                required
              />
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label>
                  <input
                    type="radio"
                    name="commentMode"
                    value="anonymous"
                    checked={commentMode === 'anonymous'}
                    onChange={() => setCommentMode('anonymous')}
                  /> 익명
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    name="commentMode"
                    value="name"
                    checked={commentMode === 'name'}
                    onChange={() => setCommentMode('name')}
                  /> 이름
                  <input
                    type="text"
                    value={commentName}
                    onChange={e => setCommentName(e.target.value)}
                    placeholder="이름 입력"
                    disabled={commentMode !== 'name'}
                    style={{ width: 100, padding: '0.3rem', borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </label>
                <Button type="submit">댓글 작성</Button>
              </div>
            </CommentForm>

            <CommentList>
              {(post.comments || []).map((comment, index) => (
                <Comment key={comment.id || index}>
                  <CommentHeader>
                    <span>{comment.author}</span>
                    <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}</span>
                  </CommentHeader>
                  {editingCommentId === comment.id ? (
                    <form onSubmit={e => handleEditCommentSubmit(e, comment)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <TextArea
                        value={editingCommentContent}
                        onChange={e => setEditingCommentContent(e.target.value)}
                        style={{ minHeight: 60, flex: 1 }}
                        required
                      />
                      <Button type="submit">수정 완료</Button>
                      <Button type="button" onClick={() => setEditingCommentId(null)}>취소</Button>
                    </form>
                  ) : (
                    <>
                      <CommentContent>{comment.content}</CommentContent>
                      {(comment.userId === userId || isAdmin) && (
                        <ButtonGroup>
                          {comment.userId === userId && (
                            <Button type="button" onClick={() => handleEditComment(comment)}>수정</Button>
                          )}
                          <Button type="button" onClick={() => handleDeleteComment(comment)}>
                            {isAdmin ? '관리자 삭제' : '삭제'}
                          </Button>
                        </ButtonGroup>
                      )}
                    </>
                  )}
                </Comment>
              ))}
            </CommentList>
          </CommentSection>
        </>
      )}
    </DetailContainer>
  );
};

const DetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PostHeader = styled.header`
  margin-bottom: 2rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PinIcon = styled.span`
  font-size: 1.2rem;
  color: #1976d2;
`;

const PinButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: #1976d2;
  border: 1px solid #1976d2;

  &:hover {
    background-color: #e3f2fd;
  }
`;

const Title = styled.h1`
  color: #1976d2;
  margin-bottom: 1rem;
`;

const PostInfo = styled.div`
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const Content = styled.div`
  line-height: 1.6;
  margin-bottom: 2rem;
  white-space: pre-wrap;
`;

const MediaContainer = styled.div`
  margin: 2rem 0;
`;

const Media = styled.img`
  max-width: 100%;
  border-radius: 4px;
`;

const Video = styled.video`
  max-width: 100%;
  border-radius: 4px;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: ${props => props.$liked ? 'red' : 'gray'};
  &:hover {
    background-color: #f5f5f5;
  }
`;

const CommentSection = styled.section`
  margin-top: 3rem;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Comment = styled.div`
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 4px;
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const CommentContent = styled.div`
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &[type="submit"] {
    background-color: #1976d2;
    color: white;

    &:hover {
      background-color: #1565c0;
    }
  }

  &[type="button"] {
    background-color: #e0e0e0;
    color: #333;

    &:hover {
      background-color: #d5d5d5;
    }
  }
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 300px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ImagePreviewOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const PreviewImg = styled.img`
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
`;

const PreviewButtonRow = styled.div`
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
`;

const PreviewButton = styled.button`
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  background: #1976d2;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #1565c0; }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

export default PostDetail; 