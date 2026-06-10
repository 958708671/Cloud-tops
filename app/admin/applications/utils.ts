// 工具函数

/**
 * 格式化日期时间
 */
export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * 导出CSV文件
 */
export const exportToCsv = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('没有可导出的数据');
    return;
  }
  
  const csvContent = [
    ['游戏ID', '年龄', '联系方式', '申请理由', '状态', '申请时间'].join(','),
    ...data.map(app => [
      app.minecraft_id,
      app.age || '未填写',
      app.contact,
      (app.reason || '').replace(/"/g, '""'),
      app.status === 'pending' ? '待审核' : app.status === 'approved' ? '已通过' : '已拒绝',
      formatDate(app.created_at)
    ].map(field => `"${field}"`).join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
