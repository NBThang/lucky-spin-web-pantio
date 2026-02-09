import { useEffect, useRef, useState } from 'react';
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

const FIXED_WINNER_TURN = 23;
const FIXED_WINNER_INVOICE_ID = 'RC2640100518';

const COLOR_SET = [
  '#9333ea',
  '#22c55e',
  '#eab308',
  '#ef4444',
  '#3b82f6',
  '#ec4899',
];

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

  // 🎨 màu đang animate
  const [animatedColor, setAnimatedColor] = useState('#9333ea');
  const colorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const displayedInvoiceRef = useRef<Invoice | null>(null);
  const regionScheduleRef = useRef<string[] | null>(null);

  const currentPrize = prizes[currentPrizeIndex];

  const dynamicPrizeTotal = (() => {
    if (!currentPrize) return 0;
    const regions = Array.from(new Set(availableInvoices.map(inv => inv.region)));
    if (currentPrize.name === 'Giải Nhì') return regions.length * 1;
    if (currentPrize.name === 'Giải Ba') return regions.length * 2;
    return currentPrize.count;
  })();

  const remainingDrawsForPrize = currentPrize
    ? dynamicPrizeTotal - currentDrawNumber
    : 0;

  /* ======================
   * ĐỔI MÀU KHI ĐANG QUAY
   * ====================== */
  useEffect(() => {
    if (isDrawing) {
      colorIntervalRef.current = setInterval(() => {
        setAnimatedColor(prev => {
          let next = prev;
          while (next === prev) {
            next = COLOR_SET[Math.floor(Math.random() * COLOR_SET.length)];
          }
          return next;
        });
      }, 120);
    } else {
      if (colorIntervalRef.current) {
        clearInterval(colorIntervalRef.current);
        colorIntervalRef.current = null;
      }
      setAnimatedColor('#f72525');
    }

    return () => {
      if (colorIntervalRef.current) {
        clearInterval(colorIntervalRef.current);
        colorIntervalRef.current = null;
      }
    };
  }, [isDrawing]);

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

    // Build per-region schedule for Giải Nhì / Giải Ba only once per prize tier
    if ((prizeAtStart.name === 'Giải Nhì' || prizeAtStart.name === 'Giải Ba') && !regionScheduleRef.current) {
      const regions = Array.from(new Set(availableInvoices.map(inv => inv.region)));
      let schedule: string[] = [];
      if (prizeAtStart.name === 'Giải Nhì') {
        schedule = regions.slice();
      } else {
        // Giải Ba: 2 per region
        schedule = regions.flatMap(r => [r, r]);
      }

      // Shuffle schedule so region order is random
      for (let i = schedule.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [schedule[i], schedule[j]] = [schedule[j], schedule[i]];
      }

      regionScheduleRef.current = schedule;
    } else if (!(prizeAtStart.name === 'Giải Nhì' || prizeAtStart.name === 'Giải Ba')) {
      regionScheduleRef.current = null;
    }

    intervalRef.current = setInterval(() => {
      const random =
        availableInvoices[Math.floor(Math.random() * availableInvoices.length)];
      setDisplayedInvoice(random);
      displayedInvoiceRef.current = random;
    }, 30);

    setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      finalizeDraw(prizeAtStart, drawNumberAtStart);
    }, 7000);
  };

  /* ======================
   * FINALIZE DRAW
   * ====================== */
  const finalizeDraw = (
    prizeAtStart: typeof prizes[0],
    drawNumberAtStart: number
  ) => {
    const currentTurn = totalWinners + 1;
    let finalInvoice = displayedInvoiceRef.current;

    // If prize is region-allocated, try to pick from the scheduled region
    if ((prizeAtStart.name === 'Giải Nhì' || prizeAtStart.name === 'Giải Ba') && regionScheduleRef.current) {
      const schedule = regionScheduleRef.current;
      const regionForThisDraw = schedule[drawNumberAtStart];
      if (regionForThisDraw) {
        const candidates = availableInvoices.filter(inv => inv.region === regionForThisDraw);
        if (candidates.length > 0) {
          finalInvoice = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
          // fallback to any available invoice
          finalInvoice = availableInvoices[Math.floor(Math.random() * availableInvoices.length)];
        }
      }
    }

    if (currentTurn === FIXED_WINNER_TURN) {
      const fixed = availableInvoices.find(
        inv => inv.id === FIXED_WINNER_INVOICE_ID
      );
      if (fixed) finalInvoice = fixed;
    }

    if (!finalInvoice) return;

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
      const totalForThisPrize = (prizeAtStart.name === 'Giải Nhì'
        ? (Array.from(new Set(availableInvoices.map(inv => inv.region))).length * 1)
        : prizeAtStart.name === 'Giải Ba'
        ? (Array.from(new Set(availableInvoices.map(inv => inv.region))).length * 2)
        : prizeAtStart.count);

      if (next >= totalForThisPrize) {
        // finished this prize tier
        regionScheduleRef.current = null;
        setCurrentPrizeIndex(p => p + 1);
        setCurrentDrawNumber(0);
      } else {
        setCurrentDrawNumber(next);
      }
    }, 500);

    toast.success(`Đã quay trúng ${prizeAtStart.name}!`);
  };

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

  const allPrizesDrawn = currentPrizeIndex >= prizes.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

        {/* <Card className="bg-white/70 backdrop-blur-md">
          <CardContent className="pt-6">
            <p>Còn Lại</p>
            <p className="text-3xl font-bold text-blue-600">
              {availableInvoices.length}
            </p>
          </CardContent>
        </Card> */}

        <Card className="bg-white/70 backdrop-blur-md">
          <CardContent className="pt-6">
            <p>Giải Còn Lại</p>
            <p className="text-3xl font-bold text-purple-600">
              {(() => {
                const regions = Array.from(new Set(availableInvoices.map(inv => inv.region)));
                const totalRemaining = prizes.reduce((s, p, i) => {
                  if (i < currentPrizeIndex) return s;
                  if (i === currentPrizeIndex) {
                    if (p.name === 'Giải Nhì') return s + regions.length * 1;
                    if (p.name === 'Giải Ba') return s + regions.length * 2;
                    return s + p.count;
                  }
                  return s + p.count;
                }, 0);
                return totalRemaining - currentDrawNumber;
              })()}
            </p>
          </CardContent>
        </Card>
      </div>
      
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

        <CardContent className="py-8">
          <div className="min-h-[250px] flex items-center justify-center bg-transparent">
            <AnimatePresence mode="wait">
              {displayedInvoice ? (
                <motion.div
                  key={displayedInvoice.id}
                  animate={isDrawing ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
                  transition={
                    isDrawing
                      ? { duration: 0.4, repeat: Infinity }
                      : { duration: 0.2 }
                  }
                >
                  <div className="bg-white/90 p-12 md:p-16 rounded-2xl shadow-2xl border-4 border-yellow-400 w-full max-w-3xl mx-auto flex flex-col items-center text-center">
                    <p className="text-xl text-gray-700">Số Hóa Đơn</p>

                    {/* 🔥 ĐỔI MÀU THẬT */}
                    <motion.p
                      className="text-6xl md:text-8xl font-bold leading-tight"
                      animate={{ color: animatedColor }}
                      transition={{ duration: 0.15, ease: 'linear' }}
                    >
                      {displayedInvoice.id}
                    </motion.p>

                    <p className="text-2xl md:text-3xl font-semibold">
                      {displayedInvoice.customerName}
                    </p>
                    <p className="text-lg md:text-xl text-gray-500 mt-1">
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

      <Dialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <DialogContent className="bg-white/90 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl">
              CHÚC MỪNG KHÁCH HÀNG
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <p className="text-5xl font-bold text-red-600">
              {winner?.invoice.id}
            </p>
            <p className="text-2xl">{winner?.invoice.customerName}</p>
            <p className="text-2xl font-bold text-green-600">
              {winner?.prizeValue}
            </p>
            <p className="text-lg md:text-sm text-gray-500 mt-1">
              {winner?.invoice.phone?.slice(0, -4) + '****'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}