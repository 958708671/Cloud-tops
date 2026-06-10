'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/Modal';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiresWork: boolean;
}

export default function ApplyPage() {
  const router = useRouter();
  const [categories] = useState<Category[]>([
    { id: 'build', name: '建筑', icon: '🏗️', description: '', requiresWork: true },
    { id: 'redstone', name: '红石', icon: '🔄', description: '', requiresWork: true },
    { id: 'survival', name: '生存', icon: '🌲', description: '', requiresWork: false },
    { id: 'command', name: '指令', icon: '💻', description: '', requiresWork: false },
  ]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminSkip, setAdminSkip] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [showWarning, setShowWarning] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const skipQuiz = urlParams.get('skipQuiz');
    if (skipQuiz === 'true') {
      setAdminSkip(true);
      router.push('/apply/form?skipQuiz=true');
    }
  }, [router]);

  useEffect(() => {
    const checkAttempts = async () => {
      try {
        const response = await fetch('/api/quiz/attempts', {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
          setAttemptsLeft(data.attemptsLeft);
          if (data.attemptsLeft <= 0) {
            setError('今日答题次数已用完，请联系管理员重置或明天再试');
          }
        }
      } catch (err) {
        console.error('检查答题次数失败:', err);
      }
    };

    checkAttempts();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else if (prev.length < 2) {
        return [...prev, categoryId];
      } else {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
        return prev;
      }
    });
  };

  const handleStartQuiz = async () => {
    if (selectedCategories.length === 0) {
      setError('请至少选择一个题目类型');
      return;
    }
    setShowRulesModal(true);
  };

  const handleConfirmRules = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/quiz/attempts', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message || '检查答题次数失败');
        return;
      }

      if (data.attemptsLeft <= 0) {
        setError('今日答题次数已用完，请联系管理员重置或明天再试');
        return;
      }

      const categoriesParam = selectedCategories.join(',');
      router.push(`/apply/quiz?categories=${categoriesParam}`);
    } catch (err) {
      setError('开始答题失败，请重试');
      console.error('开始答题失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (adminSkip) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">正在跳转到申请表单...</p>
        </div>
      </div>
    );
  }

  const requiresWork = selectedCategories.some(cat => cat === 'build' || cat === 'redstone');
  const rulesContent = requiresWork ? `【答题规则】

1. 每个IP地址每天最多可答题3次
2. 您选择了建筑或红石类型，需要上传相关作品
3. 题目数量：15道题 + 1-2道主观题
4. 满分100分，达到60分以上可申请白名单

【重要提示】
请确保您已经准备好以下材料：
• 建筑或红石作品的存档文件
• 作品照片（不少于3张，清晰可见）
• 作品视频（不少于30秒，可选）

【温馨提示】
即使您同时选择了生存或指令类型，只要包含建筑或红石类型，答题数量仍为15道题。` : `【答题规则】

1. 每个IP地址每天最多可答题3次
2. 您选择了生存或指令类型，不需要上传作品
3. 题目数量：30道题 + 1-2道主观题
4. 满分100分，达到60分以上可申请白名单

【温馨提示】
请认真答题，确保您的知识水平符合服务器要求。`;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Modal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title={requiresWork ? "🏗️ 建筑/红石答题规则" : "🎮 生存/指令答题规则"}
        confirmText="开始答题"
        cancelText="返回"
        onConfirm={handleConfirmRules}
      >
        {rulesContent}
      </Modal>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">选择题目类型</h1>
            <p className="text-gray-400 mb-6">请选择一个或两个你擅长的领域，完成相关测试后即可申请白名单</p>

            <div className="bg-gray-800/50 rounded-lg p-4 inline-block mb-8">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-gray-300">今日剩余答题次数: <span className="font-bold text-white">{attemptsLeft}/3</span></span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {showWarning && (
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
              <p className="text-yellow-400">最多只能选择两个题目类型</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`cursor-pointer rounded-xl border-2 transition-all duration-300 p-6 ${selectedCategories.includes(category.id) ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-blue-400 hover:bg-gray-800/50'}`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (window.confirm('确定要返回首页吗？所有选择将被重置。')) {
                  router.push('/');
                }
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              返回首页
            </button>
            <button
              onClick={handleStartQuiz}
              disabled={selectedCategories.length === 0 || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              {loading ? '加载中...' : '开始答题'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
