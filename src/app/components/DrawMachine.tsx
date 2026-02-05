import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Invoice, Winner, prizes } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface DrawMachineProps {
  availableInvoices: Invoice[];
  addWinner: (winner: Winner) => void;
  totalInvoices: number;
  totalWinners: number;
  resetAll: () => void;
}

export function DrawMachine({
  availableInvoices,
  addWinner,
  totalInvoices,
  totalWinners,
  resetAll,
}: DrawMachineProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [currentDrawNumber, setCurrentDrawNumber] = useState(0);
  const [displayedInvoice, setDisplayedInvoice] = useState<Invoice | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentPrize = prizes[currentPrizeIndex];
  const remainingDrawsForPrize = currentPrize ? currentPrize.count - currentDrawNumber : 0;

  const startDraw = () => {
    if (availableInvoices.length === 0) {
      toast.error('Không còn hóa đơn nào để quay');
      return;
    }

    if (currentPrizeIndex >= prizes.length) {
      toast.error('Đã quay hết tất cả các giải');
      return;
    }

    setIsDrawing(true);
    let counter = 0;
    const duration = 3000; // 3 seconds
    const intervalTime = 50;

    intervalRef.current = setInterval(() => {
      const randomInvoice = availableInvoices[Math.floor(Math.random() * availableInvoices.length)];
      setDisplayedInvoice(randomInvoice);
      counter += intervalTime;

      if (counter >= duration) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        finalizeDraw();
      }
    }, intervalTime);
  };

  const finalizeDraw = () => {
    setIsDrawing(false);
    
    if (availableInvoices.length === 0) return;

    const winningInvoice = availableInvoices[Math.floor(Math.random() * availableInvoices.length)];
    
    const newWinner: Winner = {
      invoice: winningInvoice,
      prize: currentPrize.name,
      prizeValue: currentPrize.value,
      timestamp: new Date(),
    };

    setWinner(newWinner);
    setShowWinnerDialog(true);
    addWinner(newWinner);

    // Move to next draw
    const nextDrawNumber = currentDrawNumber + 1;
    if (nextDrawNumber >= currentPrize.count) {
      setCurrentPrizeIndex(currentPrizeIndex + 1);
      setCurrentDrawNumber(0);
    } else {
      setCurrentDrawNumber(nextDrawNumber);
    }

    toast.success(`Đã quay trúng ${currentPrize.name}!`);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn reset toàn bộ kết quả quay số?')) {
      resetAll();
      setCurrentPrizeIndex(0);
      setCurrentDrawNumber(0);
      setDisplayedInvoice(null);
      toast.success('Đã reset kết quả');
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const allPrizesDrawn = currentPrizeIndex >= prizes.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Tổng HĐ</p>
            <p className="text-3xl font-bold text-gray-800">{totalInvoices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Đã Trúng</p>
            <p className="text-3xl font-bold text-green-600">{totalWinners}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Còn Lại</p>
            <p className="text-3xl font-bold text-blue-600">{availableInvoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Giải Còn Lại</p>
            <p className="text-3xl font-bold text-purple-600">
              {prizes.reduce((sum, p, idx) => idx >= currentPrizeIndex ? sum + p.count : sum, 0) - currentDrawNumber}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Draw Machine */}
      <Card className="overflow-hidden">
        <CardHeader className={`bg-gradient-to-r ${currentPrize?.color || 'from-gray-400 to-gray-600'} text-white`}>
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="w-6 h-6" />
            {allPrizesDrawn ? 'Đã Hoàn Thành' : currentPrize?.name || 'Hoàn Thành'}
            <Trophy className="w-6 h-6" />
          </CardTitle>
          {!allPrizesDrawn && (
            <CardDescription className="text-white/90 text-center">
              Giải thưởng: {currentPrize?.value} • Còn {remainingDrawsForPrize} giải chưa quay
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          {/* Display Area */}
          <div className="mb-8">
            <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 min-h-64 flex items-center justify-center border-4 border-purple-300 overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiM5MzMzZWEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
              
              <AnimatePresence mode="wait">
                {displayedInvoice ? (
                  <motion.div
                    key={displayedInvoice.id}
                    initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                    transition={{ duration: 0.2 }}
                    className="text-center z-10"
                  >
                    <div className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-yellow-400">
                      <p className="text-sm text-gray-600 mb-2">Mã Hóa Đơn</p>
                      <p className="text-5xl font-bold text-purple-600 mb-4">{displayedInvoice.id}</p>
                      <p className="text-xl text-gray-800 font-semibold">{displayedInvoice.customerName}</p>
                      <p className="text-sm text-gray-600 mt-2">{displayedInvoice.phone}</p>
                      {displayedInvoice.amount > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          {displayedInvoice.amount.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center z-10"
                  >
                    {allPrizesDrawn ? (
                      <div>
                        <Trophy className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
                        <p className="text-2xl font-bold text-gray-800">
                          Đã hoàn thành tất cả các giải!
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Sparkles className="w-24 h-24 text-purple-400 mx-auto mb-4" />
                        <p className="text-2xl font-bold text-gray-600">
                          Nhấn "Bắt Đầu Quay" để bắt đầu
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={startDraw}
              disabled={isDrawing || availableInvoices.length === 0 || allPrizesDrawn}
              size="lg"
              className="text-xl font-bold px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {isDrawing ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  ĐANG QUAY...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  BẮT ĐẦU QUAY
                </span>
              )}
            </Button>

            <Button
              onClick={handleReset}
              disabled={isDrawing || totalWinners === 0}
              size="lg"
              variant="outline"
              className="text-lg font-semibold px-8 py-6"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Winner Dialog */}
      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              🎉 CHÚC MỪNG! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="text-8xl"
            >
              🏆
            </motion.div>
            <div className="space-y-2">
              <p className="text-lg text-gray-600">Hóa đơn</p>
              <p className="text-4xl font-bold text-purple-600">{winner?.invoice.id}</p>
              <p className="text-xl font-semibold text-gray-800">{winner?.invoice.customerName}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border-2 border-yellow-400">
              <p className="text-sm text-gray-600 mb-1">Đã trúng</p>
              <p className="text-2xl font-bold text-orange-600">{winner?.prize}</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{winner?.prizeValue}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}