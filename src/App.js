import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Board from './components/Board';
import PostDetail from './components/PostDetail';
import Write from './components/Write';
import Home from './components/Home';
import Login from './components/Login';
import My from './components/My';
import Tutorial from './components/Tutorial';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import { postService, commentService } from './services/firebaseService';

// Firebase 기반으로 전환 - API URL 제거

const App = () => {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  // 좋아요한 게시글 목록 계산
  const likedPosts = posts
    .filter(post => post.likedUsers && post.likedUsers.includes(userId))
    .map(post => post.id);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await postService.getAllPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleAddPost = async (newPost) => {
    try {
      await postService.createPost(newPost);
      await fetchPosts();
    } catch (error) {
      console.error('Error adding post:', error);
      throw error;
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postService.deletePost(postId);
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  };

  const handleEditPost = async (postId, updatedPost) => {
    try {
      await postService.updatePost(postId, updatedPost);
      await fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const handleLike = async (postId, userId) => {
    try {
      await postService.toggleLike(postId, userId);
      await fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId, comment) => {
    try {
      await commentService.addComment(postId, comment);
      await fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (postId, commentId, updatedFields) => {
    try {
      await commentService.updateComment(postId, commentId, updatedFields);
      await fetchPosts();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await commentService.deleteComment(postId, commentId);
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    setUserId('');
    setIsAdmin(false);
  };

  return (
    <Router>
      {userId ? (
        <AppContainer>
          <Nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/board">Board</NavLink>
            <NavLink to="/write">Write</NavLink>
            <NavLink to="/my">My</NavLink>
            <NavLink to="/profile">프로필</NavLink>
            <NavLink to="/tutorial">튜토리얼</NavLink>
            {isAdmin && (
              <>
                <AdminBadge>관리자</AdminBadge>
                <NavLink to="/admin">관리자 패널</NavLink>
              </>
            )}
            <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'white', fontWeight: 500, cursor: 'pointer' }}>로그아웃</button>
          </Nav>

          <MainContent>
            <Routes>
              <Route path="/" element={<Home posts={posts} userId={userId} />} />
              <Route 
                path="/board" 
                element={
                  <Board 
                    posts={posts} 
                    likedPosts={likedPosts}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                    userId={userId}
                    fetchPosts={fetchPosts}
                  />
                } 
              />
              <Route 
                path="/write" 
                element={
                  <Write 
                    onAddPost={handleAddPost}
                    userId={userId}
                  />
                } 
              />
              <Route 
                path="/post/:id" 
                element={
                  <PostDetail 
                    posts={posts}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    onAddComment={handleAddComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    onLike={handleLike}
                    likedPosts={likedPosts}
                    userId={userId}
                    isAdmin={isAdmin}
                  />
                } 
              />
              <Route 
                path="/my" 
                element={
                  <My posts={posts} likedPosts={likedPosts} userId={userId} />
                } 
              />
              <Route 
                path="/tutorial" 
                element={<Tutorial />} 
              />
              <Route 
                path="/admin" 
                element={<AdminPanel userId={userId} isAdmin={isAdmin} />} 
              />
              <Route 
                path="/profile" 
                element={<Profile userId={userId} isAdmin={isAdmin} setUserId={setUserId} />} 
              />
            </Routes>
          </MainContent>
        </AppContainer>
      ) : (
        <Login setUserId={setUserId} setIsAdmin={setIsAdmin} />
      )}
    </Router>
  );
};

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Nav = styled.nav`
  background-color: #1976d2;
  padding: 1rem 2rem;
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const AdminBadge = styled.span`
  background: #ff4444;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

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

  &:hover {
    transform: translateY(-2px);
  }
`;

const PostHeader = styled.header`
  margin-bottom: 1rem;
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

const PostMeta = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const PostContent = styled.p`
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const PostFooter = styled.div`
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const LikeCount = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const CommentCount = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

export default App;