import React, { useState, useEffect, useRef, useCallback, useMemo, Component } from 'react';
import { 
  LayoutDashboard, 
  Bell, 
  Settings, 
  Plus, 
  Search, 
  ChevronRight, 
  LogOut, 
  User, 
  Calendar, 
  Activity, 
  Beef,
  Milk, 
  Baby, 
  Utensils,
  Info,
  CheckCircle2,
  X,
  HeartPulse,
  Wheat,
  Map as MapIcon,
  ArrowLeftRight,
  ShoppingCart,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Dna,
  DollarSign,
  Menu,
  Loader2,
  PieChart as PieChartIcon,
  FileText,
  Image as ImageIcon,
  Database,
  Coffee,
  MoreHorizontal,
  ArrowRight,
  Stethoscope,
  Users,
  Users2,
  Camera,
  MapPin,
  Trash2,
  Edit3,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Download,
  MessageSquare,
  Check,
  CheckCheck,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, differenceInMonths, differenceInYears, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  doc, 
  getDoc,
  serverTimestamp, 
  getDocs,
  writeBatch,
  orderBy,
  limit
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { cn } from './utils';

// --- Constants ---
const LOGO_URL = "https://i.imgur.com/9VzJJ0a.png"; // URL directa de la imagen de Imgur

const PINOS_COMMUNITIES = [
  "Pinos (Cabecera)",
  "El Obraje",
  "La Victoria",
  "Santa Ana",
  "San José de Castellanos",
  "El Nigromante",
  "Espíritu Santo",
  "Jaula de Abajo",
  "Estación de Pinos",
  "San Andrés de los Pocitos",
  "Santa Elena",
  "El Chino",
  "El Salitre",
  "La Pendencia",
  "San José de Bernalejo",
  "El Refugio de los Gallegos",
  "San Martín",
  "El Tule",
  "La Blanca",
  "El Remanente",
  "San Rafael",
  "El Sitio",
  "La Esmeralda",
  "El Mezquite",
  "San Antonio de Pintos"
];

const CATTLE_BREEDS = [
  { id: 'raza_1', name: 'Angus' },
  { id: 'raza_2', name: 'Hereford' },
  { id: 'raza_3', name: 'Brahman' },
  { id: 'raza_4', name: 'Holstein' },
  { id: 'charolais', name: 'Charolais' },
  { id: 'simmental', name: 'Simmental' },
  { id: 'limousin', name: 'Limousin' },
  { id: 'brangus', name: 'Brangus' },
  { id: 'beefmaster', name: 'Beefmaster' },
  { id: 'nelore', name: 'Nelore' },
  { id: 'gyr', name: 'Gyr' },
  { id: 'guzerat', name: 'Guzerat' },
  { id: 'pardo_suizo', name: 'Pardo Suizo' },
  { id: 'jersey', name: 'Jersey' },
  { id: 'senepol', name: 'Senepol' },
  { id: 'santa_gertrudis', name: 'Santa Gertrudis' },
  { id: 'sardo_negro', name: 'Sardo Negro' },
  { id: 'indubrasil', name: 'Indubrasil' },
  { id: 'criollo', name: 'Criollo' },
  { id: 'suiz_bu', name: 'Suiz-Bú' },
  { id: 'belgian_blue', name: 'Belgian Blue' },
  { id: 'wagyu', name: 'Wagyu' }
];

// --- Types ---
interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  phone: string;
  address: string;
  ranchName: string;
  curp: string;
  rfc: string;
  upp: string;
  state: string;
  municipality: string;
  isPublic: boolean;
  updatedAt?: any;
}

interface PublicProfile {
  id: string;
  displayName: string;
  photoURL: string;
  ranchName: string;
  state: string;
  municipality: string;
  lastSeen?: any;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageDate?: any;
  updatedAt: any;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  date: any;
  read: boolean;
}

interface Animal {
  id: string;
  id_arete: string;
  nombre: string;
  sexo: 'M' | 'H';
  fecha_nacimiento: string;
  id_raza: string;
  id_categoria: string;
  id_propietario: string;
  id_potrero: string;
  peso: number;
  precio?: number;
  tipo_produccion: string;
  photoUrl?: string;
  padreId?: string;
  madreId?: string;
  createdAt?: any;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: any;
  type: 'health' | 'birth' | 'feed' | 'chat' | 'transfer';
  read: boolean;
  chatId?: string;
  transferId?: string;
}

interface AnimalTransfer {
  id: string;
  animalId: string;
  animalName: string;
  animalArete: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: any;
  updatedAt: any;
}

interface Potrero {
  id: string;
  nombre: string;
  id_finca: string;
  comunidad: string;
}

interface HealthEvent {
  id: string;
  animalId: string;
  animalName: string;
  animalArete: string;
  type: string;
  description: string;
  date: any;
  cost?: number;
  userId: string;
}

interface FeedingRecord {
  id: string;
  potreroId: string;
  potreroNombre: string;
  foodType: string;
  quantity: number;
  unit: string;
  date: any;
  userId: string;
}

interface ReproductionEvent {
  id: string;
  animalId: string;
  animalName: string;
  type: 'Inseminación' | 'Palpación' | 'Parto' | 'Celo';
  date: any;
  notes: string;
  result: string;
  userId: string;
}

interface ProductionRecord {
  id: string;
  animalId: string;
  animalName: string;
  type: 'Leche' | 'Carne';
  quantity: number;
  unit: string;
  date: any;
  userId: string;
}

interface InventoryItem {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  minimo: number;
  userId: string;
  updatedAt: any;
}

interface Task {
  id: string;
  title: string;
  description: string;
  date: any;
  type: 'vacuna' | 'desparasitacion' | 'parto' | 'otro';
  completed: boolean;
  userId: string;
}

interface MarketplaceOffer {
  id: string;
  animalId: string;
  animalName: string;
  animalArete: string;
  price: number;
  description: string;
  sellerId: string;
  sellerName: string;
  photoUrl?: string;
  createdAt: any;
}

interface Review {
  id: string;
  targetUserId: string;
  authorId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

interface FinanceTransaction {
  id: string;
  type: 'Venta' | 'Compra' | 'Ingreso' | 'Egreso' | 'Gasto';
  amount: number;
  date: any;
  category: string;
  description: string;
  animalId?: string;
  userId: string;
}

// --- Components ---

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.props = props;
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
          <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-black text-primary mb-2">Algo salió mal</h2>
          <p className="text-gray-500 mb-8 max-w-md">La aplicación encontró un error inesperado. Por favor, intenta recargar la página.</p>
          <button 
            onClick={() => window.location.reload()}
            className="accent-button"
          >
            Recargar Aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const safeFormatDate = (date: any, formatStr: string = 'PPP') => {
  try {
    if (!date) return 'Reciente';
    let d: Date;
    if (date && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date && typeof date.seconds === 'number') {
      d = new Date(date.seconds * 1000);
    } else {
      d = new Date(date);
    }
    
    if (!isValid(d)) return 'Reciente';
    return format(d, formatStr, { locale: es });
  } catch (e) {
    return 'Reciente';
  }
};

const DatePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'calendar' | 'years'>('calendar');
  const [currentDate, setCurrentDate] = useState(value ? new Date(value + 'T12:00:00') : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView('calendar');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDate = value ? new Date(value + 'T12:00:00') : null;

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 flex justify-between items-center cursor-pointer hover:border-primary/50 transition-all text-sm"
      >
        <span className={value ? "text-primary font-medium" : "text-gray-400"}>
          {value ? format(new Date(value + 'T12:00:00'), 'PPP', { locale: es }) : 'Seleccionar fecha'}
        </span>
        <Calendar size={18} className="text-gray-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[200] mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 w-[280px] left-0 sm:left-auto sm:right-0"
          >
            {view === 'calendar' ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button type="button" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight size={16} className="rotate-180" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setView('years')}
                    className="px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1"
                  >
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                    <ChevronRight size={12} className="rotate-90" />
                  </button>
                  <button type="button" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[8px] font-black text-gray-400 py-1">{d}</div>
                  ))}
                  {calendarDays.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        onChange(format(day, 'yyyy-MM-dd'));
                        setIsOpen(false);
                      }}
                      className={cn(
                        "h-8 w-8 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center",
                        !isSameMonth(day, monthStart) ? "text-gray-200" : "text-gray-600 hover:bg-primary/10 hover:text-primary",
                        selectedDate && isSameDay(day, selectedDate) ? "bg-primary text-white shadow-lg shadow-primary/20" : "",
                        isSameDay(day, new Date()) && !(selectedDate && isSameDay(day, selectedDate)) ? "border border-primary/30 text-primary" : ""
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col h-[240px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-widest">Seleccionar Año</h3>
                  <button 
                    type="button"
                    onClick={() => setView('calendar')}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                  {years.map(year => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setFullYear(year);
                        setCurrentDate(newDate);
                        setView('calendar');
                      }}
                      className={cn(
                        "py-2 rounded-xl text-[10px] font-bold transition-all",
                        currentDate.getFullYear() === year 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-gray-50 text-gray-600 hover:bg-primary/10 hover:text-primary"
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TlanextliLogo = ({ className, size = "md" }: { className?: string, light?: boolean, size?: "sm" | "md" | "lg" }) => {
  const textSize = size === "sm" ? "text-xl" : size === "md" ? "text-2xl" : "text-4xl";
  
  if (LOGO_URL) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <img 
          src={LOGO_URL} 
          alt="Tlanextli Logo" 
          className={cn(
            "object-contain",
            size === "sm" ? "h-12" : size === "md" ? "h-24" : "h-36"
          )}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
          <LayoutDashboard className="text-white" size={size === "sm" ? 16 : size === "md" ? 24 : 32} />
        </div>
        <span className={cn("font-black tracking-tighter text-primary", textSize)}>
          Tlanextli
        </span>
      </div>
      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40 mt-1">
        Platform
      </span>
    </div>
  );
};

const calculateAge = (birthDate: any) => {
  if (!birthDate) return 'N/A';
  
  let birth: Date;
  if (birthDate && typeof birthDate.toDate === 'function') {
    birth = birthDate.toDate();
  } else if (birthDate && typeof birthDate.seconds === 'number') {
    birth = new Date(birthDate.seconds * 1000);
  } else if (typeof birthDate === 'string') {
    // Handle YYYY-MM-DD or DD/MM/YYYY
    if (birthDate.includes('/')) {
      const parts = birthDate.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY
        birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      } else {
        birth = new Date(birthDate);
      }
    } else {
      birth = parseISO(birthDate);
      if (!isValid(birth)) {
        birth = new Date(birthDate);
      }
    }
  } else {
    birth = new Date(birthDate);
  }

  if (!isValid(birth)) return 'N/A';

  const now = new Date();
  const months = differenceInMonths(now, birth);
  
  if (months < 0) return 'Recién nacido';
  if (months < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Recién nacido';
    return `${days} ${days === 1 ? 'día' : 'días'}`;
  }
  if (months < 12) return `${months} meses`;
  
  const years = differenceInYears(now, birth);
  const remainingMonths = months % 12;
  
  if (years === 0) return `${months} meses`;
  
  let ageStr = `${years} ${years === 1 ? 'año' : 'años'}`;
  if (remainingMonths > 0) {
    ageStr += ` ${remainingMonths}m`;
  }
  return ageStr;
};

const AnimalCard: React.FC<{ 
  animal: Animal, 
  potreros: Potrero[],
  onClick?: () => void,
  onTransfer?: (e: React.MouseEvent) => void,
  onShowQR?: (e: React.MouseEvent) => void,
  onSell?: (e: React.MouseEvent) => void,
  onDelete?: (e: React.MouseEvent) => void
}> = ({ animal, potreros, onClick, onTransfer, onShowQR, onSell, onDelete }) => (
    <motion.div 
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
      onClick={onClick}
    >
    <div className="relative h-48 overflow-hidden">
      {animal.photoUrl ? (
        <img 
          src={animal.photoUrl} 
          alt={animal.nombre} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
          <Camera size={48} className="text-gray-200" />
        </div>
      )}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {animal.id_propietario?.startsWith('vendido_') && (
          <div className="bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20">
            <p className="text-white font-black text-xs uppercase tracking-widest">
              Vendido
            </p>
          </div>
        )}
        {animal.precio && !animal.id_propietario?.startsWith('vendido_') && (
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
            <p className="text-primary font-black text-lg">
              ${animal.precio.toLocaleString()}
            </p>
          </div>
        )}
        {onShowQR && (
          <button 
            onClick={onShowQR}
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg text-primary hover:bg-white transition-all"
          >
            <Camera size={18} />
          </button>
        )}
      </div>
      <div className="absolute top-4 right-4 flex gap-2">
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <div className="absolute bottom-4 left-4">
        <span className={cn(
          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg",
          animal.sexo === 'M' ? "bg-blue-500/80 text-white" : "bg-pink-500/80 text-white"
        )}>
          {animal.sexo === 'M' ? 'Semental' : 'Vientre'}
        </span>
      </div>
    </div>

    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-xl font-black text-primary tracking-tight">{animal.nombre}</h4>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{animal.id_arete}</span>
        </div>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          {CATTLE_BREEDS.find(b => b.id === animal.id_raza)?.name || 'Raza Desconocida'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mb-1">Edad</p>
          <p className="text-sm font-black text-primary">{calculateAge(animal.fecha_nacimiento)}</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mb-1">Peso</p>
          <p className="text-sm font-black text-primary">{animal.peso}kg</p>
        </div>
        <div className="text-center">
          <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mb-1">Ubicación</p>
          <p className="text-sm font-black text-secondary truncate">
            {potreros.find(p => p.id === animal.id_potrero)?.nombre || 'Corral'}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {onTransfer && !animal.id_propietario?.startsWith('vendido_') && (
          <button 
            onClick={onTransfer}
            className="flex-1 py-4 bg-purple-50 text-purple-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeftRight size={14} /> Transferir
          </button>
        )}
        {onSell && !animal.id_propietario?.startsWith('vendido_') && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onSell(e);
            }}
            className="flex-1 py-4 bg-orange-50 text-orange-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={14} /> Mercado
          </button>
        )}
        <button className="flex-1 py-4 bg-gray-50 text-primary rounded-2xl font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
          Ver detalles
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  </motion.div>
);

const addWatermark = (dataUrl: string, text: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      
      ctx.drawImage(img, 0, 0);
      
      // Watermark style
      ctx.font = `${Math.floor(img.width / 20)}px Inter`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      // Draw watermark
      ctx.fillText(text, img.width - 20, img.height - 20);
      
      // Add a subtle overlay for "Platform Only" feel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, img.width - 20, img.height - 20);
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = dataUrl;
  });
};

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void, badge?: number }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 px-6 py-4 w-full transition-all duration-300 rounded-2xl mb-2 group relative",
      active 
        ? "bg-primary text-white shadow-xl shadow-primary/20" 
        : "text-gray-500 hover:bg-gray-100 hover:text-primary"
    )}
  >
    <Icon size={22} className={cn("transition-transform group-hover:scale-110", active ? "text-accent" : "")} />
    <span className="font-bold text-sm tracking-tight">{label}</span>
    {badge && badge > 0 && (
      <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
        {badge}
      </span>
    )}
  </button>
);

const BottomNavItem = ({ icon: Icon, label, active, onClick, badge }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void, badge?: number }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-all duration-300 relative py-1",
      active ? "text-primary" : "text-gray-400"
    )}
  >
    <div className={cn(
      "p-1.5 rounded-xl transition-all duration-500",
      active ? "bg-primary/5" : ""
    )}>
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    </div>
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
    {badge && badge > 0 && (
      <span className="absolute top-0 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
        {badge}
      </span>
    )}
  </button>
);

const NotificationItem: React.FC<{ notification: Notification, onClick: (n: Notification) => void }> = ({ notification, onClick }) => {
  const icons = {
    health: <HeartPulse className="text-red-600" size={18} />,
    birth: <Baby className="text-pink-600" size={18} />,
    feed: <Wheat className="text-[#2e7d32]" size={18} />,
    chat: <MessageSquare className="text-blue-600" size={18} />,
    transfer: <ArrowLeftRight className="text-purple-600" size={18} />
  };

  const bgColors = {
    health: "bg-red-50",
    birth: "bg-pink-50",
    feed: "bg-[#2e7d32]/10",
    chat: "bg-blue-50",
    transfer: "bg-purple-50"
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-4 p-4 rounded-2xl transition-all border border-gray-50 cursor-pointer active:scale-[0.98]",
        notification.read ? "opacity-60 bg-gray-50/50" : "bg-white shadow-sm border-gray-100 hover:border-[#2e7d32]/20"
      )}
      onClick={() => onClick(notification)}
    >
      <div className={cn(
        "p-2.5 rounded-xl",
        bgColors[notification.type as keyof typeof bgColors] || "bg-gray-50"
      )}>
        {icons[notification.type as keyof typeof icons] || <Bell size={18} />}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-[#1a1a1a]">{notification.title}</h4>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notification.message}</p>
        <span className="text-[10px] font-bold text-gray-400 mt-2 block uppercase tracking-widest">
          {safeFormatDate(notification.date)}
        </span>
      </div>
      {!notification.read && <div className="w-2 h-2 rounded-full bg-[#2e7d32] mt-2 shadow-lg shadow-[#2e7d32]/40" />}
    </div>
  );
};

const FeedingRecordModal = ({ isOpen, onClose, onAdd, potreros }: { isOpen: boolean, onClose: () => void, onAdd: (data: any) => void, potreros: Potrero[] }) => {
  const [formData, setFormData] = useState({
    potreroId: '',
    foodType: '',
    quantity: '' as any,
    unit: 'kg',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    const potrero = potreros.find(p => p.id === formData.potreroId);
    if (!potrero) return;
    
    let finalDate: any = serverTimestamp();
    if (formData.date) {
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = (formData.time || '00:00').split(':').map(Number);
      finalDate = new Date(year, month - 1, day, hours, minutes);
    }

    onAdd({
      ...formData,
      quantity: parseFloat(formData.quantity as any) || 0,
      potreroNombre: potrero.nombre,
      date: finalDate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-yellow-50 text-yellow-600">
              <Wheat size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a1a1a]">Registro de Alimentación</h2>
              <p className="text-xs text-gray-500">Alimento por potrero</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Potrero / Zona</label>
            <select 
              value={formData.potreroId}
              onChange={(e) => setFormData({ ...formData, potreroId: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="">Seleccionar potrero...</option>
              {potreros.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Tipo de Alimento</label>
            <input 
              type="text"
              value={formData.foodType}
              onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              placeholder="Ej. Concentrado, Heno, etc."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Cantidad</label>
              <input 
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0.00"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
              />
            </div>
            <div className="w-32 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Unidad</label>
              <select 
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="kg">kg</option>
                <option value="bolsas">bolsas</option>
                <option value="ton">ton</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Fecha</label>
              <DatePicker 
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Hora</label>
              <input 
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm appearance-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm">Cancelar</button>
          <button onClick={handleSubmit} className="flex-[2] px-6 py-3.5 rounded-xl font-bold text-white bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20 text-sm">Guardar</button>
        </div>
      </motion.div>
    </div>
  );
};


const HealthTab = ({ healthEvents, animals, onAddEvent }: { healthEvents: HealthEvent[], animals: Animal[], onAddEvent: (data: any) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Eventos de Salud</h2>
          <p className="text-sm text-gray-500">Seguimiento médico animal</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2e7d32] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20"
        >
          <Plus size={20} />
          <span>Registrar Evento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {healthEvents.map(event => (
          <div key={event.id} className="app-card border-l-4 border-red-500">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                <HeartPulse size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {safeFormatDate(event.date, 'dd/MM/yy HH:mm')}
              </span>
            </div>
            <h4 className="text-lg font-bold text-[#1a1a1a] mb-1">{event.type}</h4>
            <p className="text-sm text-gray-500 mb-4">{event.animalName} ({event.animalArete})</p>
            <p className="text-sm text-gray-700 mb-6 line-clamp-2">{event.description}</p>
            {event.cost > 0 && (
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Costo</span>
                <span className="font-bold text-[#2e7d32]">${event.cost.toFixed(2)}</span>
              </div>
            )}
          </div>
        ))}
        {healthEvents.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center gap-3 opacity-40">
              <HeartPulse size={48} />
              <p className="font-bold text-sm uppercase tracking-widest">No hay eventos de salud registrados</p>
            </div>
          </div>
        )}
      </div>

      <HealthEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={onAddEvent} 
        animals={animals} 
        potreros={[]}
        mode="individual"
      />
    </div>
  );
};

const FeedingTab = ({ feedingRecords, potreros, onAddRecord }: { feedingRecords: FeedingRecord[], potreros: Potrero[], onAddRecord: (data: any) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Alimentación</h2>
          <p className="text-sm text-gray-500">Registro de nutrición por zona</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2e7d32] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20"
        >
          <Plus size={20} />
          <span>Registrar Alimento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {feedingRecords.map(record => (
          <div key={record.id} className="app-card border-l-4 border-yellow-500">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-yellow-50 text-yellow-600">
                <Wheat size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {safeFormatDate(record.date, 'dd/MM/yy HH:mm')}
              </span>
            </div>
            <h4 className="text-lg font-bold text-[#1a1a1a] mb-1">{record.foodType}</h4>
            <p className="text-xs text-gray-500 mb-6 uppercase tracking-widest">{record.potreroNombre}</p>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cantidad</span>
              <span className="font-bold text-[#2e7d32]">{record.quantity} {record.unit}</span>
            </div>
          </div>
        ))}
        {feedingRecords.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center gap-3 opacity-40">
              <Wheat size={48} />
              <p className="font-bold text-sm uppercase tracking-widest">No hay registros de alimentación</p>
            </div>
          </div>
        )}
      </div>

      <FeedingRecordModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={onAddRecord} 
        potreros={potreros} 
      />
    </div>
  );
};

const PotreroModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.nombre) return;
    setIsSaving(true);
    try {
      await onAdd(formData);
      setFormData({ nombre: '' });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1a1a1a]">Nuevo Potrero</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Nombre del Potrero</label>
            <input 
              type="text" 
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej. Potrero Norte" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] px-6 py-3.5 rounded-xl font-bold text-white bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PotreroDetailsModal = ({ 
  isOpen, 
  onClose, 
  potrero, 
  animals, 
  potreros, 
  onUpdateAnimal 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  potrero: Potrero | null, 
  animals: Animal[], 
  potreros: Potrero[],
  onUpdateAnimal: (id: string, data: any) => void 
}) => {
  if (!isOpen || !potrero) return null;

  const potreroAnimals = animals.filter(a => a.id_potrero === potrero.id);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl overflow-hidden max-h-[85vh]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-[#2e7d32]/10 text-[#2e7d32]">
              <MapIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1a1a1a]">{potrero.nombre}</h2>
              <p className="text-xs text-gray-500">Animales en este potrero</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {potreroAnimals.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="font-bold text-sm text-gray-400 uppercase tracking-widest">No hay animales en este potrero</p>
            </div>
          ) : (
            potreroAnimals.map(animal => (
              <div key={animal.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#2e7d32]/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-xs text-[#1a1a1a]">
                    {animal.id_arete.slice(-2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a1a1a]">{animal.nombre}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{animal.id_arete}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Mover a:</label>
                    <select 
                      className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all appearance-none cursor-pointer text-[#1a1a1a]"
                      value={animal.id_potrero}
                      onChange={(e) => {
                        if (e.target.value !== animal.id_potrero) {
                          onUpdateAnimal(animal.id, { id_potrero: e.target.value });
                        }
                      }}
                    >
                      {potreros.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-2 text-gray-300 mt-3">
                    <ArrowLeftRight size={14} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ReproductionTab = ({ reproductionEvents, animals, onAddEvent }: { reproductionEvents: ReproductionEvent[], animals: Animal[], onAddEvent: (data: any) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    animalId: '',
    type: 'Inseminación' as const,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    result: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = animals.find(a => a.id === formData.animalId);
    if (!animal) return;

    onAddEvent({
      ...formData,
      animalName: animal.nombre,
      date: new Date(formData.date)
    });
    setIsModalOpen(false);
    setFormData({
      animalId: '',
      type: 'Inseminación',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      result: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Reproducción</h2>
          <p className="text-sm text-gray-500">Control de ciclos y cría</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2e7d32] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20"
        >
          <Plus size={20} />
          <span>Nuevo Evento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reproductionEvents.map(event => (
          <div key={event.id} className="app-card border-l-4 border-pink-500">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600">
                <Dna size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {new Date(event.date?.seconds * 1000 || event.date).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-xl font-bold text-[#1a1a1a] mb-1">{event.animalName}</h4>
            <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-4">{event.type}</p>
            
            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-700">{event.notes}</p>
              {event.result && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resultado:</p>
                  <p className="text-sm font-bold text-[#1a1a1a]">{event.result}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {reproductionEvents.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center gap-3 opacity-40">
              <Dna size={48} />
              <p className="font-bold text-sm uppercase tracking-widest">No hay eventos registrados</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Nuevo Evento Reproductivo</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Animal</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
                    value={formData.animalId}
                    onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                  >
                    <option value="">Seleccionar animal</option>
                    {animals.filter(a => a.sexo === 'H').map(animal => (
                      <option key={animal.id} value={animal.id}>{animal.nombre} ({animal.id_arete})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Tipo de Evento</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="Inseminación">Inseminación</option>
                    <option value="Palpación">Palpación</option>
                    <option value="Parto">Parto</option>
                    <option value="Celo">Celo</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Fecha</label>
                  <DatePicker 
                    value={formData.date}
                    onChange={(val) => setFormData({ ...formData, date: val })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Notas</label>
                  <textarea 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all h-24 resize-none text-sm"
                    placeholder="Detalles del evento..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Resultado (Opcional)</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
                    placeholder="Ej: Positivo, Cría sana..."
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-3.5 rounded-xl font-bold text-white bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20 text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductionTab = ({ productionRecords, animals, onAddRecord }: { productionRecords: ProductionRecord[], animals: Animal[], onAddRecord: (data: any) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    animalId: '',
    type: 'Leche' as const,
    quantity: '' as any,
    unit: 'Liters',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = animals.find(a => a.id === formData.animalId);
    if (!animal) return;

    onAddRecord({
      ...formData,
      quantity: parseFloat(formData.quantity as any) || 0,
      animalName: animal.nombre,
      date: new Date(formData.date)
    });
    setIsModalOpen(false);
    setFormData({
      animalId: '',
      type: 'Leche',
      quantity: '' as any,
      unit: 'Liters',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Producción</h2>
          <p className="text-sm text-gray-500">Seguimiento de rendimiento</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2e7d32] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20"
        >
          <Plus size={20} />
          <span>Nuevo Registro</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {productionRecords.map(record => (
          <div key={record.id} className="app-card border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {new Date(record.date?.seconds * 1000 || record.date).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-xl font-bold text-[#1a1a1a] mb-1">{record.animalName}</h4>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">{record.type}</p>
            
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-[#1a1a1a]">{record.quantity}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{record.unit}</span>
            </div>
          </div>
        ))}
        {productionRecords.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center gap-3 opacity-40">
              <TrendingUp size={48} />
              <p className="font-bold text-sm uppercase tracking-widest">No hay registros de producción</p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Nuevo Registro de Producción</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Animal</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
                    value={formData.animalId}
                    onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                  >
                    <option value="">Seleccionar animal</option>
                    {animals.map(animal => (
                      <option key={animal.id} value={animal.id}>{animal.nombre} ({animal.id_arete})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Tipo de Producción</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any, unit: e.target.value === 'Leche' ? 'Liters' : 'Kg' })}
                  >
                    <option value="Leche">Leche</option>
                    <option value="Carne">Carne</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 ml-1">Cantidad</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 ml-1">Unidad</label>
                    <input 
                      type="text" 
                      required
                      readOnly
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none text-sm text-gray-500"
                      value={formData.unit}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Fecha</label>
                  <DatePicker 
                    value={formData.date}
                    onChange={(val) => setFormData({ ...formData, date: val })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)} 
                    className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-3.5 rounded-xl font-bold text-white bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20 text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PotrerosTab = ({ potreros, animals, onAddPotrero, onUpdateAnimal }: { potreros: Potrero[], animals: Animal[], onAddPotrero: (data: any) => void, onUpdateAnimal: (id: string, data: any) => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPotrero, setSelectedPotrero] = useState<Potrero | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Potreros</h2>
          <p className="text-sm text-gray-500">Gestión de zonas de pastoreo</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2e7d32] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20"
        >
          <Plus size={20} />
          <span>Nuevo Potrero</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {potreros.map(potrero => {
          const potreroAnimals = animals.filter(a => a.id_potrero === potrero.id);
          return (
            <div 
              key={potrero.id} 
              className="app-card border-l-4 border-[#2e7d32] cursor-pointer hover:border-[#2e7d32]/50 transition-all active:scale-[0.98]"
              onClick={() => {
                setSelectedPotrero(potrero);
                setIsDetailsOpen(true);
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-[#2e7d32]/10 text-[#2e7d32]">
                  <MapIcon size={24} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {potreroAnimals.length} Animales
                </span>
              </div>
              <h4 className="text-xl font-bold text-[#1a1a1a] mb-4">{potrero.nombre}</h4>
              
              <div className="space-y-2 mb-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Animales en zona:</p>
                <div className="flex flex-wrap gap-2">
                  {potreroAnimals.slice(0, 5).map(animal => (
                    <span key={animal.id} className="px-2 py-1 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-600 border border-gray-100">
                      {animal.id_arete}
                    </span>
                  ))}
                  {potreroAnimals.length > 5 && (
                    <span className="px-2 py-1 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-400 border border-gray-100">
                      +{potreroAnimals.length - 5} más
                    </span>
                  )}
                  {potreroAnimals.length === 0 && (
                    <span className="text-[10px] italic text-gray-400">Sin animales</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</span>
                <span className="text-[10px] font-bold text-[#2e7d32] uppercase tracking-widest">Activo</span>
              </div>
            </div>
          );
        })}
        {potreros.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center gap-3 opacity-40">
              <MapIcon size={48} />
              <p className="font-bold text-sm uppercase tracking-widest">No hay potreros registrados</p>
            </div>
          </div>
        )}
      </div>

      <PotreroModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={onAddPotrero} 
      />

      <PotreroDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        potrero={selectedPotrero}
        animals={animals.filter(a => !a.id_propietario?.startsWith('vendido_'))}
        potreros={potreros}
        onUpdateAnimal={onUpdateAnimal}
      />
    </div>
  );
};

const AnimalsModal: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  animals: Animal[], 
  potreros: Potrero[],
  searchTerm: string,
  setSearchTerm: (s: string) => void,
  onAddNew: () => void,
  onEdit: (animal: Animal) => void,
  onTransfer: (animal: Animal) => void,
  onShowQR: (animal: Animal) => void,
  onSell: (animal: Animal) => void
}> = ({ isOpen, onClose, animals, potreros, searchTerm, setSearchTerm, onAddNew, onEdit, onTransfer, onShowQR, onSell }) => {
  const [cattleFilter, setCattleFilter] = useState<'activos' | 'vendidos'>('activos');

  if (!isOpen) return null;

  const filteredAnimals = animals.filter(a => {
    const matchesSearch = (a.id_arete.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           a.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (cattleFilter === 'vendidos') {
      return matchesSearch && a.id_propietario?.startsWith('vendido_');
    }
    
    return matchesSearch && !a.id_propietario?.startsWith('vendido_');
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-7xl h-[90vh] bg-[#f8f9fa] rounded-[40px] p-6 sm:p-10 overflow-hidden flex flex-col gap-6 sm:gap-8 shadow-2xl border border-white"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#2e7d32]/10 text-[#2e7d32]">
              <Activity size={32} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight">Ganado Vacuno</h2>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                Listado General de Animales
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={onAddNew}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#2e7d32] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20"
            >
              <Plus size={20} />
              <span>Nuevo Registro</span>
            </button>
            <button 
              onClick={onClose}
              className="p-3.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 border border-gray-100 bg-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por ID Arete o Nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl py-3.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm shadow-sm"
            />
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-full sm:w-auto">
            <button 
              onClick={() => setCattleFilter('activos')}
              className={cn(
                "flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                cattleFilter === 'activos' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-primary"
              )}
            >
              Hato Activo ({animals.filter(a => !a.id_propietario?.startsWith('vendido_')).length})
            </button>
            <button 
              onClick={() => setCattleFilter('vendidos')}
              className={cn(
                "flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                cattleFilter === 'vendidos' ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-red-600"
              )}
            >
              Vendidos ({animals.filter(a => a.id_propietario?.startsWith('vendido_')).length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-8">
            {filteredAnimals.map(animal => (
              <AnimalCard 
                key={animal.id} 
                animal={animal} 
                potreros={potreros} 
                onClick={() => onEdit(animal)}
                onTransfer={(e) => {
                  e.stopPropagation();
                  onTransfer(animal);
                }}
                onShowQR={(e) => {
                  e.stopPropagation();
                  onShowQR(animal);
                }}
                onSell={(e) => {
                  e.stopPropagation();
                  onSell(animal);
                }}
              />
            ))}
            {filteredAnimals.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="flex flex-col items-center gap-3 opacity-40">
                  <Activity size={48} />
                  <p className="font-bold text-sm uppercase tracking-widest">No hay registros disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
 const AnimalFormModal = ({ 
  isOpen, 
  onClose, 
  onAdd,
  onUpdate,
  onDelete,
  potreros,
  initialPotrero = '',
  editingAnimal = null,
  ranchName = ''
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onAdd: (data: any) => Promise<void>,
  onUpdate: (id: string, data: any) => Promise<void>,
  onDelete?: (animal: Animal) => void,
  potreros: Potrero[],
  initialPotrero?: string,
  editingAnimal?: Animal | null,
  ranchName?: string
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    id_arete: '',
    sexo: 'M',
    fecha_nacimiento: new Date().toISOString().split('T')[0],
    id_raza: 'raza_1',
    id_categoria: 'cat_4',
    id_potrero: initialPotrero || '',
    peso: editingAnimal ? editingAnimal.peso : '' as any,
    precio: editingAnimal ? editingAnimal.precio : '' as any,
    tipo_produccion: editingAnimal ? editingAnimal.tipo_produccion : 'Carne',
    photoUrl: '',
    origen: 'nacido' as 'nacido' | 'comprado'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingAnimal) {
        setFormData({
          nombre: editingAnimal.nombre || '',
          id_arete: editingAnimal.id_arete || '',
          sexo: editingAnimal.sexo || 'M',
          fecha_nacimiento: editingAnimal.fecha_nacimiento || new Date().toISOString().split('T')[0],
          id_raza: editingAnimal.id_raza || 'raza_1',
          id_categoria: editingAnimal.id_categoria || 'cat_4',
          id_potrero: editingAnimal.id_potrero || '',
          peso: editingAnimal.peso || '',
          precio: editingAnimal.precio || '',
          tipo_produccion: editingAnimal.tipo_produccion || 'Carne',
          photoUrl: editingAnimal.photoUrl || '',
          origen: editingAnimal.precio && Number(editingAnimal.precio) > 0 ? 'comprado' : 'nacido'
        });
      } else {
        setFormData({
          nombre: '',
          id_arete: '',
          sexo: 'M',
          fecha_nacimiento: new Date().toISOString().split('T')[0],
          id_raza: 'raza_1',
          id_categoria: 'cat_4',
          id_potrero: initialPotrero || (potreros[0]?.id || ''),
          peso: '',
          precio: '',
          tipo_produccion: 'Carne',
          photoUrl: '',
          origen: 'nacido'
        });
      }
      setIsSaving(false);
      setShowCamera(false);
    }
  }, [isOpen, initialPotrero, potreros, editingAnimal]);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const takePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const watermarked = await addWatermark(dataUrl, `RANCHO: ${ranchName} | ${new Date().toLocaleString()}`);
        setFormData({ ...formData, photoUrl: watermarked });
        stopCamera();
      }
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.nombre || !formData.id_arete) {
      return;
    }
    setIsSaving(true);
    try {
      const animalData = {
        ...formData,
        peso: parseFloat(formData.peso as any) || 0,
        precio: formData.origen === 'comprado' ? (parseFloat(formData.precio as any) || 0) : 0
      };
      if (editingAnimal) {
        await onUpdate(editingAnimal.id, animalData);
      } else {
        await onAdd(animalData);
      }
      onClose();
    } catch (error: any) {
      console.error("Error saving:", error?.message || String(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white max-w-2xl w-full p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl my-4 sm:my-8 flex flex-col gap-4 sm:gap-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1a1a1a]">
            {editingAnimal ? 'Editar Registro' : 'Nuevo Registro'}
          </h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Photo Section */}
          <div className="relative aspect-video bg-gray-100 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group">
            {showCamera ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4">
                  <button 
                    onClick={takePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-primary/20 active:scale-90 transition-all"
                  >
                    <div className="w-10 h-10 bg-primary rounded-full" />
                  </button>
                  <button 
                    onClick={stopCamera}
                    className="p-4 bg-red-500 text-white rounded-2xl shadow-lg active:scale-90 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            ) : formData.photoUrl ? (
              <div className="relative w-full h-full">
                <img src={formData.photoUrl} alt="" className="w-full h-full object-cover" />
                <button 
                  onClick={startCamera}
                  className="absolute bottom-4 right-4 p-4 bg-white/90 backdrop-blur-sm text-primary rounded-2xl shadow-lg hover:bg-white transition-all"
                >
                  <Camera size={24} />
                </button>
              </div>
            ) : (
              <button 
                onClick={startCamera}
                className="flex flex-col items-center gap-3 text-gray-400 hover:text-primary transition-colors"
              >
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <Camera size={48} strokeWidth={1.5} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Tomar Foto del Animal</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Nombre</label>
            <input 
              type="text" 
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej. Toro Bravo" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Matrícula (ID Arete)</label>
            <input 
              type="text" 
              value={formData.id_arete}
              onChange={(e) => setFormData({ ...formData, id_arete: e.target.value })}
              placeholder="Ej. ZAC-001" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Sexo</label>
            <select 
              value={formData.sexo}
              onChange={(e) => setFormData({ ...formData, sexo: e.target.value as 'M' | 'H' })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="M">Macho</option>
              <option value="H">Hembra</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Fecha Nacimiento</label>
            <DatePicker 
              value={formData.fecha_nacimiento}
              onChange={(val) => setFormData({ ...formData, fecha_nacimiento: val })}
            />
            <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { label: 'Hoy', days: 0 },
                { label: 'Hace 1 mes', days: 30 },
                { label: 'Hace 6 meses', days: 180 },
                { label: 'Hace 1 año', days: 365 }
              ].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - opt.days);
                    setFormData({ ...formData, fecha_nacimiento: d.toISOString().split('T')[0] });
                  }}
                  className="whitespace-nowrap px-3 py-1 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-lg text-[10px] font-bold text-gray-500 transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Raza</label>
            <select 
              value={formData.id_raza}
              onChange={(e) => setFormData({ ...formData, id_raza: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm appearance-none cursor-pointer"
            >
              {CATTLE_BREEDS.map(breed => (
                <option key={breed.id} value={breed.id}>{breed.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Peso (kg)</label>
            <input 
              type="number" 
              value={formData.peso}
              onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              placeholder="0.00" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Origen del Animal</label>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, origen: 'nacido' })}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all",
                  formData.origen === 'nacido' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Nacido en Rancho
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, origen: 'comprado' })}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all",
                  formData.origen === 'comprado' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Comprado / Adquirido
              </button>
            </div>
          </div>

          {formData.origen === 'comprado' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Precio de Compra ($)</label>
              <input 
                type="number" 
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                placeholder="0.00" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Origen del Animal</label>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, origen: 'nacido' })}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all",
                  formData.origen === 'nacido' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Nacido
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ ...formData, origen: 'comprado' })}
                className={cn(
                  "flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition-all",
                  formData.origen === 'comprado' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                Comprado
              </button>
            </div>
          </div>

          {formData.origen === 'comprado' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Precio de Compra ($)</label>
              <input 
                type="number" 
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                placeholder="0.00" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Potrero</label>
            <select 
              value={formData.id_potrero}
              onChange={(e) => setFormData({ ...formData, id_potrero: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm appearance-none cursor-pointer"
            >
              {potreros.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
              {potreros.length === 0 && (
                <option value="">Sin potreros</option>
              )}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Tipo de Producción</label>
            <input 
              list="produccion-options"
              value={formData.tipo_produccion}
              onChange={(e) => setFormData({ ...formData, tipo_produccion: e.target.value })}
              placeholder="Ej. Carne, Leche..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#2e7d32]/20 focus:border-[#2e7d32] transition-all text-sm"
            />
            <datalist id="produccion-options">
              <option value="Carne" />
              <option value="Leche" />
              <option value="Doble Propósito" />
              <option value="Cría" />
            </datalist>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          {editingAnimal && onDelete && (
            <button 
              type="button"
              onClick={() => onDelete(editingAnimal)}
              className="p-3.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
              title="Eliminar animal"
            >
              <Trash2 size={24} />
            </button>
          )}
          <button 
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-6 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] px-6 py-3.5 rounded-xl font-bold text-white bg-[#2e7d32] hover:bg-[#1b5e20] transition-colors shadow-lg shadow-[#2e7d32]/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Guardando...</span>
              </>
            ) : (
              <span>{editingAnimal ? 'Actualizar' : 'Registrar'}</span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);
};

// --- Main App ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any) {
  let errorMessage = 'Unknown error';
  try {
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String((error as any).message);
    } else {
      errorMessage = String(error);
    }
  } catch (e) {
    errorMessage = 'SecurityError: Could not access error message';
  }

  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState('inicio');
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [potreros, setPotreros] = useState<Potrero[]>([]);
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([]);
  const [reproductionEvents, setReproductionEvents] = useState<ReproductionEvent[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAnimalsModalOpen, setIsAnimalsModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [healthModalMode, setHealthModalMode] = useState<'individual' | 'grupal'>('individual');
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);
  const [isReproductionModalOpen, setIsReproductionModalOpen] = useState(false);
  const [isProductionModalOpen, setIsProductionModalOpen] = useState(false);
  const [isPotreroModalOpen, setIsPotreroModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [hasDismissedProfileModal, setHasDismissedProfileModal] = useState(() => {
    return localStorage.getItem('hasDismissedProfileModal') === 'true';
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false);
  const [marketplaceAnimal, setMarketplaceAnimal] = useState<Animal | null>(null);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [marketplaceOffers, setMarketplaceOffers] = useState<MarketplaceOffer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [transferAnimal, setTransferAnimal] = useState<Animal | null>(null);
  const [animalTransfers, setAnimalTransfers] = useState<AnimalTransfer[]>([]);
  const [publicProfiles, setPublicProfiles] = useState<PublicProfile[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [targetPotrero, setTargetPotrero] = useState<Potrero | null>(null);
  const [modalInitialPotrero, setModalInitialPotrero] = useState('');
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cattleFilter, setCattleFilter] = useState<'todos' | 'venta' | 'vendidos'>('todos');
  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({});

  const [qrAnimal, setQrAnimal] = useState<Animal | null>(null);
  const [scannedHistory, setScannedHistory] = useState<{
    health: HealthEvent[],
    reproduction: ReproductionEvent[],
    production: ProductionRecord[],
    finance: FinanceTransaction[]
  } | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Partial<Task>>({});

  // ... existing state ...
  const activeAnimals = useMemo(() => animals.filter(a => !a.id_propietario?.startsWith('vendido_')), [animals]);
  const soldAnimals = useMemo(() => animals.filter(a => a.id_propietario?.startsWith('vendido_')), [animals]);

  const activeHealthStats = useMemo(() => {
    const activeAnimalIds = new Set(activeAnimals.map(a => a.id));
    const eventsForActive = healthEvents.filter(e => {
      const aId = e.animalId || (e as any).id_animal;
      return activeAnimalIds.has(aId);
    });
    
    // We count UNIQUE sick animals to get a "Current sick count"
    // An animal is considered sick if it has an "Enfermedad" event within our loaded events
    const sickAnimalIds = new Set(
      eventsForActive
        .filter(e => e.type === 'Enfermedad')
        .map(e => e.animalId || (e as any).id_animal)
    );
    const activeSickCount = sickAnimalIds.size;
    
    return {
      total: activeAnimals.length,
      sick: activeSickCount,
      healthy: Math.max(0, activeAnimals.length - activeSickCount),
      vaccinations: eventsForActive.filter(e => e.type === 'Vacunación').length
    };
  }, [activeAnimals, healthEvents]);

  const [activeToast, setActiveToast] = useState<{ title: string, message: string, type: string } | null>(null);
  const lastNotificationIds = useRef<Set<string>>(new Set());

  // Monitor notifications for Toast
  useEffect(() => {
    if (notifications.length === 0) {
      lastNotificationIds.current = new Set();
      return;
    }

    // On first load, just fill the set without showing toasts
    if (lastNotificationIds.current.size === 0) {
      lastNotificationIds.current = new Set(notifications.map(n => n.id));
      return;
    }

    const newNotifications = notifications.filter(n => !lastNotificationIds.current.has(n.id) && !n.read);
    
    if (newNotifications.length > 0) {
      const n = newNotifications[0];
      setActiveToast({
        title: n.title,
        message: n.message,
        type: n.type
      });
      // Important to update the set so we don't trigger again for the same ID
      lastNotificationIds.current = new Set(notifications.map(n => n.id));
      setTimeout(() => setActiveToast(null), 5000);
    } else {
      lastNotificationIds.current = new Set(notifications.map(n => n.id));
    }
  }, [notifications]);

  const monthlyData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        name: format(d, 'MMM', { locale: es }),
        month: d.getMonth(),
        year: d.getFullYear(),
        value: 0
      });
    }

    financeTransactions.forEach(t => {
      const tDate = t.date?.toDate ? t.date.toDate() : (t.date ? new Date(t.date) : new Date());
      const monthData = last6Months.find(m => m.month === tDate.getMonth() && m.year === tDate.getFullYear());
      if (monthData && (t.type === 'Venta' || t.type === 'Ingreso')) {
        monthData.value += Number(t.amount || 0);
      }
    });

    return last6Months;
  }, [financeTransactions]);

  const expensesByCategory = useMemo(() => {
    const categories: { [key: string]: number } = {};
    financeTransactions
      .filter(t => t.type === 'Gasto' || t.type === 'Egreso' || t.type === 'Compra')
      .forEach(t => {
        const category = t.category || 'Otros';
        categories[category] = (categories[category] || 0) + Number(t.amount || 0);
      });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [financeTransactions]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchAnimalHistory = useCallback(async (animalId: string) => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const [healthSnap, reproSnap, prodSnap, financeSnap, oldHealthSnap, oldReproSnap, oldProdSnap, oldFinanceSnap] = await Promise.all([
        getDocs(query(collection(db, 'health_events'), where('animalId', '==', animalId), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'reproduction_events'), where('animalId', '==', animalId), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'production_records'), where('animalId', '==', animalId), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'finance_transactions'), where('animalId', '==', animalId), orderBy('date', 'desc'))),
        // Fallback for legacy id_animal field
        getDocs(query(collection(db, 'health_events'), where('id_animal', '==', animalId), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'reproduction_events'), where('id_animal', '==', animalId), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'production_records'), where('id_animal', '==', animalId), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'finance_transactions'), where('id_animal', '==', animalId), orderBy('date', 'desc')))
      ]);

      const mergeDocs = (snap1: any, snap2: any) => {
        const all = [...snap1.docs, ...snap2.docs];
        const merged = Array.from(new Map(all.map((d: any) => [d.id, { id: d.id, ...d.data() }])).values());
        return merged.sort((a: any, b: any) => {
          const getVal = (v: any) => v?.toDate ? v.toDate().getTime() : (v ? new Date(v).getTime() : 0);
          return getVal(b.date) - getVal(a.date);
        });
      };

      setScannedHistory({
        health: mergeDocs(healthSnap, oldHealthSnap) as HealthEvent[],
        reproduction: mergeDocs(reproSnap, oldReproSnap) as ReproductionEvent[],
        production: mergeDocs(prodSnap, oldProdSnap) as ProductionRecord[],
        finance: mergeDocs(financeSnap, oldFinanceSnap) as FinanceTransaction[]
      });
    } catch (err) {
      console.error("Error fetching animal history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  const handleAnimalScan = useCallback(async (animalId: string) => {
    if (!user) return;
    
    try {
      // 1. Fetch Animal Data
      const animalDoc = await getDoc(doc(db, 'animals', animalId));
      if (!animalDoc.exists()) {
        setActiveToast({
          title: 'Animal No Encontrado',
          message: 'El código QR no corresponde a ningún animal registrado.',
          type: 'error'
        });
        setTimeout(() => setActiveToast(null), 5000);
        return;
      }

      const animalData = { id: animalDoc.id, ...animalDoc.data() } as Animal;
      setQrAnimal(animalData);

      // 2. Fetch All Related Events
      await fetchAnimalHistory(animalId);

      setIsQrModalOpen(true);
      setIsScannerModalOpen(false);
    } catch (error) {
      console.error("Error fetching animal scan data:", error);
      setActiveToast({
        title: 'Error de Escaneo',
        message: 'No pudimos obtener la información completa del animal.',
        type: 'error'
      });
      setTimeout(() => setActiveToast(null), 5000);
    }
  }, [user, fetchAnimalHistory]);

  // Handle deep linking for animal history via QR code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const animalId = params.get('animalId');
    if (animalId && user && !qrAnimal) {
       handleAnimalScan(animalId);
       // Clear URL
       const newUrl = window.location.origin + window.location.pathname;
       window.history.replaceState({}, document.title, newUrl);
    }
  }, [user, handleAnimalScan, qrAnimal]);

  const unreadMessagesCount = useMemo(() => {
    return notifications.filter(n => n.type === 'chat' && !n.read).length;
  }, [notifications]);

  const activeRanchersCount = useMemo(() => {
    if (!user) return 0;
    const now = new Date().getTime();
    const onlineOthers = publicProfiles.filter(p => {
      const profileLastSeen = p.lastSeen?.toDate ? p.lastSeen.toDate().getTime() : (p.lastSeen ? new Date(p.lastSeen).getTime() : 0);
      return now - profileLastSeen < 5 * 60000; // 5 minutes threshold
    }).length;
    return onlineOthers + 1; // Current user included
  }, [publicProfiles, user]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      setIsLoggingIn(false);
    });
    return unsubscribe;
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user || !activeChat) {
      setMessages([]);
      return;
    }

    const messagesUnsubscribe = onSnapshot(
      query(
        collection(db, 'messages'), 
        where('chatId', '==', activeChat.id),
        orderBy('date', 'asc'),
        limit(100)
      ),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, `messages/${activeChat.id}`, auth)
    );

    return () => messagesUnsubscribe();
  }, [user, activeChat]);

  // Mark messages as read
  useEffect(() => {
    if (!user || !activeChat || !isChatOpen) return;

    const unreadMessages = messages.filter(m => m.chatId === activeChat.id && m.senderId !== user.uid && !m.read);
    
    if (unreadMessages.length > 0) {
      const batch = writeBatch(db);
      unreadMessages.forEach(m => {
        batch.update(doc(db, 'messages', m.id), { read: true });
      });
      batch.commit().catch(err => console.error("Error marking messages as read:", err));
    }
  }, [activeChat, messages, isChatOpen, user]);

  const handleStartChat = async (otherUserId: string) => {
    if (!user) return;
    try {
      // Check if chat already exists
      const existingChat = chats.find(c => c.participants.includes(otherUserId));
      if (existingChat) {
        setActiveChat(existingChat);
        setIsChatOpen(true);
        return;
      }

      const newChatRef = await addDoc(collection(db, 'chats'), {
        participants: [user.uid, otherUserId],
        updatedAt: serverTimestamp()
      });

      setActiveChat({
        id: newChatRef.id,
        participants: [user.uid, otherUserId],
        updatedAt: new Date()
      });
      setIsChatOpen(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chats', auth);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!user || !activeChat) return;
    try {
      const otherUserId = activeChat.participants.find(id => id !== user.uid);
      
      await addDoc(collection(db, 'messages'), {
        chatId: activeChat.id,
        senderId: user.uid,
        text,
        date: serverTimestamp(),
        read: false
      });

      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: text,
        lastMessageDate: serverTimestamp(),
        lastMessageSenderId: user.uid,
        updatedAt: serverTimestamp()
      });

      if (otherUserId) {
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: otherUserId,
            title: 'Nuevo Mensaje',
            message: `Has recibido un mensaje de ${userProfile?.ranchName || 'un ganadero'}`,
            date: serverTimestamp(),
            type: 'chat',
            read: false,
            chatId: activeChat.id
          });
        } catch (notifErr) {
          console.error("Error sending notification:", notifErr);
          // Don't throw here, the message was already sent
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'messages/notifications', auth);
    }
  };

  const handleInitiateTransfer = async (animal: Animal, buyerId: string, price: number) => {
    if (!user || !userProfile) return;
    try {
      const transferId = `${animal.id}_${buyerId}`;
      await setDoc(doc(db, 'animal_transfers', transferId), {
        animalId: animal.id,
        animalName: animal.nombre,
        animalArete: animal.id_arete,
        sellerId: user.uid,
        sellerName: userProfile.ranchName || userProfile.displayName,
        buyerId,
        participants: [user.uid, buyerId],
        price,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: buyerId,
        title: 'Propuesta de Compra',
        message: `${userProfile.ranchName || userProfile.displayName} te ha propuesto la venta de ${animal.nombre}`,
        date: serverTimestamp(),
        type: 'transfer',
        read: false,
        transferId
      });

      setIsTransferModalOpen(false);
      setTransferAnimal(null);
      setActiveToast({
        title: 'Transferencia Iniciada',
        message: 'La propuesta ha sido enviada al comprador.',
        type: 'success'
      });
      setTimeout(() => setActiveToast(null), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'animal_transfers', auth);
    }
  };

  const handleAcceptTransfer = async (transfer: AnimalTransfer) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'animal_transfers', transfer.id), {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      // Record a 'Compra' for the buyer in real-time
      await addDoc(collection(db, 'finance_transactions'), {
        userId: user.uid,
        amount: Number(transfer.price) || 0,
        type: 'Compra',
        date: serverTimestamp(),
        category: 'Compra de Ganado',
        description: `Compra aceptada: ${transfer.animalName} (#${transfer.animalArete}) de ${transfer.sellerName}`,
        animalId: transfer.animalId,
        createdAt: serverTimestamp()
      });

      const otherPartyId = transfer.sellerId === user.uid ? transfer.buyerId : transfer.sellerId;
      await addDoc(collection(db, 'notifications'), {
        userId: otherPartyId,
        title: 'Transferencia Aceptada',
        message: `La propuesta para ${transfer.animalName} ha sido aceptada.`,
        date: serverTimestamp(),
        type: 'transfer',
        read: false,
        transferId: transfer.id
      });

      setActiveToast({
        title: 'Propuesta Aceptada',
        message: 'Has aceptado la propuesta correctamente.',
        type: 'success'
      });
      setTimeout(() => setActiveToast(null), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'animal_transfers', auth);
    }
  };

  const handleRejectTransfer = async (transfer: AnimalTransfer) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'animal_transfers', transfer.id), {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });

      const otherPartyId = transfer.sellerId === user.uid ? transfer.buyerId : transfer.sellerId;
      await addDoc(collection(db, 'notifications'), {
        userId: otherPartyId,
        title: 'Propuesta Rechazada',
        message: `La propuesta para ${transfer.animalName} ha sido rechazada o cancelada.`,
        date: serverTimestamp(),
        type: 'transfer',
        read: false,
        transferId: transfer.id
      });

      setActiveToast({
        title: 'Propuesta Finalizada',
        message: 'La propuesta ha sido rechazada o cancelada.',
        type: 'info'
      });
      setTimeout(() => setActiveToast(null), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'animal_transfers', auth);
    }
  };

  const handleCompleteTransfer = async (transfer: AnimalTransfer) => {
    if (!user) return;
    
    // Safety check: Ensure transfer is still accepted and seller still owns the animal
    if (transfer.status !== 'accepted') {
      setActiveToast({
        title: 'Error',
        message: 'La transferencia ya no está en estado aceptado.',
        type: 'error'
      });
      setTimeout(() => setActiveToast(null), 5000);
      return;
    }

    const animalDoc = await getDoc(doc(db, 'animals', transfer.animalId));
    if (!animalDoc.exists() || animalDoc.data().id_propietario !== user.uid) {
      setActiveToast({
        title: 'Error',
        message: 'Ya no eres el propietario de este animal.',
        type: 'error'
      });
      setTimeout(() => setActiveToast(null), 5000);
      return;
    }

    try {
      // 1 & 2. Update animal owner and transfer status atomically
      const mainBatch = writeBatch(db);
      
      mainBatch.update(doc(db, 'animals', transfer.animalId), {
        id_propietario: transfer.buyerId,
        id_potrero: 'sin_asignar' // Reset pasture for new owner
      });

      mainBatch.update(doc(db, 'animal_transfers', transfer.id), {
        status: 'completed',
        updatedAt: serverTimestamp()
      });

      await mainBatch.commit();
      
      // 3. Cleanup Marketplace Offer if exists
      const marketplaceQuery = query(collection(db, 'marketplace_offers'), where('animalId', '==', transfer.animalId));
      const marketplaceSnapshot = await getDocs(marketplaceQuery);
      for (const docSnap of marketplaceSnapshot.docs) {
        await deleteDoc(doc(db, 'marketplace_offers', docSnap.id));
      }

      // 3.5 Cleanup other pending/accepted transfers for this animal
      const otherTransfersQuery = query(
        collection(db, 'animal_transfers'), 
        where('animalId', '==', transfer.animalId),
        where('status', 'in', ['pending', 'accepted'])
      );
      const otherTransfersSnapshot = await getDocs(otherTransfersQuery);
      for (const docSnap of otherTransfersSnapshot.docs) {
        if (docSnap.id !== transfer.id) {
          await updateDoc(doc(db, 'animal_transfers', docSnap.id), {
            status: 'rejected',
            updatedAt: serverTimestamp()
          });
        }
      }

      // 4. Update History (Events) to follow the new owner
      const collectionsToUpdate = ['health_events', 'feeding_records', 'reproduction_events', 'production_records', 'tasks', 'finance_transactions'];
      
      for (const collName of collectionsToUpdate) {
        // We fetch ALL records for this animal ID, regardless of current userId, 
        // to ensure history from previous owners is also migrated to the new one.
        const qByAnimalId = query(
          collection(db, collName), 
          where('animalId', '==', transfer.animalId)
        );
        const qByIdAnimal = query(
          collection(db, collName), 
          where('id_animal', '==', transfer.animalId)
        );

        const [snap1, snap2] = await Promise.all([getDocs(qByAnimalId), getDocs(qByIdAnimal)]);
        const allDocs = [...snap1.docs, ...snap2.docs];
        
        // Remove duplicates if any doc appeared in both queries
        const uniqueDocs = Array.from(new Map(allDocs.map(d => [d.id, d])).values());

        if (uniqueDocs.length > 0) {
          // Process in sub-batches of 500 to avoid Firestore limits
          for (let i = 0; i < uniqueDocs.length; i += 500) {
            const currentSubBatch = uniqueDocs.slice(i, i + 500);
            const batch = writeBatch(db);
            currentSubBatch.forEach((docSnap: any) => {
              if (docSnap.data()?.userId !== transfer.buyerId) {
                batch.update(doc(db, collName, docSnap.id), { userId: transfer.buyerId });
              }
            });
            await batch.commit();
          }
        }
      }

      // 5. Create finance transactions for both
      // Seller: Venta
      await addDoc(collection(db, 'finance_transactions'), {
        type: 'Venta',
        amount: Number(transfer.price || 0),
        date: serverTimestamp(),
        category: 'Venta de Animal',
        description: `Venta de ${transfer.animalName} (${transfer.animalArete})`,
        animalId: transfer.animalId,
        userId: transfer.sellerId,
        createdAt: serverTimestamp()
      });

      // Buyer: Compra
      await addDoc(collection(db, 'finance_transactions'), {
        type: 'Compra',
        amount: Number(transfer.price || 0),
        date: serverTimestamp(),
        category: 'Compra de Animal',
        description: `Compra de ${transfer.animalName} (${transfer.animalArete})`,
        animalId: transfer.animalId,
        userId: transfer.buyerId,
        createdAt: serverTimestamp()
      });

      // 6. Notify buyer
      await addDoc(collection(db, 'notifications'), {
        userId: transfer.buyerId,
        title: 'Transferencia Completada',
        message: `La transferencia de ${transfer.animalName} ha sido completada. El animal ahora está en tu inventario.`,
        date: serverTimestamp(),
        type: 'transfer',
        read: false,
        transferId: transfer.id
      });

      setActiveToast({
        title: 'Transferencia Exitosa',
        message: 'El animal ha sido transferido correctamente.',
        type: 'success'
      });
      setTimeout(() => setActiveToast(null), 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'animals_transfer_complete', auth);
    }
  };

  // Presence Tracking
  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      try {
        await updateDoc(doc(db, 'public_profiles', user.uid), {
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        // Silent fail for presence
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const animalsUnsubscribe = onSnapshot(
      query(collection(db, 'animals'), where('id_propietario', 'in', [user.uid, `vendido_${user.uid}`]), orderBy('createdAt', 'desc'), limit(500)),
      (snapshot) => {
        setAnimals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Animal)));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'animals', auth)
    );

    const notificationsUnsubscribe = onSnapshot(
      query(collection(db, 'notifications'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(50)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
        setNotifications(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'notifications', auth)
    );

    const potrerosUnsubscribe = onSnapshot(
      query(collection(db, 'potreros'), where('userId', '==', user.uid), limit(100)),
      (snapshot) => {
        setPotreros(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Potrero)));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'potreros', auth)
    );

    const healthUnsubscribe = onSnapshot(
      query(collection(db, 'health_events'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(1000)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthEvent));
        setHealthEvents(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'health_events', auth)
    );

    const feedingUnsubscribe = onSnapshot(
      query(collection(db, 'feeding_records'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(1000)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedingRecord));
        setFeedingRecords(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'feeding_records', auth)
    );

    const profileUnsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          setUserProfile({ id: snapshot.id, ...data });
          setLocalProfile(data);
          
          // Check if profile is complete
          // We only show the modal if it's NOT complete AND the user hasn't dismissed it
          const isComplete = data.displayName && data.phone && data.ranchName && 
                            data.curp && data.municipality;
          
          if (!isComplete && !hasDismissedProfileModal) {
            setIsProfileModalOpen(true);
          } else {
            setIsProfileModalOpen(false);
          }
        } else {
          // Initialize profile if it doesn't exist
          const initialProfile: UserProfile = {
            id: user.uid,
            displayName: user.displayName || '',
            email: user.email || '',
            photoURL: user.photoURL || '',
            phone: '',
            address: '',
            ranchName: '',
            curp: '',
            rfc: '',
            upp: '',
            state: '',
            municipality: '',
            isPublic: true
          };
          setUserProfile(initialProfile);
          setLocalProfile(initialProfile);
          setIsProfileModalOpen(true);
          setDoc(doc(db, 'users', user.uid), initialProfile).catch(err => 
            handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`, auth)
          );
        }
      },
      (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`, auth)
    );

    const reproductionUnsubscribe = onSnapshot(
      query(collection(db, 'reproduction_events'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(1000)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReproductionEvent));
        setReproductionEvents(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'reproduction_events', auth)
    );

    const productionUnsubscribe = onSnapshot(
      query(collection(db, 'production_records'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(1000)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionRecord));
        setProductionRecords(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'production_records', auth)
    );

    const publicProfilesUnsubscribe = onSnapshot(
      query(collection(db, 'public_profiles'), limit(100)),
      (snapshot) => {
        setPublicProfiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PublicProfile)).filter(p => p.id !== user.uid));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'public_profiles', auth)
    );

    const chatsUnsubscribe = onSnapshot(
      query(collection(db, 'chats'), where('participants', 'array-contains', user.uid), limit(50)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
        setChats(data.sort((a, b) => {
          const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : (a.updatedAt ? new Date(a.updatedAt) : new Date());
          const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : (b.updatedAt ? new Date(b.updatedAt) : new Date());
          return dateB.getTime() - dateA.getTime();
        }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'chats', auth)
    );

    const financeUnsubscribe = onSnapshot(
      query(collection(db, 'finance_transactions'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(200)),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinanceTransaction));
        setFinanceTransactions(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'finance_transactions', auth)
    );

    const transfersUnsubscribe = onSnapshot(
      query(collection(db, 'animal_transfers'), where('participants', 'array-contains', user.uid), orderBy('updatedAt', 'desc'), limit(50)),
      (snapshot) => {
        setAnimalTransfers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnimalTransfer)));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'animal_transfers', auth)
    );

    const inventoryUnsubscribe = onSnapshot(
      query(collection(db, 'inventory'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'), limit(200)),
      (snapshot) => {
        setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'inventory', auth)
    );

    const tasksUnsubscribe = onSnapshot(
      query(collection(db, 'tasks'), where('userId', '==', user.uid), orderBy('date', 'desc'), limit(200)),
      (snapshot) => {
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'tasks', auth)
    );

    const marketplaceUnsubscribe = onSnapshot(
      query(collection(db, 'marketplace_offers'), orderBy('createdAt', 'desc'), limit(50)),
      (snapshot) => {
        setMarketplaceOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketplaceOffer)));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'marketplace_offers', auth)
    );

    const reviewsUnsubscribe = onSnapshot(
      query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(50)),
      (snapshot) => {
        setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'reviews', auth)
    );

    return () => {
      animalsUnsubscribe();
      notificationsUnsubscribe();
      potrerosUnsubscribe();
      healthUnsubscribe();
      feedingUnsubscribe();
      profileUnsubscribe();
      reproductionUnsubscribe();
      productionUnsubscribe();
      publicProfilesUnsubscribe();
      chatsUnsubscribe();
      financeUnsubscribe();
      transfersUnsubscribe();
      inventoryUnsubscribe();
      tasksUnsubscribe();
      marketplaceUnsubscribe();
      reviewsUnsubscribe();
    };
  }, [user]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setIsLoggingIn(false);
      if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Login popup was closed or replaced by a new request.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the login popup.");
      } else {
        console.error("Login error:", error?.message || String(error));
      }
    }
  };

  const handleLogout = () => signOut(auth);

  const markAsRead = async (notification: Notification) => {
    if (!notification.read) {
      await updateDoc(doc(db, 'notifications', notification.id), { read: true });
    }

    // Navigation logic based on notification type
    if (notification.type === 'chat' && notification.chatId) {
      const targetChat = chats.find(c => c.id === notification.chatId);
      if (targetChat) {
        setActiveChat(targetChat);
        setIsChatOpen(true);
        setActiveTab('community');
        setShowNotifications(false);
      }
    } else if (notification.type === 'transfer') {
      setActiveTab('community');
      setShowNotifications(false);
    } else if (notification.type === 'health') {
      setActiveTab('sanidad');
      setShowNotifications(false);
    } else if (notification.type === 'feed') {
      setActiveTab('alimentacion');
      setShowNotifications(false);
    } else if (notification.type === 'birth') {
      setActiveTab('reproduccion');
      setShowNotifications(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...localProfile,
        updatedAt: serverTimestamp()
      });

      // Mark as dismissed so it doesn't pop up again immediately
      setHasDismissedProfileModal(true);
      localStorage.setItem('hasDismissedProfileModal', 'true');
      setIsProfileModalOpen(false);

      if (localProfile.isPublic) {
        await setDoc(doc(db, 'public_profiles', user.uid), {
          id: user.uid,
          displayName: localProfile.displayName,
          photoURL: localProfile.photoURL,
          ranchName: localProfile.ranchName,
          state: localProfile.state,
          municipality: localProfile.municipality,
          updatedAt: serverTimestamp()
        });
      } else {
        // Remove from public if it was public before
        try {
          await deleteDoc(doc(db, 'public_profiles', user.uid));
        } catch (e) {
          console.log("Profile was not public or error deleting:", e);
        }
      }
      
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Perfil Actualizado',
        message: 'Tu información de perfil ha sido actualizada correctamente.',
        date: serverTimestamp(),
        type: 'feed',
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`, auth);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openAddModal = (potreroId?: string) => {
    setEditingAnimal(null);
    setModalInitialPotrero(potreroId || (potreros[0]?.id || ''));
    setIsAddModalOpen(true);
  };

  const openEditModal = (animal: Animal) => {
    setEditingAnimal(animal);
    setIsAnimalsModalOpen(false);
    setIsAddModalOpen(true);
  };

  const handleDeleteAnimal = async () => {
    if (!user || !animalToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'animals', animalToDelete.id));
      
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          title: 'Registro Eliminado',
          message: `El registro de ${animalToDelete.nombre} (${animalToDelete.id_arete}) ha sido eliminado permanentemente.`,
          date: serverTimestamp(),
          type: 'feed',
          read: false
        });
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
      }
      
      setIsDeleteConfirmOpen(false);
      setIsAddModalOpen(false);
      setEditingAnimal(null);
      setAnimalToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `animals/${animalToDelete.id}`, auth);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateAnimal = async (id: string, data: any) => {
    if (!user) return;
    await updateDoc(doc(db, 'animals', id), data);
    
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Registro Actualizado',
        message: `Se ha actualizado la información de ${data.nombre} (${data.id_arete}).`,
        date: serverTimestamp(),
        type: 'feed',
        read: false
      });
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
    }
  };

  const handleAddAnimal = async (data: any) => {
    if (!user) return;
    try {
      const animalRef = await addDoc(collection(db, 'animals'), {
        ...data,
        id_propietario: user.uid,
        createdAt: serverTimestamp()
      });
      
    if (data.precio && Number(data.precio) > 0) {
      await addDoc(collection(db, 'finance_transactions'), {
        userId: user.uid,
        amount: Number(data.precio),
        type: 'Compra',
        date: serverTimestamp(),
        category: 'Compra de Ganado',
        description: `Registro de animal: ${data.nombre} (${data.id_arete})`,
        animalId: animalRef.id,
        createdAt: serverTimestamp()
      });
    }

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Nuevo Registro',
        message: `Se ha registrado a ${data.nombre} (${data.id_arete}) exitosamente.`,
        date: serverTimestamp(),
        type: 'feed',
        read: false
      });
    } catch (error) {
      console.error("Error adding animal:", error);
    }
  };

  const handleDownloadReport = () => {
    const headers = ['Mes', 'Año', 'Ingresos/Ventas ($)'];
    const rows = monthlyData.map(m => [m.name, m.year, m.value]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_produccion_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (user) {
      addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Reporte Generado',
        message: 'Se ha descargado el reporte de producción mensual en formato CSV.',
        date: serverTimestamp(),
        type: 'info',
        read: false
      });
    }
  };

  const handleAddHealthEvent = async (data: any) => {
    if (!user) return;
    try {
      const healthRef = await addDoc(collection(db, 'health_events'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      
      // If there's a cost, create a finance transaction
      if (data.cost && Number(data.cost) > 0) {
        await addDoc(collection(db, 'finance_transactions'), {
          type: 'Egreso',
          amount: Number(data.cost),
          date: data.date || serverTimestamp(),
          category: 'Salud',
          description: `Salud: ${data.type} - ${data.mode === 'grupal' ? data.potreroName : data.animalName}`,
          relatedId: healthRef.id,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Evento de Salud',
        message: data.mode === 'grupal' 
          ? `Se ha registrado un evento de ${data.description || data.type} para el corral ${data.potreroName}.`
          : `Se ha registrado un evento de ${data.description || data.type} para el animal ${data.animalName} (#${data.animalId}).`,
        date: serverTimestamp(),
        type: 'health',
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'health_events/notifications', auth);
    }
  };

  const handleAddPotrero = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'potreros'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Nuevo Potrero',
        message: `Se ha registrado el potrero ${data.nombre}.`,
        date: serverTimestamp(),
        type: 'health',
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'potreros/notifications', auth);
    }
  };

  const handleAssignAnimals = async (animalIds: string[], potreroId: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      animalIds.forEach(id => {
        const animalRef = doc(db, 'animals', id);
        batch.update(animalRef, { id_potrero: potreroId });
      });
      await batch.commit();
      
      const potrero = potreros.find(p => p.id === potreroId);
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Animales Asignados',
        message: `Se han asignado ${animalIds.length} animales al potrero ${potrero?.nombre}.`,
        date: serverTimestamp(),
        type: 'feed',
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'animals', auth);
    }
  };

  const handleAddFeedingRecord = async (data: any) => {
    if (!user) return;
    try {
      const feedingRef = await addDoc(collection(db, 'feeding_records'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      
      // If there's a cost, create a finance transaction
      if (data.cost && Number(data.cost) > 0) {
        await addDoc(collection(db, 'finance_transactions'), {
          type: 'Egreso',
          amount: Number(data.cost),
          date: data.date || serverTimestamp(),
          category: 'Alimentación',
          description: `Alimento: ${data.foodType} para ${data.potreroNombre}`,
          relatedId: feedingRef.id,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Registro de Alimentación',
        message: `Se ha registrado alimento para el potrero ${data.potreroId}.`,
        date: serverTimestamp(),
        type: 'feed',
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'feeding_records/notifications', auth);
    }
  };

  const handleAddReproductionEvent = async (data: any) => {
    if (!user) return;
    try {
      const reproRef = await addDoc(collection(db, 'reproduction_events'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      
      // If there's a cost, create a finance transaction
      if (data.cost && Number(data.cost) > 0) {
        await addDoc(collection(db, 'finance_transactions'), {
          type: 'Egreso',
          amount: Number(data.cost),
          date: data.date || serverTimestamp(),
          category: 'Reproducción',
          description: `Evento: ${data.type} - ${data.animalName}`,
          relatedId: reproRef.id,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Evento Reproductivo',
        message: `Se ha registrado un evento de ${data.type} para ${data.animalName}.`,
        date: serverTimestamp(),
        type: 'birth',
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reproduction_events', auth);
    }
  };

  const handleAddProductionRecord = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'production_records'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'production_records', auth);
    }
  };

  const handleAddInventoryItem = async (data: Partial<InventoryItem> & { cost?: number }) => {
    if (!user) return;
    try {
      const inventoryRef = await addDoc(collection(db, 'inventory'), {
        ...data,
        userId: user.uid,
        updatedAt: serverTimestamp()
      });

      // If there's a cost, create a finance transaction
      if (data.cost && Number(data.cost) > 0) {
        await addDoc(collection(db, 'finance_transactions'), {
          type: 'Egreso',
          amount: Number(data.cost),
          date: serverTimestamp(),
          category: 'Inventario',
          description: `Compra de Insumo: ${data.nombre}`,
          relatedId: inventoryRef.id,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'inventory', auth);
    }
  };

  const handleUpdateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await updateDoc(doc(db, 'inventory', id), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `inventory/${id}`, auth);
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inventory/${id}`, auth);
    }
  };

  const handleAddTask = async (data: Partial<Task>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        ...data,
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'tasks', auth);
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { completed });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `tasks/${id}`, auth);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`, auth);
    }
  };

  const handleBuyOffer = async (offer: MarketplaceOffer) => {
    if (!user) return;
    // This starts a transfer proposal
    try {
      const transferId = `${offer.animalId}_${user.uid}`;
      await setDoc(doc(db, 'animal_transfers', transferId), {
        animalId: offer.animalId,
        animalName: offer.animalName,
        animalArete: offer.animalArete,
        sellerId: offer.sellerId,
        sellerName: offer.sellerName,
        buyerId: user.uid,
        buyerName: user.displayName || 'Ganadero',
        price: offer.price,
        status: 'pending',
        participants: [offer.sellerId, user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: offer.sellerId,
        title: 'Interés en Mercado',
        message: `${user.displayName} quiere comprar a ${offer.animalName}. Revisa tus transferencias.`,
        date: serverTimestamp(),
        type: 'transfer',
        read: false,
        transferId
      });

      setActiveToast({
        title: 'Propuesta Enviada',
        message: 'Se ha enviado tu interés al vendedor.',
        type: 'transfer'
      });
      setTimeout(() => setActiveToast(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'animal_transfers', auth);
    }
  };

  const handleAddMarketplaceOffer = async (animal: Animal, price: number, description: string) => {
    if (!user) return;
    
    if (!userProfile || !userProfile.ranchName) {
      setActiveToast({
        title: 'Perfil Incompleto',
        message: 'Por favor, completa tu perfil de ganadero antes de publicar en el mercado.',
        type: 'error'
      });
      setTimeout(() => setActiveToast(null), 5000);
      setIsProfileModalOpen(true);
      return;
    }

    try {
      await addDoc(collection(db, 'marketplace_offers'), {
        animalId: animal.id,
        animalName: animal.nombre,
        animalArete: animal.id_arete,
        price,
        description,
        sellerId: user.uid,
        sellerName: userProfile.ranchName || user.displayName || 'Ganadero',
        photoUrl: animal.photoUrl || null,
        createdAt: serverTimestamp()
      });

      // Update animal status/price
      await updateDoc(doc(db, 'animals', animal.id), {
        precio: price
      });

      setActiveToast({
        title: 'Oferta Publicada',
        message: 'Tu animal ya está disponible en el mercado.',
        type: 'success'
      });
      setTimeout(() => setActiveToast(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'marketplace_offers', auth);
    }
  };

  const handleAddFinanceTransaction = async (data: any) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'finance_transactions'), {
        ...data,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      // Si es una Venta y tiene un animalId, marcar el animal como vendido
      if (data.type === 'Venta' && data.animalId) {
        await updateDoc(doc(db, 'animals', data.animalId), {
          id_propietario: `vendido_${user.uid}`,
          status_venta: 'vendido_directo',
          precio_venta: data.amount,
          fecha_venta: data.date instanceof Date ? data.date : new Date(data.date)
        });
        
        setActiveToast({
          title: 'Venta Registrada',
          message: 'La transacción ha sido guardada y el animal marcado como vendido.',
          type: 'success'
        });
        setTimeout(() => setActiveToast(null), 3000);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'finance_transactions', auth);
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    setIsResetting(true);
    try {
      const collectionsToClear = [
        'animals',
        'potreros',
        'notifications',
        'health_events',
        'feeding_records',
        'reproduction_events',
        'production_records',
        'finance_transactions'
      ];

      for (const collName of collectionsToClear) {
        const q = query(collection(db, collName), where(collName === 'animals' ? 'id_propietario' : 'userId', '==', user.uid));
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      setIsResetConfirmOpen(false);
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Sistema Reiniciado',
        message: 'Todos los registros han sido eliminados exitosamente.',
        date: serverTimestamp(),
        type: 'feed',
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'reset_data', auth);
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen relative flex items-center justify-center overflow-hidden">
        {/* Crystal Liquid Gradient Background */}
        <div className="absolute inset-0 z-0 bg-[#f8fafc]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.4, 1],
                x: [-50, 50, -50],
                y: [-30, 30, -30],
                rotate: [0, 45, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-[#006341]/40 rounded-full blur-[120px]"
            />
            <motion.div 
              animate={{ 
                scale: [1.4, 1, 1.4],
                x: [50, -50, 50],
                y: [30, -30, 30],
                rotate: [0, -45, 0]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-[10%] -right-[10%] w-[80%] h-[80%] bg-[#c8102e]/40 rounded-full blur-[120px]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#006341]/40 via-white/20 to-[#c8102e]/40 backdrop-blur-[60px]" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-8"
        >
          <TlanextliLogo size="lg" />
          <div className="w-48 h-1.5 bg-primary/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              animate={{ x: [-200, 200] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-end p-8 overflow-hidden">
        {/* Mexican Flag */}
        <div className="absolute top-8 right-8 z-20 shadow-xl overflow-hidden border border-white/20">
          <img 
            src="https://flagcdn.com/w160/mx.png" 
            alt="México" 
            className="w-20 sm:w-28 h-auto object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Crystal Liquid Gradient Background */}
        <div className="absolute inset-0 z-0 bg-[#f8fafc]">
          {/* Animated Liquid Blobs for "Crystal Liquid" effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.4, 1],
                x: [-50, 50, -50],
                y: [-30, 30, -30],
                rotate: [0, 45, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-[#006341]/40 rounded-full blur-[120px]"
            />
            <motion.div 
              animate={{ 
                scale: [1.4, 1, 1.4],
                x: [50, -50, 50],
                y: [30, -30, 30],
                rotate: [0, -45, 0]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-[10%] -right-[10%] w-[80%] h-[80%] bg-[#c8102e]/40 rounded-full blur-[120px]"
            />
            <motion.div 
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [0.8, 1.1, 0.8]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-white/50 rounded-full blur-[100px]"
            />
          </div>
          
          {/* Main Translucent Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#006341]/40 via-white/20 to-[#c8102e]/40 backdrop-blur-[60px]" />
          
          {/* Glass Noise Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-12 mb-12">
          <div className="space-y-8">
            <TlanextliLogo light size="lg" />
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight font-display">
                GESTIÓN<br />
                <span className="text-accent">GANADERA</span>
              </h1>
            </div>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-white text-primary font-bold py-5 px-8 rounded-3xl shadow-2xl flex items-center justify-between group hover:bg-gray-50 transition-all active:scale-95"
          >
            <span className="text-xl">Ingresar</span>
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:translate-x-2 transition-transform">
              <ArrowRight className="text-primary" size={24} />
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pb-24 lg:pb-0 lg:pl-72">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 fixed inset-y-0 left-0 p-8 z-50">
        <button 
          onClick={() => setActiveTab('inicio')}
          className="mb-12 hover:opacity-80 transition-opacity"
        >
          <TlanextliLogo size="md" />
        </button>
        <nav className="flex-1 overflow-y-auto no-scrollbar space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
          <SidebarItem icon={Users} label="Ganado" active={activeTab === 'ganado'} onClick={() => setActiveTab('ganado')} />
          <SidebarItem icon={MapIcon} label="Corrales" active={activeTab === 'corrales'} onClick={() => setActiveTab('corrales')} />
          <SidebarItem icon={Stethoscope} label="Sanidad" active={activeTab === 'sanidad'} onClick={() => setActiveTab('sanidad')} />
          <SidebarItem icon={Wheat} label="Alimentación" active={activeTab === 'feeding'} onClick={() => setActiveTab('feeding')} />
          <SidebarItem icon={Dna} label="Reproducción" active={activeTab === 'reproduction'} onClick={() => setActiveTab('reproduction')} />
          <SidebarItem icon={TrendingUp} label="Producción" active={activeTab === 'production'} onClick={() => setActiveTab('production')} />
          <SidebarItem icon={Database} label="Inventario" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <SidebarItem icon={Calendar} label="Calendario" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          <SidebarItem icon={PieChartIcon} label="Reportes" active={activeTab === 'reportes'} onClick={() => setActiveTab('reportes')} />
          <SidebarItem icon={Wallet} label="Finanzas" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
          <SidebarItem icon={Users2} label="Comunidad" active={activeTab === 'community'} onClick={() => setActiveTab('community')} badge={activeRanchersCount} />
          <SidebarItem icon={User} label="Perfil" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center gap-4 mb-6 p-2">
            <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-xl border-2 border-primary/10" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary truncate">{user.displayName}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Propietario</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 font-bold text-sm px-4 py-2 w-full transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white px-6 py-4 flex justify-center items-center sticky top-0 z-40 border-b border-gray-100">
        <button onClick={() => setActiveTab('inicio')} className="hover:opacity-80 transition-opacity">
          <TlanextliLogo size="sm" className="justify-center" />
        </button>
      </header>

      <main className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
            {activeTab === 'inicio' && (
              <motion.div 
                key="inicio"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-12"
              >
                {/* Hero Header */}
                <div className="primary-gradient rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                  <div className="absolute top-0 right-0 p-6">
                    <button 
                      onClick={() => setActiveTab('notifications')}
                      className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors relative"
                    >
                      <Bell size={24} />
                      {notifications.filter(n => !n.read).length > 0 && (
                        <span className="absolute top-3 right-3 w-3 h-3 bg-accent rounded-full border-2 border-primary" />
                      )}
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-white/70 font-medium">
                      {(() => {
                        const hour = new Date().getHours();
                        if (hour >= 5 && hour < 12) return 'Buenos días';
                        if (hour >= 12 && hour < 19) return 'Buenas tardes';
                        return 'Buenas noches';
                      })()}
                    </p>
                    <h2 className="text-3xl font-black font-display tracking-tight">Ganader@</h2>
                  </div>

                  <div className="mt-12 text-center">
                    <p className="text-6xl sm:text-7xl font-black font-display tracking-tighter">{activeHealthStats.total}</p>
                    <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-xs mt-2">animales en el hato</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                    <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
                      <div className="flex flex-col items-center gap-1">
                        <Users size={16} className="text-white/60" />
                        <p className="text-lg font-black">{activeAnimals.filter(a => a.sexo === 'M').length}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Machos</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
                      <div className="flex flex-col items-center gap-1">
                        <Users size={16} className="text-white/60" />
                        <p className="text-lg font-black">{activeAnimals.filter(a => a.sexo === 'H').length}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Hembras</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
                      <div className="flex flex-col items-center gap-1">
                        <Milk size={16} className="text-white/60" />
                        <p className="text-lg font-black">{activeAnimals.filter(a => a.tipo_produccion === 'Leche').length}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Lecheras</p>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
                      <div className="flex flex-col items-center gap-1">
                        <AlertCircle size={16} className="text-white/60" />
                        <p className="text-lg font-black">{activeHealthStats.sick}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Enfermos</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                  {inventory.filter(item => item.cantidad <= (item.minimo || 0)).length > 0 && (
                    <div onClick={() => setActiveTab('inventory')} className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-red-100 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-red-600 uppercase tracking-widest">Alerta de Inventario</p>
                        <p className="text-sm font-bold text-red-900">Tienes insumos con stock bajo</p>
                      </div>
                    </div>
                  )}
                  {tasks.filter(t => !t.completed && isSameDay(t.date?.toDate ? t.date.toDate() : new Date(t.date), new Date())).length > 0 && (
                    <div onClick={() => setActiveTab('calendar')} className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-primary/10 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest">Tareas de Hoy</p>
                        <p className="text-sm font-bold text-primary/80">Tienes tareas pendientes para hoy</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <section className="space-y-4">
                  <h3 className="text-xl font-black text-primary tracking-tight px-2">Acceso Rápido</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button onClick={() => setActiveTab('calendar')} className="quick-action-btn">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Calendar size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">Calendario</span>
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className="quick-action-btn">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Database size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">Inventario</span>
                    </button>
                    <button onClick={() => setIsScannerModalOpen(true)} className="quick-action-btn">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Camera size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">Escanear QR</span>
                    </button>
                    <button onClick={() => setActiveTab('reportes')} className="quick-action-btn">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <FileText size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">Reportes</span>
                    </button>
                    <button onClick={() => setActiveTab('community')} className="quick-action-btn">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <ShoppingBag size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">Mercado</span>
                    </button>
                  </div>
                </section>

                {/* Health Status */}
                <section className="space-y-4">
                  <div className="flex justify-between items-end px-2">
                    <h3 className="text-xl font-black text-primary tracking-tight">Estado Sanitario</h3>
                    <button onClick={() => setActiveTab('sanidad')} className="text-xs font-bold text-secondary flex items-center gap-1">
                      Ver todo <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card border-b-4 border-b-green-500">
                      <CheckCircle className="text-green-500 mb-2" size={20} />
                      <p className="text-3xl font-black text-primary">{activeHealthStats.healthy}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sanos</p>
                    </div>
                    <div className="stat-card border-b-4 border-b-red-500">
                      <AlertCircle className="text-red-500 mb-2" size={20} />
                      <p className="text-3xl font-black text-primary">{activeHealthStats.sick}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enfermos</p>
                    </div>
                    <div className="stat-card border-b-4 border-b-orange-500">
                      <CheckCircle2 className="text-orange-500 mb-2" size={20} />
                      <p className="text-3xl font-black text-primary">{activeHealthStats.vaccinations}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vacunación</p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'ganado' && (
              <motion.div 
                key="ganado"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 pb-12"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-3xl font-black text-primary tracking-tight font-display">Ganado</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsScannerModalOpen(true)}
                        className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-primary flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all"
                        title="Escanear QR"
                      >
                        <Camera size={24} />
                      </button>
                      <button 
                        onClick={() => openAddModal()}
                        className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="relative px-2">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre o arete..."
                      className="w-full pl-14 pr-6 py-4 bg-white rounded-3xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar">
                    <button 
                      onClick={() => setCattleFilter('todos')}
                      className={cn(
                        "px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all",
                        cattleFilter === 'todos' ? "bg-primary text-white" : "bg-white text-gray-400 border border-gray-100"
                      )}
                    >
                      Todos
                    </button>
                    <button 
                      onClick={() => setCattleFilter('venta')}
                      className={cn(
                        "px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all",
                        cattleFilter === 'venta' ? "bg-primary text-white" : "bg-white text-gray-400 border border-gray-100"
                      )}
                    >
                      En Venta
                    </button>
                    <button 
                      onClick={() => setCattleFilter('vendidos')}
                      className={cn(
                        "px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all",
                        cattleFilter === 'vendidos' ? "bg-primary text-white" : "bg-white text-gray-400 border border-gray-100"
                      )}
                    >
                      Vendidos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {animals
                    .filter(a => {
                      const matchesSearch = a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          a.id_arete.toLowerCase().includes(searchTerm.toLowerCase());
                      
                      if (cattleFilter === 'venta') {
                        return matchesSearch && a.en_venta;
                      }
                      
                      if (cattleFilter === 'vendidos') {
                        return matchesSearch && a.id_propietario?.startsWith('vendido_');
                      }
                      
                      return matchesSearch && !a.id_propietario?.startsWith('vendido_');
                    })
                    .map(animal => (
                      <AnimalCard 
                        key={animal.id} 
                        animal={animal} 
                        potreros={potreros}
                        onClick={() => openEditModal(animal)}
                        onTransfer={(e) => {
                          e.stopPropagation();
                          setTransferAnimal(animal);
                          setIsTransferModalOpen(true);
                        }}
                        onShowQR={(e) => {
                          e.stopPropagation();
                          setQrAnimal(animal);
                          setIsQrModalOpen(true);
                          fetchAnimalHistory(animal.id);
                        }}
                        onSell={(e) => {
                          e.stopPropagation();
                          setMarketplaceAnimal(animal);
                          setIsMarketplaceModalOpen(true);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          setAnimalToDelete(animal);
                          setIsDeleteConfirmOpen(true);
                        }}
                      />
                    ))}
                  
                  {cattleFilter === 'vendidos' && (
                    <div className="space-y-4">
                      {animalTransfers
                        .filter(t => t.sellerId === user?.uid && t.status === 'completed')
                        .map(transfer => (
                          <div key={transfer.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center">
                                <Users size={24} />
                              </div>
                              <div>
                                <p className="font-black text-primary text-lg">{transfer.animalName}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Vendido por ${transfer.price.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Completado</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                                {transfer.updatedAt?.toDate ? format(transfer.updatedAt.toDate(), 'dd MMM yyyy', { locale: es }) : 'Reciente'}
                              </p>
                            </div>
                          </div>
                        ))}
                      {animalTransfers.filter(t => t.sellerId === user?.uid && t.status === 'completed').length === 0 && (
                        <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No hay ventas registradas</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {activeAnimals.length === 0 && (
                  <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6">
                      <Users size={40} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2">No hay animales registrados</h3>
                    <p className="text-gray-400 max-w-xs mx-auto text-sm">Comienza agregando tu primer ejemplar al hato.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'corrales' && (
              <motion.div 
                key="corrales"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-12"
              >
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-3xl font-black text-primary tracking-tight font-display">Corrales</h2>
                  <button 
                    onClick={() => setIsPotreroModalOpen(true)}
                    className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20"
                  >
                    <Plus size={24} />
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 px-2">
                  <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-black text-primary">{potreros.length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Corrales</p>
                  </div>
                  <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-black text-secondary">{activeAnimals.filter(a => a.id_potrero).length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ubicados</p>
                  </div>
                  <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-black text-red-500">{activeAnimals.filter(a => !a.id_potrero).length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sin ubicar</p>
                  </div>
                </div>

                {/* Potreros List */}
                <div className="space-y-4 px-2">
                  {potreros.map(potrero => {
                    const animalCount = activeAnimals.filter(a => a.id_potrero === potrero.id).length;
                    const freeSpace = potrero.capacidad - animalCount;
                    const occupancyPercent = (animalCount / potrero.capacidad) * 100;

                    return (
                      <div key={potrero.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                              <MapIcon size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-primary text-lg">{potrero.nombre}</h4>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{animalCount} Animales</p>
                            </div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                            <MoreHorizontal size={20} />
                          </button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-gray-400">Ocupación</span>
                            <span className={cn(
                              occupancyPercent > 90 ? "text-red-500" : "text-secondary"
                            )}>{Math.round(occupancyPercent)}%</span>
                          </div>
                          <div className="progress-bar-container">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${occupancyPercent}%` }}
                              className={cn(
                                "progress-bar-fill",
                                occupancyPercent > 90 ? "bg-red-500" : "bg-secondary"
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs font-bold text-gray-600">{freeSpace} Libres</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-200" />
                            <span className="text-xs font-bold text-gray-600">{potrero.capacidad} Capacidad</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setTargetPotrero(potrero);
                            setIsAssignModalOpen(true);
                          }}
                          className="w-full mt-4 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
                        >
                          <ArrowLeftRight size={20} />
                          Asignar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'sanidad' && (
              <motion.div 
                key="sanidad"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-12"
              >
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-3xl font-black text-primary tracking-tight font-display">Sanidad</h2>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 px-2">
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-4xl font-black text-primary">{activeHealthStats.total}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-4xl font-black text-green-600">{activeHealthStats.healthy}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sanos</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-4xl font-black text-red-600">{activeHealthStats.sick}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enfermos</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <p className="text-4xl font-black text-orange-600">{activeHealthStats.vaccinations}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Vacunación</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 px-2">
                  <button 
                    onClick={() => {
                      setHealthModalMode('individual');
                      setIsHealthModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20"
                  >
                    <User size={20} />
                    Individual
                  </button>
                  <button 
                    onClick={() => {
                      setHealthModalMode('grupal');
                      setIsHealthModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-3 py-4 bg-white text-primary border border-gray-100 rounded-2xl font-bold shadow-sm"
                  >
                    <Users size={20} />
                    Grupal
                  </button>
                </div>

                {/* History */}
                <section className="space-y-4 px-2">
                  <h3 className="text-xl font-black text-primary tracking-tight">Historial</h3>
                  <div className="space-y-4">
                    {healthEvents.length > 0 ? (
                      [...healthEvents].sort((a, b) => b.date.seconds - a.date.seconds).map(event => (
                        <div key={event.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            event.type === 'Enfermedad' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                          )}>
                            <Stethoscope size={24} />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-primary">{event.type}</p>
                            <p className="text-xs text-gray-400 font-medium">
                              {event.animalName || `Animal ID: ${event.animalId}`} • {safeFormatDate(event.date, 'dd MMM yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                              event.type === 'Enfermedad' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                            )}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sin historial sanitario</p>
                      </div>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'mas' && (
              <motion.div 
                key="mas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-12"
              >
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-3xl font-black text-primary tracking-tight font-display">Más opciones</h2>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="p-3 bg-white rounded-2xl border border-gray-100 text-primary shadow-sm"
                  >
                    <Settings size={20} />
                  </button>
                </div>

                <div className="space-y-8 px-2">
                  {/* Gestión Section */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Gestión</h3>
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                      <button onClick={() => setActiveTab('corrales')} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                            <MapIcon size={20} />
                          </div>
                          <span className="font-bold text-primary">Potreros y Corrales</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </button>
                      <button onClick={() => setActiveTab('reportes')} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <PieChartIcon size={20} />
                          </div>
                          <span className="font-bold text-primary">Reportes y Estadísticas</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </button>
                      <button onClick={() => setActiveTab('finances')} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                            <Wallet size={20} />
                          </div>
                          <span className="font-bold text-primary">Finanzas y Gastos</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </button>
                    </div>
                  </section>

                  {/* Animales Section */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Animales</h3>
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                      <button onClick={() => setActiveTab('feeding')} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Wheat size={20} />
                          </div>
                          <span className="font-bold text-primary">Alimentación</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </button>
                      <button onClick={() => setActiveTab('reproduction')} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                            <Dna size={20} />
                          </div>
                          <span className="font-bold text-primary">Reproducción</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </button>
                    </div>
                  </section>

                  {/* Sistema Section */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Sistema</h3>
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                      <button onClick={() => setActiveTab('settings')} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center">
                            <User size={20} />
                          </div>
                          <span className="font-bold text-primary">Perfil del Rancho</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                      </button>
                      <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 hover:bg-red-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <LogOut size={20} />
                          </div>
                          <span className="font-bold text-red-600">Cerrar Sesión</span>
                        </div>
                        <ChevronRight size={18} className="text-red-200" />
                      </button>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'reportes' && (
              <motion.div 
                key="reportes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 pb-12"
              >
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-3xl font-black text-primary tracking-tight font-display">Reportes</h2>
                  <button 
                    onClick={() => setIsReportsModalOpen(true)}
                    className="p-3 bg-white rounded-2xl border border-gray-100 text-primary shadow-sm hover:bg-gray-50 transition-colors"
                  >
                    <Download size={20} />
                  </button>
                </div>

                {/* Production Chart */}
                <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-primary">Producción Mensual</h3>
                    <select className="bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-500 px-3 py-2 outline-none">
                      <option>Últimos 6 meses</option>
                      <option>Este año</option>
                    </select>
                  </div>
                  <div className="h-64 w-full min-h-[256px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#f3f4f6' }}
                        />
                        <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* Distribution Chart */}
                <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-primary">Distribución del Hato</h3>
                  <div className="h-64 w-full min-h-[256px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Machos', value: activeAnimals.filter(a => a.sexo === 'M').length },
                            { name: 'Hembras', value: activeAnimals.filter(a => a.sexo === 'H').length },
                          ]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="var(--color-primary)" />
                          <Cell fill="var(--color-accent)" />
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('inicio')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <ArrowLeftRight size={20} className="rotate-180" />
                    </button>
                    <h2 className="text-3xl font-black text-primary tracking-tight font-display">Inventario</h2>
                  </div>
                  <button onClick={() => setIsInventoryModalOpen(true)} className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                    <Plus size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                  {inventory.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center",
                          item.cantidad <= (item.minimo || 0) ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary"
                        )}>
                          <Database size={24} />
                        </div>
                        <div>
                          <p className="font-black text-primary text-lg">{item.nombre}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.cantidad} {item.unidad}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleUpdateInventoryItem(item.id, { cantidad: item.cantidad + 1 })} className="p-3 hover:bg-gray-50 rounded-xl text-primary transition-all"><Plus size={20} /></button>
                        <button onClick={() => handleUpdateInventoryItem(item.id, { cantidad: Math.max(0, item.cantidad - 1) })} className="p-3 hover:bg-gray-50 rounded-xl text-red-500 transition-all"><Minus size={20} /></button>
                      </div>
                    </div>
                  ))}
                  {inventory.length === 0 && (
                    <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                      <Database size={48} className="mx-auto mb-4 text-gray-200" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No hay insumos registrados</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'community' && (
              <CommunityView 
                profiles={publicProfiles} 
                onStartChat={handleStartChat}
                chats={chats}
                onOpenChat={() => setIsChatOpen(true)}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
                transfers={animalTransfers}
                onAcceptTransfer={handleAcceptTransfer}
                onRejectTransfer={handleRejectTransfer}
                onCompleteTransfer={handleCompleteTransfer}
                currentUserId={user?.uid || ''}
                marketplaceOffers={marketplaceOffers}
                onBuyOffer={handleBuyOffer}
                reviews={reviews}
                onOpenAnimals={() => setIsAnimalsModalOpen(true)}
              />
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }} 
                className="space-y-8 pb-12"
              >
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-3xl font-black text-primary tracking-tight font-display">Ajustes</h2>
                </div>
                
                <div className="space-y-8 px-2">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <img src={user.photoURL || ''} alt="Avatar" className="w-24 h-24 rounded-3xl border-4 border-primary/10 object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Plus className="text-white" size={24} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{user.displayName}</h3>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                        <span className="status-badge bg-primary/10 text-primary mt-2 inline-block">Propietario Verificado</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                        <input 
                          type="text" 
                          value={localProfile.displayName || ''} 
                          onChange={(e) => setLocalProfile({ ...localProfile, displayName: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre del Rancho</label>
                        <input 
                          type="text" 
                          value={localProfile.ranchName || ''} 
                          onChange={(e) => setLocalProfile({ ...localProfile, ranchName: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                          placeholder="Ej: Rancho La Esperanza"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                        <input 
                          type="text" 
                          value={localProfile.phone || ''} 
                          onChange={(e) => setLocalProfile({ ...localProfile, phone: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                          placeholder="+52 ..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CURP</label>
                        <input 
                          type="text" 
                          value={localProfile.curp || ''} 
                          onChange={(e) => setLocalProfile({ ...localProfile, curp: e.target.value.toUpperCase() })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                          placeholder="18 caracteres"
                          maxLength={18}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Municipio</label>
                        <input 
                          type="text" 
                          value={localProfile.municipality || ''} 
                          onChange={(e) => setLocalProfile({ ...localProfile, municipality: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                          placeholder="Ej: Pinos"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border border-primary/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-primary">Perfil Público</h4>
                          <p className="text-xs text-gray-500">Haz que tu rancho sea visible en la comunidad</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setLocalProfile({ ...localProfile, isPublic: !localProfile.isPublic })}
                        className={cn(
                          "w-14 h-8 rounded-full transition-all relative",
                          localProfile.isPublic ? "bg-primary" : "bg-gray-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm",
                          localProfile.isPublic ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <button 
                      onClick={handleUpdateProfile}
                      className="accent-button w-full py-4"
                    >
                      Guardar Cambios
                    </button>
                  </div>

                  <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 space-y-4">
                    <h3 className="text-xl font-bold text-red-600">Zona de Peligro</h3>
                    <p className="text-sm text-red-600/70 font-medium">
                      Estas acciones son irreversibles. Ten cuidado.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="w-full py-4 bg-white text-red-600 border border-red-200 rounded-2xl font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                      >
                        Borrar Todos los Datos
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 pb-12"
              >
                <h2 className="text-3xl font-black text-primary tracking-tight font-display px-2">Notificaciones</h2>
                <div className="space-y-4 px-2">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <NotificationItem key={n.id} notification={n} onClick={markAsRead} />
                    ))
                  ) : (
                    <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                      <Bell size={48} className="mx-auto mb-4 text-gray-200" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Sin notificaciones</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'finances' && (
              <motion.div key="finances" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('inicio')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <ArrowLeftRight size={20} className="rotate-180" />
                    </button>
                    <h2 className="text-3xl font-black text-primary tracking-tight font-display">Finanzas</h2>
                  </div>
                  <button onClick={() => setIsFinanceModalOpen(true)} className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                    <Plus size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ingresos Totales</p>
                    <p className="text-2xl font-black text-green-600">${financeTransactions.filter(t => t.type === 'Venta' || t.type === 'Ingreso').reduce((acc, curr) => {
                      const val = Number(curr.amount || 0);
                      return acc + (isNaN(val) ? 0 : val);
                    }, 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Egresos Totales</p>
                    <p className="text-2xl font-black text-red-600">${financeTransactions.filter(t => t.type === 'Gasto' || t.type === 'Egreso' || t.type === 'Compra').reduce((acc, curr) => {
                      const val = Number(curr.amount || 0);
                      return acc + (isNaN(val) ? 0 : val);
                    }, 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-2xl font-black text-primary">${(financeTransactions.filter(t => t.type === 'Venta' || t.type === 'Ingreso').reduce((acc, curr) => {
                      const val = Number(curr.amount || 0);
                      return acc + (isNaN(val) ? 0 : val);
                    }, 0) - financeTransactions.filter(t => t.type === 'Gasto' || t.type === 'Egreso' || t.type === 'Compra').reduce((acc, curr) => {
                      const val = Number(curr.amount || 0);
                      return acc + (isNaN(val) ? 0 : val);
                    }, 0)).toLocaleString()}</p>
                  </div>
                </div>

                {/* Gráfico de Gastos por Categoría */}
                <div className="px-2">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-primary tracking-tight mb-6">Gastos por Categoría</h3>
                    <div className="h-[300px] w-full min-h-[300px]">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <BarChart data={expensesByCategory} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ 
                              borderRadius: '1.5rem', 
                              border: 'none', 
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                              padding: '1rem'
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Gasto']}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="#1b4332" 
                            radius={[8, 8, 8, 8]} 
                            barSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-2">
                  <h3 className="text-xl font-black text-primary tracking-tight">Transacciones Recientes</h3>
                  {financeTransactions.map(t => (
                    <div key={t.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'Venta' || t.type === 'Ingreso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {t.type === 'Venta' || t.type === 'Ingreso' ? <TrendingUp size={24} /> : <TrendingUp size={24} className="rotate-180" />}
                        </div>
                        <div>
                          <p className="font-bold text-primary">{t.category}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">{safeFormatDate(t.date)}</p>
                            {t.animalId && (
                              <span className="text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {animals.find(a => a.id === t.animalId)?.nombre || 'Animal'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className={`text-lg font-black ${t.type === 'Venta' || t.type === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'Venta' || t.type === 'Ingreso' ? '+' : '-'}${(t.amount || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'feeding' && (
              <motion.div key="feeding" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('inicio')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <ArrowLeftRight size={20} className="rotate-180" />
                    </button>
                    <h2 className="text-3xl font-black text-primary tracking-tight font-display">Alimentación</h2>
                  </div>
                  <button onClick={() => setIsFeedingModalOpen(true)} className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                    <Plus size={24} />
                  </button>
                </div>
                <div className="space-y-4 px-2">
                  {feedingRecords.map(r => (
                    <div key={r.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            <Wheat size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-primary">{r.foodType}</p>
                            <p className="text-xs text-gray-400">{safeFormatDate(r.date)}</p>
                          </div>
                        </div>
                        <span className="status-badge bg-orange-50 text-orange-600">{r.quantity} {r.unit}</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{r.potreroNombre}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reproduction' && (
              <motion.div key="reproduction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('inicio')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <ArrowLeftRight size={20} className="rotate-180" />
                    </button>
                    <h2 className="text-3xl font-black text-primary tracking-tight font-display">Reproducción</h2>
                  </div>
                  <button onClick={() => setIsReproductionModalOpen(true)} className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                    <Plus size={24} />
                  </button>
                </div>
                <div className="space-y-4 px-2">
                  {reproductionEvents.map(e => (
                    <div key={e.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                            <Dna size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-primary">{e.type}</p>
                            <p className="text-xs text-gray-400">{e.animalName}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-400">{safeFormatDate(e.date)}</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">{e.notes}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'production' && (
              <motion.div key="production" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('inicio')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <ArrowLeftRight size={20} className="rotate-180" />
                    </button>
                    <h2 className="text-3xl font-black text-primary tracking-tight font-display">Producción</h2>
                  </div>
                  <button onClick={() => setIsProductionModalOpen(true)} className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                    <Plus size={24} />
                  </button>
                </div>
                <div className="space-y-4 px-2">
                  {productionRecords.map(r => (
                    <div key={r.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <TrendingUp size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-primary">{r.type}</p>
                            <p className="text-xs text-gray-400">{safeFormatDate(r.date)}</p>
                          </div>
                        </div>
                        <span className="status-badge bg-blue-50 text-blue-600">{r.quantity} {r.unit}</span>
                      </div>
                      {r.animalName && (
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Animal: {r.animalName}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div key="calendar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('inicio')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <ArrowLeftRight size={20} className="rotate-180" />
                    </button>
                    <h2 className="text-3xl font-black text-primary tracking-tight font-display">Calendario</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                    <button onClick={() => setCalendarDate(subMonths(calendarDate, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                      <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <span className="px-4 font-black text-primary uppercase tracking-widest text-[10px] whitespace-nowrap">
                      {format(calendarDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <button onClick={() => setCalendarDate(addMonths(calendarDate, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mx-2">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                      <div key={`${d}-${i}`} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {(() => {
                      const monthStart = startOfMonth(calendarDate);
                      const monthEnd = endOfMonth(monthStart);
                      const startDate = startOfWeek(monthStart);
                      const endDate = endOfWeek(monthEnd);
                      const days = eachDayOfInterval({ start: startDate, end: endDate });
                      
                      return days.map((day, i) => {
                        const dayTasks = tasks.filter(t => isSameDay(t.date?.toDate ? t.date.toDate() : new Date(t.date), day));
                        const isSelectedMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                          <button 
                            key={i} 
                            onClick={() => {
                              setTaskToEdit({ date: format(day, 'yyyy-MM-dd'), title: '', type: 'otro' });
                              setIsTaskFormOpen(true);
                            }}
                            className={cn(
                              "aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-bold transition-all relative group",
                              !isSelectedMonth ? "opacity-20 pointer-events-none" : "hover:bg-gray-50",
                              isToday ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-gray-50 text-primary"
                            )}
                          >
                            <span>{format(day, 'd')}</span>
                            {dayTasks.length > 0 && (
                              <div className="absolute bottom-2 flex gap-0.5">
                                {dayTasks.slice(0, 3).map(t => (
                                  <div key={t.id} className={cn(
                                    "w-1 h-1 rounded-full",
                                    isToday ? "bg-white" : (
                                      t.type === 'vacuna' ? "bg-red-400" : 
                                      t.type === 'desparasitacion' ? "bg-blue-400" : 
                                      t.type === 'parto' ? "bg-pink-400" : "bg-primary/40"
                                    )
                                  )} />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <h4 className="text-sm font-black text-primary uppercase tracking-widest">Tareas Próximas</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {tasks
                        .filter(t => !t.completed && (t.date?.toDate ? t.date.toDate() : new Date(t.date)) >= startOfMonth(new Date()))
                        .sort((a,b) => (a.date?.toDate ? a.date.toDate() : new Date(a.date)).getTime() - (b.date?.toDate ? b.date.toDate() : new Date(b.date)).getTime())
                        .slice(0, 5)
                        .map(task => (
                          <div key={task.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-sm transition-all">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                              task.type === 'vacuna' ? "bg-red-500 shadow-red-500/20" : 
                              task.type === 'desparasitacion' ? "bg-blue-500 shadow-blue-500/20" : 
                              task.type === 'parto' ? "bg-pink-500 shadow-pink-500/20" : "bg-primary shadow-primary/20"
                            )}>
                              {task.type === 'vacuna' ? <Stethoscope size={20} /> : 
                               task.type === 'parto' ? <Baby size={20} /> : <Activity size={20} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-primary">{task.title}</p>
                              <p className="text-[10px] text-primary/60 font-bold uppercase tracking-wider">
                                {format(task.date?.toDate ? task.date.toDate() : new Date(task.date), 'dd MMM yyyy', { locale: es })}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleToggleTask(task.id, true)}
                              className="p-2 text-gray-300 hover:text-green-500 transition-colors"
                            >
                              <CheckCircle2 size={20} />
                            </button>
                          </div>
                      ))}
                      {tasks.length === 0 && (
                        <div className="text-center py-10 opacity-40">
                          <p className="text-[10px] font-bold uppercase tracking-widest">No hay tareas pendientes</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div key="gallery" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
                <div className="flex items-center gap-4 px-2">
                  <button onClick={() => setActiveTab('inicio')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeftRight size={20} className="rotate-180" />
                  </button>
                  <h2 className="text-3xl font-black text-primary tracking-tight font-display">Galería Finca</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 px-2">
                  {activeAnimals.filter(a => a.photoUrl).length > 0 ? (
                    activeAnimals.filter(a => a.photoUrl).map(animal => (
                      <div key={animal.id} className="aspect-square rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group relative">
                        <img 
                          src={animal.photoUrl} 
                          alt={animal.nombre} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <div className="text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest">{animal.nombre}</p>
                            <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest">#{animal.id_arete}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                      <ImageIcon size={48} className="mx-auto mb-4 text-gray-200" />
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No hay fotos de animales registradas</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'support' && (
              <motion.div key="support" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 pb-12">
                <div className="flex items-center gap-4 px-2">
                  <button onClick={() => setActiveTab('inicio')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeftRight size={20} className="rotate-180" />
                  </button>
                  <h2 className="text-3xl font-black text-primary tracking-tight font-display">Apoyar</h2>
                </div>
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm mx-2 text-center space-y-8">
                  <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-amber-600/10">
                    <Coffee size={48} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-primary tracking-tight font-display">Apoya el Proyecto</h2>
                    <p className="text-gray-500 font-medium max-w-xs mx-auto">Tlanextli es una herramienta gratuita para ganaderos. Tu apoyo nos ayuda a seguir mejorando.</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Gracias por ser parte de Tlanextli</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        <nav className="fixed bottom-0 inset-x-0 glass-nav lg:hidden flex items-center justify-around px-2 py-1 z-50 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
          <BottomNavItem icon={LayoutDashboard} label="Inicio" active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} />
          <BottomNavItem icon={Users} label="Ganado" active={activeTab === 'ganado'} onClick={() => setActiveTab('ganado')} />
          <BottomNavItem icon={Stethoscope} label="Sanidad" active={activeTab === 'sanidad'} onClick={() => setActiveTab('sanidad')} />
          <BottomNavItem icon={Users2} label="Comunidad" active={activeTab === 'community'} onClick={() => setActiveTab('community')} badge={activeRanchersCount} />
          <BottomNavItem icon={MoreHorizontal} label="Más" active={activeTab === 'mas'} onClick={() => setActiveTab('mas')} />
        </nav>
      
      <AnimalFormModal 
        isOpen={isAddModalOpen} 
        onClose={() => { 
          setIsAddModalOpen(false); 
          setEditingAnimal(null); 
          setModalInitialPotrero('');
        }} 
        onAdd={handleAddAnimal}
        onUpdate={handleUpdateAnimal}
        onDelete={(animal) => {
          setAnimalToDelete(animal);
          setIsDeleteConfirmOpen(true);
        }}
        potreros={potreros}
        initialPotrero={modalInitialPotrero}
        editingAnimal={editingAnimal}
        ranchName={userProfile?.ranchName}
      />

      <AnimalsModal 
        isOpen={isAnimalsModalOpen}
        onClose={() => setIsAnimalsModalOpen(false)}
        animals={animals}
        potreros={potreros}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddNew={() => { setIsAnimalsModalOpen(false); openAddModal(); }}
        onEdit={openEditModal}
        onTransfer={(animal) => {
          setTransferAnimal(animal);
          setIsTransferModalOpen(true);
        }}
        onShowQR={(animal) => {
          setQrAnimal(animal);
          setIsQrModalOpen(true);
        }}
        onSell={(animal) => {
          setMarketplaceAnimal(animal);
          setIsMarketplaceModalOpen(true);
        }}
      />

      <HealthEventModal 
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        animals={activeAnimals}
        potreros={potreros}
        mode={healthModalMode}
        onAdd={handleAddHealthEvent}
      />

      <FinanceModal
        isOpen={isFinanceModalOpen}
        onClose={() => setIsFinanceModalOpen(false)}
        onAdd={handleAddFinanceTransaction}
        animals={activeAnimals}
      />

      <ComingSoonModal 
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
      />

      {isScannerModalOpen && (
        <QRScannerModal 
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          onScanSuccess={(id) => handleAnimalScan(id)}
        />
      )}

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        inventory={inventory}
        onAdd={handleAddInventoryItem}
        onUpdate={handleUpdateInventoryItem}
        onDelete={handleDeleteInventoryItem}
      />

      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        tasks={tasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskFormModal
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onAdd={handleAddTask}
        initialData={taskToEdit}
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        animals={activeAnimals}
        healthEvents={healthEvents}
        productionRecords={productionRecords}
        financeTransactions={financeTransactions}
        potreros={potreros}
      />

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setQrAnimal(null);
          setScannedHistory(null);
        }}
        animal={qrAnimal}
        healthEvents={healthEvents}
        reproductionEvents={reproductionEvents}
        productionRecords={productionRecords}
        financeTransactions={financeTransactions}
        scannedHistory={scannedHistory}
        isLoading={loadingHistory}
      />

      <FeedingModal 
        isOpen={isFeedingModalOpen}
        onClose={() => setIsFeedingModalOpen(false)}
        potreros={potreros}
        onAdd={handleAddFeedingRecord}
      />

      <ReproductionModal 
        isOpen={isReproductionModalOpen}
        onClose={() => setIsReproductionModalOpen(false)}
        animals={activeAnimals}
        onAdd={handleAddReproductionEvent}
      />

      <ProductionModal 
        isOpen={isProductionModalOpen}
        onClose={() => setIsProductionModalOpen(false)}
        animals={activeAnimals}
        onAdd={handleAddProductionRecord}
      />

      <PotreroFormModal 
        isOpen={isPotreroModalOpen}
        onClose={() => setIsPotreroModalOpen(false)}
        onAdd={handleAddPotrero}
      />

      <AssignAnimalsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        animals={activeAnimals}
        targetPotrero={targetPotrero}
        onAssign={handleAssignAnimals}
      />

      <ConfirmModal 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="¿Borrar todos los datos?"
        message="Esta acción eliminará permanentemente todos los animales, potreros, movimientos y registros financieros. No se puede deshacer."
        confirmText="Sí, Borrar Todo"
        isLoading={isResetting}
      />

      <ConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setAnimalToDelete(null); }}
        onConfirm={handleDeleteAnimal}
        title="¿Eliminar Registro de Animal?"
        message={`¿Estás seguro de que deseas eliminar permanentemente a ${animalToDelete?.nombre} (${animalToDelete?.id_arete})? Esta acción no se puede deshacer y se borrará de la base de datos.`}
        confirmText="Eliminar Permanentemente"
        isLoading={isDeleting}
      />

      <ProfileCompletionModal
        isOpen={isProfileModalOpen}
        profile={localProfile}
        onUpdate={setLocalProfile}
        onSave={handleUpdateProfile}
        onDismiss={() => {
          setHasDismissedProfileModal(true);
          localStorage.setItem('hasDismissedProfileModal', 'true');
          setIsProfileModalOpen(false);
        }}
        isSaving={isSavingProfile}
      />

      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chat={activeChat}
        messages={messages.filter(m => m.chatId === activeChat?.id)}
        onSendMessage={handleSendMessage}
        currentUserId={user?.uid || ''}
        otherProfile={publicProfiles.find(p => p.id === activeChat?.participants.find(id => id !== user?.uid))}
      />

      <AnimalTransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        animal={transferAnimal}
        profiles={publicProfiles}
        onInitiate={handleInitiateTransfer}
      />

      <MarketplaceOfferModal 
        isOpen={isMarketplaceModalOpen}
        onClose={() => {
          setIsMarketplaceModalOpen(false);
          setMarketplaceAnimal(null);
        }}
        animal={marketplaceAnimal}
        onPublish={handleAddMarketplaceOffer}
      />

      <AnimatePresence>
        {activeToast && (
          <Toast 
            {...activeToast} 
            onClose={() => setActiveToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}

const Toast = ({ title, message, type, onClose }: { title: string, message: string, type: string, onClose: () => void }) => {
  const icons = {
    health: <HeartPulse className="text-red-600" size={20} />,
    birth: <Baby className="text-pink-600" size={20} />,
    feed: <Wheat className="text-[#2e7d32]" size={20} />,
    chat: <MessageSquare className="text-blue-600" size={20} />,
    transfer: <ArrowLeftRight className="text-purple-600" size={20} />,
    success: <CheckCircle2 className="text-green-600" size={20} />,
    error: <AlertCircle className="text-red-600" size={20} />,
    info: <Bell className="text-blue-500" size={20} />
  };

  const getBgColor = () => {
    switch(type) {
      case 'health': return "bg-red-50";
      case 'birth': return "bg-pink-50";
      case 'chat': return "bg-blue-50";
      case 'transfer': return "bg-purple-50";
      case 'success': return "bg-green-50";
      case 'error': return "bg-red-50";
      default: return "bg-[#2e7d32]/10";
    }
  };

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 20, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-sm bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 p-4 pl-5 flex items-center gap-4 cursor-pointer"
      onClick={onClose}
    >
      <div className={cn("p-3 rounded-2xl shrink-0", getBgColor())}>
        {icons[type as keyof typeof icons] || <Bell size={20} className="text-primary" />}
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="font-bold text-[13px] text-primary leading-tight truncate">{title}</h4>
        <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 leading-tight">{message}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
        <X size={16} className="text-gray-400" />
      </button>
    </motion.div>
  );
};

const ProfileCompletionModal = ({ isOpen, profile, onUpdate, onSave, onDismiss, isSaving }: { 
  isOpen: boolean, 
  profile: UserProfile, 
  onUpdate: (profile: UserProfile) => void,
  onSave: () => void,
  onDismiss: () => void,
  isSaving: boolean
}) => {
  if (!isOpen) return null;

  const isComplete = profile.displayName && profile.phone && profile.ranchName && 
                    profile.curp && profile.municipality;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary/95 backdrop-blur-md" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <button 
          onClick={onDismiss}
          className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
        >
          <X size={24} />
        </button>

        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <User size={40} />
          </div>
          <h3 className="text-3xl font-black text-primary tracking-tight mb-2">Completa tu Perfil</h3>
          <p className="text-gray-500 font-medium">Para acceder a la plataforma, es obligatorio proporcionar tus datos de identificación oficial.</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input 
                type="text" 
                value={profile.displayName || ''} 
                onChange={(e) => onUpdate({ ...profile, displayName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                placeholder="Tu nombre completo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre del Rancho</label>
              <input 
                type="text" 
                value={profile.ranchName || ''} 
                onChange={(e) => onUpdate({ ...profile, ranchName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                placeholder="Ej: Rancho La Esperanza"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
              <input 
                type="text" 
                value={profile.phone || ''} 
                onChange={(e) => onUpdate({ ...profile, phone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                placeholder="+52 ..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">CURP</label>
              <input 
                type="text" 
                value={profile.curp || ''} 
                onChange={(e) => onUpdate({ ...profile, curp: e.target.value.toUpperCase() })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                placeholder="18 caracteres"
                maxLength={18}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Municipio</label>
              <input 
                type="text" 
                value={profile.municipality || ''} 
                onChange={(e) => onUpdate({ ...profile, municipality: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                placeholder="Ej: Pinos"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-primary/5 rounded-3xl border border-primary/10 mt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-primary">Perfil Público</h4>
                <p className="text-xs text-gray-500">Haz que tu rancho sea visible en la comunidad</p>
              </div>
            </div>
            <button 
              onClick={() => onUpdate({ ...profile, isPublic: !profile.isPublic })}
              className={cn(
                "w-14 h-8 rounded-full transition-all relative",
                profile.isPublic ? "bg-primary" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm",
                profile.isPublic ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>

        <div className="mt-10">
          <button 
            disabled={!isComplete || isSaving}
            onClick={onSave}
            className="w-full py-5 bg-primary text-white rounded-[2rem] font-bold text-xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
          >
            {isSaving ? <Loader2 className="animate-spin" size={24} /> : 'Guardar y Continuar'}
          </button>
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
            Tus datos están protegidos y se usan solo para fines de identificación oficial.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isLoading }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void,
  title: string,
  message: string,
  confirmText: string,
  isLoading?: boolean
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden text-center">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} />
        </div>
        <h3 className="text-2xl font-black text-primary tracking-tight mb-2">{title}</h3>
        <p className="text-gray-500 font-medium mb-8">{message}</p>
        <div className="flex flex-col gap-3">
          <button 
            disabled={isLoading}
            onClick={onConfirm}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : confirmText}
          </button>
          <button 
            disabled={isLoading}
            onClick={onClose}
            className="w-full py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AssignAnimalsModal = ({ isOpen, onClose, animals, targetPotrero, onAssign }: { 
  isOpen: boolean, 
  onClose: () => void, 
  animals: Animal[], 
  targetPotrero: Potrero | null,
  onAssign: (ids: string[], potreroId: string) => void 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const availableAnimals = animals.filter(a => 
    a.id_potrero !== targetPotrero?.id && 
    (a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || a.id_arete.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen || !targetPotrero) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-black text-primary tracking-tight">Asignar a {targetPotrero.nombre}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Selecciona los animales a mover</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o arete..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none font-medium"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {availableAnimals.map(animal => (
            <div 
              key={animal.id}
              onClick={() => toggleSelect(animal.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                selectedIds.includes(animal.id) 
                  ? "bg-primary/5 border-primary shadow-sm" 
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  selectedIds.includes(animal.id) ? "bg-primary text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-primary">{animal.nombre}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{animal.id_arete}</p>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                selectedIds.includes(animal.id) ? "bg-primary border-primary" : "border-gray-200"
              )}>
                {selectedIds.includes(animal.id) && <Plus size={14} className="text-white" />}
              </div>
            </div>
          ))}
          {availableAnimals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 font-medium">No se encontraron animales disponibles.</p>
            </div>
          )}
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            disabled={selectedIds.length === 0}
            onClick={() => {
              onAssign(selectedIds, targetPotrero.id);
              onClose();
            }}
            className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
          >
            Asignar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PotreroFormModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: '' as any,
    area: '' as any,
    comunidad: '',
    cp: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-primary tracking-tight">Nuevo Potrero</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          onAdd({
            ...formData,
            capacidad: parseInt(formData.capacidad as any) || 0,
            area: parseFloat(formData.area as any) || 0
          });
          onClose();
        }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre del Potrero</label>
            <input type="text" required placeholder="Ej: El Mezquite" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Capacidad (Animales)</label>
              <input type="number" required value={formData.capacidad} onChange={(e) => setFormData({ ...formData, capacidad: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Área (Hectáreas)</label>
              <input type="number" required value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Comunidad / Ubicación</label>
            <input type="text" placeholder="Ej: Pinos (Centro)" value={formData.comunidad} onChange={(e) => setFormData({ ...formData, comunidad: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Registrar Potrero</button>
        </form>
      </motion.div>
    </div>
  );
};

const FeedingModal = ({ isOpen, onClose, potreros, onAdd }: { isOpen: boolean, onClose: () => void, potreros: Potrero[], onAdd: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    potreroId: '',
    tipo_alimento: '',
    cantidad: '',
    unidad: 'kg',
    cost: '',
    notas: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-primary tracking-tight">Registro de Alimento</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const potrero = potreros.find(p => p.id === formData.potreroId);
          onAdd({ 
            ...formData, 
            cantidad: parseFloat(formData.cantidad), 
            cost: parseFloat(formData.cost) || 0,
            potreroNombre: potrero?.nombre || '',
            date: new Date(formData.date) 
          });
          onClose();
        }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Potrero</label>
            <select required value={formData.potreroId} onChange={(e) => setFormData({ ...formData, potreroId: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium">
              <option value="">Seleccionar Potrero</option>
              {potreros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Alimento</label>
            <input type="text" required placeholder="Ej: Concentrado, Heno..." value={formData.tipo_alimento} onChange={(e) => setFormData({ ...formData, tipo_alimento: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cantidad</label>
              <input type="number" required placeholder="0.00" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unidad</label>
              <select value={formData.unidad} onChange={(e) => setFormData({ ...formData, unidad: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium">
                <option value="kg">kg</option>
                <option value="lb">lb</option>
                <option value="ton">ton</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Costo Total ($)</label>
              <input type="number" placeholder="Opcional" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
              <DatePicker 
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
              />
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Registrar</button>
        </form>
      </motion.div>
    </div>
  );
};

const ReproductionModal = ({ isOpen, onClose, animals, onAdd }: { isOpen: boolean, onClose: () => void, animals: Animal[], onAdd: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    animalId: '',
    type: 'Inseminación',
    cost: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-primary tracking-tight">Evento Reproductivo</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const animal = animals.find(a => a.id === formData.animalId);
          onAdd({ 
            ...formData, 
            animalName: animal?.nombre || '', 
            cost: parseFloat(formData.cost) || 0,
            date: new Date(formData.date) 
          });
          onClose();
        }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Animal (Hembra)</label>
            <select required value={formData.animalId} onChange={(e) => setFormData({ ...formData, animalId: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium">
              <option value="">Seleccionar Animal</option>
              {animals.filter(a => a.sexo === 'H').map(a => <option key={a.id} value={a.id}>{a.nombre} (#{a.id_arete})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Evento</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium">
                <option value="Inseminación">Inseminación</option>
                <option value="Palpación">Palpación</option>
                <option value="Parto">Parto</option>
                <option value="Celo">Celo</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Costo ($)</label>
              <input type="number" placeholder="Opcional" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
            <DatePicker 
              value={formData.date}
              onChange={(val) => setFormData({ ...formData, date: val })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Notas</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium h-24 resize-none" />
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Registrar</button>
        </form>
      </motion.div>
    </div>
  );
};

const ProductionModal = ({ isOpen, onClose, animals, onAdd }: { isOpen: boolean, onClose: () => void, animals: Animal[], onAdd: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    animalId: '',
    type: 'Leche',
    quantity: '',
    unit: 'L',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-primary tracking-tight">Registro de Producción</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const animal = animals.find(a => a.id === formData.animalId);
          onAdd({ 
            ...formData, 
            quantity: parseFloat(formData.quantity) || 0, 
            date: new Date(formData.date),
            animalId: formData.animalId || 'general',
            animalName: animal?.nombre || 'General'
          });
          onClose();
        }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Animal (Opcional)</label>
            <select 
              value={formData.animalId} 
              onChange={(e) => setFormData({ ...formData, animalId: e.target.value })} 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium"
            >
              <option value="">Seleccionar animal...</option>
              {animals.map(a => (
                <option key={a.id} value={a.id}>{a.nombre} - {a.id_arete}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo de Producción</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium">
              <option value="Leche">Leche</option>
              <option value="Carne">Carne</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cantidad</label>
              <input type="number" required step="0.01" placeholder="0.00" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unidad</label>
              <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium">
                <option value="L">L</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
            <DatePicker 
              value={formData.date}
              onChange={(val) => setFormData({ ...formData, date: val })}
            />
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Registrar</button>
        </form>
      </motion.div>
    </div>
  );
};

const ComingSoonModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-12 shadow-2xl text-center">
        <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Info size={40} />
        </div>
        <h3 className="text-2xl font-black text-primary mb-2">Próximamente</h3>
        <p className="text-gray-500 font-medium mb-8">Esta función estará disponible en la próxima actualización.</p>
        <button onClick={onClose} className="w-full py-4 bg-primary text-white rounded-2xl font-bold">Entendido</button>
      </motion.div>
    </div>
  );
};

const HealthEventModal = ({ isOpen, onClose, animals, potreros, mode, onAdd }: { isOpen: boolean, onClose: () => void, animals: Animal[], potreros: Potrero[], mode: 'individual' | 'grupal', onAdd: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    animalId: '',
    potreroId: '',
    type: 'Vacunación',
    description: '',
    cost: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-primary tracking-tight">Evento de Salud {mode === 'grupal' ? '(Grupal)' : '(Individual)'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          const animal = animals.find(a => a.id === formData.animalId);
          const potrero = potreros.find(p => p.id === formData.potreroId);
          onAdd({
            ...formData,
            animalName: animal?.nombre || '',
            potreroName: potrero?.nombre || '',
            cost: parseFloat(formData.cost) || 0,
            mode,
            date: new Date(formData.date)
          });
          onClose();
        }} className="space-y-6">
          {mode === 'individual' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Animal</label>
              <select 
                required
                value={formData.animalId}
                onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              >
                <option value="">Seleccionar Animal</option>
                {animals.map(a => (
                  <option key={a.id} value={a.id}>{a.nombre} (#{a.id_arete})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Corral (Potrero)</label>
              <select 
                required
                value={formData.potreroId}
                onChange={(e) => setFormData({ ...formData, potreroId: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              >
                <option value="">Seleccionar Corral</option>
                {potreros.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              >
                <option value="Vacunación">Vacunación</option>
                <option value="Enfermedad">Enfermedad</option>
                <option value="Tratamiento">Tratamiento</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Costo ($)</label>
              <input type="number" placeholder="Opcional" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 outline-none font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
              <input 
                type="text"
                required
                placeholder="Ej: Brucelosis..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
              <DatePicker 
                value={formData.date}
                onChange={(val) => setFormData({ ...formData, date: val })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Notas</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium h-24 resize-none"
              placeholder="Detalles adicionales..."
            />
          </div>

          <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            Registrar Evento
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const FinanceModal = ({ isOpen, onClose, onAdd, animals = [] }: { isOpen: boolean, onClose: () => void, onAdd: (data: any) => void, animals?: Animal[] }) => {
  const [formData, setFormData] = useState({
    type: 'Ingreso',
    category: 'Venta',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    animalId: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-primary tracking-tight">Nueva Transacción</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onAdd({
            ...formData,
            amount: parseFloat(formData.amount) || 0,
            date: new Date(formData.date)
          });
          onClose();
        }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipo</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              >
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
                <option value="Venta">Venta</option>
                <option value="Compra">Compra</option>
                <option value="Gasto">Gasto</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monto ($)</label>
              <input 
                type="number"
                required
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
            <input 
              type="text"
              required
              placeholder="Ej: Venta de novillos, Alimento, Medicinas..."
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fecha</label>
            <DatePicker 
              value={formData.date}
              onChange={(val) => setFormData({ ...formData, date: val })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Animal (Opcional)</label>
            <select 
              value={formData.animalId}
              onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            >
              <option value="">Seleccionar animal...</option>
              {animals.map(a => (
                <option key={a.id} value={a.id}>{a.nombre} ({a.id_arete})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium h-24 resize-none"
              placeholder="Detalles de la transacción..."
            />
          </div>

          <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            Registrar Transacción
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const MarketplaceOfferModal = ({ 
  isOpen, 
  onClose, 
  animal, 
  onPublish 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  animal: Animal | null, 
  onPublish: (animal: Animal, price: number, description: string) => void 
}) => {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen || !animal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-primary tracking-tight">Publicar en Mercado</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl mb-6 flex items-center gap-4">
          {animal.photoUrl ? (
            <img src={animal.photoUrl} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Camera size={20} className="text-gray-300" />
            </div>
          )}
          <div>
            <p className="font-black text-primary">{animal.nombre}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{animal.id_arete}</p>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (price && description) {
            onPublish(animal, parseFloat(price), description);
            onClose();
          }
        }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Precio de Venta ($)</label>
            <input 
              type="number"
              required
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Descripción de la Oferta</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium h-32 resize-none"
              placeholder="Ej: Excelente semental, buena genética, dócil..."
            />
          </div>

          <button type="submit" className="w-full py-4 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all">
            Publicar Oferta
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const AnimalTransferModal = ({ 
  isOpen, 
  onClose, 
  animal, 
  profiles, 
  onInitiate 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  animal: Animal | null, 
  profiles: PublicProfile[],
  onInitiate: (animal: Animal, buyerId: string, price: number) => void 
}) => {
  const [buyerId, setBuyerId] = useState('');
  const [price, setPrice] = useState('');

  if (!isOpen || !animal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-primary tracking-tight">Iniciar Transferencia</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={24} /></button>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl mb-6 flex items-center gap-4">
          {animal.photoUrl ? (
            <img src={animal.photoUrl} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Camera size={20} className="text-gray-300" />
            </div>
          )}
          <div>
            <p className="font-black text-primary">{animal.nombre}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{animal.id_arete}</p>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (buyerId && price) {
            onInitiate(animal, buyerId, parseFloat(price));
          }
        }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Seleccionar Comprador</label>
            <select 
              required
              value={buyerId}
              onChange={(e) => setBuyerId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            >
              <option value="">Selecciona un ganadero...</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.ranchName || p.displayName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Precio de Venta ($)</label>
            <input 
              type="number"
              required
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            />
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl">
            <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
              <Info size={12} className="inline mr-1 mb-0.5" />
              Esta acción iniciará un proceso de transferencia segura. El comprador deberá aceptar la propuesta antes de que el animal cambie de dueño.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={!buyerId || !price}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar Propuesta
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const CommunityView = ({ 
  profiles, 
  onStartChat, 
  chats, 
  onOpenChat, 
  activeChat, 
  setActiveChat,
  transfers,
  onAcceptTransfer,
  onRejectTransfer,
  onCompleteTransfer,
  currentUserId,
  marketplaceOffers,
  onBuyOffer,
  reviews,
  onOpenAnimals
}: { 
  profiles: PublicProfile[], 
  onStartChat: (id: string) => void,
  chats: Chat[],
  onOpenChat: () => void,
  activeChat: Chat | null,
  setActiveChat: (chat: Chat) => void,
  transfers: AnimalTransfer[],
  onAcceptTransfer: (t: AnimalTransfer) => void,
  onRejectTransfer: (t: AnimalTransfer) => void,
  onCompleteTransfer: (t: AnimalTransfer) => void,
  currentUserId: string,
  marketplaceOffers: MarketplaceOffer[],
  onBuyOffer: (offer: MarketplaceOffer) => void,
  reviews: Review[],
  onOpenAnimals: () => void
}) => {
  const [view, setView] = useState<'profiles' | 'chats' | 'transfers' | 'marketplace'>('profiles');
  const [transferTab, setTransferTab] = useState<'active' | 'history'>('active');

  return (
    <motion.div 
      key="community"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight font-display">Comunidad</h2>
        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto no-scrollbar w-full sm:w-auto">
          <button 
            onClick={() => setView('profiles')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all whitespace-nowrap",
              view === 'profiles' ? "bg-white text-primary shadow-sm" : "text-gray-500"
            )}
          >
            Ganaderos
          </button>
          <button 
            onClick={() => setView('marketplace')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all whitespace-nowrap",
              view === 'marketplace' ? "bg-white text-primary shadow-sm" : "text-gray-500"
            )}
          >
            Mercado
          </button>
          <button 
            onClick={() => setView('transfers')}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all whitespace-nowrap relative",
              view === 'transfers' ? "bg-white text-primary shadow-sm" : "text-gray-500"
            )}
          >
            Transferencias
            {transfers.filter(t => t.buyerId === currentUserId && t.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>

      <div className="px-2 space-y-4">
        {view === 'transfers' && (
          <div className="flex gap-4 mb-4">
            <button 
              onClick={() => setTransferTab('active')}
              className={cn(
                "text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all",
                transferTab === 'active' ? "border-primary text-primary" : "border-transparent text-gray-400"
              )}
            >
              Pendientes
            </button>
            <button 
              onClick={() => setTransferTab('history')}
              className={cn(
                "text-xs font-bold uppercase tracking-widest pb-2 border-b-2 transition-all",
                transferTab === 'history' ? "border-primary text-primary" : "border-transparent text-gray-400"
              )}
            >
              Historial
            </button>
          </div>
        )}

        {view === 'marketplace' && (
          <div className="flex justify-end mb-4">
            <button 
              onClick={onOpenAnimals}
              className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all"
            >
              <Plus size={20} />
              <span>Publicar Animal</span>
            </button>
          </div>
        )}

        {view === 'profiles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profiles.map(profile => {
              const profileLastSeen = profile.lastSeen?.toDate ? profile.lastSeen.toDate() : (profile.lastSeen ? new Date(profile.lastSeen) : null);
              const isOnline = profileLastSeen ? (new Date().getTime() - profileLastSeen.getTime() < 3 * 60000) : false;

              return (
                <div key={profile.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <img src={profile.photoURL || ''} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/5" referrerPolicy="no-referrer" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-primary text-lg leading-tight">{profile.ranchName}</h3>
                        <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center" title="Perfil Verificado">
                          <Check size={10} strokeWidth={4} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-bold">{profile.displayName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{profile.municipality}, {profile.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        isOnline ? "bg-green-500 animate-pulse" : "bg-gray-300"
                      )} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {isOnline ? 'Activo ahora' : 'Desconectado'}
                      </span>
                    </div>
                    <button 
                      onClick={() => onStartChat(profile.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <MessageSquare size={18} />
                      <span className="text-xs font-bold">Chat</span>
                    </button>
                  </div>
                </div>
              );
            })}
            {profiles.length === 0 && (
              <div className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <Users size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No hay ganaderos públicos aún</p>
              </div>
            )}
          </div>
        ) : view === 'chats' ? (
          <div className="space-y-3">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => {
                  setActiveChat(chat);
                  onOpenChat();
                }}
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:border-primary/20 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-primary">Conversación</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{chat.lastMessage || 'Sin mensajes aún'}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            ))}
            {chats.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <ArrowLeftRight size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No tienes conversaciones activas</p>
              </div>
            )}
          </div>
        ) : view === 'marketplace' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketplaceOffers.map(offer => (
              <div key={offer.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/5 text-secondary flex items-center justify-center overflow-hidden">
                    {offer.photoUrl ? (
                      <img src={offer.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ShoppingBag size={32} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-primary text-lg leading-tight">{offer.animalName}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{offer.animalArete}</p>
                  </div>
                </div>
                <div className="flex-1 mb-6">
                  <p className="text-xs text-gray-500 line-clamp-2">{offer.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Vendedor</p>
                      <p className="text-xs font-bold text-primary">{offer.sellerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Precio</p>
                      <p className="text-lg font-black text-secondary">${offer.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onBuyOffer(offer)}
                  disabled={offer.sellerId === currentUserId}
                  className="w-full py-4 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all disabled:opacity-50"
                >
                  {offer.sellerId === currentUserId ? 'Tu Oferta' : 'Comprar / Ofertar'}
                </button>
              </div>
            ))}
            {marketplaceOffers.length === 0 && (
              <div className="col-span-full text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <ShoppingBag size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No hay ofertas en el mercado</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {transfers.filter(t => transferTab === 'active' ? t.status !== 'completed' : t.status === 'completed').length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <ArrowLeftRight size={48} className="mx-auto mb-4 text-gray-200" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  {transferTab === 'active' ? 'No hay transferencias pendientes' : 'No hay historial de transferencias'}
                </p>
              </div>
            ) : (
              transfers.filter(t => transferTab === 'active' ? t.status !== 'completed' : t.status === 'completed').map(transfer => {
                const isBuyer = transfer.buyerId === currentUserId;
                const otherParty = profiles.find(p => p.id === (isBuyer ? transfer.sellerId : transfer.buyerId));
                
                return (
                  <div key={transfer.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <ArrowLeftRight size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-primary text-lg">{transfer.animalName}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{transfer.animalArete}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        transfer.status === 'pending' ? "bg-amber-100 text-amber-700" :
                        transfer.status === 'accepted' ? "bg-blue-100 text-blue-700" : 
                        transfer.status === 'completed' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {transfer.status === 'pending' ? 'Pendiente' : 
                         transfer.status === 'accepted' ? 'Aceptada' : 
                         transfer.status === 'completed' ? 'Completada' : 'Rechazada'}
                      </div>
                    </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                    <div>
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                        {isBuyer ? 'Vendedor' : 'Comprador'}
                      </p>
                      <div className="flex items-center gap-2">
                        <img src={otherParty?.photoURL || ''} alt="" className="w-6 h-6 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <p className="text-sm font-black text-primary truncate">
                          {otherParty?.ranchName || otherParty?.displayName || 'Ganadero'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mb-1">Precio</p>
                      <p className="text-sm font-black text-secondary">${transfer.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mb-1">Estado del Evento</p>
                    <p className="text-[10px] font-medium text-gray-600">
                      {transfer.status === 'pending' ? (isBuyer ? 'Esperando que aceptes la propuesta' : 'Esperando respuesta del comprador') :
                       transfer.status === 'accepted' ? (isBuyer ? 'Propuesta aceptada. Esperando que el vendedor complete el envío' : 'El comprador aceptó. Debes completar la transferencia') :
                       transfer.status === 'completed' ? 'La transferencia se realizó con éxito' :
                       'La transferencia ha sido cancelada o rechazada'}
                    </p>
                  </div>

                    <div className="flex gap-3">
                      {isBuyer && transfer.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => onAcceptTransfer(transfer)}
                            className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all"
                          >
                            Aceptar
                          </button>
                          <button 
                            onClick={() => onRejectTransfer(transfer)}
                            className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {!isBuyer && transfer.status === 'accepted' && (
                        <button 
                          onClick={() => onCompleteTransfer(transfer)}
                          className="w-full py-3 bg-primary text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all"
                        >
                          Completar Transferencia
                        </button>
                      )}
                      {transfer.status === 'pending' && !isBuyer && (
                        <button 
                          onClick={() => onRejectTransfer(transfer)}
                          className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                          Cancelar Propuesta
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const InventoryModal = ({ isOpen, onClose, inventory, onAdd, onUpdate, onDelete }: {
  isOpen: boolean,
  onClose: () => void,
  inventory: InventoryItem[],
  onAdd: (item: Partial<InventoryItem> & { cost?: number }) => void,
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void,
  onDelete: (id: string) => void
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ nombre: '', cantidad: '' as any, unidad: 'kg', minimo: '' as any, cost: '' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Database size={24} />
            </div>
            <h2 className="text-2xl font-black text-primary tracking-tight">Inventario de Bodega</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {isAdding ? (
            <div className="bg-gray-50 p-6 rounded-3xl space-y-4 border border-gray-100">
              <h3 className="font-bold text-primary">Nuevo Insumo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Nombre</label>
                  <input type="text" value={newItem.nombre} onChange={e => setNewItem({...newItem, nombre: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Cantidad</label>
                  <input type="number" value={newItem.cantidad} onChange={e => setNewItem({...newItem, cantidad: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Unidad</label>
                  <select value={newItem.unidad} onChange={e => setNewItem({...newItem, unidad: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="l">Litros (l)</option>
                    <option value="unidades">Unidades</option>
                    <option value="dosis">Dosis</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Costo de Adquisición ($)</label>
                  <input type="number" placeholder="Opcional" value={newItem.cost} onChange={e => setNewItem({...newItem, cost: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { 
                  onAdd({
                    nombre: newItem.nombre,
                    cantidad: parseFloat(newItem.cantidad) || 0,
                    unidad: newItem.unidad,
                    minimo: parseFloat(newItem.minimo as any) || 0,
                    cost: parseFloat(newItem.cost) || 0
                  }); 
                  setIsAdding(false); 
                  setNewItem({ nombre: '', cantidad: '' as any, unidad: 'kg', minimo: '' as any, cost: '' });
                }} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold">Guardar</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold">Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setIsAdding(true)} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 font-bold hover:border-primary/20 hover:text-primary transition-all flex items-center justify-center gap-2">
              <Plus size={20} />
              Agregar Insumo
            </button>
          )}

          {inventory.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  item.cantidad <= item.minimo ? "bg-red-50 text-red-600" : "bg-primary/5 text-primary"
                )}>
                  <Database size={20} />
                </div>
                <div>
                  <p className="font-bold text-primary">{item.nombre}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.cantidad} {item.unidad}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdate(item.id, { cantidad: item.cantidad + 1 })} className="p-2 hover:bg-gray-50 rounded-lg text-primary"><Plus size={18} /></button>
                <button onClick={() => onUpdate(item.id, { cantidad: Math.max(0, item.cantidad - 1) })} className="p-2 hover:bg-gray-50 rounded-lg text-red-500"><X size={18} /></button>
                <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 ml-2"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const CalendarModal = ({ isOpen, onClose, tasks, onAddTask, onToggleTask, onDeleteTask }: {
  isOpen: boolean,
  onClose: () => void,
  tasks: Task[],
  onAddTask: (task: Partial<Task>) => void,
  onToggleTask: (id: string, completed: boolean) => void,
  onDeleteTask: (id: string) => void
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', type: 'vacuna' as const, date: format(new Date(), 'yyyy-MM-dd') });

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-4xl bg-white rounded-[2.5rem] p-8 overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Calendar size={24} />
            </div>
            <h2 className="text-2xl font-black text-primary tracking-tight">Calendario de Tareas</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-lg shadow-sm transition-all"><ChevronRight size={20} className="rotate-180" /></button>
              <span className="px-4 font-black text-primary uppercase tracking-widest text-xs">{format(currentDate, 'MMMM yyyy', { locale: es })}</span>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white rounded-lg shadow-sm transition-all"><ChevronRight size={20} /></button>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest py-2">{day}</div>
          ))}
          {calendarDays.map((day, i) => {
            const dayTasks = tasks.filter(t => isSameDay(t.date?.toDate ? t.date.toDate() : new Date(t.date), day));
            return (
              <div key={i} className={cn(
                "min-h-[80px] p-2 border border-gray-50 rounded-xl transition-all",
                !isSameMonth(day, monthStart) ? "opacity-20" : "bg-white",
                isSameDay(day, new Date()) ? "ring-2 ring-primary ring-inset" : ""
              )}>
                <span className="text-[10px] font-black text-gray-400">{format(day, 'd')}</span>
                <div className="mt-1 space-y-1">
                  {dayTasks.map(t => (
                    <div key={t.id} className={cn(
                      "w-full h-1.5 rounded-full",
                      t.type === 'vacuna' ? "bg-red-400" : 
                      t.type === 'desparasitacion' ? "bg-blue-400" : 
                      t.type === 'parto' ? "bg-pink-400" : "bg-gray-400"
                    )} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar border-t border-gray-50 pt-6">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-primary uppercase tracking-widest text-xs">Tareas del Mes</h3>
            <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20">
              <Plus size={16} /> Nueva Tarea
            </button>
          </div>

          {isAdding && (
            <div className="bg-gray-50 p-6 rounded-3xl space-y-4 border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Título</label>
                  <input type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Tipo</label>
                  <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value as any})} className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="vacuna">Vacunación</option>
                    <option value="desparasitacion">Desparasitación</option>
                    <option value="parto">Fecha de Parto</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Fecha</label>
                  <DatePicker 
                    value={newTask.date}
                    onChange={(val) => setNewTask({...newTask, date: val})}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { onAddTask(newTask); setIsAdding(false); }} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold">Programar</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 py-3 bg-gray-200 text-gray-600 rounded-xl font-bold">Cancelar</button>
              </div>
            </div>
          )}

          {tasks.sort((a,b) => (a.date?.toDate ? a.date.toDate() : new Date(a.date)).getTime() - (b.date?.toDate ? b.date.toDate() : new Date(b.date)).getTime()).map(task => (
            <div key={task.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => onToggleTask(task.id, !task.completed)} className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  task.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-200"
                )}>
                  {task.completed && <Check size={16} strokeWidth={4} />}
                </button>
                <div>
                  <p className={cn("font-bold text-primary", task.completed && "line-through opacity-40")}>{task.title}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {format(task.date?.toDate ? task.date.toDate() : new Date(task.date), 'PPP', { locale: es })} • {task.type}
                  </p>
                </div>
              </div>
              <button onClick={() => onDeleteTask(task.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const TaskFormModal = ({ isOpen, onClose, onAdd, initialData }: {
  isOpen: boolean,
  onClose: () => void,
  onAdd: (data: Partial<Task>) => Promise<any>,
  initialData?: Partial<Task>
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'otro' as const,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || '',
        type: (initialData?.type as any) || 'otro',
        date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
        description: initialData?.description || ''
      });
      setIsSaving(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.title) return;
    setIsSaving(true);
    try {
      await onAdd({
        ...formData,
        date: new Date(formData.date + 'T12:00:00') // Use noon to avoid timezone issues
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-md w-full p-8 rounded-[2.5rem] shadow-2xl space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-primary tracking-tight">Recordatorio</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Título</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Vacunación Clostridiales"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Tipo</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="vacuna">Vacunación</option>
                <option value="desparasitacion">Desparasitación</option>
                <option value="parto">Fecha de Parto</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Fecha</label>
              <DatePicker 
                value={formData.date}
                onChange={val => setFormData({ ...formData, date: val })}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving || !formData.title}
          className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Calendar size={20} />}
          Guardar Recordatorio
        </button>
      </motion.div>
    </div>
  );
};

const ReportsModal = ({ isOpen, onClose, animals, financeTransactions, healthEvents, productionRecords, potreros }: {
  isOpen: boolean,
  onClose: () => void,
  animals: Animal[],
  financeTransactions: FinanceTransaction[],
  healthEvents: HealthEvent[],
  productionRecords: ProductionRecord[],
  potreros: Potrero[]
}) => {
  if (!isOpen) return null;

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Animales con más detalle
    const animalsData = animals.map(a => ({
      'Nombre': a.nombre,
      'Arete': a.id_arete,
      'Sexo': a.sexo === 'M' ? 'Macho' : 'Hembra',
      'Raza': CATTLE_BREEDS.find(b => b.id === a.id_raza)?.name || 'Desconocida',
      'Peso (kg)': a.peso,
      'Precio': a.precio || 0,
      'Producción': a.tipo_produccion,
      'Fecha Nacimiento': a.fecha_nacimiento,
      'Ubicación': potreros.find(p => p.id === a.id_potrero)?.nombre || 'Sin asignar'
    }));
    const animalsWS = XLSX.utils.json_to_sheet(animalsData);
    XLSX.utils.book_append_sheet(wb, animalsWS, "Animales");
    
    // Finanzas
    const financeData = financeTransactions.map(t => ({
      'Fecha': t.date?.toDate ? format(t.date.toDate(), 'yyyy-MM-dd') : format(new Date(t.date), 'yyyy-MM-dd'),
      'Tipo': t.type,
      'Categoría': t.category,
      'Monto': t.amount,
      'Descripción': t.description
    }));
    const financeWS = XLSX.utils.json_to_sheet(financeData);
    XLSX.utils.book_append_sheet(wb, financeWS, "Finanzas");

    // Sanidad
    const healthData = healthEvents.map(h => ({
      'Fecha': h.date?.toDate ? format(h.date.toDate(), 'yyyy-MM-dd') : format(new Date(h.date), 'yyyy-MM-dd'),
      'Animal': h.animalName,
      'Arete': h.animalArete,
      'Tipo': h.type,
      'Descripción': h.description,
      'Costo': h.cost || 0
    }));
    const healthWS = XLSX.utils.json_to_sheet(healthData);
    XLSX.utils.book_append_sheet(wb, healthWS, "Sanidad");

    // Producción
    const productionData = productionRecords.map(p => ({
      'Fecha': p.date?.toDate ? format(p.date.toDate(), 'yyyy-MM-dd') : format(new Date(p.date), 'yyyy-MM-dd'),
      'Animal': p.animalName,
      'Tipo': p.type,
      'Cantidad': p.quantity,
      'Unidad': p.unit
    }));
    const productionWS = XLSX.utils.json_to_sheet(productionData);
    XLSX.utils.book_append_sheet(wb, productionWS, "Producción");
    
    XLSX.writeFile(wb, `Reporte_Completo_Tlanextli_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');
    
    doc.setFontSize(20);
    doc.text("Reporte General de Tlanextli", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${dateStr}`, 14, 28);
    
    // Sección Animales
    doc.setFontSize(14);
    doc.text("Inventario de Animales", 14, 40);
    const animalTable = animals.map(a => [
      a.nombre, 
      a.id_arete, 
      a.sexo === 'M' ? 'Macho' : 'Hembra', 
      a.peso + 'kg',
      potreros.find(p => p.id === a.id_potrero)?.nombre || 'N/A'
    ]);
    autoTable(doc, {
      head: [['Nombre', 'Arete', 'Sexo', 'Peso', 'Ubicación']],
      body: animalTable,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50] }
    });

    // Sección Finanzas (Resumen)
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Resumen Financiero", 14, finalY);
    const totalIncome = financeTransactions
      .filter(t => t.type === 'Venta' || t.type === 'Ingreso')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const totalExpense = financeTransactions
      .filter(t => t.type === 'Gasto' || t.type === 'Egreso' || t.type === 'Compra')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    autoTable(doc, {
      head: [['Concepto', 'Total']],
      body: [
        ['Ingresos Totales', `$${totalIncome.toLocaleString()}`],
        ['Egresos Totales', `$${totalExpense.toLocaleString()}`],
        ['Balance Neto', `$${(totalIncome - totalExpense).toLocaleString()}`]
      ],
      startY: finalY + 5,
      theme: 'striped',
      headStyles: { fillColor: [103, 58, 183] }
    });
    
    doc.save(`Reporte_Tlanextli_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] p-8 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <FileText size={24} />
            </div>
            <h2 className="text-2xl font-black text-primary tracking-tight">Reportes y Exportación</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button onClick={exportToExcel} className="flex items-center justify-between p-6 bg-green-50 rounded-3xl border border-green-100 hover:bg-green-100 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-green-600 shadow-sm">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-green-900">Exportar a Excel (XLSX)</p>
                <p className="text-xs text-green-700 font-bold uppercase tracking-widest">Todos los datos del sistema</p>
              </div>
            </div>
            <Download size={24} className="text-green-600 group-hover:translate-y-1 transition-transform" />
          </button>

          <button onClick={exportToPDF} className="flex items-center justify-between p-6 bg-red-50 rounded-3xl border border-red-100 hover:bg-red-100 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-red-600 shadow-sm">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-red-900">Exportar a PDF</p>
                <p className="text-xs text-red-700 font-bold uppercase tracking-widest">Resumen de inventario animal</p>
              </div>
            </div>
            <Download size={24} className="text-red-600 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
          <h3 className="font-black text-primary uppercase tracking-widest text-[10px] mb-4">Resumen de Datos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-primary">{animals.length}</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Animales</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-green-600">
                ${financeTransactions
                  .filter(t => t.type === 'Venta' || t.type === 'Ingreso')
                  .reduce((acc, t) => {
                    const val = Number(t.amount || 0);
                    return acc + (isNaN(val) ? 0 : val);
                  }, 0)
                  .toLocaleString()}
              </p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Ingresos</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-2xl font-black text-red-600">
                ${financeTransactions
                  .filter(t => t.type === 'Compra' || t.type === 'Egreso' || t.type === 'Gasto')
                  .reduce((acc, t) => {
                    const val = Number(t.amount || 0);
                    return acc + (isNaN(val) ? 0 : val);
                  }, 0)
                  .toLocaleString()}
              </p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Egresos</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              {(() => {
                const income = financeTransactions
                  .filter(t => t.type === 'Venta' || t.type === 'Ingreso')
                  .reduce((acc, t) => {
                    const val = Number(t.amount || 0);
                    return acc + (isNaN(val) ? 0 : val);
                  }, 0);
                const expense = financeTransactions
                  .filter(t => t.type === 'Compra' || t.type === 'Egreso' || t.type === 'Gasto')
                  .reduce((acc, t) => {
                    const val = Number(t.amount || 0);
                    return acc + (isNaN(val) ? 0 : val);
                  }, 0);
                const balance = income - expense;
                return (
                  <>
                    <p className={cn("text-2xl font-black", balance >= 0 ? "text-primary" : "text-red-600")}>
                      ${balance.toLocaleString()}
                    </p>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Balance</p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const QRCodeModal = ({ 
  isOpen, 
  onClose, 
  animal,
  healthEvents = [],
  reproductionEvents = [],
  productionRecords = [],
  financeTransactions = [],
  scannedHistory = null,
  isLoading = false
}: {
  isOpen: boolean,
  onClose: () => void,
  animal: Animal | null,
  healthEvents?: HealthEvent[],
  reproductionEvents?: ReproductionEvent[],
  productionRecords?: ProductionRecord[],
  financeTransactions?: FinanceTransaction[],
  scannedHistory?: {
    health: HealthEvent[],
    reproduction: ReproductionEvent[],
    production: ProductionRecord[],
    finance: FinanceTransaction[]
  } | null,
  isLoading?: boolean
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'history'>('qr');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  if (!isOpen || !animal) return null;

  const qrValue = `${window.location.origin}${window.location.pathname}?animalId=${animal.id}`;

  const animalHealth = scannedHistory ? scannedHistory.health : healthEvents.filter(e => e.animalId === animal.id || (e as any).id_animal === animal.id);
  const animalReproduction = scannedHistory ? scannedHistory.reproduction : reproductionEvents.filter(e => e.animalId === animal.id || (e as any).id_animal === animal.id);
  const animalProduction = scannedHistory ? scannedHistory.production : productionRecords.filter(e => e.animalId === animal.id || (e as any).id_animal === animal.id);
  const animalFinance = scannedHistory ? scannedHistory.finance : financeTransactions.filter(t => t.animalId === animal.id || (t as any).id_animal === animal.id);

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 80]
      });

      const canvas = qrCanvasRef.current;
      if (!canvas) {
        alert("Error al generar el código QR para el PDF");
        return;
      }

      const qrDataUrl = canvas.toDataURL('image/png');
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(27, 67, 50); // Primary color
      doc.text("TLANEXTLI", 40, 10, { align: 'center' });
      
      // Animal Info
      doc.setFontSize(12);
      doc.text(animal.nombre, 40, 18, { align: 'center' });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Arete: #${animal.id_arete}`, 40, 24, { align: 'center' });
      
      // QR Code
      doc.addImage(qrDataUrl, 'PNG', 15, 28, 50, 50);
      
      doc.save(`etiqueta_${animal.id_arete}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor intenta de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div 
        id="printable-qr"
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-6 sm:p-8 overflow-hidden flex flex-col shadow-2xl max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-all z-10">
          <X size={24} />
        </button>

        <div className="flex gap-2 mb-6 bg-gray-50 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('qr')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'qr' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Código QR
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'history' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Historial
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'qr' ? (
            <div className="flex flex-col items-center text-center">
              <div className="p-4 rounded-3xl bg-primary/5 text-primary mb-6 mt-4">
                <Camera size={32} />
              </div>
              
              <h2 className="text-2xl font-black text-primary tracking-tight mb-2">Código QR Animal</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Escanea para ver historial</p>

              <div className="p-8 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/10 border border-gray-50 mb-8">
                <QRCodeSVG value={qrValue} size={280} level="H" includeMargin={true} />
                {/* Hidden canvas for PDF generation */}
                <div className="hidden">
                  <QRCodeCanvas ref={qrCanvasRef} value={qrValue} size={500} level="H" includeMargin={true} />
                </div>
              </div>

              <div className="w-full bg-gray-50 p-4 rounded-2xl mb-6">
                <p className="font-black text-primary">{animal.nombre}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{animal.id_arete}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => window.print()} 
                  className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  Vista Previa
                </button>
                <button 
                  onClick={handleDownloadPDF} 
                  className="py-4 bg-primary text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} /> Descargar PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
                  {animal.photoUrl ? (
                    <img src={animal.photoUrl} className="w-full h-full object-cover rounded-2xl" referrerPolicy="no-referrer" />
                  ) : (
                    <Camera size={24} className="text-primary/20" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-primary">{animal.nombre}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">#{animal.id_arete}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2 pt-2">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Eventos de Salud</h4>
                  {isLoading && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                </div>
                {animalHealth.length > 0 ? animalHealth.map(e => (
                  <div key={e.id} className="p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm text-red-900">{e.type}</p>
                      <span className="text-[8px] font-black text-red-400 uppercase">{e.date?.toDate ? format(e.date.toDate(), 'dd/MM/yy') : (e.date ? format(new Date(e.date), 'dd/MM/yy') : 'Reciente')}</span>
                    </div>
                    <p className="text-xs text-red-700/70">{(e as any).description || (e as any).tipo || (e as any).notes}</p>
                  </div>
                )) : <p className="text-xs text-gray-400 italic px-2">Sin eventos de salud registrados</p>}

                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 pt-2">Reproducción</h4>
                {animalReproduction.length > 0 ? animalReproduction.map(e => (
                  <div key={e.id} className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100/50">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm text-pink-900">{e.type}</p>
                      <span className="text-[8px] font-black text-pink-400 uppercase">{e.date?.toDate ? format(e.date.toDate(), 'dd/MM/yy') : (e.date ? format(new Date(e.date), 'dd/MM/yy') : 'Reciente')}</span>
                    </div>
                    <p className="text-xs text-pink-700/70">{e.notes}</p>
                    {e.result && <p className="text-[10px] font-bold text-pink-600 mt-1 uppercase tracking-widest">Resultado: {e.result}</p>}
                  </div>
                )) : <p className="text-xs text-gray-400 italic px-2">Sin eventos reproductivos</p>}

                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 pt-2">Producción</h4>
                {animalProduction.length > 0 ? animalProduction.map(e => (
                  <div key={e.id} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm text-blue-900">{e.type}</p>
                      <p className="text-[8px] font-black text-blue-400 uppercase">{e.date?.toDate ? format(e.date.toDate(), 'dd/MM/yy') : (e.date ? format(new Date(e.date), 'dd/MM/yy') : 'Reciente')}</p>
                    </div>
                    <p className="font-black text-blue-600">{e.quantity} {e.unit}</p>
                  </div>
                )) : <p className="text-xs text-gray-400 italic px-2">Sin registros de producción</p>}

                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2 pt-2">Finanzas</h4>
                {animalFinance.length > 0 ? animalFinance.map(t => (
                  <div key={t.id} className={cn(
                    "p-4 rounded-2xl border flex justify-between items-center",
                    (t.type === 'Venta' || t.type === 'Ingreso') ? "bg-green-50/50 border-green-100/50" : "bg-orange-50/50 border-orange-100/50"
                  )}>
                    <div>
                      <p className={cn("font-bold text-sm", (t.type === 'Venta' || t.type === 'Ingreso') ? "text-green-900" : "text-orange-900")}>{t.type}</p>
                      <p className="text-[8px] font-black text-gray-400 uppercase">{t.date?.toDate ? format(t.date.toDate(), 'dd/MM/yy') : (t.date ? format(new Date(t.date), 'dd/MM/yy') : 'Reciente')}</p>
                    </div>
                    <p className={cn("font-black", (t.type === 'Venta' || t.type === 'Ingreso') ? "text-green-600" : "text-orange-600")}>
                      ${t.amount.toLocaleString()}
                    </p>
                  </div>
                )) : <p className="text-xs text-gray-400 italic px-2">Sin transacciones financieras</p>}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ChatModal = ({ isOpen, onClose, chat, messages, onSendMessage, currentUserId, otherProfile }: {
  isOpen: boolean,
  onClose: () => void,
  chat: Chat | null,
  messages: Message[],
  onSendMessage: (text: string) => void,
  currentUserId: string,
  otherProfile?: PublicProfile
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen || !chat) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-black text-primary leading-tight">{otherProfile?.ranchName || 'Ganadero'}</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chat en línea</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/50">
          {messages.map(m => (
            <div key={m.id} className={cn(
              "flex flex-col max-w-[80%]",
              m.senderId === currentUserId ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "p-4 rounded-2xl font-medium text-sm shadow-sm",
                m.senderId === currentUserId ? "bg-primary text-white rounded-tr-none" : "bg-white text-primary rounded-tl-none border border-gray-100"
              )}>
                {m.text}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                  {safeFormatDate(m.date, 'HH:mm')}
                </span>
                {m.senderId === currentUserId && (
                  <div className={cn(
                    "flex items-center",
                    m.read ? "text-blue-500" : "text-gray-300"
                  )}>
                    {m.read ? <CheckCheck size={10} strokeWidth={3} /> : <Check size={10} strokeWidth={3} />}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) {
                onSendMessage(inputText);
                setInputText('');
              }
            }}
            className="flex gap-3"
          >
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none font-medium"
            />
            <button 
              type="submit"
              className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
            >
              <ArrowRight size={24} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onScanSuccess: (id: string) => void 
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only proceed if actually open (though parent manages mounting too)
    if (!isOpen) return;

    // Use a small timeout to ensure the DOM element 'qr-reader' is fully rendered
    const startTimeout = setTimeout(() => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      const onScanSuccessLocal = (decodedText: string) => {
        try {
          if (decodedText.includes('animalId=')) {
            const url = new URL(decodedText);
            const id = url.searchParams.get('animalId');
            if (id) {
              onScanSuccess(id);
              if (html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error(err));
              }
            }
          } else {
            onScanSuccess(decodedText);
            if (html5QrCode.isScanning) {
              html5QrCode.stop().catch(err => console.error(err));
            }
          }
        } catch (e) {
          onScanSuccess(decodedText);
          if (html5QrCode.isScanning) {
            html5QrCode.stop().catch(err => console.error(err));
          }
        }
      };

      html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccessLocal,
        (errorMessage) => {
          if (!errorMessage.includes("NotFound")) {
            // console.warn(`QR scan error: ${errorMessage}`);
          }
        }
      ).catch(err => {
        console.error("Starting scanner failed", err);
        setError("No se pudo acceder a la cámara. Asegúrate de dar permisos.");
      });

      // Cleanup function to stop scanning when component unmounts or isOpen changes
      return () => {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(error => console.error("Failed to stop scanner", error));
        }
      };
    }, 300);

    return () => clearTimeout(startTimeout);
  }, [isOpen, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-8"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <X size={24} />
        </button>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera size={32} />
          </div>
          <h3 className="text-2xl font-black text-primary tracking-tight">Escáner de QR</h3>
          <p className="text-sm text-gray-500 font-medium mt-2">Apunta con tu cámara trasera al código del animal</p>
        </div>

        <div className="relative aspect-square bg-gray-900 rounded-3xl overflow-hidden border-4 border-gray-100 shadow-inner">
          <div id="qr-reader" className="w-full h-full"></div>
          {/* Overlay scanning line effect */}
          <div className="absolute inset-0 border-2 border-primary/20 pointer-events-none">
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(34,197,94,0.5)] z-10" 
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <button 
          onClick={onClose}
          className="mt-8 py-4 w-full bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
        >
          Cancelar
        </button>
      </motion.div>
    </div>
  );
};

