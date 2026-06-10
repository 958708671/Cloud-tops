'use client';

export default function GuidelinesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">管理员守则</h1>
        <p className="text-mc-stone-light text-sm mt-1">请所有管理员遵守以下守则</p>
      </div>

      <div className="space-y-6">
        {/* 审核守则 */}
        <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📋</span> 审核守则
          </h2>
          <div className="space-y-3 text-mc-stone-light">
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold mt-1">1.</span>
              <div>
                <p className="font-medium">公平公正</p>
                <p className="text-sm text-mc-stone-light">审核时应保持客观，不偏不倚，不因个人喜好影响审核结果</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold mt-1">2.</span>
              <div>
                <p className="font-medium">及时处理</p>
                <p className="text-sm text-mc-stone-light">收到新申请后应尽快处理，避免让玩家等待过长时间</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold mt-1">3.</span>
              <div>
                <p className="font-medium">认真负责</p>
                <p className="text-sm text-mc-stone-light">仔细查看申请者的答题情况、作品和填写的信息，确保审核质量</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold mt-1">4.</span>
              <div>
                <p className="font-medium">注明理由</p>
                <p className="text-sm text-mc-stone-light">拒绝申请时必须填写清晰的拒绝理由，方便申请者了解原因</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 font-bold mt-1">5.</span>
              <div>
                <p className="font-medium">谨慎转单</p>
                <p className="text-sm text-mc-stone-light">只有在不确定审核结果或无法继续处理时，才可以将申请转给其他管理员</p>
              </div>
            </div>
          </div>
        </div>

        {/* 行为规范 */}
        <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚖️</span> 行为规范
          </h2>
          <div className="space-y-3 text-mc-stone-light">
            <div className="flex items-start gap-3">
              <span className="text-mc-stone-light font-bold mt-1">1.</span>
              <div>
                <p className="font-medium">保密原则</p>
                <p className="text-sm text-mc-stone-light">不得泄露申请者的个人信息、联系方式等隐私内容</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-mc-stone-light font-bold mt-1">2.</span>
              <div>
                <p className="font-medium">专业态度</p>
                <p className="text-sm text-mc-stone-light">与玩家沟通时保持礼貌、专业，树立良好的管理员形象</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-mc-stone-light font-bold mt-1">3.</span>
              <div>
                <p className="font-medium">团队协作</p>
                <p className="text-sm text-mc-stone-light">管理员之间应互相配合，有问题及时沟通，共同维护服务器秩序</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-mc-stone-light font-bold mt-1">4.</span>
              <div>
                <p className="font-medium">不滥用职权</p>
                <p className="text-sm text-mc-stone-light">不得利用管理员权限谋取私利，或进行与管理无关的操作</p>
              </div>
            </div>
          </div>
        </div>

        {/* 审核标准 */}
        <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>✅</span> 审核标准
          </h2>
          <div className="space-y-3 text-mc-stone-light">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold mt-1">1.</span>
              <div>
                <p className="font-medium">答题成绩</p>
                <p className="text-sm text-mc-stone-light">总分需达到60分及以上（满分100分）</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold mt-1">2.</span>
              <div>
                <p className="font-medium">建筑/生电作品</p>
                <p className="text-sm text-mc-stone-light">选择建筑或生电领域的申请者，需提供1-10张作品截图，管理员应根据作品质量评估其能力</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold mt-1">3.</span>
              <div>
                <p className="font-medium">实景题答案</p>
                <p className="text-sm text-mc-stone-light">认真查看实景题回答，评估申请者的实际理解能力</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold mt-1">4.</span>
              <div>
                <p className="font-medium">历史记录</p>
                <p className="text-sm text-mc-stone-light">查看申请者是否有被其他服务器封禁的记录，如有需谨慎评估</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold mt-1">5.</span>
              <div>
                <p className="font-medium">综合评估</p>
                <p className="text-sm text-mc-stone-light">结合以上所有因素，做出最终的审核决定</p>
              </div>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="rounded-sm p-6" style={{border: '1px solid rgba(30, 40, 60, 0.7)', backgroundColor: 'rgba(30, 40, 60, 0.8)'}}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚠️</span> 注意事项
          </h2>
          <div className="space-y-3 text-mc-stone-light">
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-bold mt-1">•</span>
              <p>审核时请确保在安静、不受干扰的环境下进行</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-bold mt-1">•</span>
              <p>如有疑问或不确定的情况，请及时联系服主或其他资深管理员</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-bold mt-1">•</span>
              <p>定期查看管理员守则，确保自己的行为符合要求</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-bold mt-1">•</span>
              <p>如有违反守则的行为，将根据情节轻重给予警告或撤去管理员职务</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
