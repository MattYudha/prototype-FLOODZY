'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function DataSensorPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Data Sensor</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Halaman ini akan menampilkan data real-time dari sensor-sensor
            pemantau banjir.
          </p>
          <p className="mt-4 text-muted-foreground">
            Data seperti ketinggian air, curah hujan, dan status pompa akan
            divisualisasikan di sini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
