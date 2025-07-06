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
      title: "왜 만들었나요?",
      content: "탐구를 하다 보면,때로는 “이게 맞나?” 싶은 아이디어를 떠올리기도 하고,\n 생각지도 못한 실패에 멈춰 서기도 하며,\n 누군가와 질문을 던지고 대화하며 사고를 정리하고 싶어질 때가 있습니다.\n 하지만 학교 안에서 연구와 탐구에 대해 \n 편하게 이야기할 수 있는 구조는 충분하지 않았습니다.\n 이 플랫폼은 그런 사고의 정리 공간, 질문의 숙성 공간이 되고자 시작되었습니다.",
      image: "💡",
      action: "다음"
    },
    {
      title: "무엇을 지향하나요?",
      content: "우리는 이 플랫폼을 ‘탐구자들의 경청 훈련장’으로 정의합니다. \n여기는 지식을 나누고 서로의 생각을 요약하고 반론하며 정제해가는 숙의 공간입니다.\n 누구나 익명으로 게시물을 작성하거나 댓글을 달 수 있으며,\n선생님들도 자유롭게 참여하실 수 있습니다. \n이 공간의 목표는 ‘정답 찾기’가 아니라, ‘더 나은 이해’입니다.",
      image: "🎯",
      action: "다음"
    },
    {
      title: "어떻게 소통하나요?",
      content: "📌 핵심 규칙: “요약 후 의견 제시”\n\n1) 댓글을 달기 전, 먼저 게시글의 핵심 내용을 한 문장으로 요약합니다.\n 예: \"네 말은 결국 '~라는 개념이 탐구에 영향을 줬다'는 의미구나.\" \n\n2) 그 다음 자신의 의견, 반론, 보완을 이어서 제시합니다.\n예: \"나는 이 구조가 다른 방식으로도 설명될 수 있다고 생각해. 예컨대…\"\n\n3) 반론은 가능하지만, 상대의 관점을 충분히 이해한 뒤에 이루어져야 합니다.\n질문, 시행착오, 실패도 모두 의미 있는 탐구의 일부로 간주됩니다.\n\n5) 지적이 아닌 제안, 정답보다 구조, 이김보다 이해를 지향합니다.",
      image: "🧩",
      action: "다음"
    },
    {
      title: "이 플랫폼이 가져올 변화",
      content: "📘 탐구의 과정에서 마주치는 질문과 실패를 나누며,\n각자의 사고를 정제해가는 ‘지식의 공동체’가 만들어집니다.\n\n🧠 타인의 생각을 요약하는 훈련을 통해,\n경청 능력과 구조적 사고력을 함께 기를 수 있습니다.\n\n🛠️ 실제 연구와 실험, 설계, 아이디어 구상에 실질적인 피드백을 주고받으며,\n탐구자의 태도를 함께 연습할 수 있습니다.\n\n🫱‍🫲 교사-학생, 학년 간, 학과 간의 벽을 허물고,\n함께 배우고 이해하는 ‘수평적 연구 공동체’를 지향합니다.",
      image: "🌱",
      action: "다음"
    },
    {
      title: "0. 탐구 입문",
      content: "🔎 관심사 탐색, 주제 발굴, 동료 탐색\n\n\"어떤 주제부터 시작해야 할지 모르겠나요?\n평소 궁금했던 점, 책에서 인상 깊었던 문장, 잘 모르지만 자꾸 떠오르는 키워드 등\n자신의 ‘탐구 출발점’을 자유롭게 나누고, 함께 할 동료도 찾아보세요.\"",
      image: "🔰",
      action: "다음"
    },
    {
      title: "1. 탐구 설계・자료 추천",
      content: "📘 연구 아이디어 구조화, 자료 공유, 참고 도서/논문 추천\n\n\"어떤 질문을 어떻게 탐구할 수 있을지 고민되시나요?\n아이디어 초안을 공유하고, 자료 추천을 요청하거나, 다른 사람의 설계를 읽으며\n탐구의 방향을 다듬어보세요.\"",
      image: "🧭",
      action: "다음"
    },
    {
      title: "2. 연구 중 시행착오 나눔",
      content: "⚠️ 예상대로 되지 않는 실험, 조사, 사고 흐름 공유\n\n\"연구 과정에서 겪은 시행착오를 함께 나눠주세요.\n실험이 반복해서 실패한다면? 논리 전개가 자꾸 막힌다면?\n문제 상황을 함께 정리하고 해결의 실마리를 찾아드립니다.\"",
      image: "🔧",
      action: "다음"
    },
    {
      title: "3. 이상한 결과・결론 도출 질문",
      content: "🤯 ‘이건 왜 이런 결과가 나왔을까?’ ‘이런 결론이 말이 될까?’ 질문 공유\n\n\"탐구가 예상치 못한 결론으로 이어졌을 때,\n그 원인을 함께 해석하거나, 결과의 의미를 재정의해보는 공간입니다.\n누군가의 이상한 결과가 새로운 질문의 출발점이 될 수 있어요.\"",
      image: "🧪",
      action: "다음"
    },
    {
      title: "4. 탐구 피드백・보완 제안",
      content: "🛠️ 설계나 결과에 대한 구조적 피드백, 보완점 제안\n\n\"다른 사람의 연구 설계, 실험 결과, 논리 전개에 대해\n잘된 점은 구체적으로 짚고, 보완할 점은 논리와 기준을 들어 제안해주세요.\n비판이 아닌 ‘구조적 이해와 보완’이 이 공간의 목표입니다.\"",
      image: "🧾",
      action: "다음"
    },
    {
      title: "5. 인문 계열 지식 토론",
      content: "🧾 철학, 언어, 역사, 사회, 문학, 심리 등 인문 주제 탐색\n\n\"사회・철학・언어・역사 등 인문학 기반의 질문이나 지식을\n토론을 통해 더 깊게 확장해봅니다.\n단순 의견 대립이 아니라, 이해 중심의 요약과 반론으로 이어지는 숙의를 지향합니다.\"",
      image: "🧠",
      action: "다음"
    },
    {
      title: "6. 자연 계열 지식 토론",
      content: "🔭 수학, 물리, 화학, 생명, 지구과학 등 탐구 토론\n\n\"자연과학에서의 개념, 실험, 이론, 구조에 대한 질문을 나누는 공간입니다.\n수식 구조, 개념 해석, 실험 조건 등에 대해 함께 정제해갑니다.\"",
      image: "🔬",
      action: "다음"
    },
    {
      title: "7. 융합형 토론・모델 제안",
      content: "🧬 사회+과학, 수학+철학, 인문+생명 등 융합 주제 탐구\n\n\"여러 분야가 만나는 질문을 환영합니다.\n‘함수로 사회 현상을 설명할 수 있을까?’ '이 수학적 개념과 유사한 국어 개념이 없을까?'\n이처럼 학문 사이 경계를 넘어서는 주제를 정리하고, 함께 구조를 설계해보세요.\"",
      image: "🌐",
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