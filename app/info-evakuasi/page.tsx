
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InfoEvakuasiPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informasi Evakuasi</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Halaman ini akan menampilkan informasi penting mengenai lokasi dan prosedur evakuasi saat terjadi banjir.</p>
          <p className="mt-4 text-muted-foreground">Konten lebih lanjut seperti peta lokasi pengungsian, rute evakuasi, dan kontak darurat akan ditambahkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
