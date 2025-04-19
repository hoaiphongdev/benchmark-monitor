import { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { BenchmarkData, ServiceConfig, serviceConfigs } from './lib/utils.local';

// Chart styling constants
const CHART_MARGIN = { top: 10, right: 10, left: 0, bottom: 0 };
const CHART_HEIGHT = 160;
const CHART_LINE_WIDTH = 2;
const CHART_ACTIVE_DOT_RADIUS = 5;
const MAX_DATA_POINTS = 60; // Keep last 60 seconds of data

// Available metrics to display
const METRICS = [
  { id: 'latency', name: 'Latency', unit: 'ms' },
  { id: 'memoryUsage', name: 'Memory Usage', unit: 'MB' },
  { id: 'throughput', name: 'Throughput', unit: 'ops/sec' },
  { id: 'cpuUsage', name: 'CPU Usage', unit: '%' },
];

function App() {
  const [streaming, setStreaming] = useState(false);
  const [services, setServices] = useState<ServiceConfig[]>(serviceConfigs);
  const [serviceData, setServiceData] = useState<Record<string, BenchmarkData[]>>({
    deno: [],
    node: [],
    nest: [],
  });
  const [selectedMetric, setSelectedMetric] = useState<string>('latency');
  const eventSourcesRef = useRef<Record<string, EventSource | null>>({});

  // Function to toggle service visibility
  const toggleService = (id: ServiceConfig['id']) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, enabled: !service.enabled } : service,
      ),
    );
  };

  // Function to toggle streaming
  const toggleStreaming = () => {
    if (streaming) {
      // Stop all event sources
      Object.values(eventSourcesRef.current).forEach((es) => {
        if (es) es.close();
      });
      eventSourcesRef.current = {};
    } else {
      // Start streaming from all services
      services.forEach((service) => {
        if (!service.enabled) return;

        // Extract base URL and construct stream endpoint
        const baseUrl = service.url.includes('/benchmark')
          ? service.url.split('/benchmark')[0]
          : service.url;
        const streamUrl = `${baseUrl}/benchmark/stream`;

        console.log(`Starting stream from ${streamUrl}`);

        try {
          // Close any existing connection first
          if (eventSourcesRef.current[service.id]) {
            eventSourcesRef.current[service.id]?.close();
          }

          // Create new EventSource with proper error handling
          const eventSource = new EventSource(streamUrl);

          eventSource.onopen = () => {
            console.log(`Stream connected: ${service.name}`);
          };

          eventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data) as BenchmarkData;
              console.log(`Data received from ${service.name}:`, data);

              setServiceData((prev) => {
                const serviceHistory = [...(prev[service.id] || [])];

                // Add new data point
                serviceHistory.push(data);

                // Keep only the last MAX_DATA_POINTS
                const updatedHistory = serviceHistory.slice(-MAX_DATA_POINTS);

                return {
                  ...prev,
                  [service.id]: updatedHistory,
                };
              });
            } catch (parseError) {
              console.error(`Error parsing data from ${service.name}:`, parseError, event.data);
            }
          };

          eventSource.onerror = (error) => {
            console.error(`Error with EventSource for ${service.name}:`, error);
            // Don't immediately close on first error - let the browser retry
            if (eventSource.readyState === EventSource.CLOSED) {
              console.log(`Stream ${service.name} closed due to error`);
              eventSourcesRef.current[service.id] = null;
            }
          };

          eventSourcesRef.current[service.id] = eventSource;
        } catch (error) {
          console.error(`Failed to create EventSource for ${service.name}:`, error);
        }
      });
    }

    setStreaming(!streaming);
  };

  // Clean up on unmount or when services change
  useEffect(() => {
    return () => {
      Object.values(eventSourcesRef.current).forEach((es) => {
        if (es) es.close();
      });
    };
  }, []);

  // Get the latest value for a specific metric and service
  const getLatestMetricValue = (serviceId: string, metricKey: string): string => {
    const data = serviceData[serviceId] || [];
    if (!data.length) return '0';

    const value = data[data.length - 1][metricKey as keyof BenchmarkData];
    if (typeof value === 'number') {
      return value.toFixed(metricKey === 'memoryUsage' ? 1 : metricKey === 'cpuUsage' ? 0 : 2);
    }
    return '0';
  };

  // Get the appropriate unit for a metric
  const getMetricUnit = (metricId: string): string => {
    const metric = METRICS.find((m) => m.id === metricId);
    return metric ? metric.unit : '';
  };

  // Get display name for a metric
  const getMetricName = (metricId: string): string => {
    switch (metricId) {
      case 'latency':
        return 'Average Latency';
      case 'memoryUsage':
        return 'Memory Usage';
      case 'throughput':
        return 'Requests per second';
      case 'cpuUsage':
        return 'CPU Load';
      default:
        return metricId;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4 md:p-6">
      <header className="mb-5">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-zinc-100">Service Performance Dashboard</h1>
          <div className="flex gap-2">
            <Button
              variant={streaming ? 'destructive' : 'default'}
              onClick={toggleStreaming}
              className="font-medium"
              size="sm"
            >
              {streaming ? 'Stop' : 'Start'} Streaming
            </Button>
          </div>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="mr-3 text-sm font-medium text-zinc-400">Services:</div>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <Button
              key={service.id}
              variant="outline"
              onClick={() => toggleService(service.id)}
              className={`${
                service.enabled
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                  : 'bg-transparent text-zinc-500 border-zinc-800'
              } text-xs px-3 py-1 h-7`}
              size="sm"
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
                style={{
                  backgroundColor: service.enabled ? service.color : 'transparent',
                  border: `1px solid ${service.color}`,
                }}
              />
              {service.name}
            </Button>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          <div className="mr-1 text-sm font-medium text-zinc-400">Metrics:</div>
          {METRICS.map((metric) => (
            <Button
              key={metric.id}
              variant="outline"
              onClick={() => setSelectedMetric(metric.id)}
              className={`${
                selectedMetric === metric.id
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                  : 'bg-transparent text-zinc-500 border-zinc-800'
              } text-xs px-3 py-1 h-7`}
              size="sm"
            >
              {metric.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Main metrics grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {services
          .filter((service) => service.enabled)
          .map((service) => (
            <Card
              key={service.id}
              className="bg-zinc-900 border-zinc-800 shadow-lg overflow-hidden"
            >
              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    {getMetricName(selectedMetric)}
                  </CardTitle>
                  <CardDescription className="text-2xl font-bold text-zinc-100 flex items-baseline">
                    {getLatestMetricValue(service.id, selectedMetric)}
                    <span className="ml-1 text-xs text-zinc-500 font-normal">
                      {getMetricUnit(selectedMetric)}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: service.color }}
                  />
                  <span className="text-xs font-medium text-zinc-300">{service.name}</span>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0 h-40">
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                    <LineChart data={serviceData[service.id] || []} margin={CHART_MARGIN}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleTimeString([], {
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        }
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                        axisLine={false}
                        tickLine={false}
                        width={30}
                      />
                      <Tooltip
                        labelFormatter={(value) => new Date(Number(value)).toLocaleTimeString()}
                        contentStyle={{
                          backgroundColor: 'rgba(24,24,27,0.9)',
                          border: '1px solid rgba(63,63,70,0.5)',
                          borderRadius: '0.25rem',
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.75rem',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke={service.color}
                        strokeWidth={CHART_LINE_WIDTH}
                        dot={false}
                        activeDot={{ r: CHART_ACTIVE_DOT_RADIUS }}
                        isAnimationActive={false}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Combined chart with all services */}
      <Card className="bg-zinc-900 border-zinc-800 shadow-lg overflow-hidden w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            {getMetricName(selectedMetric)} — All Services Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={CHART_MARGIN}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) =>
                  new Date(value).toLocaleTimeString([], {
                    minute: '2-digit',
                    second: '2-digit',
                  })
                }
                stroke="rgba(255,255,255,0.2)"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                labelFormatter={(value) => new Date(Number(value)).toLocaleTimeString()}
                contentStyle={{
                  backgroundColor: 'rgba(24,24,27,0.9)',
                  border: '1px solid rgba(63,63,70,0.5)',
                  borderRadius: '0.25rem',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                }}
              />
              {services
                .filter((service) => service.enabled && serviceData[service.id]?.length > 0)
                .map((service) => (
                  <Line
                    key={service.id}
                    type="monotone"
                    data={serviceData[service.id]}
                    dataKey={selectedMetric}
                    name={service.name}
                    stroke={service.color}
                    strokeWidth={CHART_LINE_WIDTH}
                    dot={false}
                    activeDot={{ r: CHART_ACTIVE_DOT_RADIUS }}
                    isAnimationActive={false}
                    connectNulls
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <footer className="mt-6 text-center text-xs text-zinc-500">
        <p>Service Benchmark Dashboard &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
