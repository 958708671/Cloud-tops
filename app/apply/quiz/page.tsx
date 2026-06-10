'use client';
import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Question {
  id: number;
  type: 'single' | 'multiple' | 'judgment' | 'subjective';
  question: string;
  options?: string[];
  correctAnswer?: number | number[] | boolean;
  points: number;
  imageUrl?: string;
}

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoriesParam = searchParams.get('categories') || '';
  const selectedCategories = categoriesParam.split(',').filter(Boolean);
  const requiresWork = selectedCategories.includes('build') || selectedCategories.includes('redstone');
  const [isHoveringList, setIsHoveringList] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const generateQuestions = (categories: string[]): Question[] => {
    const isTechnical = categories.includes('build') || categories.includes('redstone');
    const questionCount = isTechnical ? 15 : 30;
    const basePoints = 100 / questionCount;

    const singleCount = isTechnical ? 7 : 15;
    const multipleCount = isTechnical ? 4 : 10;
    const judgmentCount = isTechnical ? 4 : 5;

    const questions: Question[] = [];
    let currentId = 1;

    const singleQuestions = isTechnical ? [
      { q: '以下哪种方块不能被活塞推动？', opts: ['沙子', '圆石', '基岩', '石头'], answer: 2 },
      { q: '红石比较器的作用是什么？', opts: ['放大信号', '比较信号强度', '传输信号', '存储信号'], answer: 1 },
      { q: '以下哪种工具采集黑曜石最快？', opts: ['木镐', '石镐', '铁镐', '钻石镐'], answer: 3 },
      { q: '拴绳可以绑住哪些生物？', opts: ['所有生物', '仅村民', '仅动物', '除BOSS外的所有生物'], answer: 3 },
      { q: '信标的有效范围是多大？', opts: ['64格', '96格', '128格', '256格'], answer: 1 },
      { q: '营火会提供什么效果？', opts: ['力量', '速度', '隐身', '饱食'], answer: 3 },
      { q: '下界要塞最少会生成多少个凋灵骷髅笼子？', opts: ['1个', '2个', '3个', '5个'], answer: 1 },
    ] : [
      { q: '我的世界中被闪电击中的生物会变成什么？', opts: ['僵尸', '骷髅', '女巫', '高压爬行者'], answer: 3 },
      { q: '以下哪个不是我的世界中的食物？', opts: ['面包', '胡萝卜', '土豆', '番茄'], answer: 3 },
      { q: '我的世界中有几种颜色的羊毛？', opts: ['8种', '12种', '16种', '20种'], answer: 2 },
      { q: '村民会通过什么方式获得职业？', opts: ['睡觉', '交易', '杀怪', '挖矿'], answer: 1 },
      { q: '以下哪个不是下界生物？', opts: ['僵尸猪人', '烈焰人', '末影人', '岩浆怪'], answer: 3 },
      { q: '我的世界中的末影箱有什么特点？', opts: ['可以染色', '所有玩家共享', '无限容量', '可以远程访问'], answer: 1 },
      { q: '海晶灯需要用什么来激活？', opts: ['红石', '海磷', '海草', '水'], answer: 1 },
      { q: '潜影盒里可以放多少个物品槽？', opts: ['9个', '18个', '27个', '36个'], answer: 2 },
    ];

    const multipleQuestions = isTechnical ? [
      { q: '以下哪些方块可以用于红石中继器的正确连接？', opts: ['红石粉', '红石中继器', '红石火把', '活塞'], answer: [0, 1, 2] },
      { q: '哪些物品可以通过村民交易获得？', opts: ['附魔书', '马铠', '拴绳', '命名牌'], answer: [0, 1, 2, 3] },
      { q: '以下哪些是刷怪笼的特性？', opts: ['可被活塞推动', '发光', '可被命名', '会掉落经验'], answer: [1, 2, 3] },
      { q: '哪些方法可以产生下界传送门？', opts: ['使用黑曜石搭建', '使用钻石镐挖掘', '自然生成', '使用打火石激活'], answer: [0, 3] },
    ] : [
      { q: '我的世界中可以通过哪些方式获得钻石？', opts: ['挖掘', '交易', '箱子查找', '钓鱼'], answer: [0, 1, 2, 3] },
      { q: '以下哪些是暮色森林的生物？', opts: ['娜迦', '冰雪女王', '僵尸', '巨人'], answer: [0, 1, 3] },
      { q: '哪些行为会影响村庄好感度？', opts: ['攻击村民', '交易', '杀死铁傀儡', '建造房屋'], answer: [0, 1, 2] },
      { q: '我的世界中可以用什么方法繁殖动物？', opts: ['喂食对应食物', '使用村民', '使用小麦', '使用拴绳'], answer: [0, 2] },
      { q: '以下哪些物品可以通过打开箱子获得？', opts: ['铁锭', '金锭', '钻石', '绿宝石'], answer: [0, 1, 2, 3] },
      { q: '我的世界中哪些方块可以放置火把？', opts: ['石头', '泥土', '圆石', '木板'], answer: [0, 2, 3] },
    ];

    const judgmentQuestions = isTechnical ? [
      { q: 'TNT可以被活塞推动', answer: true },
      { q: '红石火把可以作为红石信号的稳定来源', answer: true },
      { q: '音符盒可以放置在任何方块上', answer: false },
      { q: '观察者方块可以检测到方块的放置和破坏', answer: true },
    ] : [
      { q: '我的世界中所有的羊都是白色的', answer: false },
      { q: '钻石只能在下界找到', answer: false },
      { q: '村民会在晚上自动上床睡觉', answer: true },
      { q: '我的世界中有四种Boss生物', answer: false },
      { q: '潜影盒可以被染色', answer: false },
    ];

    for (let i = 0; i < singleCount; i++) {
      const sq = singleQuestions[i % singleQuestions.length];
      questions.push({
        id: currentId++,
        type: 'single',
        question: `单选题 ${i + 1}：${sq.q}`,
        options: sq.opts,
        correctAnswer: sq.answer,
        points: basePoints
      });
    }

    for (let i = 0; i < multipleCount; i++) {
      const mq = multipleQuestions[i % multipleQuestions.length];
      questions.push({
        id: currentId++,
        type: 'multiple',
        question: `多选题 ${i + 1}：${mq.q}`,
        options: mq.opts,
        correctAnswer: mq.answer,
        points: basePoints
      });
    }

    for (let i = 0; i < judgmentCount; i++) {
      const jq = judgmentQuestions[i % judgmentQuestions.length];
      questions.push({
        id: currentId++,
        type: 'judgment',
        question: `判断题 ${i + 1}：${jq.q}`,
        correctAnswer: jq.answer,
        points: basePoints
      });
    }

    const subjectiveCount = isTechnical ? 2 : 2;
    const subjectiveQuestions = isTechnical ? [
      '主观题 1：请描述你最喜欢的红石机关设计，并说明其工作原理',
      '主观题 2：展示你的建筑作品图片，并描述你的设计思路'
    ] : [
      '主观题 1：你在我的世界中有什么特别的经历或建造经历？',
      '主观题 2：你为什么想要加入我们的服务器？'
    ];
    for (let i = 0; i < subjectiveCount; i++) {
      questions.push({
        id: currentId++,
        type: 'subjective',
        question: subjectiveQuestions[i],
        points: 0,
        imageUrl: isTechnical ? `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`minecraft ${categories.join(' ')} build redstone creation, detailed, high quality`)}&image_size=landscape_16_9` : undefined
      });
    }

    return questions;
  };

  const questions = selectedCategories.length > 0 ? generateQuestions(selectedCategories) : [];
  const totalQuestions = questions.length;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | number[] | boolean | string | { text: string; image: string | null; audio: string | null })[]>(new Array(totalQuestions).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(selectedCategories.length === 0 ? '请先选择题目类型' : '');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [resultDetails, setResultDetails] = useState<Array<{
    question: string;
    type: string;
    options?: string[];
    userAnswer: any;
    correctAnswer: any;
    isCorrect: boolean;
    points: number;
    earnedPoints: number;
  }>>([]);

  const handleAnswerSelect = (answer: number | number[] | boolean | string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubjectiveAnswer = (field: 'text' | 'image' | 'audio', value: string | null) => {
    const currentAnswer = answers[currentQuestionIndex] as { text: string; image: string | null; audio: string | null } || { text: '', image: null, audio: null };
    const newAnswer = { ...currentAnswer, [field]: value };
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = newAnswer;
    setAnswers(newAnswers);
  };

  const startRecording = async () => {
    try {
      if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN';

        recognition.onresult = (event: any) => {
          const currentAnswer = answers[currentQuestionIndex] as { text: string; image: string | null; audio: string | null } || { text: '', image: null, audio: null };
          let transcript = currentAnswer.text;
          
          for (let i = 0; i < event.results.length; i++) {
            if (!event.results[i].isFinal) {
              const lastInterimIndex = transcript.lastIndexOf('###');
              if (lastInterimIndex !== -1) {
                transcript = transcript.substring(0, lastInterimIndex);
              }
              transcript += '###' + event.results[i][0].transcript;
            } else {
              const lastInterimIndex = transcript.lastIndexOf('###');
              if (lastInterimIndex !== -1) {
                transcript = transcript.substring(0, lastInterimIndex);
              }
              transcript += event.results[i][0].transcript;
            }
          }
          
          handleSubjectiveAnswer('text', transcript);
        };

        recognition.onend = () => {
          setRecognitionActive(false);
        };

        recognition.start();
        setRecognition(recognition);
        recognitionRef.current = recognition;
        setRecognitionActive(true);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        setAudioChunks([]);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setAudioChunks((prev) => [...prev, event.data]);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = (event) => {
            handleSubjectiveAnswer('audio', event.target?.result as string);
          };
          reader.readAsDataURL(audioBlob);
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
        };

        recorder.start();
        setIsRecording(true);
      }
    } catch (err) {
      console.error('无法访问麦克风:', err);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecognitionActive(false);
      const currentAnswer = answers[currentQuestionIndex] as { text: string; image: string | null; audio: string | null } || { text: '', image: null, audio: null };
      if (currentAnswer.text.includes('###')) {
        const cleanText = currentAnswer.text.replace('###', '');
        handleSubjectiveAnswer('text', cleanText);
      }
    } else if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      stopRecording();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      stopRecording();
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    stopRecording();

    const cleanedAnswers = answers.map((answer, index) => {
      if (questions[index].type === 'subjective' && typeof answer === 'object' && answer !== null) {
        const subjectiveAnswer = answer as { text: string; image: string | null; audio: string | null };
        if (subjectiveAnswer.text.includes('###')) {
          return {
            ...subjectiveAnswer,
            text: subjectiveAnswer.text.replace('###', '')
          };
        }
      }
      return answer;
    });

    let totalScore = 0;
    const details: typeof resultDetails = [];

    questions.forEach((question, index) => {
      let isCorrect = false;
      let earnedPoints = 0;

      if (question.type === 'single') {
        isCorrect = cleanedAnswers[index] === question.correctAnswer;
        if (isCorrect) {
          totalScore += question.points;
          earnedPoints = question.points;
        }
      } else if (question.type === 'multiple') {
        const userAnswer = cleanedAnswers[index] as number[];
        const correctAnswer = question.correctAnswer as number[];
        if (userAnswer && correctAnswer) {
          isCorrect = userAnswer.sort().join(',') === correctAnswer.sort().join(',');
          if (isCorrect) {
            totalScore += question.points;
            earnedPoints = question.points;
          }
        }
      } else if (question.type === 'judgment') {
        isCorrect = cleanedAnswers[index] === question.correctAnswer;
        if (isCorrect) {
          totalScore += question.points;
          earnedPoints = question.points;
        }
      } else if (question.type === 'subjective') {
        earnedPoints = 0;
        isCorrect = false;
      }

      details.push({
        question: question.question,
        type: question.type,
        options: question.options,
        userAnswer: cleanedAnswers[index],
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points,
        earnedPoints
      });
    });

    try {
      await fetch('/api/quiz/attempts', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('增加答题次数失败:', error);
    }

    setScore(Math.round(totalScore));
    setShowResult(true);
    setResultDetails(details);

    localStorage.setItem('quizScore', Math.round(totalScore).toString());
    localStorage.setItem('quizCategories', selectedCategories.join(','));
    localStorage.setItem('quizTotal', totalQuestions.toString());
    localStorage.setItem('requiresWork', requiresWork.toString());
  };

  const handleGoToApplication = () => {
    router.push('/apply/form');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">正在加载题目...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/apply')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            返回选择页面
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold">答题详情</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {resultDetails.map((detail, index) => (
                  <div key={index} className="mb-6 bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${detail.type === 'single' ? 'bg-blue-900 text-blue-300' : detail.type === 'multiple' ? 'bg-green-900 text-green-300' : detail.type === 'judgment' ? 'bg-yellow-900 text-yellow-300' : 'bg-purple-900 text-purple-300'}`}>
                          {detail.type === 'single' ? '单选题' : detail.type === 'multiple' ? '多选题' : detail.type === 'judgment' ? '判断题' : '主观题'}
                        </span>
                        <span className="text-gray-400">第{index + 1}题</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${detail.isCorrect ? 'bg-green-900 text-green-300' : detail.type === 'subjective' ? 'bg-purple-900 text-purple-300' : 'bg-red-900 text-red-300'}`}>
                        {detail.isCorrect ? '✓ 正确' : detail.type === 'subjective' ? '待审核' : '✗ 错误'}
                      </div>
                    </div>
                    <p className="text-lg mb-3">{detail.question}</p>
                    
                    {detail.options && (
                      <div className="space-y-2 mb-3">
                        {detail.options.map((opt, optIdx) => {
                          const isUserAnswer = Array.isArray(detail.userAnswer) 
                            ? detail.userAnswer.includes(optIdx)
                            : detail.userAnswer === optIdx;
                          const isCorrectAnswer = Array.isArray(detail.correctAnswer)
                            ? detail.correctAnswer.includes(optIdx)
                            : detail.correctAnswer === optIdx;
                          
                          let bgClass = 'bg-gray-600';
                          if (isCorrectAnswer) bgClass = 'bg-green-800 border-green-500';
                          if (isUserAnswer && !isCorrectAnswer) bgClass = 'bg-red-800 border-red-500';
                          if (isUserAnswer && isCorrectAnswer) bgClass = 'bg-green-800 border-green-500';
                          
                          return (
                            <div key={optIdx} className={`p-2 rounded border-2 ${bgClass}`}>
                              <span className="font-semibold mr-2">{String.fromCharCode(65 + optIdx).padStart(2, '0')}.</span>
                              <span>{opt}</span>
                              {isUserAnswer && <span className="ml-2 text-yellow-400">（你的答案）</span>}
                              {isCorrectAnswer && <span className="ml-2 text-green-400">（正确答案）</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {detail.type === 'subjective' && detail.userAnswer && typeof detail.userAnswer === 'object' && (
                      <div className="bg-gray-600 rounded p-3 mb-3">
                        <p className="text-gray-400 text-sm mb-1">你的回答：</p>
                        <p className="text-white">{(detail.userAnswer as { text: string }).text || '无文字回答'}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-400">
                        <span>分值：{detail.points.toFixed(2)}分</span>
                        <span className="mx-2">|</span>
                        <span>得分：{detail.earnedPoints.toFixed(2)}分</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">测试结果</h1>

          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <div className="text-6xl font-bold mb-4">
              {score}%
            </div>
            <p className="text-gray-400 mb-2">
              满分: 100分
            </p>
            <p className="text-gray-400">
              题目数量: {totalQuestions}道
            </p>
          </div>

          {score >= 60 ? (
            <div className="mb-8 text-center">
              <div className="mb-6">
                <p className="text-green-400 text-3xl font-bold mb-2">🎉 恭喜你通过了测试！</p>
                <p className="text-gray-300 text-xl">你的得分：<span className="text-green-400 font-bold">{score}</span> / 100</p>
              </div>
              <div className="mb-6">
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                >
                  查看答题详情
                </button>
              </div>
              <div className="mb-6">
                <button
                  onClick={handleGoToApplication}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                >
                  填写申请表单
                </button>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/apply')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
                >
                  重新测试
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('确定要返回首页吗？所有答题记录将被清除。')) {
                      router.push('/');
                    }
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
                >
                  返回首页
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8 text-center">
              <p className="text-red-400 mb-4">很遗憾，你的得分未达到要求</p>
              <p className="text-gray-400 mb-6">请重新测试，得分达到60%以上才能申请</p>
              <div className="mb-6">
                <button
                  onClick={() => setShowDetailModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
                >
                  查看答题详情
                </button>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/apply')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
                >
                  重新测试
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('确定要返回首页吗？所有答题记录将被清除。')) {
                      router.push('/');
                    }
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
                >
                  返回首页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* 左侧悬停题目列表 */}
      <div 
        ref={listRef}
        className="relative"
        onMouseEnter={() => setIsHoveringList(true)}
        onMouseLeave={() => setIsHoveringList(false)}
      >
        {/* 悬停区域 */}
        <div className="w-14 bg-gray-800 h-full min-h-screen flex items-center justify-center cursor-pointer">
          <div 
            className="text-gray-400 font-semibold select-none"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', fontSize: '20px', letterSpacing: '8px' }}
          >
            题目列表
          </div>
        </div>
        
        {/* 悬停弹出的列表 */}
        <div 
          className={`absolute left-0 top-0 h-full bg-gray-800 p-4 transition-all duration-300 z-50 ${isHoveringList ? 'w-48 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
        >
          <h3 className="text-lg font-semibold mb-4 text-center whitespace-nowrap">题目列表</h3>
          <div className="space-y-2">
            {questions.map((question, index) => {
              const isAnswered = answers[index] !== null;
              return (
                <button
                  key={question.id}
                  onClick={() => {
                    stopRecording();
                    setCurrentQuestionIndex(index);
                  }}
                  className={`w-full p-2 rounded-lg transition duration-300 text-center ${currentQuestionIndex === index ? 'bg-blue-600 text-white' : isAnswered ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-gray-700 hover:bg-gray-600 border border-gray-600'}`}
                >
                  <span className="block text-sm font-medium whitespace-nowrap">{index + 1}. {question.type === 'single' ? '单选' : question.type === 'multiple' ? '多选' : question.type === 'judgment' ? '判断' : '主观'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 右侧主内容 - 居中 */}
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-3xl w-full px-4">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">答题测试</h1>
                <button
                  onClick={() => {
                    const newAnswers = questions.map((q, i) => {
                      if (q.type === 'single' && typeof q.correctAnswer === 'number') {
                        return q.correctAnswer;
                      } else if (q.type === 'multiple' && Array.isArray(q.correctAnswer)) {
                        return q.correctAnswer;
                      } else if (q.type === 'judgment' && typeof q.correctAnswer === 'boolean') {
                        return q.correctAnswer;
                      } else if (q.type === 'subjective') {
                        return { text: '测试答案', image: null, audio: null };
                      }
                      return null;
                    });
                    setAnswers(newAnswers);
                    alert('已自动填写所有答案，请点击提交！');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-1 px-3 rounded-lg transition duration-300"
                >
                  自动答题(测试)
                </button>
              </div>
              <div className="text-gray-400">
                第 {currentQuestionIndex + 1} 题 / 共 {questions.length} 题
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

            {currentQuestion.type === 'subjective' && currentQuestion.imageUrl && (
              <div className="mb-6">
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="题目图片" 
                    className="w-full h-auto object-cover" 
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
            )}

            {currentQuestion.type === 'single' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${answers[currentQuestionIndex] === index ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-blue-400 hover:bg-gray-700'}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${answers[currentQuestionIndex] === index ? 'bg-blue-500' : 'border border-gray-500'}`}>
                        {answers[currentQuestionIndex] === index && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multiple' && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const currentAnswer = answers[currentQuestionIndex] as number[] || [];
                      if (currentAnswer.includes(index)) {
                        handleAnswerSelect(currentAnswer.filter(i => i !== index));
                      } else {
                        handleAnswerSelect([...currentAnswer, index]);
                      }
                    }}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${(answers[currentQuestionIndex] as number[] || []).includes(index) ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-blue-400 hover:bg-gray-700'}`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-3 ${(answers[currentQuestionIndex] as number[] || []).includes(index) ? 'border-blue-500 bg-blue-900/50' : 'border-gray-500'}`}>
                        {(answers[currentQuestionIndex] as number[] || []).includes(index) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'judgment' && (
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => handleAnswerSelect(true)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${answers[currentQuestionIndex] === true ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-blue-400 hover:bg-gray-700'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <span>正确</span>
                  </div>
                </div>
                <div
                  onClick={() => handleAnswerSelect(false)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${answers[currentQuestionIndex] === false ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-blue-400 hover:bg-gray-700'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">❌</div>
                    <span>错误</span>
                  </div>
                </div>
              </div>
            )}

            {currentQuestion.type === 'subjective' && (
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-gray-400 mb-2">回答</label>
                  <textarea
                    value={(currentAnswer as { text?: string; image?: string | null; audio?: string | null })?.text || ''}
                    onChange={(e) => handleSubjectiveAnswer('text', e.target.value)}
                    placeholder="请输入你的回答..."
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none min-h-[100px]"
                  ></textarea>
                  <div className="absolute top-12 right-4 flex gap-2">
                    {!recognitionActive && !isRecording ? (
                      <button
                        onClick={startRecording}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition duration-300 flex items-center gap-1"
                        title="开始录音"
                      >
                        <span>🎤</span>
                        <span className="text-sm">开始</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition duration-300 flex items-center gap-1"
                        title="停止录音"
                      >
                        <span>⏹️</span>
                        <span className="text-sm">停止</span>
                      </button>
                    )}
                    {(recognitionActive || isRecording) && (
                      <div className="flex items-center text-green-400 text-sm">
                        <span className="animate-pulse mr-1">●</span>
                        <span>录音中...</span>
                      </div>
                    )}
                  </div>
                </div>

                {(currentAnswer as { text?: string; image?: string | null; audio?: string | null })?.audio && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>✅</span> 语音已录制
                    <audio src={(currentAnswer as { text: string; image: string | null; audio: string }).audio} controls className="h-8" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
              上一题
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
              >
                提交答案
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
              >
                下一题
              </button>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                if (window.confirm('确定要返回首页吗？所有答题进度将被清除。')) {
                  router.push('/');
                }
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
