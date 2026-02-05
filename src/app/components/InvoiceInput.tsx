import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Invoice } from '../App';
import { Plus, Upload, Trash2, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface InvoiceInputProps {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  setInvoices: (invoices: Invoice[]) => void;
}

export function InvoiceInput({ invoices, addInvoice, setInvoices }: InvoiceInputProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        let errorCount = 0;

        jsonData.forEach((row: any) => {
          // Support multiple column name formats
          const id = row['Mã HĐ'] || row['Ma HD'] || row['MaHD'] || row['ID'] || row['id'];
          const name = row['Tên Khách Hàng'] || row['Ten Khach Hang'] || row['TenKH'] || row['Name'] || row['name'];
          const phoneNum = row['SDT'] || row['SĐT'] || row['Phone'] || row['phone'] || row['Số điện thoại'];
          const amt = row['Giá trị'] || row['Gia tri'] || row['Amount'] || row['amount'] || 0;

          if (id && name && phoneNum) {
            const newInvoice: Invoice = {
              id: String(id).trim(),
              customerName: String(name).trim(),
              phone: String(phoneNum).trim(),
              amount: typeof amt === 'number' ? amt : parseFloat(String(amt).replace(/[^\d.]/g, '')) || 0,
            };
            addInvoice(newInvoice);
            successCount++;
          } else {
            errorCount++;
          }
        });

        toast.success(`Đã nhập ${successCount} hóa đơn từ file Excel${errorCount > 0 ? `, ${errorCount} lỗi` : ''}`);
        event.target.value = ''; // Reset file input
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra định dạng file.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách hóa đơn?')) {
      setInvoices([]);
      toast.success('Đã xóa toàn bộ danh sách');
    }
  };

  return (
    <div className="space-y-6">
      {/* Excel Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Nhập File Excel
          </CardTitle>
          <CardDescription>
            File Excel phải có các cột: <span className="font-semibold">Mã HĐ, Tên Khách Hàng, SDT</span> (Giá trị - tùy chọn)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors bg-gradient-to-br from-green-50 to-emerald-50">
            <FileSpreadsheet className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <Label htmlFor="excel-upload" className="cursor-pointer">
              <div className="text-lg font-semibold text-gray-700 mb-2">
                Chọn file Excel để tải lên
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Hỗ trợ định dạng .xlsx, .xls
              </div>
              <Input
                id="excel-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button type="button" size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn File Excel
                </span>
              </Button>
            </Label>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <span className="font-semibold">💡 Mẫu file Excel:</span>
            </p>
            <div className="bg-white rounded border border-blue-300 p-3 font-mono text-xs overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="px-2 py-1">Mã HĐ</th>
                    <th className="px-2 py-1">Tên Khách Hàng</th>
                    <th className="px-2 py-1">SĐT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1">HD001</td>
                    <td className="px-2 py-1">Nguyễn Văn A</td>
                    <td className="px-2 py-1">0912345678</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1">HD002</td>
                    <td className="px-2 py-1">Trần Thị B</td>
                    <td className="px-2 py-1">0987654321</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Danh Sách Hóa Đơn
              </CardTitle>
              <CardDescription>Tổng số: {invoices.length} hóa đơn</CardDescription>
            </div>
            {invoices.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa Tất Cả
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Chưa có hóa đơn nào</p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {invoices.map((invoice, index) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.customerName}</p>
                    <p className="text-xs text-gray-500">{invoice.phone}</p>
                  </div>
                  {invoice.amount > 0 && (
                    <p className="text-sm font-medium text-gray-700">
                      {invoice.amount.toLocaleString('vi-VN')}đ
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}