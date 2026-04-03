import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Satellite as SatelliteIcon, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  useToast,
  ColorBends,
} from '@/components/ui-bits';

interface Satellite {
  id: string;
  country: string;
  launch_date: string;
  mass: string;
  launcher: string;
}

export default function SatellitesPage() {
  const [sats, setSats] = useState<Satellite[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSat, setSelectedSat] = useState<Satellite | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    fetch('/api/satellites')
      .then((r) => r.json())
      .then((data) => {
        setSats(data.customer_satellites || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch satellites:', error);
        setSats([]);
        setLoading(false);
        toast({
          title: 'Error loading satellites',
          description: 'Could not fetch satellite data. Using mock data.',
          variant: 'error',
        });
      });
  }, [toast]);

  // Memoize filtered results for performance
  const filtered = useMemo(
    () =>
      sats.filter(
        (s) =>
          s.id.toLowerCase().includes(query.toLowerCase()) ||
          s.country.toLowerCase().includes(query.toLowerCase())
      ),
    [sats, query]
  );

  return (
    <div className="relative min-h-screen readable-surface">
      {/* Animated Background */}
      <ColorBends
        colors={['#ff5c7a', '#8a5cff', '#00ffd1']}
        rotation={30}
        speed={0.3}
        scale={1.2}
        frequency={1.4}
        warpStrength={1.2}
        mouseInfluence={0.8}
        parallax={0.6}
        noise={0.08}
        transparent
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6"
      >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-nee-100 rounded-lg">
          <SatelliteIcon className="w-5 h-5 sm:w-6 sm:h-6 text-nee-700" />
        </div>
        <div>
          <h1 className="text-gradient-heading text-2xl sm:text-3xl font-extrabold hero-readable-text">Satellites</h1>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-400 font-medium">Monitor and manage customer satellite data</p>
        </div>
      </div>

      {/* Search and Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Satellite Database</CardTitle>
          <CardDescription>
            Search and view detailed information about registered satellites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID or country..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-700/60 text-gray-900 dark:text-gray-100 pl-10 pr-4 py-2 text-sm transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-nee-500 focus:outline-none focus:ring-2 focus:ring-nee-500/20"
              />
            </div>
            <Badge variant="secondary" className="text-xs sm:text-sm whitespace-nowrap">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <SatelliteIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No satellites found</h3>
              <p className="text-gray-600">
                {query ? 'Try adjusting your search criteria' : 'No satellite data available'}
              </p>
            </div>
          ) : (
              <div className="overflow-x-auto -mx-6 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Launch Date</TableHead>
                    <TableHead>Mass (kg)</TableHead>
                    <TableHead>Launcher</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((sat) => (
                    <motion.tr
                      key={sat.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TableCell className="font-medium">{sat.id}</TableCell>
                      <TableCell>{sat.country}</TableCell>
                      <TableCell>{sat.launch_date}</TableCell>
                      <TableCell>{sat.mass}</TableCell>
                      <TableCell>{sat.launcher}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => setSelectedSat(sat)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        isOpen={!!selectedSat}
        onOpenChange={() => setSelectedSat(null)}
        title={selectedSat ? `Satellite: ${selectedSat.id}` : ''}
        description="Detailed satellite information"
      >
        {selectedSat && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">ID</p>
                <p className="text-base font-semibold">{selectedSat.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Country</p>
                <p className="text-base font-semibold">{selectedSat.country}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Launch Date</p>
                <p className="text-base font-semibold">{selectedSat.launch_date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mass</p>
                <p className="text-base font-semibold">{selectedSat.mass} kg</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Launcher</p>
                <p className="text-base font-semibold">{selectedSat.launcher}</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>
      </motion.div>
    </div>
  );
}