import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Tutorial = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "수학과학 동아리 포럼에 오신 것을 환영합니다!",
      content: "이 튜토리얼을 통해 포럼의 주요 기능과 사용법을 알아보겠습니다.",
      image: "🏠",
      action: "다음"
    },
    {
      title: "홈 화면",
      content: "홈에서는 최근 게시글과 카테고리를 한눈에 볼 수 있습니다. \n최근 5개의 게시글이 표시되며, \n각 카테고리별로 게시글을 찾아볼 수 있습니다.",
      image: "📋",
      action: "다음"
    },
    {
      title: "게시판",
      content: "게시판에서는 모든 게시글을 \n카테고리별로 필터링하여 볼 수 있습니다.\n 물리, 화학, 생물, 지구과학, 수학 카테고리가 있습니다.",
      image: "📚",
      action: "다음"
    },
    {
      title: "게시글 작성",
      content: "Write 메뉴에서 새로운 게시글을 작성할 수 있습니다.\n 익명/실명 선택이 가능하며 \n제목, 내용, 카테고리를 선택하고 게시할 수 있습니다.",
      image: "✍️",
      action: "다음"
    },
    {
      title: "게시글 상세보기",
      content: "게시글을 클릭하면 상세 내용을 볼 수 있습니다.\n 좋아요, 댓글 작성이 가능하며\n 자신의 글과 댓글에 한해 수정, 삭제 기능을 사용할 수 있습니다.",
      image: "👁️",
      action: "다음"
    },
    {
      title: "마이 페이지",
      content: "내가 작성한 게시글, 댓글과 좋아요한 게시글을 확인할 수 있습니다. 개인 활동 내역을 한눈에 볼 수 있는 공간입니다.",
      image: "👤",
      action: "다음"
    },
    {
      title: "프로필 페이지",
      content: "프로필 페이지에서는 내 정보를 관리할 수 있습니다. \n로그인에 필요한 사용자ID를 언제든지 확인, 수정할 수 있으며 \n더 강한 보안을 위해 선택적으로 비밀번호를 설정할 수 있습니다.",
      image: "⚙️",
      action: "다음"
    },
    {
      title: "관리자 계정",
      content: "관리자는 게시글과 댓글을 관리할 수 있으며, \n관리자 패널에서 비밀번호를 변경할 수 있습니다. \n일반 사용자는 관리자 권한이 없으며,\n 관리자는 자신의 관리자 비밀번호만 볼 수 있습니다.",
      image: "🛡️",
      action: "다음"
    },
    {
      title: "주의사항",
      content: "작성한 댓글과 게시글이 뜨지 않거나 삭제 후 글이 여전히 남아있다면 해당 페이지를 새로고침해주세요. \n새로고침 후에도 문제가 지속되면 잠시 후 다시 시도해보세요.",
      image: "⚠️",
      action: "다음"
    },
    {
      title: "포럼 이용 규칙",
      content: "1. 서로를 존중하는 마음으로 토론해주세요\n2. 경청하는 문화 형성을 위해 타인의 글에 대한 반박문 작성 시\n 상대방의 글을 먼저 요약해주세요\n3. 부적절한 내용은 관리자에 의해 삭제될 수 있습니다\n4. 건설적인 토론 문화를 만들어주세요",
      image: "📜",
      action: "다음"
    },
    {
      title: "튜토리얼 완료!",
      content: "이제 포럼을 자유롭게 이용하실 수 있습니다.\n 궁금한 점이 있으면 언제든지 튜토리얼을 다시 확인해보세요!",
      image: "🎉",
      action: "홈으로 이동"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <TutorialContainer>
      <TutorialCard>
        <ProgressBar>
          <ProgressFill progress={(currentStep + 1) / tutorialSteps.length * 100} />
        </ProgressBar>
        
        <TutorialContent>
          <TutorialIcon>{currentTutorial.image}</TutorialIcon>
          <TutorialTitle>{currentTutorial.title}</TutorialTitle>
          <TutorialText>{currentTutorial.content}</TutorialText>
        </TutorialContent>

        <TutorialActions>
          <PreviousButton onClick={handlePrevious} disabled={currentStep === 0}>
            이전
          </PreviousButton>
          <NextButton onClick={handleNext}>
            {currentTutorial.action}
          </NextButton>
        </TutorialActions>

        <StepIndicator>
          {tutorialSteps.map((_, index) => (
            <StepDot 
              key={index} 
              active={index === currentStep}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </StepIndicator>
      </TutorialCard>
    </TutorialContainer>
  );
};

const TutorialContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const TutorialCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  max-width: 600px;
  width: 100%;
  position: relative;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

const TutorialContent = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const TutorialIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const TutorialTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const TutorialText = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
  white-space: pre-line;
`;

const TutorialActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const PreviousButton = styled.button`
  background: none;
  border: 2px solid #ddd;
  color: #666;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #999;
    color: #333;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NextButton = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const StepDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#667eea' : '#ddd'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#667eea' : '#bbb'};
  }
`;

export default Tutorial; 