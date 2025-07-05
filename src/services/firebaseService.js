import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase';

// 게시글 관련 서비스
export const postService = {
  // 모든 게시글 가져오기
  async getAllPosts() {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('게시글 가져오기 오류:', error);
      throw error;
    }
  },

  // 카테고리별 게시글 가져오기
  async getPostsByCategory(category) {
    try {
      const q = query(
        collection(db, 'posts'), 
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('카테고리별 게시글 가져오기 오류:', error);
      throw error;
    }
  },

  // 게시글 작성
  async createPost(postData) {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        createdAt: serverTimestamp(),
        likes: 0,
        likedUsers: [],
        comments: []
      });
      return docRef.id;
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      throw error;
    }
  },

  // 게시글 수정
  async updatePost(postId, updateData) {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      throw error;
    }
  },

  // 게시글 삭제
  async deletePost(postId) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      throw error;
    }
  },

  // 좋아요 토글
  async toggleLike(postId, userId) {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      const postData = postDoc.data();
      const likedUsers = postData.likedUsers || [];
      const isLiked = likedUsers.includes(userId);

      if (isLiked) {
        // 좋아요 취소
        await updateDoc(postRef, {
          likes: postData.likes - 1,
          likedUsers: arrayRemove(userId)
        });
      } else {
        // 좋아요 추가
        await updateDoc(postRef, {
          likes: postData.likes + 1,
          likedUsers: arrayUnion(userId)
        });
      }

      return !isLiked;
    } catch (error) {
      console.error('좋아요 토글 오류:', error);
      throw error;
    }
  }
};

// 댓글 관련 서비스
export const commentService = {
  // 댓글 추가
  async addComment(postId, commentData) {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      const postData = postDoc.data();
      const comments = postData.comments || [];
      const newComment = {
        id: Date.now().toString(),
        ...commentData,
        createdAt: new Date().toISOString() // serverTimestamp 대신 일반 시간 사용
      };

      comments.push(newComment);

      await updateDoc(postRef, {
        comments: comments
      });

      console.log('댓글 추가 성공:', newComment); // 디버깅용 로그
      return newComment;
    } catch (error) {
      console.error('댓글 추가 오류:', error);
      throw error;
    }
  },

  // 댓글 수정
  async updateComment(postId, commentId, updateData) {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      const postData = postDoc.data();
      const comments = postData.comments || [];
      const updatedComments = comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, ...updateData, updatedAt: serverTimestamp() }
          : comment
      );

      await updateDoc(postRef, { comments: updatedComments });
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      throw error;
    }
  },

  // 댓글 삭제
  async deleteComment(postId, commentId) {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('게시글을 찾을 수 없습니다.');
      }

      const postData = postDoc.data();
      const comments = postData.comments || [];
      const updatedComments = comments.filter(comment => comment.id !== commentId);

      await updateDoc(postRef, { comments: updatedComments });
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      throw error;
    }
  }
};

// 파일 업로드 서비스
export const fileService = {
  // 이미지 업로드
  async uploadImage(file, fileName) {
    try {
      const storageRef = ref(storage, `images/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      throw error;
    }
  },

  // 파일 삭제
  async deleteFile(fileUrl) {
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('파일 삭제 오류:', error);
      throw error;
    }
  }
};

// 사용자 관련 서비스
export const userService = {
  // 사용자 정보 가져오기
  async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      throw error;
    }
  },

  // 사용자 정보 업데이트
  async updateUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('사용자 정보 업데이트 오류:', error);
      throw error;
    }
  },

  // 사용자 생성
  async createUser(userId, userData) {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      throw error;
    }
  }
}; 