import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Trophy, Award, Medal, Gift } from 'lucide-react';
import { prizes } from '../App';

const prizeIcons = [Trophy, Award, Medal, Gift];

export function PrizeStructure() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Cơ Cấu Giải Thưởng
        </CardTitle>
        <CardDescription>Tổng giá trị: 36.000.000đ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {prizes.map((prize, index) => {
          const Icon = prizeIcons[index] || Gift;
          const totalValue = parseInt(prize.value.replace(/\D/g, '')) * prize.count;
          
          return (
            <div
              key={index}
              className="p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${prize.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{prize.name}</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      <span className="font-semibold text-purple-600">{prize.count}</span> giải
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      Mỗi giải: <span className="font-semibold text-green-600">{prize.value}</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tổng: {totalValue.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200">
          <p className="text-sm text-center text-gray-700">
            <span className="font-bold">Tổng cộng:</span> 20 giải thưởng với tổng giá trị 32.000.000đ
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800">
            <span className="font-semibold">📌 Lưu ý:</span> Mỗi hóa đơn chỉ được trúng 1 giải duy nhất. 
            Giải thưởng được quay theo thứ tự từ giải khuyến khích đến giải nhất.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
