'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  minecraftId: string;
  age: string;
  gender: string;
  contact: string;
  occupation: string;
  howFound: string;
  playTime: string;
  playTimeSlot: string;
}

export default function AdminApplyPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    minecraftId: '',
    age: '',
    gender: '',
    contact: '',
    occupation: '',
    howFound: '',
    playTime: '',
    playTimeSlot: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check', {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.isAdmin) {
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('检查管理员状态失败:', error);
        router.push('/');
      } finally {
        setIsChecking(false);
      }
    };
    checkAdmin();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.minecraftId) {
      setSubmitMessage('请填写 Minecraft ID');
      setShowErrorModal(true);
      return;
    }
    if (!formData.age) {
      setSubmitMessage('请填写年龄');
      setShowErrorModal(true);
      return;
    }
    if (!formData.gender) {
      setSubmitMessage('请选择性别');
      setShowErrorModal(true);
      return;
    }
    if (!formData.contact) {
      setSubmitMessage('请填写联系方式（QQ号）');
      setShowErrorModal(true);
      return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 16) {
      setSubmitMessage('年龄必须为16岁以上');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('minecraft_id', formData.minecraftId);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('contact', formData.contact);
      formDataToSend.append('occupation', formData.occupation);
      formDataToSend.append('how_found', formData.howFound);
      formDataToSend.append('play_time', formData.playTime);
      formDataToSend.append('favorite_mode', formData.playTimeSlot);
      formDataToSend.append('quiz_score', '100');
      formDataToSend.append('quiz_total', '100');
      formDataToSend.append('quiz_category', 'admin');
      formDataToSend.append('play_style', '管理员');

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      if (result.success) {
        setSubmitMessage('申请提交成功！请等待管理员审核');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setSubmitMessage(result.message || '申请提交失败，请重试');
      }
    } catch (error) {
      console.error('提交申请失败:', error);
      setSubmitMessage('提交申请失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">正在验证管理员身份...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">管理员快速申请</h1>
            <p className="text-gray-400">管理员通道 - 简化申请流程，无需答题和上传文件</p>
          </div>

          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg ${submitMessage.includes('成功') ? 'bg-green-900/30 border border-green-700 text-green-400' : 'bg-red-900/30 border border-red-700 text-red-400'}`}>
              <p>{submitMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2">Minecraft ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="minecraftId"
                  value={formData.minecraftId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="请输入你的Minecraft游戏ID"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">年龄 <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="16"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="请输入你的实际年龄（16岁以上）"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2">性别 <span className="text-red-500">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">请选择</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">QQ号 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="请输入你的QQ号"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2">身份职业 <span className="text-red-500">*</span></label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">请选择</option>
                  <option value="小学">小学</option>
                  <option value="初中">初中</option>
                  <option value="高中">高中</option>
                  <option value="中专">中专</option>
                  <option value="大专">大专</option>
                  <option value="大学及以上">大学及以上</option>
                  <option value="已就业">已就业</option>
                  <option value="未就业">未就业</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">如何了解到本服务器</label>
                <input
                  type="text"
                  name="howFound"
                  value={formData.howFound}
                  onChange={handleChange}
                  list="howFoundOptions"
                  placeholder="请输入或选择"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
                <datalist id="howFoundOptions">
                  <option value="哔哩哔哩" />
                  <option value="抖音" />
                  <option value="快手" />
                  <option value="小红书" />
                  <option value="微信公众号" />
                  <option value="微博" />
                  <option value="贴吧" />
                  <option value="QQ群" />
                  <option value="微信朋友圈" />
                  <option value="朋友推荐" />
                  <option value="游戏内宣传" />
                  <option value="搜索引擎" />
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2">游戏时长</label>
                <select
                  name="playTime"
                  value={formData.playTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">请选择</option>
                  <option value="新手（1年以内）">新手（1年以内）</option>
                  <option value="熟练（1-3年）">熟练（1-3年）</option>
                  <option value="老手（3-5年）">老手（3-5年）</option>
                  <option value="专家（5年以上）">专家（5年以上）</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">游戏时段</label>
                <select
                  name="playTimeSlot"
                  value={formData.playTimeSlot}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">请选择</option>
                  <option value="早上（6:00-12:00）">早上（6:00-12:00）</option>
                  <option value="下午（12:00-18:00）">下午（12:00-18:00）</option>
                  <option value="晚上（18:00-24:00）">晚上（18:00-24:00）</option>
                  <option value="凌晨（0:00-6:00）">凌晨（0:00-6:00）</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                {isSubmitting ? '提交中...' : '提交申请'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                返回首页
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 错误弹窗 */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-red-500 text-lg font-semibold mb-4">错误提示</h3>
            <p className="text-gray-300 mb-6">{submitMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}