import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const My = ({ posts, likedPosts, userId }) => {
  const navigate = useNavigate();
  // 내가 쓴 글: author가 userId이거나, token이 내 토큰과 일치하는 글도 포함
  const savedTokens = JSON.parse(localStorage.getItem('postTokens') || '{}');
  const myPosts = posts.filter(post => post.hiddenUserId === userId);
  // 내가 좋아요한 글: 각 글의 likedUsers에 내 userId가 포함되어 있는지로 판별
  const likedPostsList = posts.filter(post => Array.isArray(post.likedUsers) && post.likedUsers.includes(userId));
  // 내가 쓴 댓글 모으기
  const myComments = [];
  posts.forEach(post => {
    (post.comments || []).forEach(comment => {
      if (comment.userId === userId) {
        myComments.push({
          ...comment,
          postId: post.id || post._id,
          postTitle: post.title,
          postCategory: post.category,
        });
      }
    });
  });

  return (
    <MyContainer>
      <h2>My Posts</h2>
      {myPosts.length === 0 ? <p>No posts yet.</p> : (
        <PostList>
          {myPosts.map(post => (
            <PostItem key={post.id || post._id} onClick={() => navigate(`/post/${post.id || post._id}`)}>
              <strong>{post.title}</strong>
              <span style={{ color: '#888', marginLeft: 8 }}>{post.category}</span>
            </PostItem>
          ))}
        </PostList>
      )}
      <h2 style={{ marginTop: 32 }}>Liked Posts</h2>
      {likedPostsList.length === 0 ? <p>No liked posts yet.</p> : (
        <PostList>
          {likedPostsList.map(post => (
            <PostItem key={post.id || post._id} onClick={() => navigate(`/post/${post.id || post._id}`)}>
              <strong>{post.title}</strong>
              <span style={{ color: '#888', marginLeft: 8 }}>{post.category}</span>
            </PostItem>
          ))}
        </PostList>
      )}
      <h2 style={{ marginTop: 32 }}>My Comments</h2>
      {myComments.length === 0 ? <p>No comments yet.</p> : (
        <PostList>
          {myComments.map((comment, idx) => (
            <PostItem key={idx} onClick={() => navigate(`/post/${comment.postId}`)}>
              <div>
                <strong>{comment.content}</strong>
              </div>
              <div style={{ color: '#888', fontSize: '0.95em', marginTop: 4 }}>
                On: {comment.postTitle} <span style={{ marginLeft: 8 }}>{comment.postCategory}</span>
              </div>
              <div style={{ color: '#aaa', fontSize: '0.85em', marginTop: 2 }}>
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
              </div>
            </PostItem>
          ))}
        </PostList>
      )}
    </MyContainer>
  );
};

const MyContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PostItem = styled.div`
  padding: 1rem;
  border-radius: 6px;
  background: #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #e3f2fd;
  }
`;

export default My; 