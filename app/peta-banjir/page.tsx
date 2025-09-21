'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious, 
  type CarouselApi 
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Waves, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

// Dinamis impor PetaBanjirClient untuk menghindari masalah SSR dengan Leaflet
const PetaBanjirClient = dynamic(() => import('@/components/peta-banjir/PetaBanjirClient'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse" />
});

// Tipe data harus cocok dengan yang ada di PetaBanjirClient
interface FloodReport {
  id: string;
  position: [number, number];
  timestamp: string;
  waterLevel: number;
}

interface EvacuationPoint {
  id: string;
  name: string;
  position: [number, number];
}

// Mock data dipindahkan ke sini karena kita butuh akses di client component
const mockFloodReports: FloodReport[] = [
  {
    id: 'report-1',
    position: [-6.2088, 106.8456],
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    waterLevel: 30,
  },
  {
    id: 'report-2',
    position: [-6.2188, 106.8556],
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    waterLevel: 50,
  },
  {
    id: 'report-3',
    position: [-6.1988, 106.8256],
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    waterLevel: 20,
  },
  {
    id: 'report-4',
    position: [-6.2288, 106.8656],
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    waterLevel: 40,
  },
  {
    id: 'report-5',
    position: [-6.1888, 106.8356],
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    waterLevel: 60,
  },
];

const mockEvacuationPoints: EvacuationPoint[] = [
  { id: 'evac-1', name: 'Posko Evakuasi Utama', position: [-6.1754, 106.8272] },
  { id: 'evac-2', name: 'Gedung Serbaguna', position: [-6.2488, 106.8856] },
];

export default function PetaBanjirPage() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    mockFloodReports.length > 0 ? mockFloodReports[0].id : null
  );
  const [api, setApi] = useState<CarouselApi>();
  const [isCarouselOpen, setIsCarouselOpen] = useState(true);

  const reports = mockFloodReports;
  const evacuationPoints = mockEvacuationPoints;

  useEffect(() => {
    if (!api) return;
 
    const onSelect = () => {
      const selectedId = reports[api.selectedScrollSnap()].id;
      setSelectedReportId(selectedId);
    };

    api.on("select", onSelect);
 
    return () => {
      api.off("select", onSelect);
    };
  }, [api, reports]);

  const handleMapClick = (coords: [number, number]) => {
    console.log('Map clicked at:', coords);
  };

  const handleCardClick = (reportId: string, index: number) => {
    setSelectedReportId(reportId);
    if (api) {
      api.scrollTo(index);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-var(--header-height))] flex flex-col md:relative">
      <div className={clsx(
        "w-full transition-all duration-300 ease-in-out",
        isCarouselOpen ? "h-3/5" : "h-[calc(100%-3rem)]",
        "md:h-full"
      )}>
        <PetaBanjirClient
          reports={reports}
          evacuationPoints={evacuationPoints}
          onMapClick={handleMapClick}
          selectedReportId={selectedReportId}
        />
      </div>
      
      <div className={clsx(
        "relative bg-card border-t",
        "transition-all duration-300 ease-in-out",
        isCarouselOpen ? "h-2/5" : "h-12",
        "md:absolute md:bottom-0 md:left-0 md:right-0 md:z-[1000] md:h-auto md:bg-transparent md:border-none"
      )}>
        <button 
          onClick={() => setIsCarouselOpen(!isCarouselOpen)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-card p-1 rounded-full border shadow-md md:hidden"
          aria-label="Toggle report panel"
        >
          {isCarouselOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>

        <div className={clsx(
            "p-4 h-full w-full transition-opacity duration-100",
            isCarouselOpen ? 'opacity-100' : 'opacity-0 invisible'
        )}>
          <Carousel 
            setApi={setApi}
            opts={{ align: "start", loop: reports.length > 3 }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent>
              {reports.map((report, index) => (
                <CarouselItem key={report.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card 
                      className={`cursor-pointer transition-all ${selectedReportId === report.id ? 'border-primary shadow-lg' : 'border-border'}`}
                      onClick={() => handleCardClick(report.id, index)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 space-y-2">
                          <div className="flex items-start justify-between w-full">
                              <div className='flex items-center'>
                                  <Waves className="w-6 h-6 mr-2 text-blue-500" />
                                  <span className="text-lg font-bold">{report.waterLevel} cm</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(report.timestamp), { addSuffix: true, locale: id })}
                              </span>
                          </div>
                          <p className="text-sm text-muted-foreground w-full text-left">
                              Laporan dari sekitar lokasi ini.
                          </p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className='hidden sm:flex' />
            <CarouselNext className='hidden sm:flex' />
          </Carousel>
        </div>
      </div>
    </div>
  );
}