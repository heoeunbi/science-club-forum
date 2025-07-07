import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Board = ({ posts, likedPosts, onLike, onAddComment, userId, fetchPosts, onTogglePin, isAdmin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCategory = params.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  // 댓글 입력값, 익명/이름 선택, 이름 입력값을 post별로 관리
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: { text, mode, name } }
  const POSTS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState(1);

  // 이미지 URL에 백엔드 도메인 추가하는 함수
  const getFullMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return '';
    if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
      return mediaUrl; // Firebase Storage URL은 그대로 사용
    }
    // 백엔드 URL을 환경변수에서 가져오거나 기본값 사용
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://science-club-forum.onrender.com';
    return `${backendUrl}${mediaUrl}`;
  };

  // refresh=1 쿼리스트링이 있으면 fetchPosts 실행 후 쿼리스트링 제거
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('refresh') === '1' && fetchPosts) {
      fetchPosts();
      params.delete('refresh');
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location.search, fetchPosts, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category') || 'all';
    setSelectedCategory(category);
    setCurrentPage(1); // 카테고리 바뀌면 1페이지로
  }, [location.search]);

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // posts가 배열인지 확인하고, 아니면 빈 배열로 설정
  const postsArray = Array.isArray(posts) ? posts : [];
  
  // 고정된 게시물과 일반 게시물을 분리
  const pinnedPosts = postsArray.filter(post => post.isPinned);
  const normalPosts = postsArray.filter(post => !post.isPinned);
  
  // 고정된 게시물은 pinnedAt 기준으로 정렬, 일반 게시물은 createdAt 기준으로 정렬
  const sortedPinnedPosts = pinnedPosts.sort((a, b) => {
    const aTime = a.pinnedAt?.toDate?.() || new Date(a.pinnedAt) || new Date(0);
    const bTime = b.pinnedAt?.toDate?.() || new Date(b.pinnedAt) || new Date(0);
    return bTime - aTime;
  });
  
  const sortedNormalPosts = normalPosts.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
    return bTime - aTime;
  });
  
  // 카테고리 필터링
  const filteredPinnedPosts = selectedCategory === 'all'
    ? sortedPinnedPosts
    : sortedPinnedPosts.filter(post => post.category === selectedCategory);
    
  const filteredNormalPosts = selectedCategory === 'all'
    ? sortedNormalPosts
    : sortedNormalPosts.filter(post => post.category === selectedCategory);

  // 페이지네이션 적용 (고정된 게시물은 항상 표시, 일반 게시물만 페이지네이션)
  const totalNormalPosts = filteredNormalPosts.length;
  const totalPages = Math.ceil(totalNormalPosts / POSTS_PER_PAGE);
  const paginatedNormalPosts = filteredNormalPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
  
  // 최종 표시할 게시물 목록 (고정된 게시물 + 페이지네이션된 일반 게시물)
  const displayPosts = [...filteredPinnedPosts, ...paginatedNormalPosts];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || { text: '', mode: 'anonymous', name: '' }),
        text: value
      }
    }));
  };

  const handleCommentModeChange = (postId, mode) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || { text: '', mode: 'anonymous', name: '' }),
        mode
      }
    }));
  };

  const handleCommentNameChange = (postId, value) => {
    setCommentInputs(prev => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || { text: '', mode: 'anonymous', name: '' }),
        name: value
      }
    }));
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const input = commentInputs[postId] || { text: '', mode: 'anonymous', name: '' };
    if (!input.text.trim()) return;
    const isAnonymous = input.mode === 'anonymous';
    const author = isAnonymous ? '익명' : (input.name.trim() || userId);
    try {
      await onAddComment(postId, {
        content: input.text,
        author,
        userId,
        isAnonymous
      });
      setCommentInputs(prev => ({ ...prev, [postId]: { text: '', mode: 'anonymous', name: '' } }));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
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
    <BoardContainer>
      <h1>게시판</h1>
      
      <CategoryFilter>
        <Select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="all">전체</option>
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
      </CategoryFilter>

      <PostList>
        {displayPosts.map(post => (
          <PostItem key={post.id || post._id} $isPinned={post.isPinned}>
            <PostHeader>
              <HeaderLeft>
              <CategoryTag>{categoryMap[post.category] || post.category}</CategoryTag>
                {post.isPinned && <PinIcon>📌</PinIcon>}
              <Title onClick={() => handlePostClick(post.id || post._id)}>{post.title}</Title>
              </HeaderLeft>
              {isAdmin && (
                <PinButton onClick={() => onTogglePin(post.id || post._id)}>
                  {post.isPinned ? '📌 고정 해제' : '📌 고정'}
                </PinButton>
              )}
            </PostHeader>

            <PostContent>
              <p>{(post.content || '').substring(0, 200)}...</p>
              {post.mediaUrl && (
                <MediaPreview>
                  {post.mediaType === 'image' ? (
                    <img src={getFullMediaUrl(post.mediaUrl)} alt="Post media" />
                  ) : post.mediaType === 'video' ? (
                    <video src={getFullMediaUrl(post.mediaUrl)} controls />
                  ) : null}
                </MediaPreview>
              )}
            </PostContent>

            <PostFooter>
              <PostMeta>
                <span>작성자: {post.author}</span>
                <span>좋아요: {post.likes}</span>
                <span>댓글: {post.comments ? post.comments.length : 0}</span>
              </PostMeta>

              <LikeButton
                $liked={likedPosts.includes(post.id || post._id)}
                onClick={() => onLike(post.id || post._id, userId)}
                disabled={likedPosts.includes(post.id || post._id)}
              >
                {likedPosts.includes(post.id || post._id) ? '❤️' : '🤍'}
              </LikeButton>
            </PostFooter>

            <CommentSection>
              <CommentForm onSubmit={(e) => handleCommentSubmit(e, post.id || post._id)}>
                <CommentInput
                  value={(commentInputs[post.id || post._id]?.text) || ''}
                  onChange={(e) => handleCommentInputChange(post.id || post._id, e.target.value)}
                  placeholder="댓글을 입력하세요"
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 8 }}>
                  <input
                    type="radio"
                    name={`commentMode-${post.id || post._id}`}
                    value="anonymous"
                    checked={(commentInputs[post.id || post._id]?.mode || 'anonymous') === 'anonymous'}
                    onChange={() => handleCommentModeChange(post.id || post._id, 'anonymous')}
                  /> 익명
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    name={`commentMode-${post.id || post._id}`}
                    value="name"
                    checked={(commentInputs[post.id || post._id]?.mode) === 'name'}
                    onChange={() => handleCommentModeChange(post.id || post._id, 'name')}
                  /> 이름
                  <input
                    type="text"
                    value={commentInputs[post.id || post._id]?.name || ''}
                    onChange={e => handleCommentNameChange(post.id || post._id, e.target.value)}
                    placeholder="이름 입력"
                    disabled={(commentInputs[post.id || post._id]?.mode) !== 'name'}
                    style={{ width: 100, padding: '0.3rem', borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </label>
                <CommentButton type="submit">댓글 작성</CommentButton>
              </CommentForm>

              <CommentList>
                {(post.comments || []).slice(0, 2).map((comment, index) => (
                  <Comment key={index}>
                    <CommentAuthor>{comment.author}</CommentAuthor>
                    <CommentContent>{comment.content}</CommentContent>
                  </Comment>
                ))}
                {post.comments && post.comments.length > 2 && (
                  <MoreComments onClick={() => handlePostClick(post.id || post._id)}>
                    댓글 {post.comments.length - 2}개 더 보기
                  </MoreComments>
                )}
              </CommentList>
            </CommentSection>
          </PostItem>
        ))}
      </PostList>
      <Pagination>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>이전</button>
        <span>{currentPage} / {totalPages || 1}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>다음</button>
      </Pagination>
    </BoardContainer>
  );
};

const BoardContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  h1 {
    color: #1976d2;
    margin-bottom: 2rem;
  }
`;

const CategoryFilter = styled.div`
  margin-bottom: 2rem;
`;

const Select = styled.select`
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

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PostItem = styled.article`
  background: white;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  ${props => props.$isPinned && `
    border-left: 4px solid #1976d2;
    background: #f8f9fa;
  `}
`;

const PostHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PinIcon = styled.span`
  font-size: 1.2rem;
  color: #1976d2;
`;

const PinButton = styled.button`
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover {
    background: #d0d0d0;
  }
`;

const CategoryTag = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const Title = styled.h2`
  color: #333;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #1976d2;
  }
`;

const PostContent = styled.div`
  margin-bottom: 1rem;
  line-height: 1.6;

  p {
    margin-bottom: 1rem;
  }
`;

const MediaPreview = styled.div`
  margin: 1rem 0;

  img, video {
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
  }
`;

const PostFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PostMeta = styled.div`
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const LikeButton = styled.button`
  background: ${props => props.$liked ? '#fdd835' : '#eee'};
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.2s;
  &:hover:not(:disabled) {
    background: #ffe082;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CommentSection = styled.div`
  border-top: 1px solid #eee;
  padding-top: 1rem;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

const CommentButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1565c0;
  }
`;

const CommentList = styled.div`
`;

const Comment = styled.div`
  margin-bottom: 1rem;
  padding: 0.8rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
`;

const CommentAuthor = styled.h4`
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9rem;
`;

const CommentContent = styled.p`
  color: #555;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const MoreComments = styled.button`
  background: none;
  border: none;
  color: #1976d2;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  margin-top: 0.5rem;

  &:hover {
    color: #1565c0;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 1rem;

  button {
    padding: 0.8rem 1.5rem;
    background-color: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover:not(:disabled) {
      background-color: #1565c0;
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

export default Board; 