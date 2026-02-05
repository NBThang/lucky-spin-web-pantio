import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Winner, prizes } from '../App';
import { Trophy, Download } from 'lucide-react';
import { Button } from './ui/button';

interface WinnersListProps {
  winners: Winner[];
}

export function WinnersList({ winners }: WinnersListProps) {
  const getWinnersByPrize = (prizeName: string) => {
    return winners.filter(w => w.prize === prizeName);
  };

  const exportToCSV = () => {
    const headers = ['Thời gian', 'Mã HĐ', 'Tên KH', 'Giải thưởng', 'Giá trị'];
    const rows = winners.map(w => [
      w.timestamp.toLocaleString('vi-VN'),
      w.invoice.id,
      w.invoice.customerName,
      w.prize,
      w.prizeValue,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `danh_sach_trung_thuong_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="w-6 h-6 text-yellow-600" />
                Danh Sách Trúng Thưởng
              </CardTitle>
              <CardDescription>Tổng số người trúng: {winners.length}</CardDescription>
            </div>
            {winners.length > 0 && (
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Xuất CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {winners.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có người trúng thưởng</p>
            </div>
          ) : (
            <div className="space-y-6">
              {prizes.map((prize, idx) => {
                const prizeWinners = getWinnersByPrize(prize.name);
                if (prizeWinners.length === 0) return null;

                return (
                  <div key={idx} className="space-y-3">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${prize.color} text-white font-bold`}>
                      <Trophy className="w-5 h-5" />
                      {prize.name} ({prizeWinners.length}/{prize.count})
                    </div>
                    <div className="grid gap-3">
                      {prizeWinners.map((winner, winnerIdx) => (
                        <div
                          key={winnerIdx}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                              {winnerIdx + 1}
                            </div>
                            <div>
                              <p className="font-bold text-lg text-gray-800">{winner.invoice.id}</p>
                              <p className="text-sm text-gray-600">{winner.invoice.customerName}</p>
                              <p className="text-xs text-gray-500">{winner.invoice.phone}</p>
                              <p className="text-xs text-gray-500">
                                {winner.timestamp.toLocaleString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">{winner.prizeValue}</p>
                            <p className="text-xs text-gray-500">
                              {winner.invoice.amount.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {winners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thống Kê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {prizes.map((prize, idx) => {
                const count = getWinnersByPrize(prize.name).length;
                return (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{prize.name}</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {count}/{prize.count}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}