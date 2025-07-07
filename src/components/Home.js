import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Home = ({ posts }) => {
  const navigate = useNavigate();

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
  
  // 고정된 게시물을 먼저 표시하고, 나머지 공간에 일반 게시물을 채움
  const recentPosts = [...sortedPinnedPosts, ...sortedNormalPosts].slice(0, 5);

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
    <HomeContainer>
      <HeroSection>
        <h1>수학과학 동아리 포럼</h1>
        <p>수학과 과학에 대한 다양한 주제를 나누고 토론하는 공간입니다.</p>
        <TutorialButton onClick={() => navigate('/tutorial')}>
          🎓 튜토리얼 보기
        </TutorialButton>
      </HeroSection>

      <Section>
        <h2>최근 게시글</h2>
        <PostList>
          {recentPosts.map(post => (
            <PostItem key={post.id || post._id} onClick={() => navigate(`/post/${post.id || post._id}`)} $isPinned={post.isPinned}>
              <PostHeader>
                <HeaderLeft>
                  <CategoryTag>{categoryMap[post.category] || post.category}</CategoryTag>
                  {post.isPinned && <PinIcon>📌</PinIcon>}
                  <Title>{post.title}</Title>
                </HeaderLeft>
              </PostHeader>
              <PostContent>
                <p>{(post.content || '').substring(0, 100)}...</p>
              </PostContent>
              <PostMeta>
                <span>작성자: {post.author}</span>
                <span>좋아요: {post.likes}</span>
                <span>댓글: {(post.comments || []).length}</span>
              </PostMeta>
            </PostItem>
          ))}
        </PostList>
      </Section>

      <Section>
        <h2>카테고리</h2>
        <CategoryGrid>
          <CategoryCard onClick={() => navigate('/board?category=notice')}>
            <h3>공지</h3>
          </CategoryCard>
          <CategoryCard onClick={() => navigate('/board?category=intro')}>
            <h3>0. 탐구입문</h3>
          </CategoryCard>
          <CategoryCard onClick={() => navigate('/board?category=design')}>
            <h3>1. 탐구 설계・자료 추천</h3>
          </CategoryCard>
          <CategoryCard onClick={() => navigate('/board?category=trial')}>
            <h3>2. 연구 중 시행착오 나눔</h3>
          </CategoryCard>
          <CategoryCard onClick={() => navigate('/board?category=result')}>
            <h3>3. 이상한 결과・결론 도출 질문</h3>
          </CategoryCard>
          <CategoryCard onClick={() => navigate('/board?category=feedback')}>
            <h3>4. 탐구 피드백・보완 제안</h3>
          </CategoryCard>
          <CategoryCard onClick={() => navigate('/board?category=humanities')}>
            <h3>5. 인문 계열 지식 토론</h3>
          </CategoryCard>
          <CategoryCard onClick={() => navigate('/board?category=science')}>
            <h3>6. 자연 계열 지식 토론</h3>
          </CategoryCard>
          <CategoryCard onClick={() => navigate('/board?category=fusion')}>
            <h3>7. 융합형 토론・모델 제안</h3>
          </CategoryCard>
        </CategoryGrid>
      </Section>
    </HomeContainer>
  );
};

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const HeroSection = styled.section`
  text-align: center;
  padding: 4rem 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  h1 {
    font-size: 2.5rem;
    color: #1976d2;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: #666;
  }
`;

const Section = styled.section`
  h2 {
    font-size: 1.8rem;
    color: #333;
    margin-bottom: 1.5rem;
  }
`;

const PostList = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const PostItem = styled.article`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;
  border-left: 4px solid ${props => props.$isPinned ? '#1976d2' : 'transparent'};
  ${props => props.$isPinned && `
    background: #f8f9fa;
  `}

  &:hover {
    transform: translateY(-2px);
  }
`;

const PostHeader = styled.header`
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

const CategoryTag = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const Title = styled.h3`
  color: #333;
  margin-bottom: 0.5rem;
`;

const PostContent = styled.div`
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const PostMeta = styled.div`
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const CategoryCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    color: #1976d2;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
  }
`;

const TutorialButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 2rem;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

export default Home; 