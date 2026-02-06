import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Invoice, Winner, prizes } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface DrawMachineProps {
  availableInvoices: Invoice[];
  addWinner: (winner: Winner) => void;
  totalInvoices: number;
  totalWinners: number;
  resetAll: () => void;
}

const FIXED_WINNER_TURN = 8;
const FIXED_WINNER_INVOICE_ID = 'LB2665520290';

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
  const displayedInvoiceRef = useRef<Invoice | null>(null);

  const currentPrize = prizes[currentPrizeIndex];
  const remainingDrawsForPrize = currentPrize
    ? currentPrize.count - currentDrawNumber
    : 0;

  /* ======================
   * START DRAW
   * ====================== */
  const startDraw = () => {
    if (availableInvoices.length === 0) {
      toast.error('Không còn hóa đơn nào để quay');
      return;
    }

    if (currentPrizeIndex >= prizes.length) {
      toast.error('Đã quay hết tất cả các giải');
      return;
    }

    const prizeAtStart = prizes[currentPrizeIndex];
    const drawNumberAtStart = currentDrawNumber;

    setIsDrawing(true);

    // 🎰 LUÔN NHẤP NHÁY RANDOM
    intervalRef.current = setInterval(() => {
      const random =
        availableInvoices[Math.floor(Math.random() * availableInvoices.length)];

      setDisplayedInvoice(random);
      displayedInvoiceRef.current = random;
    }, 150);

    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      finalizeDraw(prizeAtStart, drawNumberAtStart);
    }, 5000);
  };

  /* ======================
   * FINALIZE DRAW (CHỐT KẾT QUẢ)
   * ====================== */
  const finalizeDraw = (
    prizeAtStart: typeof prizes[0],
    drawNumberAtStart: number
  ) => {
    const currentTurn = totalWinners + 1;

    let finalInvoice: Invoice | null = displayedInvoiceRef.current;

    // 🎯 NẾU ĐÚNG LƯỢT FIX → CHỐT NGƯỜI CHỈ ĐỊNH
    if (currentTurn === FIXED_WINNER_TURN) {
      const fixed = availableInvoices.find(
        inv => inv.id === FIXED_WINNER_INVOICE_ID
      );
      if (fixed) {
        finalInvoice = fixed;
      }
    }

    if (!finalInvoice) return;

    // 🔥 QUAN TRỌNG: SYNC UI KHUNG QUAY
    setDisplayedInvoice(finalInvoice);
    displayedInvoiceRef.current = finalInvoice;

    const newWinner: Winner = {
      invoice: finalInvoice,
      prize: prizeAtStart.name,
      prizeValue: prizeAtStart.value,
      timestamp: new Date(),
    };

    setIsDrawing(false);
    setWinner(newWinner);
    addWinner(newWinner);

    setTimeout(() => setShowWinnerDialog(true), 400);

    setTimeout(() => {
      const next = drawNumberAtStart + 1;
      if (next >= prizeAtStart.count) {
        setCurrentPrizeIndex(p => p + 1);
        setCurrentDrawNumber(0);
      } else {
        setCurrentDrawNumber(next);
      }
    }, 500);

    toast.success(`Đã quay trúng ${prizeAtStart.name}!`);
  };

  /* ======================
   * RESET
   * ====================== */
  const handleReset = () => {
    if (confirm('Bạn có chắc chắn muốn reset toàn bộ kết quả quay số?')) {
      resetAll();
      setCurrentPrizeIndex(0);
      setCurrentDrawNumber(0);
      setDisplayedInvoice(null);
      displayedInvoiceRef.current = null;
      toast.success('Đã reset kết quả');
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showWinnerDialog) {
      setTimeout(() => {
        setDisplayedInvoice(null);
        displayedInvoiceRef.current = null;
      }, 300);
    }
  }, [showWinnerDialog]);

  const allPrizesDrawn = currentPrizeIndex >= prizes.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-md">
          <CardContent className="pt-6">
            <p>Tổng HĐ</p>
            <p className="text-3xl font-bold">{totalInvoices}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md">
          <CardContent className="pt-6">
            <p>Đã Trúng</p>
            <p className="text-3xl font-bold text-green-600">{totalWinners}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md">
          <CardContent className="pt-6">
            <p>Còn Lại</p>
            <p className="text-3xl font-bold text-blue-600">
              {availableInvoices.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md">
          <CardContent className="pt-6">
            <p>Giải Còn Lại</p>
            <p className="text-3xl font-bold text-purple-600">
              {prizes.reduce((s, p, i) => (i >= currentPrizeIndex ? s + p.count : s), 0)
                - currentDrawNumber}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Draw */}
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader
          className={`bg-gradient-to-r ${currentPrize?.color || 'from-gray-400 to-gray-600'}
                      text-white rounded-xl`}
        >
          <CardTitle className="flex justify-center gap-2">
            <Trophy /> {allPrizesDrawn ? 'Đã Hoàn Thành' : currentPrize?.name} <Trophy />
          </CardTitle>
          {!allPrizesDrawn && (
            <CardDescription className="text-center text-white/90">
              Giải thưởng: {currentPrize?.value} • Còn {remainingDrawsForPrize} giải
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="py-8 bg-transparent">
          <div className="min-h-[250px] flex items-center justify-center bg-white/60 backdrop-blur-lg rounded-xl border-4 border-purple-300">
            <AnimatePresence mode="wait">
              {displayedInvoice ? (
                <motion.div
                  key={displayedInvoice.id}
                  animate={isDrawing ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                  transition={
                    isDrawing
                      ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.2 }
                  }
                >
                  <div className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-xl border-4 border-yellow-400 text-center">
                    <p className="text-sm text-gray-600">Số Hóa Đơn</p>
                    <p className="text-5xl font-bold text-purple-600">
                      {displayedInvoice.id}
                    </p>
                    <p className="text-xl font-semibold">
                      {displayedInvoice.customerName}
                    </p>
                    <p className="text-base text-gray-500 mt-1">
                      {displayedInvoice.phone?.slice(0, -4) + '****'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center text-gray-500">
                  <Sparkles className="w-16 h-16 mx-auto mb-4" />
                  Nhấn “Bắt đầu quay”
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={startDraw} disabled={isDrawing || allPrizesDrawn} size="lg">
              {isDrawing ? 'ĐANG QUAY...' : 'BẮT ĐẦU QUAY'}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isDrawing || totalWinners === 0}
              variant="outline"
            >
              <RotateCcw className="w-5 h-5 mr-2" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Winner Dialog */}
      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="bg-white/90 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">
              CHÚC MỪNG KHÁCH HÀNG
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <p className="text-4xl font-bold text-purple-600">
              {winner?.invoice.id}
            </p>
            <p className="text-xl">{winner?.invoice.customerName}</p>
            <p className="text-2xl font-bold text-green-600">
              {winner?.prizeValue}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
