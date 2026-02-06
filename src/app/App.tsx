import { useState } from 'react';
import { InvoiceInput } from './components/InvoiceInput';
import { DrawMachine } from './components/DrawMachine';
import { WinnersList } from './components/WinnersList';
import { PrizeStructure } from './components/PrizeStructure';
import { Trophy, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

export interface Invoice {
  id: string;
  customerName: string;
  phone: string;
  region: string;
}

export interface Winner {
  invoice: Invoice;
  prize: string;
  prizeValue: string;
  timestamp: Date;
}

export interface Prize {
  name: string;
  value: string;
  count: number;
  color: string;
}

export const prizes: Prize[] = [
  { name: 'Giải Nhất', value: '5.000.000đ', count: 1, color: 'from-yellow-400 to-yellow-600' },
  { name: 'Giải Nhì', value: '3.000.000đ', count: 3, color: 'from-red-300 to-red-400' },
  { name: 'Giải Ba', value: '2.000.000đ', count: 6, color: 'from-orange-400 to-orange-600' },
  { name: 'Giải Khuyến Khích', value: '1.000.000đ', count: 10, color: 'from-blue-400 to-blue-600' },
];

export default function App() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [...prev, invoice]);
  };

  const addWinner = (winner: Winner) => {
    setWinners(prev => [winner, ...prev]);
  };

  const getAvailableInvoices = () => {
    const winnerIds = new Set(winners.map(w => w.invoice.id));
    return invoices.filter(inv => !winnerIds.has(inv.id));
  };

  const resetAll = () => {
    setWinners([]);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(/images/background.jpg)`,
        backgroundAttachment: "fixed"
      }}
    >
      <div className="min-h-screen">
        {/* Header */}
        <header className="relative text-red-600 py-10 px-4">
          <div className="container mx-auto text-center relative z-10">
            <div className="flex items-center justify-center gap-4 mb-3">
              <Trophy className="w-10 h-10" />
              <h1 className="text-4xl md:text-6xl font-bold">QUAY SỐ TRÚNG THƯỞNG</h1>
              <Trophy className="w-10 h-10" />
            </div>
            <p className="text-lg md:text-xl opacity-90">KHAI XUÂN PHÚ QUÝ, QUAY SỐ ĐÓN LỘC XUÂN 2026 CÙNG PANTIO</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm md:text-base">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Tổng giá trị giải thưởng: 36.000.000đ</span>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Tabs defaultValue="draw" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="setup">Cài Đặt</TabsTrigger>
              <TabsTrigger value="draw">Quay Số</TabsTrigger>
              <TabsTrigger value="winners">Kết Quả</TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <InvoiceInput invoices={invoices} addInvoice={addInvoice} setInvoices={setInvoices} />
                <PrizeStructure />
              </div>
            </TabsContent>

            <TabsContent value="draw">
              <DrawMachine
                availableInvoices={getAvailableInvoices()}
                addWinner={addWinner}
                totalInvoices={invoices.length}
                totalWinners={winners.length}
                resetAll={resetAll}
              />
            </TabsContent>

            <TabsContent value="winners">
              <WinnersList winners={winners} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}