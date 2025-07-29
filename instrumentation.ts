// instrumentation.ts

// Pastikan ini dijalankan hanya di lingkungan server Node.js
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const {
      getNodeAutoInstrumentations,
    } = require('@opentelemetry/auto-instrumentations-node');
    const {
      OTLPTraceExporter,
    } = require('@opentelemetry/exporter-trace-otlp-grpc');

    // Konfigurasi exporter, contoh: kirim data ke Jaeger/Collector
    // URL default biasanya http://localhost:4317
    const traceExporter = new OTLPTraceExporter();

    const sdk = new NodeSDK({
      // Beri nama layanan Anda agar mudah dikenali di tool visualisasi
      serviceName: 'floodzy-app',
      traceExporter,
      instrumentations: [
        // Aktifkan auto-instrumentation untuk melacak semua library populer
        getNodeAutoInstrumentations({
          // Nonaktifkan instrumentasi yang tidak relevan jika perlu
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
        }),
      ],
    });

    // Mulai SDK
    sdk.start();
    console.log(
      '✅ OpenTelemetry instrumentation registered for Node.js runtime.',
    );

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk
        .shutdown()
        .then(() => console.log('Tracing terminated.'))
        .catch((error: any) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
    });
  }
}
