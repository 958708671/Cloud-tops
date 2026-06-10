'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
  minecraftId: string;
  age: string;
  gender: string;
  contact: string;
  education: string;
  workStatus: string;
  howFound: string;
  playTime: string;
  playTimeSlot: string;
}

export default function ApplicationForm() {
  const router = useRouter();

  const [quizScore, setQuizScore] = useState<string>('0');
  const [quizTotal, setQuizTotal] = useState<string>('100');
  const [quizCategories, setQuizCategories] = useState<string>('');
  const [requiresWork, setRequiresWork] = useState<boolean>(false);

  useEffect(() => {
    setQuizScore(localStorage.getItem('quizScore') || '0');
    setQuizTotal(localStorage.getItem('quizTotal') || '100');
    setQuizCategories(localStorage.getItem('quizCategories') || '');
    setRequiresWork(localStorage.getItem('requiresWork') === 'true');
  }, []);

  const [isValid, setIsValid] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [userType, setUserType] = useState<'build' | 'normal' | 'admin' | null>(null);

  const [formData, setFormData] = useState<FormData>({
    minecraftId: '',
    age: '',
    gender: '',
    contact: '',
    education: '',
    workStatus: '',
    howFound: '',
    playTime: '',
    playTimeSlot: ''
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [archiveFile, setArchiveFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const adminRes = await fetch('/api/admin/check', {
          credentials: 'include'
        });
        const adminData = await adminRes.json();

        if (adminData.success) {
          // 是管理员，直接设置为有效状态
          setIsValid(true);
          setUserType('admin');
          return;
        }

        const score = parseInt(quizScore);
        if (score >= 60) {
          setIsValid(true);
          if (requiresWork) {
            setUserType('build');
          } else {
            setUserType('normal');
          }
        } else {
          setIsValid(false);
          setUserType(null);
        }
      } catch (error) {
        console.error('检查状态失败:', error);
        setIsValid(false);
        setUserType(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkStatus();
  }, [quizScore, quizCategories, requiresWork, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...photoFiles, ...files].slice(0, 10);
      setPhotoFiles(newFiles);
      const previewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls(previewUrls);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleArchiveUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchiveFile(file);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newFiles = photoFiles.filter((_, i) => i !== index);
    setPhotoFiles(newFiles);
    setPhotoPreviewUrls(newFiles.map(file => URL.createObjectURL(file)));
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
    if (!formData.education) {
      setSubmitMessage('请选择学历');
      setShowErrorModal(true);
      return;
    }
    if (!formData.workStatus) {
      setSubmitMessage('请选择工作状态');
      setShowErrorModal(true);
      return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 16) {
      setSubmitMessage('年龄必须为16岁以上');
      setShowErrorModal(true);
      return;
    }

    if (userType === 'build' && userType !== 'admin') {
      if (!archiveFile) {
        setSubmitMessage('请上传存档文件（必填）');
        setShowErrorModal(true);
        return;
      }
      if (photoFiles.length < 3 && !videoFile) {
        setSubmitMessage('请至少上传3张照片或1个视频');
        setShowErrorModal(true);
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('minecraft_id', formData.minecraftId);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('contact', formData.contact);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('work_status', formData.workStatus);
      formDataToSend.append('how_found', formData.howFound);
      formDataToSend.append('play_time', formData.playTime);
      formDataToSend.append('favorite_mode', formData.playTimeSlot);
      formDataToSend.append('quiz_score', quizScore);
      formDataToSend.append('quiz_total', quizTotal);
      formDataToSend.append('quiz_category', quizCategories);

      if (userType === 'build' || userType === 'normal' || userType === 'admin') {
        if (userType === 'admin') {
          formDataToSend.append('play_style', '管理员');
        } else {
          const categories = quizCategories.split(',');
          const skillTypes: string[] = [];
          if (categories.includes('build')) skillTypes.push('建筑');
          if (categories.includes('redstone')) skillTypes.push('生电');
          if (categories.includes('survival')) skillTypes.push('生存');
          if (categories.includes('command')) skillTypes.push('指令');
          formDataToSend.append('play_style', skillTypes.join(', '));
        }
      }

      if (userType === 'build' && userType !== 'admin') {
        photoFiles.forEach((file, index) => {
          formDataToSend.append(`photos[${index}]`, file);
        });
        if (videoFile) {
          formDataToSend.append('video', videoFile);
        }
        if (archiveFile) {
          formDataToSend.append('archive', archiveFile);
        }
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      const result = await response.json();
      if (result.success) {
        setSubmitMessage('申请提交成功！请等待管理员审核');
        localStorage.removeItem('quizScore');
        localStorage.removeItem('quizCategories');
        localStorage.removeItem('quizTotal');
        localStorage.removeItem('requiresWork');
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
          <p className="text-white">正在验证身份...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold text-white mb-4">验证失败</h1>
          <p className="text-red-400 mb-6">您的答题分数未达到60分，无法填写申请表</p>
          <button
            onClick={() => router.push('/apply')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            返回答题
          </button>
          <button
            onClick={() => {
              if (window.confirm('确定要返回首页吗？')) {
                router.push('/');
              }
            }}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">填写申请表单</h1>
            <p className="text-gray-400">
              {userType === 'build' && '请完整填写以下信息（需要上传作品）'}
              {userType === 'normal' && '请完整填写以下信息'}
              {userType === 'admin' && '管理员快速申请通道，请填写基本信息'}
            </p>
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
                <label className="block text-gray-300 mb-2">学历 <span className="text-red-500">*</span></label>
                <select
                  name="education"
                  value={formData.education}
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
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">工作状态 <span className="text-red-500">*</span></label>
                <select
                  name="workStatus"
                  value={formData.workStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">请选择</option>
                  <option value="已就业">已就业</option>
                  <option value="未就业">未就业</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
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
                <option value="其他" />
              </datalist>
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

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">擅长领域</label>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const categories = quizCategories.split(',');
                  const skillTypes: string[] = [];
                  if (categories.includes('build')) skillTypes.push('建筑');
                  if (categories.includes('redstone')) skillTypes.push('生电');
                  if (categories.includes('survival')) skillTypes.push('生存');
                  if (categories.includes('command')) skillTypes.push('指令');
                  return skillTypes.map((skill, index) => (
                    <span key={index} className="bg-blue-900/50 border border-blue-700 rounded-full px-4 py-1 text-sm">
                      {skill}
                    </span>
                  ));
                })()}
              </div>
              <p className="text-gray-400 text-sm mt-2">根据您的答题类型自动生成，不可修改</p>
            </div>

            {userType === 'build' && userType !== 'admin' && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-white">作品上传</h3>

                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">存档文件 <span className="text-red-500">*</span></label>
                  <div
                    onClick={() => document.getElementById('archive-upload')?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                      archiveFile ? 'border-green-500 bg-green-900/20 hover:bg-green-900/30' : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{archiveFile ? '✅' : '📁'}</div>
                    <p className={archiveFile ? 'text-green-400' : 'text-gray-300'}>{archiveFile ? `已选择: ${archiveFile.name}` : '点击选择文件'}</p>
                    <p className="text-gray-500 text-sm mt-2">支持 ZIP、RAR、7Z 格式</p>
                  </div>
                  <input
                    id="archive-upload"
                    type="file"
                    accept=".zip,.rar,.7z"
                    onChange={handleArchiveUpload}
                    className="hidden"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">照片 <span className="text-gray-400">(至少3张，或上传视频)</span></label>
                  <div
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                      photoFiles.length > 0 ? 'border-green-500 bg-green-900/20 hover:bg-green-900/30' : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{photoFiles.length > 0 ? '✅' : '🖼️'}</div>
                    <p className={photoFiles.length > 0 ? 'text-green-400' : 'text-gray-300'}>
                      {photoFiles.length > 0 ? `已选择 ${photoFiles.length} 张照片` : '点击选择照片'}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">支持 JPG、PNG 格式，至少3张，最多10张</p>
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {photoPreviewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {photoPreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img src={url} alt={`预览 ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">视频 <span className="text-gray-400">(可选，时长至少30秒)</span></label>
                  <div
                    onClick={() => document.getElementById('video-upload')?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                      videoFile ? 'border-green-500 bg-green-900/20 hover:bg-green-900/30' : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{videoFile ? '✅' : '🎬'}</div>
                    <p className={videoFile ? 'text-green-400' : 'text-gray-300'}>{videoFile ? `已选择: ${videoFile.name}` : '点击选择视频'}</p>
                    <p className="text-gray-500 text-sm mt-2">支持 MP4、MOV 格式，时长至少30秒</p>
                  </div>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

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
                onClick={() => router.push('/apply')}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                返回答题
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