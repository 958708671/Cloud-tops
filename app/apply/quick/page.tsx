'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuickApplyPage() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否为管理员
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/admin/check', {
          credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
          // 是管理员，跳转到申请表单
          router.push('/apply/form?skipQuiz=true');
        } else {
          // 不是管理员，重定向到普通申请页面
          router.push('/apply');
        }
      } catch (error) {
        console.error('检查管理员状态失败:', error);
        router.push('/apply');
      }
    };

    checkAdminStatus();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white">正在跳转到管理员快速申请...</p>
      </div>
    </div>
  );
}
