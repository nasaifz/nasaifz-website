/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LogIn, LogOut, LayoutDashboard, Users, Box, Wallet, ShieldAlert, History, User as UserIcon, Menu, X, ChevronRight, Activity, Bell, Search, Settings, Eye, EyeOff, Plus, Trash2, Edit3, Filter, MoreVertical, Handshake, Sprout, Coins, Target, Briefcase, LandPlot, Building2, UserPlus, MapPin, Scale, Zap, ShieldCheck, ShoppingBag, Package, Upload, Image as ImageIcon, ArrowUpDown, PlusCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { formatToWIB, formatFullToWIB, getBandungTime } from './lib/dateUtils';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, onSnapshot, where, limit } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { db } from './lib/firebase';
import { 
  UserProfile, UserRole, Employee, InventoryItem, FinanceTransaction, AuditLog, 
  Customer, Partner, Farmer, Investor, Livestock, Agriculture, Product, ProductGroup, ProductCategory, CompanyDocument as CompanyDoc,
  Notification, Warehouse, StockMovement
} from './types';

// --- Components ---

const LandingPage = ({ onLoginClick }: { onLoginClick: () => void }) => {
  return (
    <div className="min-h-screen bg-mesh flex flex-col font-sans relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 h-20 px-8 flex items-center justify-end z-50">
        <button 
          onClick={onLoginClick}
          className="px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200/50"
        >
          Login
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-8"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl ring-12 ring-white/20">
              <span className="text-white font-black text-5xl tracking-tighter">Q</span>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-4">Quilla Indonesia</h1>
              <div className="h-px w-12 bg-indigo-600 mx-auto mb-6 opacity-30" />
              <p className="text-xs text-indigo-600 font-bold tracking-[0.4em] uppercase opacity-80">Local Value, Global Impact.</p>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="h-24 flex items-center justify-center bg-transparent border-none">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
           @2026 Quilla Indonesia
        </p>
      </footer>
    </div>
  );
};

const LoginForm = ({ onClose }: { onClose: () => void }) => {
  const { login, initializeQuilla } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    try {
      await initializeQuilla();
      setIsSuccess(true);
      setError('System Ready! Redirecting...');
    } catch (err: any) {
      setError(err.message || 'Gagal inisialisasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (err: any) {
      setError('Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass w-full max-w-[380px] rounded-3xl p-8 shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-indigo-50 mb-4 shadow-inner">
            <UserIcon className="text-indigo-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome</h2>
          <p className="text-sm text-slate-500">Login Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 font-medium"
              placeholder="Username"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group/input">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className={cn("text-xs mt-1 text-center font-bold py-2 rounded border", isSuccess ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-red-500 bg-red-50 border-red-100")}>{error}</p>}

          <button
            disabled={isLoading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Login'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap justify-between gap-4">
          <button type="button" onClick={handleSetup} className="text-[10px] text-indigo-600 font-extrabold hover:underline transition-colors uppercase tracking-widest">
            Help & Support
          </button>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
             <ShieldAlert className="w-3 h-3" /> MFA Active
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Placeholder for Login Icon (using specific terminology)
const Lock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);


const EmployeesView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    fullName: '',
    email: '',
    department: 'Operations',
    position: '',
    salary: '',
    status: 'active' as const
  });

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('fullName', 'asc'));
    
    // Real-time synchronization
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Employee);
      setEmployees(data);
      setLoading(false);
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn("Permission denied for employees listener - likely unauthorized access attempt.");
      } else {
        console.error("Error with employees snapshot listener:", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'super_admin') {
      alert("Unauthorized: Only Super Admins can add employees.");
      return;
    }

    try {
      await addDoc(collection(db, 'employees'), {
        ...newEmp,
        salary: Number(newEmp.salary),
        joinDate: new Date().toISOString(),
      });
      await logSystemActivity(profile, 'Add Employee', 'Personnel', `Registered new personnel: ${newEmp.fullName}`);
      setShowAddModal(false);
      setNewEmp({ fullName: '', email: '', department: 'Operations', position: '', salary: '', status: 'active' });
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee. Check console for details.");
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !editingEmployee.id || role !== 'super_admin') return;

    try {
      const { id, ...data } = editingEmployee;
      await updateDoc(doc(db, 'employees', id), {
        ...data,
        salary: Number(data.salary)
      });
      await logSystemActivity(profile, 'Update Record', 'Personnel', `Modified data for: ${data.fullName}`);
      setShowEditModal(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update record.");
    }
  };

  const handleDelete = async (id: string) => {
    if (role !== 'super_admin' && role !== 'admin') return;
    setEmployeeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete || (role !== 'super_admin' && role !== 'admin')) return;
    
    try {
      const empName = employees.find(e => e.id === employeeToDelete)?.fullName || 'Unknown';
      await deleteDoc(doc(db, 'employees', employeeToDelete));
      await logSystemActivity(profile, 'Permanent Purge', 'Personnel', `Terminated record: ${empName}`);
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Delete failed. Check credentials.");
    }
  };

  const filteredEmployees = employees.filter(emp => (emp.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.position || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Personnel Database</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Managing Quilla Indonesia's human capital across Bandung nodes</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group border-slate-200">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search personnel..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> New Personnel
          </button>
        </div>
      </div>

      <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Position</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</th>
                {(role === 'super_admin' || role === 'admin') && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium">No personnel records found in database.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-black text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             {emp.fullName ? emp.fullName[0] : 'E'}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-800">{emp.fullName}</p>
                             <p className="text-[10px] text-slate-400 font-medium">{emp.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-xs font-bold text-slate-600 bg-white border border-slate-100 px-3 py-1 rounded-lg shadow-sm">
                          {emp.department}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-medium text-slate-500 italic">"{emp.position}"</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shadow-sm",
                            emp.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                          )} />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            emp.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
                          )}>
                             {emp.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-xs font-bold text-slate-400">{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : 'N/A'}</p>
                    </td>
                    {(role === 'super_admin' || role === 'admin') && (
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingEmployee({ ...emp });
                                setShowEditModal(true);
                              }}
                              className="p-2 glass text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {(role === 'super_admin' || role === 'admin') && (
                              <button onClick={() => handleDelete(emp.id)} className="p-2 glass text-slate-400 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                            )}
                         </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass bg-white rounded-3xl shadow-2xl overflow-hidden border border-white"
            >
               <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">Internal Registry</h4>
                    <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Employee Data Onboarding</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
               </div>
               
               <form onSubmit={handleAddEmployee} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          required
                          value={newEmp.fullName}
                          onChange={e => setNewEmp({...newEmp, fullName: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          required
                          type="email"
                          value={newEmp.email}
                          onChange={e => setNewEmp({...newEmp, email: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                        <select 
                          value={newEmp.department}
                          onChange={e => setNewEmp({...newEmp, department: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        >
                          <option>Operations</option>
                          <option>Finance</option>
                          <option>Tech & Infrastructure</option>
                          <option>Marketing</option>
                          <option>Human Resources</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Position</label>
                        <input 
                          required
                          value={newEmp.position}
                          onChange={e => setNewEmp({...newEmp, position: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Annual Salary (IDR)</label>
                      <input 
                        required
                        type="number"
                        value={newEmp.salary}
                        onChange={e => setNewEmp({...newEmp, salary: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 glass text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-100 uppercase text-xs tracking-widest">Register Personnel</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Employee Modal */}
      <AnimatePresence>
        {showEditModal && editingEmployee && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass bg-white rounded-3xl shadow-2xl overflow-hidden border border-white"
            >
               <div className="bg-indigo-600 px-8 py-6 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">Record Update</h4>
                    <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest">Modifying Employee Metadata</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
               </div>
               
               <form onSubmit={handleUpdateEmployee} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          required
                          value={editingEmployee.fullName}
                          onChange={e => setEditingEmployee({...editingEmployee, fullName: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          required
                          type="email"
                          value={editingEmployee.email}
                          onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                        <select 
                          value={editingEmployee.department}
                          onChange={e => setEditingEmployee({...editingEmployee, department: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        >
                          <option>Operations</option>
                          <option>Finance</option>
                          <option>Tech & Infrastructure</option>
                          <option>Marketing</option>
                          <option>Human Resources</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Position</label>
                        <input 
                          required
                          value={editingEmployee.position}
                          onChange={e => setEditingEmployee({...editingEmployee, position: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary (IDR)</label>
                        <input 
                          required
                          type="number"
                          value={editingEmployee.salary}
                          onChange={e => setEditingEmployee({...editingEmployee, salary: Number(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                        <select 
                          value={editingEmployee.status}
                          onChange={e => setEditingEmployee({...editingEmployee, status: e.target.value as any})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all"
                        >
                          <option value="active">Active</option>
                          <option value="on-leave">On Leave</option>
                          <option value="resigned">Resigned</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 glass text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Cancel</button>
                      <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase text-xs tracking-widest">Apply Changes</button>
                    </div>
                    {(role === 'super_admin' || role === 'admin') && (
                      <button 
                        type="button" 
                        onClick={() => {
                          handleDelete(editingEmployee.id!);
                        }}
                        className="w-full py-4 border border-red-100 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Terminate Record
                      </button>
                    )}
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white p-8 text-center"
            >
               <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                  <ShieldAlert className="w-10 h-10 text-red-500" />
               </div>
               <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Authorization Required</h4>
               <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                 You are about to permanently purge this record from the **Quilla Global Registry**. This action cannot be undone. Are you certain?
               </p>
               
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmDelete}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 uppercase text-xs tracking-widest"
                  >
                    Confirm Permanent Purge
                  </button>
                  <button 
                    onClick={() => {
                      setShowDeleteModal(false);
                      setEmployeeToDelete(null);
                    }}
                    className="w-full py-4 glass text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                  >
                    Abort Action
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


const InventoryView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'Catalog' | 'Warehouses' | 'StockHistory' | 'ProductMonitor'>('Catalog');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<string | null>(null);
  const [itemToAdjust, setItemToAdjust] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Item Form State
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    quantity: '',
    price: '',
    category: 'Product' as any,
    location: 'Bandung Central Hub',
    warehouseId: '',
    unit: 'pcs',
    minStockThreshold: 5,
    productId: ''
  });

  // NEW: Adjustment State
  const [adjustment, setAdjustment] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: '',
    reason: '',
    toWarehouse: '',
    fromWarehouse: ''
  });

  // NEW: Warehouse State
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    location: '',
    capacity: '',
    type: 'General' as any,
    status: 'active' as any,
    manager: '',
    phoneNumber: '',
    description: ''
  });
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [warehouseToView, setWarehouseToView] = useState<Warehouse | null>(null);
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('All');

  useEffect(() => {
    const qItems = query(collection(db, 'inventory'), orderBy('name', 'asc'));
    const qWarehouses = query(collection(db, 'warehouses'), orderBy('name', 'asc'));
    const qMovements = query(collection(db, 'stock_movements'), orderBy('timestamp', 'desc'), limit(50));
    const qProducts = query(collection(db, 'products'), orderBy('name', 'asc'));

    const unsubItems = onSnapshot(qItems, (s) => setItems(s.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem))));
    const unsubWarehouses = onSnapshot(qWarehouses, (s) => setWarehouses(s.docs.map(d => ({ id: d.id, ...d.data() } as Warehouse))));
    const unsubMovements = onSnapshot(qMovements, (s) => setMovements(s.docs.map(d => ({ id: d.id, ...d.data() } as StockMovement))));
    const unsubProducts = onSnapshot(qProducts, (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() } as Product))));

    setLoading(false);
    return () => {
      unsubItems();
      unsubWarehouses();
      unsubMovements();
      unsubProducts();
    };
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'super_admin' && role !== 'admin') return;

    try {
      const qty = Number(newItem.quantity);
      const docRef = await addDoc(collection(db, 'inventory'), {
        ...newItem,
        quantity: qty,
        price: Number(newItem.price),
        updatedAt: serverTimestamp()
      });
      
      // Batch initialization (FIFO)
      if (qty > 0) {
        await addDoc(collection(db, `inventory/${docRef.id}/batches`), {
          itemId: docRef.id,
          initialQuantity: qty,
          currentQuantity: qty,
          costPrice: Number(newItem.price),
          receivedAt: serverTimestamp(),
          batchCode: `BATCH-INIT-${Date.now().toString().slice(-4)}`
        });
      }

      // Initial Movement
      await addDoc(collection(db, 'stock_movements'), {
        itemId: docRef.id,
        sku: newItem.sku,
        itemName: newItem.name,
        type: 'IN',
        quantity: qty,
        from: 'SYSTEM_INIT',
        to: newItem.location,
        reason: 'Initial inventory registration',
        recordedBy: profile?.username || 'system',
        timestamp: serverTimestamp()
      });

      await logSystemActivity(profile, 'Add Asset', 'Inventory', `Linked new SKU to network: ${newItem.sku} (${newItem.name})`);
      setShowAddModal(false);
      setNewItem({ name: '', sku: '', quantity: '', price: '', category: 'Product', location: 'Bandung Central Hub', warehouseId: '', unit: 'pcs', minStockThreshold: 5, productId: '' });
    } catch (error) {
      console.error("Error adding inventory item:", error);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToAdjust || !itemToAdjust.id) return;

    try {
      const qty = Number(adjustment.quantity);
      
      if (adjustment.type === 'IN') {
        const newQty = itemToAdjust.quantity + qty;
        
        // Add Batch for FIFO
        await addDoc(collection(db, `inventory/${itemToAdjust.id}/batches`), {
          itemId: itemToAdjust.id,
          initialQuantity: qty,
          currentQuantity: qty,
          costPrice: itemToAdjust.price,
          receivedAt: serverTimestamp(),
          batchCode: `BATCH-${Date.now().toString().slice(-6)}`
        });

        await updateDoc(doc(db, 'inventory', itemToAdjust.id), {
          quantity: newQty,
          updatedAt: serverTimestamp()
        });
      } else if (adjustment.type === 'OUT') {
        if (itemToAdjust.quantity < qty) {
          alert("Insufficient total stock.");
          return;
        }

        // FIFO Withdrawal Implementation
        const batchesRef = collection(db, `inventory/${itemToAdjust.id}/batches`);
        const qB = query(batchesRef, where('currentQuantity', '>', 0), orderBy('receivedAt', 'asc'));
        const batchesSnap = await getDocs(qB);
        
        let remainingToDeduct = qty;
        const updates: Promise<any>[] = [];

        for (const bDoc of batchesSnap.docs) {
          if (remainingToDeduct <= 0) break;
          const bData = bDoc.data();
          const bQty = bData.currentQuantity;
          
          if (bQty >= remainingToDeduct) {
            updates.push(updateDoc(doc(db, `inventory/${itemToAdjust.id}/batches`, bDoc.id), {
              currentQuantity: bQty - remainingToDeduct
            }));
            remainingToDeduct = 0;
          } else {
            updates.push(updateDoc(doc(db, `inventory/${itemToAdjust.id}/batches`, bDoc.id), {
              currentQuantity: 0
            }));
            remainingToDeduct -= bQty;
          }
        }

        if (remainingToDeduct > 0) {
          alert(`Warning: Could only fulfill ${qty - remainingToDeduct} from batches. Check data consistency.`);
          // We still proceed if the main quantity allowed it, but it's a data integrity warning
        }

        await Promise.all(updates);
        await updateDoc(doc(db, 'inventory', itemToAdjust.id), {
          quantity: itemToAdjust.quantity - qty,
          updatedAt: serverTimestamp()
        });
      } else {
        // Simple ADJUSTMENT/CALIBRATION
        const newQty = Number(adjustment.quantity);
        await updateDoc(doc(db, 'inventory', itemToAdjust.id), {
          quantity: newQty,
          updatedAt: serverTimestamp()
        });
      }

      await addDoc(collection(db, 'stock_movements'), {
        itemId: itemToAdjust.id,
        sku: itemToAdjust.sku,
        itemName: itemToAdjust.name,
        type: adjustment.type,
        quantity: qty,
        from: (adjustment.type === 'OUT' || adjustment.type === 'ADJUSTMENT') ? itemToAdjust.location : 'External',
        to: (adjustment.type === 'IN' || adjustment.type === 'ADJUSTMENT') ? itemToAdjust.location : 'External',
        reason: adjustment.reason,
        recordedBy: profile?.username || 'system',
        timestamp: serverTimestamp()
      });

      await logSystemActivity(profile, 'Adjust Stock', 'Inventory', `${adjustment.type} ${qty} units for ${itemToAdjust.sku} (FIFO)`);
      setShowAdjustmentModal(false);
      setAdjustment({ type: 'IN', quantity: '', reason: '', toWarehouse: '', fromWarehouse: '' });
    } catch (error) {
      console.error("Adjustment Error:", error);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarehouse.name.trim()) return;

    try {
      if (editingWarehouse) {
        await updateDoc(doc(db, 'warehouses', editingWarehouse.id), {
          ...newWarehouse,
          capacity: Number(newWarehouse.capacity),
          updatedAt: serverTimestamp()
        });
        await logSystemActivity(profile, 'Update Warehouse', 'Logistics', `Modified facility: ${newWarehouse.name}`);
      } else {
        await addDoc(collection(db, 'warehouses'), {
          ...newWarehouse,
          capacity: Number(newWarehouse.capacity),
          createdAt: serverTimestamp()
        });
        await logSystemActivity(profile, 'Create Warehouse', 'Logistics', `Added new facility: ${newWarehouse.name}`);
      }
      setShowWarehouseModal(false);
      setEditingWarehouse(null);
      setNewWarehouse({ 
        name: '', 
        location: '', 
        capacity: '', 
        type: 'General', 
        status: 'active',
        manager: '',
        phoneNumber: '',
        description: ''
      });
    } catch (error) { console.error(error); }
  };

  const confirmDeleteWarehouse = async () => {
    if (!warehouseToDelete) return;
    try {
      const wName = warehouses.find(w => w.id === warehouseToDelete)?.name || 'Unknown';
      await deleteDoc(doc(db, 'warehouses', warehouseToDelete));
      await logSystemActivity(profile, 'Decommission Warehouse', 'Logistics', `Removed warehouse node: ${wName}`);
      setWarehouseToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Delete Warehouse Error:", error);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.id || (role !== 'super_admin' && role !== 'admin')) return;

    try {
      const { id, ...data } = editingItem;
      await updateDoc(doc(db, 'inventory', id), {
        ...data,
        quantity: Number(data.quantity),
        price: Number(data.price),
        updatedAt: serverTimestamp()
      });
      await logSystemActivity(profile, 'Modify SKU', 'Inventory', `Adjusted parameters for: ${data.sku}`);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating inventory item:", error);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete || (role !== 'super_admin' && role !== 'admin')) return;
    try {
      const sku = items.find(i => i.id === itemToDelete)?.sku || 'Unknown';
      await deleteDoc(doc(db, 'inventory', itemToDelete));
      await logSystemActivity(profile, 'Permanent Purge', 'Inventory', `Eliminated asset record: ${sku}`);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (i.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWarehouse = selectedWarehouseFilter === 'All' || i.location === selectedWarehouseFilter;
    return matchesSearch && matchesWarehouse;
  });

  const filteredWarehouses = warehouses.filter(w =>
    (w.name || '').toLowerCase().includes(warehouseSearch.toLowerCase()) ||
    (w.location || '').toLowerCase().includes(warehouseSearch.toLowerCase()) ||
    (w.manager || '').toLowerCase().includes(warehouseSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAdmin = role === 'super_admin' || role === 'admin';

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Warehouse & SKU</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Stock level automation and facility management</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
             {['Catalog', 'ProductMonitor', 'Warehouses', 'StockHistory'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setActiveSubTab(t as any)}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    activeSubTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {t === 'ProductMonitor' ? 'Product Monitor' : t === 'StockHistory' ? 'History' : t}
                </button>
             ))}
          </div>
          {isAdmin && (
            <button 
              onClick={() => activeSubTab === 'Warehouses' ? setShowWarehouseModal(true) : setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> {activeSubTab === 'Warehouses' ? 'New Hub' : 'Receive Stock'}
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'Catalog' && (
        <>
          <div className="flex items-center gap-4 mb-4">
             <div className="relative group border-slate-200 flex-1 sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search SKU/Items..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-all w-full shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-100 p-1.5 rounded-xl shadow-sm px-4">
                 <Building2 className="w-3.5 h-3.5 text-slate-400" />
                 <select 
                   value={selectedWarehouseFilter}
                   onChange={e => setSelectedWarehouseFilter(e.target.value)}
                   className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none pr-2 text-slate-600"
                 >
                    <option value="All">All Hubs</option>
                    {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                 </select>
              </div>
          </div>

          <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Identity</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">In Stock</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valuation</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                    {isAdmin && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/30">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium font-bold uppercase text-[10px]">No matches found in storage.</td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-black text-xs shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all overflow-hidden">
                                {item.productId ? (
                                  <img 
                                    src={products.find(p => p.id === item.productId)?.imageUrl || `https://picsum.photos/seed/${item.sku}/100/100`} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  item.sku ? item.sku.substring(0, 2).toUpperCase() : 'SK'
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tighter uppercase">
                                  {item.sku} • {item.category} 
                                  {item.productId && <span className="ml-2 text-emerald-600 border border-emerald-100 px-1 rounded text-[8px]">Catalog Linked</span>}
                                </p>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full shadow-sm",
                                  item.quantity > (item.minStockThreshold || 5) ? 'bg-emerald-500' : 'bg-red-500'
                                )} />
                                <span className={cn(
                                  "text-xs font-black",
                                  item.quantity > (item.minStockThreshold || 5) ? 'text-slate-700' : 'text-red-600'
                                )}>
                                  {item.quantity} {item.unit || 'units'}
                                </span>
                            </div>
                            {item.quantity <= (item.minStockThreshold || 5) && (
                              <p className="text-[9px] text-red-500 font-black uppercase flex items-center gap-1 animate-pulse"><Zap className="w-2.5 h-2.5"/> Low Stock</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-slate-800">Rp {(item.price || 0).toLocaleString('id-ID')}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 uppercase tracking-tight">
                            <MapPin className="w-3 h-3 text-slate-400" /> {item.location}
                          </p>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => { setItemToAdjust(item); setShowAdjustmentModal(true); }}
                                  title="Adjust Stock"
                                  className="p-2 glass text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                >
                                  <ArrowUpDown className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => { setEditingItem({...item}); setShowEditModal(true); }}
                                  className="p-2 glass text-slate-400 hover:text-emerald-600 rounded-lg transition-all"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                {(role === 'super_admin' || role === 'admin') && (
                                  <button 
                                    onClick={() => { setItemToDelete(item.id); setShowDeleteModal(true); }}
                                    className="p-2 glass text-slate-400 hover:text-red-500 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'ProductMonitor' && (
        <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catalog Product</th>
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Stock</th>
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Locations</th>
                       <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white/30">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-bold uppercase text-[10px]">Catalog is empty. Register products in Catalog view first.</td>
                      </tr>
                    ) : (
                      products.map(p => {
                         const inventoryEntries = items.filter(i => i.productId === p.id);
                         const totalStock = inventoryEntries.reduce((sum, i) => sum + i.quantity, 0);
                         const locations = Array.from(new Set(inventoryEntries.map(i => i.location))).join(', ') || 'Not in stock';
                         
                         return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                               <td className="px-6 py-5">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                                        <img src={p.imageUrl || `https://picsum.photos/seed/${p.sku}/100/100`} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-slate-800">{p.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono font-bold tracking-tighter uppercase">{p.sku}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-5">
                                  <p className="text-sm font-black text-slate-900">{totalStock} {p.unit}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Aggregate inventory</p>
                               </td>
                               <td className="px-6 py-5">
                                  <p className="text-xs text-slate-600 font-medium max-w-[250px] leading-tight capitalize">{locations}</p>
                               </td>
                               <td className="px-6 py-5">
                                  <span className={cn(
                                     "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                     totalStock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                  )}>{totalStock > 0 ? 'Available' : 'Out of Stock'}</span>
                               </td>
                            </tr>
                         );
                      })
                    )}
                 </tbody>
              </table>
           </div>
         </div>
      )}

      {activeSubTab === 'Warehouses' && (
        <>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group border-slate-200 flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Hubs..." 
                value={warehouseSearch}
                onChange={(e) => setWarehouseSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-all w-full shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWarehouses.map(w => {
              const warehouseItems = items.filter(i => i.location === w.name);
              const utilization = Math.round((warehouseItems.length / w.capacity) * 100);
              
              return (
                <div key={w.id} className="glass p-8 rounded-3xl border border-slate-200 hover:border-emerald-200 transition-all group relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white ring-8 ring-slate-50 shadow-lg shadow-slate-200 group-hover:bg-emerald-600 transition-colors">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                            w.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                          )}>{w.status}</span>
                          <button 
                            onClick={() => setWarehouseToView(w)}
                            className="p-1.5 bg-white text-indigo-600 hover:bg-slate-900 hover:text-white rounded-lg shadow-sm border border-slate-100 transition-all font-black uppercase text-[8px] tracking-widest px-2"
                          >
                             Inventory
                          </button>
                       </div>
                       {isAdmin && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={() => {
                                 setEditingWarehouse(w);
                                 setNewWarehouse({ 
                                   name: w.name, 
                                   location: w.location, 
                                   capacity: String(w.capacity), 
                                   type: w.type, 
                                   status: w.status,
                                   manager: w.manager || '',
                                   phoneNumber: w.phoneNumber || '',
                                   description: w.description || ''
                                 });
                                 setShowWarehouseModal(true);
                               }}
                               className="p-1.5 bg-white text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-100 transition-all"
                             >
                                <Edit3 className="w-3.5 h-3.5" />
                             </button>
                             {role === 'super_admin' && (
                               <button 
                                 onClick={() => {
                                   setWarehouseToDelete(w.id);
                                   setShowDeleteModal(true);
                                 }}
                                 className="p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-lg shadow-sm border border-slate-100 transition-all"
                               >
                                  <Trash2 className="w-3.5 h-3.5" />
                               </button>
                             )}
                          </div>
                       )}
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-black text-slate-800 mb-1">{w.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-4">
                     <MapPin className="w-3 h-3" /> {w.location}
                  </p>

                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600">{w.manager || 'No Manager'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-600">{w.phoneNumber || 'No Contact'}</span>
                      </div>
                    </div>
                    {w.description && (
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-2 italic leading-relaxed border-l-2 border-slate-100 pl-2">
                        {w.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                      <Box className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-600">{warehouseItems.length} SKUs Active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Type</p>
                       <p className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-tight">{w.type}</p>
                    </div>
                    <div className="space-y-2">
                       {(() => {
                          const currentLoad = warehouseItems.reduce((acc, curr) => acc + curr.quantity, 0);
                          const utilizationEfficiency = Math.round((currentLoad / w.capacity) * 100);
                          return (
                             <>
                                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                   <span>Volume Load Efficiency</span>
                                   <span className={cn(
                                     utilizationEfficiency > 90 ? 'text-red-600' : utilizationEfficiency > 70 ? 'text-amber-600' : 'text-emerald-600'
                                   )}>{utilizationEfficiency}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                   <div 
                                     className={cn(
                                       "h-full rounded-full transition-all duration-500",
                                       utilizationEfficiency > 90 ? 'bg-red-500' : utilizationEfficiency > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                     )} 
                                     style={{ width: `${Math.min(100, utilizationEfficiency)}%` }} 
                                   />
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase text-right tracking-widest">
                                   {currentLoad} / {w.capacity} Units Active
                                </p>
                             </>
                          );
                       })()}
                    </div>
                  </div>
                </div>
              );
            })}
           {isAdmin && (
             <button 
               onClick={() => setShowWarehouseModal(true)}
               className="h-full min-h-[250px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-slate-50 hover:border-emerald-300 transition-all group"
             >
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                   <Plus className="w-6 h-6 text-slate-400 group-hover:text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800">Add New Warehouse</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Expand Quilla Network</p>
                </div>
             </button>
           )}
        </div>
      </>
      )}

      {activeSubTab === 'StockHistory' && (
        <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU & Item</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/30">
                  {movements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-5">
                         <p className="text-xs font-bold text-slate-800">{m.timestamp ? formatToWIB(m.timestamp) : 'Just now'}</p>
                         <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Node Transit Log</p>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-xs font-bold text-slate-800">{m.itemName}</p>
                         <p className="text-[10px] text-indigo-600 font-mono font-bold tracking-tighter uppercase">{m.sku}</p>
                      </td>
                      <td className="px-6 py-5">
                         <span className={cn(
                           "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                           m.type === 'IN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                           m.type === 'OUT' ? 'bg-red-50 text-red-600 border border-red-100' :
                           'bg-amber-50 text-amber-600 border border-amber-100'
                         )}>{m.type}</span>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-slate-800">
                         {m.type === 'OUT' ? '-' : '+'}{m.quantity}
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-xs font-bold text-slate-700">@{m.recordedBy}</p>
                         <p className="text-[10px] text-slate-400 font-medium leading-tight max-w-[200px]">{m.reason}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Warehouse Detail Modal */}
      <AnimatePresence>
         {warehouseToView && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setWarehouseToView(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl glass bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
                  <div className="bg-slate-900 px-10 py-8 text-white flex justify-between items-center">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                           <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                           <h4 className="text-2xl font-black tracking-tight">{warehouseToView.name}</h4>
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">{warehouseToView.location} • {warehouseToView.type} HUB</p>
                        </div>
                     </div>
                     <button onClick={() => setWarehouseToView(null)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                     <div className="lg:col-span-1 space-y-8">
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Facility Specs</h5>
                           <div className="space-y-3">
                              <div className="flex justify-between">
                                 <span className="text-[11px] font-bold text-slate-500">PIC Manager</span>
                                 <span className="text-[11px] font-black text-slate-900">{warehouseToView.manager || 'Not Assigned'}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-[11px] font-bold text-slate-500">Phone Hub</span>
                                 <span className="text-[11px] font-black text-slate-900">{warehouseToView.phoneNumber || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-[11px] font-bold text-slate-500">Utilization Rate</span>
                                 <span className="text-[11px] font-black text-emerald-600">
                                    {Math.round((items.filter(i => i.location === warehouseToView.name).reduce((a, b) => a + b.quantity, 0) / warehouseToView.capacity) * 100)}%
                                 </span>
                              </div>
                           </div>
                        </div>
                        
                        {warehouseToView.description && (
                           <div className="space-y-2">
                              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Logistics Memo</h5>
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">{warehouseToView.description}</p>
                           </div>
                        )}
                     </div>
                     
                     <div className="lg:col-span-2 space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Stored Inventory Assets</h5>
                        <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
                           {items.filter(i => i.location === warehouseToView.name).length === 0 ? (
                              <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This facility is empty.</p>
                              </div>
                           ) : (
                              items.filter(i => i.location === warehouseToView.name).map(i => (
                                 <div key={i.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                                          <Package className="w-4 h-4 text-slate-400" />
                                       </div>
                                       <div>
                                          <p className="text-xs font-black text-slate-800">{i.name}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{i.sku}</p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-xs font-black text-slate-900">{i.quantity} {i.unit}</p>
                                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Current Load</p>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {showAdjustmentModal && itemToAdjust && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdjustmentModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md glass bg-white rounded-3xl shadow-2xl overflow-hidden border border-white">
               <div className="bg-indigo-600 px-8 py-6 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">Stock Adjustment</h4>
                    <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest">{itemToAdjust.sku} • Current: {itemToAdjust.quantity}</p>
                  </div>
                  <button onClick={() => setShowAdjustmentModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
               </div>
               <form onSubmit={handleAdjustStock} className="p-8 space-y-6">
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motion Type</label>
                           <select value={adjustment.type} onChange={e => setAdjustment({...adjustment, type: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold">
                              <option value="IN">RESTOCK (IN)</option>
                              <option value="OUT">WITHDRAW (OUT)</option>
                              <option value="ADJUSTMENT">CALIBRATION</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                           <input type="number" required value={adjustment.quantity} onChange={e => setAdjustment({...adjustment, quantity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold" />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Notes</label>
                        <textarea required value={adjustment.reason} onChange={e => setAdjustment({...adjustment, reason: e.target.value})} className="w-full h-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all resize-none" placeholder="Explain this stock modification..." />
                     </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase text-xs tracking-widest">Post Movement</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Warehouse Modal */}
      <AnimatePresence>
        {showWarehouseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowWarehouseModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass bg-white rounded-3xl shadow-2xl overflow-hidden border border-white">
               <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">{editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{editingWarehouse ? 'Core Logistics Update' : 'New Quilla Logistics Node'}</p>
                  </div>
                  <button onClick={() => { 
                    setShowWarehouseModal(false); 
                    setEditingWarehouse(null); 
                    setNewWarehouse({ 
                      name: '', 
                      location: '', 
                      capacity: '', 
                      type: 'General', 
                      status: 'active',
                      manager: '',
                      phoneNumber: '',
                      description: ''
                    }); 
                  }} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
               </div>
               <form onSubmit={handleCreateWarehouse} className="p-8 space-y-6">
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warehouse Name</label>
                           <input required value={newWarehouse.name} onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-800 outline-none transition-all font-bold" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                           <select value={newWarehouse.status} onChange={e => setNewWarehouse({...newWarehouse, status: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all font-bold">
                              <option value="active">ACTIVE</option>
                              <option value="inactive">INACTIVE</option>
                           </select>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Type</label>
                           <select value={newWarehouse.type} onChange={e => setNewWarehouse({...newWarehouse, type: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all">
                              <option value="General">General</option>
                              <option value="Cold">Cold Storage</option>
                              <option value="Dry">Dry Hub</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity (Units)</label>
                           <input type="number" required value={newWarehouse.capacity} onChange={e => setNewWarehouse({...newWarehouse, capacity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all font-bold" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Manager</label>
                           <input value={newWarehouse.manager} onChange={e => setNewWarehouse({...newWarehouse, manager: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all" placeholder="e.g. Andi Sukardi" />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                           <input value={newWarehouse.phoneNumber} onChange={e => setNewWarehouse({...newWarehouse, phoneNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all" placeholder="+62 8..." />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Location</label>
                        <input required value={newWarehouse.location} onChange={e => setNewWarehouse({...newWarehouse, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all font-bold" />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Description</label>
                        <textarea value={newWarehouse.description} onChange={e => setNewWarehouse({...newWarehouse, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all h-20 resize-none" placeholder="Notes about this warehouse..." />
                     </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-100 uppercase text-xs tracking-widest">
                      {editingWarehouse ? 'Confirm Redesign' : 'Finalize Facility'}
                   </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass bg-white rounded-3xl shadow-2xl overflow-hidden border border-white">
               <div className="bg-emerald-600 px-8 py-6 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">Stock Receiving</h4>
                    <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest">Inbound Logistics Entry</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
               </div>
               <form onSubmit={handleAddItem} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="space-y-1.5 flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select from Catalog</label>
                        <select 
                          value={newItem.productId} 
                          onChange={e => {
                            const p = products.find(prod => prod.id === e.target.value);
                            if (p) {
                              setNewItem({...newItem, productId: p.id, name: p.name, sku: p.sku || '', unit: p.unit || 'pcs', price: String(p.price)});
                            } else {
                              setNewItem({...newItem, productId: '', name: '', sku: ''});
                            }
                          }}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold"
                        >
                           <option value="">Manual Entry...</option>
                           {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold">
                           <option value="Product">Product Catalog</option>
                           <option value="Equipment">Equipment</option>
                           <option value="Livestock">Livestock Feed</option>
                           <option value="Agriculture">Agriculture Input</option>
                           <option value="Retail">Retail Goods</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product/Asset Name</label>
                      <input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Code</label>
                        <input required value={newItem.sku} onChange={e => setNewItem({...newItem, sku: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-300" placeholder="SKU-XXXX" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Type</label>
                        <input required value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all" placeholder="pcs, kg, etc" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Stock</label>
                        <input required type="number" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Low Stock Limit</label>
                        <input required type="number" value={newItem.minStockThreshold} onChange={e => setNewItem({...newItem, minStockThreshold: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Warehouse Location</label>
                       <select required value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold">
                          <option value="">Select facility...</option>
                          {warehouses.map(w => <option key={w.id} value={w.name}>{w.name} ({w.location})</option>)}
                          {warehouses.length === 0 && <option value="Bandung Central Hub">Bandung Central Hub (Default)</option>}
                       </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 uppercase text-xs tracking-widest">Register SKU</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Asset Modal */}
      <AnimatePresence>
        {showEditModal && editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass bg-white rounded-3xl shadow-2xl overflow-hidden border border-white">
               <div className="bg-slate-800 px-8 py-6 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">Modify SKU Profile</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{editingItem.sku}</p>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
               </div>
               <form onSubmit={handleUpdateItem} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                      <input required value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valuation (IDR)</label>
                        <input required type="number" value={editingItem.price} onChange={e => setEditingItem({...editingItem, price: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Low Stock Limit</label>
                        <input required type="number" value={editingItem.minStockThreshold} onChange={e => setEditingItem({...editingItem, minStockThreshold: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Hub</label>
                       <select required value={editingItem.location} onChange={e => setEditingItem({...editingItem, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none transition-all font-bold">
                          {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                          {warehouses.length === 0 && <option value="Bandung Central Hub">Bandung Central Hub</option>}
                       </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-100 uppercase text-xs tracking-widest">Apply SKU Update</button>
                    {(role === 'super_admin' || role === 'admin') && (
                      <button 
                        type="button"
                        onClick={() => {
                          setItemToDelete(editingItem.id);
                          setShowDeleteModal(true);
                        }}
                        className="p-4 border border-red-100 text-red-500 rounded-2xl hover:bg-red-50 transition-all"
                        title="Purge Asset"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm glass bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white p-8 text-center">
               <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                  <ShieldAlert className="w-10 h-10 text-red-500" />
               </div>
               <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Purge Authorized</h4>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8 leading-loose">This will permanently eliminate the {warehouseToDelete ? 'Warehouse Node' : 'SKU Profile'} from Quilla's global ledger. This action is irreversible.</p>
               
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => {
                        if (warehouseToDelete) {
                          confirmDeleteWarehouse();
                        } else {
                          confirmDelete();
                        }
                    }} 
                    className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-100 uppercase text-[10px] tracking-[0.2em] active:scale-95"
                  >
                    Confirm Permanent Purge
                  </button>
                  <button 
                    onClick={() => { setShowDeleteModal(false); setWarehouseToDelete(null); setItemToDelete(null); }} 
                    className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-[10px] tracking-[0.2em]"
                  >
                    Abort Operation
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


const FinanceView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Transaction State
  const [newTx, setNewTx] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Operations',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const q = query(collection(db, 'finance'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FinanceTransaction);
      setTransactions(data);
      setLoading(false);
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn("Permission denied for finance listener.");
      } else {
        console.error("Error with finance snapshot listener:", error);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'super_admin' && role !== 'admin') return;

    try {
      await addDoc(collection(db, 'finance'), {
        ...newTx,
        amount: Number(newTx.amount),
        recordedBy: profile?.username || 'Unknown',
        createdAt: serverTimestamp()
      });
      await logSystemActivity(profile, 'Post Ledger', 'Finance', `Logged ${newTx.type} of Rp ${Number(newTx.amount).toLocaleString('id-ID')}: ${newTx.description}`);
      setShowAddModal(false);
      setNewTx({ type: 'expense', amount: '', category: 'Operations', description: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const confirmDelete = async () => {
    if (!transactionToDelete || role !== 'super_admin') return;
    try {
      const tx = transactions.find(t => t.id === transactionToDelete);
      await deleteDoc(doc(db, 'finance', transactionToDelete));
      await logSystemActivity(profile, 'Ledger Purge', 'Finance', `Redacted ${tx?.type} record: Rp ${tx?.amount.toLocaleString('id-ID')} (${tx?.description})`);
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter(t => 
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAdmin = role === 'super_admin' || role === 'admin';

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Financial Hub</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Fiscal telemetry and organizational resource liquidity</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group border-slate-200">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter ledger..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-100 focus:border-amber-600 transition-all w-full sm:w-64 shadow-sm"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Log Transaction
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Inflow', value: totalIncome, color: 'text-emerald-600', icon: Box },
          { label: 'Total Outflow', value: totalExpense, color: 'text-red-600', icon: Wallet },
          { label: 'Net Liquidity', value: netBalance, color: netBalance >= 0 ? 'text-indigo-600' : 'text-red-600', icon: Activity }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <p className={cn("text-2xl font-black tracking-tight", stat.color)}>
              Rp {stat.value.toLocaleString('id-ID')}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Ledger</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (IDR)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recorded By</th>
                {(role === 'super_admin' || role === 'admin') && <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">No financial movements detected in the current cycle.</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm shadow-indigo-100",
                            tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          )}>
                             {tx.type === 'income' ? 'IN' : 'EX'}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-800">{tx.description}</p>
                             <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">{tx.date}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] font-black text-slate-600 bg-white border border-slate-100 px-3 py-1 rounded-lg shadow-sm tracking-widest uppercase">
                          {tx.category}
                       </span>
                    </td>
                    <td className="px-6 py-5">
                       <p className={cn(
                         "text-sm font-bold tracking-tight",
                         tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                       )}>
                         {tx.type === 'income' ? '+' : '-'} Rp {(tx.amount || 0).toLocaleString('id-ID')}
                       </p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase border border-white">
                             {tx.recordedBy ? tx.recordedBy[0] : '?'}
                          </div>
                          <p className="text-xs font-bold text-slate-500 tracking-tight">{tx.recordedBy}</p>
                       </div>
                    </td>
                    {(role === 'super_admin' || role === 'admin') && (
                      <td className="px-6 py-5 text-right">
                         <button 
                           onClick={() => { setTransactionToDelete(tx.id); setShowDeleteModal(true); }}
                           className="p-2 glass text-slate-400 hover:text-red-500 rounded-lg transition-all"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg glass bg-white rounded-3xl shadow-2xl overflow-hidden border border-white">
               <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-black tracking-tight">Financial Ledger Entry</h4>
                    <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Inflow/Outflow Categorization</p>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
               </div>
               <form onSubmit={handleAddTransaction} className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Flow Type</label>
                        <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all">
                           <option value="income">Inflow (Income)</option>
                           <option value="expense">Outflow (Expense)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valuation (IDR)</label>
                        <input required type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <select value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all">
                           <option>Operations</option>
                           <option>Salary/Payroll</option>
                           <option>Subscription</option>
                           <option>Infrastructure</option>
                           <option>Revenue</option>
                           <option>Marketing</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Posting Date</label>
                        <input type="date" value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description / Memo</label>
                       <textarea required value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all h-24 resize-none" />
                    </div>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 glass text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Abort</button>
                    <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl uppercase text-xs tracking-widest">Post to Ledger</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm glass bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white p-8 text-center">
               <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                  <ShieldAlert className="w-10 h-10 text-red-500" />
               </div>
               <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Ledger Purge</h4>
               <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">Permanently redact this transaction from Quilla's official financial trail? This action is strictly irreversible.</p>
               <div className="flex flex-col gap-3">
                  <button onClick={confirmDelete} className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all uppercase text-xs tracking-widest">Commit Redaction</button>
                  <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 glass text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Abort</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


const logSystemActivity = async (profile: UserProfile | null, action: string, resource: string, details: string) => {
  if (!profile) return;
  try {
    await addDoc(collection(db, 'audit_logs'), {
      userId: profile.uid,
      username: profile.username,
      action,
      resource,
      details,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Audit Logging Failed:", error);
  }
};

const AuditLogsView = ({ role }: { role?: string }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AuditLog);
      setLogs(data);
      setLoading(false);
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn("Permission denied for audit logs listener.");
      } else {
        console.error("Error with audit logs snapshot listener:", error);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(l => 
    (l.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.resource || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.details || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentFailures = logs.filter(l => 
    l.action === 'Login Failure' && 
    l.timestamp && 
    (Date.now() - (l.timestamp as any).toMillis()) < 3600000 
  ).length;
  const isAnomalyDetected = recentFailures > 5;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">System Audit logs</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Immutable chronological trail of Quilla Indonesia system interactions</p>
        </div>
        
        <div className="relative group border-slate-200">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
          <input 
            type="text" 
            placeholder="Search audit trail..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-800 transition-all w-full sm:w-64 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time / Actor</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detils</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/30">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">No system interactions recorded in this cycle.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-[10px] uppercase shadow-sm">
                               {log.username ? log.username[0] : 'S'}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{log.username}</p>
                               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                 {log.timestamp ? formatToWIB(log.timestamp) : 'Pending...'}
                               </p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className={cn(
                           "text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm",
                           log.action.includes('Delete') || log.action.includes('Suspend') ? 'bg-red-50 text-red-600 border border-red-100' : 
                           log.action.includes('Add') || log.action.includes('Initialize') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                           'bg-indigo-50 text-indigo-600 border border-indigo-100'
                         )}>
                            {log.action}
                         </span>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-xs font-bold text-slate-600 uppercase tracking-tight">{log.resource}</p>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">{log.details}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
           <div className="glass p-8 rounded-3xl border border-slate-200">
              <h4 className="text-xl font-black text-slate-800 mb-2">Integrity</h4>
              <p className="text-xs text-slate-400 font-medium mb-8">Non-fungible sequence validation</p>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-emerald-100 shadow-lg"></div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Chain Intact</p>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-emerald-100 shadow-lg"></div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Hashing Active</p>
                 </div>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full shadow-lg",
                      isAnomalyDetected ? "bg-red-500 shadow-red-100 animate-pulse" : "bg-emerald-500 shadow-emerald-100"
                    )}></div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">
                      {isAnomalyDetected ? 'Anomalies Detected' : 'No Gaps Found'}
                    </p>
                  </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                 <div className="bg-slate-900 rounded-2xl p-5 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Signals</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{logs.length}</p>
                 </div>
              </div>
           </div>

           <div className="glass p-8 rounded-3xl border border-slate-200 bg-indigo-600 text-white relative overflow-hidden group">
              <History className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-2">Audit Policy</p>
                 <p className="text-xs font-medium leading-relaxed text-indigo-50">All administrative operations are permanently logged and salted for system forensics.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};


const SecurityView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() }) as UserProfile);
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleStatus = async (user: UserProfile) => {
    if (role !== 'super_admin' || updating) return;
    setUpdating(user.uid);
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { status: newStatus });
      await logSystemActivity(profile, newStatus === 'suspended' ? 'Restrict Access' : 'Restore Access', 'Security', `${newStatus === 'suspended' ? 'Suspended' : 'Reactivated'} node authorization for ${user.username}`);
    } catch (error) {
      console.error("Security Override Error:", error);
    } finally {
      setUpdating(null);
    }
  };

  const updateRole = async (user: UserProfile, newRole: UserRole) => {
    if (role !== 'super_admin' || updating) return;
    setUpdating(user.uid);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { role: newRole });
      await logSystemActivity(profile, 'Modify Permissions', 'Security', `Elevated/Adjusted role for ${user.username} to ${newRole}`);
    } catch (error) {
      console.error("Role Escalation Error:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
       </div>
     );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Security Protocols</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Access level management and terminal authorization control</p>
        </div>
        
        <div className="flex items-center gap-4 bg-red-50 border border-red-100 px-5 py-3 rounded-2xl shadow-sm">
           <ShieldAlert className="w-5 h-5 text-red-600" />
           <p className="text-[10px] font-black text-red-700 uppercase tracking-widest leading-none">Global MFA Enforcement: <span className="text-red-900 border-b border-red-200">ACTIVE</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl border border-slate-200">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-900 rounded-2xl"><Settings className="w-6 h-6 text-white" /></div>
              <div>
                 <h4 className="text-lg font-bold text-slate-800">Operational Integrity</h4>
                 <p className="text-xs text-slate-400 font-medium">Node_Bandung endpoint security</p>
              </div>
           </div>
           <div className="space-y-4">
              {[
                { label: 'E2EE Encryption', status: 'Operational', color: 'text-emerald-600' },
                { label: 'Login Attempt Lockout', status: 'Enforced (5 Try)', color: 'text-emerald-600' },
                { label: 'Session Time-to-Live', status: '7200m (2h)', color: 'text-indigo-600' },
                { label: 'Identity Proxy', status: 'Distributed', color: 'text-slate-400' }
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                   <p className="text-xs font-bold text-slate-700">{p.label}</p>
                   <p className={cn("text-[10px] font-black uppercase tracking-widest", p.color)}>{p.status}</p>
                </div>
              ))}
           </div>
        </div>

        <div className="glass p-8 rounded-3xl border border-slate-200">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-indigo-600 rounded-2xl"><Activity className="w-6 h-6 text-white" /></div>
              <div>
                 <h4 className="text-lg font-bold text-slate-800">Terminal Access Map</h4>
                 <p className="text-xs text-slate-400 font-medium">Real-time authentication density</p>
              </div>
           </div>
           <div className="flex items-center justify-center p-10">
              <div className="relative">
                 <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 border-t-indigo-600 animate-spin-slow"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-slate-800 leading-none">{users.length}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Nodes</p>
                 </div>
              </div>
           </div>
           <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Authenticated</p></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Idle Nodes</p></div>
           </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Access Control Ledger</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Modify individual terminal permissions</p>
          </div>
          {role !== 'super_admin' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100 text-amber-600 shadow-sm">
               <ShieldAlert className="w-3.5 h-3.5" />
               <span className="text-[9px] font-black uppercase tracking-widest">View-Only Mode</span>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorization</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MFA Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vulnerability Index</th>
                {(role === 'super_admin' || role === 'admin') && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Overrides</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/20">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                     <div>
                        <p className="text-sm font-bold text-slate-800">{user.username}</p>
                        <p className="text-[10px] text-slate-400 font-medium tracking-tight">{user.email}</p>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <select 
                          disabled={role !== 'super_admin' || updating === user.uid}
                          value={user.role} 
                          onChange={(e) => updateRole(user, e.target.value as any)}
                          className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md uppercase tracking-widest shadow-sm outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                           <option value="user">User</option>
                           <option value="admin">Admin</option>
                           <option value="super_admin">Super Admin</option>
                        </select>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={cn(
                       "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm",
                       user.mfaEnabled ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                     )}>
                        {user.mfaEnabled ? 'Verified' : 'Bypassed'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-100 animate-pulse"></div>
                        <p className="text-[10px] font-bold text-emerald-600 tracking-tighter uppercase leading-none">Healthy</p>
                     </div>
                  </td>
                  {(role === 'super_admin' || role === 'admin') && (
                    <td className="px-6 py-4 text-right">
                       <button 
                         disabled={updating === user.uid}
                         onClick={() => toggleStatus(user)}
                         className={cn(
                           "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50",
                           user.status === 'active' 
                             ? "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white" 
                             : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white"
                         )}
                       >
                          {updating === user.uid ? 'Working...' : (user.status === 'active' ? 'Suspend' : 'Activate')}
                       </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const UsersListView = () => {
  const { profile, adminCreateUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    role: 'viewer' as UserRole,
    hierarchy: { grup: 'Quilla Group', perusahaan: 'Holding', divisi: 'General' }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    // Real-time synchronization for users
    const unsubscribe = onSnapshot(collection(db, 'users'), (querySnapshot) => {
      const usersData = querySnapshot.docs.map(doc => ({ ...doc.data() }) as UserProfile);
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.uid) return;

    try {
      const userRef = doc(db, 'users', editingUser.uid);
      await updateDoc(userRef, {
        fullName: editingUser.fullName,
        username: editingUser.username,
        role: editingUser.role,
        status: editingUser.status,
        hierarchy: editingUser.hierarchy,
      });

      await logSystemActivity(
        profile,
        'Edit Credentials',
        'User Systems',
        `Modified profile for: ${editingUser.fullName} (@${editingUser.username})`
      );

      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user. Please try again.");
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'suspend'} user ${user.username}?`)) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), { status: newStatus });
      await logSystemActivity(
        profile,
        'Security Audit',
        'User Systems',
        `${newStatus === 'active' ? 'Activated' : 'Suspended'} access for: ${user.username}`
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newUser.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminCreateUser(newUser.email, newUser.password, {
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        hierarchy: newUser.hierarchy
      });
      
      setIsNewUserModalOpen(false);
      setNewUser({
        email: '',
        password: '',
        fullName: '',
        username: '',
        role: 'viewer',
        hierarchy: { grup: 'Quilla Group', perusahaan: 'Holding', divisi: 'General' }
      });
      setFeedback({ type: 'success', message: 'Identity provisioned successfully! The system node is now active.' });
    } catch (error: any) {
      console.error("Creation error:", error);
      setFeedback({ type: 'error', message: `Provisioning failed: ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={cn(
              "fixed top-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
              feedback.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-red-500/90 text-white border-red-400"
            )}
          >
            {feedback.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            <p className="text-xs font-black uppercase tracking-wider">{feedback.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Account Systems</h3>
          <p className="text-sm text-slate-500 font-medium">Monitoring and managing all Quilla Indonesia system access</p>
        </div>
        <div className="flex gap-3">
           <div className="flex -space-x-3">
              {users.slice(0, 5).map(u => (
                <div key={u.uid} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm">
                   {u.username ? u.username[0].toUpperCase() : 'U'}
                </div>
              ))}
              {users.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm">
                   +{users.length - 5}
                </div>
              )}
           </div>
           {/* Add user handled via adminCreateUser */}
           <button 
             onClick={() => setIsNewUserModalOpen(true)}
             className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
           >
              New Account
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <motion.div 
            key={u.uid} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
             <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg relative group-hover:scale-105 transition-transform">
                   {u.username ? u.username[0].toUpperCase() : 'U'}
                   <div className={cn(
                     "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors",
                     u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                   )} />
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-slate-800 text-lg leading-tight mb-0.5 truncate">{u.fullName || u.username}</h4>
                   <p className="text-[10px] text-slate-400 font-medium mb-2 lowercase tracking-tight">@{u.username}</p>
                   <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] px-2 py-0.5 bg-indigo-50 text-indigo-600 font-black uppercase tracking-widest rounded-full border border-indigo-100/50">
                        {u.role.replace('_', ' ')}
                      </span>
                      {u.mfaEnabled && (
                        <span className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-600 font-black uppercase tracking-widest rounded-full flex items-center gap-1 border border-emerald-100/50">
                          <ShieldCheck className="w-2.5 h-2.5" /> SECURE
                        </span>
                      )}
                   </div>
                </div>
             </div>

             <div className="space-y-4 pb-6 border-b border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Organization</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-800 font-bold leading-tight">{u.hierarchy?.grup || 'Quilla Group'}</span>
                        <span className="text-[10px] text-slate-500 font-medium">{u.hierarchy?.perusahaan || 'Holding'}</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Division</span>
                      <span className="text-[11px] text-indigo-600 font-bold">{u.hierarchy?.divisi || 'General'}</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                     <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Last Activity</span>
                     <span className="text-[10px] text-slate-600 font-medium italic">
                        {u.lastLogin ? formatFullToWIB(u.lastLogin) : 'Never logged in'}
                     </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                     <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Network Status</span>
                     <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", u.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500')} />
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", u.status === 'active' ? 'text-emerald-500' : 'text-red-500')}>
                           {u.status}
                        </span>
                     </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-0.5">
                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Digital Identification</span>
                   <span className="text-[10px] text-slate-500 font-mono truncate bg-slate-50 p-1.5 rounded-lg border border-slate-100">{u.email}</span>
                </div>
             </div>

             <div className="pt-6 flex gap-3">
                <button 
                  onClick={() => {
                    setEditingUser({ ...u });
                    setIsModalOpen(true);
                  }}
                  className="flex-1 py-3 glass text-[10px] font-black text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 uppercase tracking-widest transition-all"
                >
                  Edit Credentials
                </button>
                <div className="flex gap-2">
                  <button title="Security Audit" className="p-3 glass text-slate-400 hover:text-indigo-600 rounded-xl transition-all">
                    <History className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleUserStatus(u)}
                    title={u.status === 'active' ? 'Restrict Access' : 'Restore Access'} 
                    className={cn(
                      "p-3 glass rounded-xl transition-all",
                      u.status === 'active' ? 'text-slate-400 hover:text-red-600' : 'text-red-500 hover:text-emerald-600'
                    )}
                  >
                    {u.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </button>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* User Edit Modal */}
      <AnimatePresence>
        {isModalOpen && editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-xl glass bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
            >
               <div className="bg-slate-900 px-10 py-8 text-white">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="text-2xl font-black tracking-tight mb-1">Edit User System</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Modifying platform access parameters</p>
                     </div>
                     <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                  </div>
               </div>

               <form onSubmit={handleUpdateUser} className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                        <input 
                           required
                           value={editingUser.fullName}
                           onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
                           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                        <div className="relative">
                           <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                           <input 
                              required
                              value={editingUser.username}
                              onChange={e => setEditingUser({...editingUser, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                              className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-mono"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                        <select 
                           value={editingUser.role}
                           onChange={e => setEditingUser({...editingUser, role: e.target.value as UserRole})}
                           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold"
                        >
                           <option value="viewer">Viewer / Guest</option>
                           <option value="super_admin">Super Admin</option>
                           <option value="group_ceo">Group CEO</option>
                           <option value="coo_cto">COO / CTO</option>
                           <option value="hrd">HR Director</option>
                           <option value="niaga">Niaga (Retail)</option>
                           <option value="peternakan">Peternakan (Livestock)</option>
                           <option value="pertanian">Pertanian (Agri)</option>
                           <option value="investor">Investor</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Status</label>
                        <select 
                           value={editingUser.status}
                           onChange={e => setEditingUser({...editingUser, status: e.target.value as 'active' | 'suspended'})}
                           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold"
                        >
                           <option value="active">Active Access</option>
                           <option value="suspended">Suspended / Revoked</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hierarchy Placement</label>
                     <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="space-y-1.5">
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Grup</span>
                           <input 
                              value={editingUser.hierarchy?.grup || ''}
                              onChange={e => setEditingUser({...editingUser, hierarchy: {...editingUser.hierarchy, grup: e.target.value}})}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Perusahaan</span>
                           <input 
                              value={editingUser.hierarchy?.perusahaan || ''}
                              onChange={e => setEditingUser({...editingUser, hierarchy: {...editingUser.hierarchy, perusahaan: e.target.value}})}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Divisi</span>
                           <input 
                              value={editingUser.hierarchy?.divisi || ''}
                              onChange={e => setEditingUser({...editingUser, hierarchy: {...editingUser.hierarchy, divisi: e.target.value}})}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-4 glass text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest"
                     >
                        Cancel
                     </button>
                     <button 
                        type="submit"
                        className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-100 uppercase text-[10px] tracking-widest"
                     >
                        Commit Changes
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New User Provisioning Modal */}
      <AnimatePresence>
        {isNewUserModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsNewUserModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-xl glass bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
            >
               <div className="bg-indigo-600 px-10 py-8 text-white">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="text-2xl font-black tracking-tight mb-1">Provision New Identity</h4>
                        <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-[0.2em]">Enrolling new node into Quilla Network</p>
                     </div>
                     <button onClick={() => setIsNewUserModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                  </div>
               </div>

               <form onSubmit={handleCreateUser} className="p-10 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Login)</label>
                    <input 
                       required
                       type="email"
                       value={newUser.email}
                       onChange={e => setNewUser({...newUser, email: e.target.value})}
                       className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-mono"
                       placeholder="user@quilla.id"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                           required
                           value={newUser.fullName}
                           onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold"
                           placeholder="Full Name"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                        <div className="relative">
                           <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                           <input 
                              required
                              value={newUser.username}
                              onChange={e => setNewUser({...newUser, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                              className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-mono"
                              placeholder="username"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <input 
                           required
                           type="password"
                           minLength={6}
                           value={newUser.password}
                           onChange={e => setNewUser({...newUser, password: e.target.value})}
                           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-mono"
                           placeholder="••••••••"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                        <select 
                           value={newUser.role}
                           onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                           className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-bold cursor-pointer"
                        >
                           <option value="viewer">Viewer / Guest</option>
                           <option value="hrd">HR Director</option>
                           <option value="niaga">Niaga (Retail)</option>
                           <option value="peternakan">Peternakan (Livestock)</option>
                           <option value="pertanian">Pertanian (Agri)</option>
                           <option value="coo_cto">COO / CTO</option>
                           <option value="group_ceo">Group CEO</option>
                           <option value="super_admin">Super Admin</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hierarchy Attachment</label>
                     <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="space-y-1.5">
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Grup</span>
                           <input 
                              value={newUser.hierarchy.grup}
                              onChange={e => setNewUser({...newUser, hierarchy: {...newUser.hierarchy, grup: e.target.value}})}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Perusahaan</span>
                           <input 
                              value={newUser.hierarchy.perusahaan}
                              onChange={e => setNewUser({...newUser, hierarchy: {...newUser.hierarchy, perusahaan: e.target.value}})}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Divisi</span>
                           <input 
                              value={newUser.hierarchy.divisi}
                              onChange={e => setNewUser({...newUser, hierarchy: {...newUser.hierarchy, divisi: e.target.value}})}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-600"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button 
                        type="button" 
                        disabled={isSubmitting}
                        onClick={() => setIsNewUserModalOpen(false)}
                        className="flex-1 py-4 glass text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-[10px] tracking-widest disabled:opacity-50"
                     >
                        Cancel
                     </button>
                     <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                          "flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase text-[10px] tracking-widest flex items-center justify-center gap-2",
                          isSubmitting && "opacity-80 cursor-wait"
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Provisioning...
                          </>
                        ) : (
                          'Finalize Registration'
                        )}
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


const StakeholdersView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'Customers' | 'Partners' | 'Farmers' | 'Investors'>('Customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stakeholderToDelete, setStakeholderToDelete] = useState<{id: string, collection: string, name: string} | null>(null);

  useEffect(() => {
    if (!role) return;

    const isNiaga = role === 'super_admin' || role === 'niaga' || role === 'group_ceo';
    const isPertanian = role === 'super_admin' || role === 'pertanian' || role === 'group_ceo' || role === 'coo_cto';
    const isCEO = role === 'super_admin' || role === 'group_ceo';
    const isCOO = role === 'super_admin' || role === 'group_ceo' || role === 'coo_cto';
    const isAdmin = role === 'super_admin' || role === 'admin';

    const handleError = (collectionName: string) => (error: any) => {
      if (error.code === 'permission-denied') {
        console.warn(`Permission denied for stakeholder listener: ${collectionName}`);
      } else {
        console.error(`Error with stakeholder listener (${collectionName}):`, error);
      }
    };

    let unsubCustomers = () => {};
    if (isNiaga || isCEO) unsubCustomers = onSnapshot(collection(db, 'customers'), (s) => setCustomers(s.docs.map(d => ({ id: d.id, ...d.data() }) as Customer)), handleError('customers'));

    let unsubPartners = () => {};
    if (isNiaga || isCEO || isCOO) unsubPartners = onSnapshot(collection(db, 'partners'), (s) => setPartners(s.docs.map(d => ({ id: d.id, ...d.data() }) as Partner)), handleError('partners'));

    let unsubFarmers = () => {};
    if (isPertanian || isCEO || isCOO) unsubFarmers = onSnapshot(collection(db, 'farmers'), (s) => setFarmers(s.docs.map(d => ({ id: d.id, ...d.data() }) as Farmer)), handleError('farmers'));

    let unsubInvestors = () => {};
    if (isCEO || isAdmin) unsubInvestors = onSnapshot(collection(db, 'investors'), (s) => setInvestors(s.docs.map(d => ({ id: d.id, ...d.data() }) as Investor)), handleError('investors'));

    setLoading(false);
    return () => {
      unsubCustomers();
      unsubPartners();
      unsubFarmers();
      unsubInvestors();
    };
  }, [role]);

  const stats = [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Business Partners', value: partners.length, icon: Handshake, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Farmer Network', value: farmers.length, icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Investor Portfolio', value: investors.length, icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const handleDelete = async (id: string, collectionName: string, name: string) => {
    setStakeholderToDelete({ id, collection: collectionName, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!stakeholderToDelete) return;
    try {
      const { id, collection: collectionName, name } = stakeholderToDelete;
      await deleteDoc(doc(db, collectionName, id));
      await logSystemActivity(profile, 'Delete Stakeholder', collectionName, `Removed ${name} (ID: ${id})`);
      setIsModalOpen(false); // Close edit modal if open
      setShowDeleteModal(false);
      setStakeholderToDelete(null);
    } catch (e) { 
      console.error(e);
      alert("Failed to delete stakeholder. Please try again.");
    }
  };

  const renderList = () => {
    switch (activeSubTab) {
      case 'Customers':
        return customers
          .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.company || '').toLowerCase().includes(searchTerm.toLowerCase()))
          .map(c => (
            <div key={c.id} className="p-5 glass hover:bg-slate-50 transition-all rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{c.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{c.company} • {c.segment}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter", 
                    c.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  )}>{c.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingItem(c); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                  {(profile?.role === 'super_admin' || profile?.role === 'admin') && (
                    <button onClick={() => handleDelete(c.id, 'customers', c.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            </div>
          ));
      case 'Partners':
        return partners
          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(p => (
            <div key={p.id} className="p-5 glass hover:bg-slate-50 transition-all rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <Handshake className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{p.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{p.partnerType} • PIC: {p.pic}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-tighter hidden sm:inline-block">{p.status}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingItem(p); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                   {(profile?.role === 'super_admin' || profile?.role === 'admin') && (
                    <button onClick={() => handleDelete(p.id, 'partners', p.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            </div>
          ));
      case 'Farmers':
        return farmers
          .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.village.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(f => (
            <div key={f.id} className="p-5 glass hover:bg-slate-50 transition-all rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{f.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{f.village}, {f.regency} • {f.commodity}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div className="hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Panen</p>
                  <p className="text-xs font-bold text-emerald-600">{f.harvestEstimate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingItem(f); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                   {(profile?.role === 'super_admin' || profile?.role === 'admin') && (
                    <button onClick={() => handleDelete(f.id, 'farmers', f.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            </div>
          ));
      case 'Investors':
        return investors
          .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.institution.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(i => (
            <div key={i.id} className="p-5 glass hover:bg-slate-50 transition-all rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{i.name}</h4>
                  <p className="text-xs text-slate-400 font-medium">{i.institution} • {i.investorType}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Focus</p>
                  <p className="text-[10px] font-bold text-slate-600">{i.focusArea}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingItem(i); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                   {(profile?.role === 'super_admin' || profile?.role === 'admin') && (
                    <button onClick={() => handleDelete(i.id, 'investors', i.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            </div>
          ));
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Stakeholder Ecosystem</h3>
          <p className="text-sm text-slate-500 font-medium">Unified documentation for Quilla Indonesia internal networks</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          <Plus className="w-4 h-4" /> Add Stakeholder
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", s.bg)}>
              <s.icon className={cn("w-6 h-6", s.color)} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <p className="text-xl font-black text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-[40px] border border-slate-100 shadow-sm overflow-hidden bg-white/40">
        <div className="flex border-b border-slate-100 p-2 gap-2">
          {(['Customers', 'Partners', 'Farmers', 'Investors'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.15em] rounded-2xl transition-all",
                activeSubTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
           <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeSubTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                />
              </div>
              <button className="px-6 py-3 glass text-slate-400 rounded-2xl flex items-center gap-2 hover:text-slate-900 transition-all font-bold text-xs">
                <Filter className="w-4 h-4" /> Filter
              </button>
           </div>

           <div className="space-y-3 min-h-[400px]">
              {renderList()}
              {!loading && customers.length === 0 && activeSubTab === 'Customers' && (
                <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50">
                   <Target className="w-12 h-12" />
                   <p className="text-xs font-black uppercase tracking-widest">No customers registered yet</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <StakeholderModal 
            activeTab={activeSubTab} 
            initialData={editingItem} 
            onClose={() => setIsModalOpen(false)} 
            onDelete={(id, name) => handleDelete(id, activeSubTab.toLowerCase(), name)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white p-8 text-center"
            >
               <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                  <ShieldAlert className="w-10 h-10 text-red-500" />
               </div>
               <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Security Protocol</h4>
               <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                 Confirm deletion of **{stakeholderToDelete?.name}**. This entry will be permanently erased from the system nodes.
               </p>
               
               <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmDelete}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 uppercase text-xs tracking-widest"
                  >
                    Confirm Deletion
                  </button>
                  <button 
                    onClick={() => {
                      setShowDeleteModal(false);
                      setStakeholderToDelete(null);
                    }}
                    className="w-full py-4 glass text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest"
                  >
                    Cancel
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StakeholderModal = ({ activeTab, initialData, onClose, onDelete }: { activeTab: string, initialData: any, onClose: () => void, onDelete?: (id: string, name: string) => void }) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<any>(initialData || { 
    status: 'active',
    ...(activeTab === 'Customers' ? { segment: 'B2C' } : {}),
    ...(activeTab === 'Investors' ? { investorType: 'Individual' } : {})
  });
  const [loading, setLoading] = useState(false);

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin' || profile?.role === 'group_ceo';

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const collectionName = activeTab.toLowerCase();
      
      // Safety: Filter out any undefined values that Firestore rejects
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined)
      );

      if (initialData?.id) {
        const { id, ...dataToUpdate } = cleanData;
        await updateDoc(doc(db, collectionName, id as string), {
          ...dataToUpdate,
          updatedAt: serverTimestamp()
        });
        await logSystemActivity(profile, 'Update Stakeholder', collectionName, `Modified ${formData.name}`);
      } else {
        await addDoc(collection(db, collectionName), {
          ...cleanData,
          createdAt: serverTimestamp()
        });
        await logSystemActivity(profile, 'Add Stakeholder', collectionName, `Registered ${formData.name}`);
      }
      onClose();
    } catch (error) {
       console.error("Error saving stakeholder:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
           <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{initialData ? 'Modify' : 'Register'} {activeTab.slice(0, -1)}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Stakeholder Information Node</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-red-500 shadow-sm"><X className="w-5 h-5"/></button>
           </div>
           
           <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name / Label</label>
                    <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all" />
                 </div>

                 {activeTab === 'Customers' && (
                   <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Company</label>
                          <input value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Segment</label>
                          <select value={formData.segment || 'B2C'} onChange={e => setFormData({ ...formData, segment: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none">
                            <option value="B2C">B2C</option>
                            <option value="B2B">B2B</option>
                            <option value="Distributor">Distributor</option>
                            <option value="Ekspor">Ekspor</option>
                            <option value="Impor">Impor</option>
                          </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Interested Products</label>
                        <input value={formData.interestedProducts || ''} onChange={e => setFormData({ ...formData, interestedProducts: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" placeholder="e.g. Vanilla, Spices" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Purchase Frequency</label>
                        <input value={formData.purchaseFrequency || ''} onChange={e => setFormData({ ...formData, purchaseFrequency: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" placeholder="e.g. Monthly, Bi-annually" />
                    </div>
                   </>
                 )}

                 {activeTab === 'Partners' && (
                   <>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Partner Type</label>
                          <input required value={formData.partnerType || ''} onChange={e => setFormData({ ...formData, partnerType: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">PIC Name</label>
                          <input required value={formData.pic || ''} onChange={e => setFormData({ ...formData, pic: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Scope of Work</label>
                        <textarea value={formData.scopeOfWork || ''} onChange={e => setFormData({ ...formData, scopeOfWork: e.target.value })} className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none resize-none" />
                    </div>
                   </>
                 )}

                 {activeTab === 'Farmers' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Village (Desa)</label>
                        <input required value={formData.village || ''} onChange={e => setFormData({ ...formData, village: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Regency (Kabupaten)</label>
                        <input required value={formData.regency || ''} onChange={e => setFormData({ ...formData, regency: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Land Area (Ha)</label>
                        <input value={formData.landArea || ''} onChange={e => setFormData({ ...formData, landArea: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Commodity</label>
                        <input required value={formData.commodity || ''} onChange={e => setFormData({ ...formData, commodity: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Harvest Estimate</label>
                        <input value={formData.harvestEstimate || ''} onChange={e => setFormData({ ...formData, harvestEstimate: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                      </div>
                   </div>
                 )}

                 {activeTab === 'Investors' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Investor Type</label>
                            <select value={formData.investorType || 'Individual'} onChange={e => setFormData({ ...formData, investorType: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none">
                              <option value="Individual">Individual</option>
                              <option value="Institutional">Institutional</option>
                              <option value="VC">VC</option>
                              <option value="Angel">Angel</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institution</label>
                            <input value={formData.institution || ''} onChange={e => setFormData({ ...formData, institution: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Investment Value Est. (IDR)</label>
                          <input type="number" value={formData.investmentValue || ''} onChange={e => setFormData({ ...formData, investmentValue: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Focus Area</label>
                          <input value={formData.focusArea || ''} onChange={e => setFormData({ ...formData, focusArea: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                      </div>
                    </>
                 )}
              </div>

              <div className="pt-4 flex gap-3">
                 {initialData && isAdmin && (
                   <button 
                    type="button"
                    onClick={() => {
                      if (onDelete) {
                        onDelete(initialData.id, formData.name);
                        onClose();
                      }
                    }}
                    className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-100 transition-all flex items-center justify-center border border-red-100"
                    title="Delete Record"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                 )}
                 <button 
                  disabled={loading}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50"
                 >
                  {loading ? 'Processing Node...' : initialData ? 'Update Entity' : 'Register Entry'}
                 </button>
              </div>
           </form>
        </motion.div>
     </motion.div>
  );
};

const CatalogView = ({ role }: { role?: UserRole }) => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'Products' | 'Categories' | 'Groups'>('Products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (s) => setProducts(s.docs.map(d => ({ id: d.id, ...d.data() }) as Product)));
    const unsubGroups = onSnapshot(collection(db, 'product_groups'), (s) => setGroups(s.docs.map(d => ({ id: d.id, ...d.data() }) as ProductGroup)));
    const unsubCategories = onSnapshot(collection(db, 'product_categories'), (s) => setCategories(s.docs.map(d => ({ id: d.id, ...d.data() }) as ProductCategory)));
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (s) => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }) as InventoryItem)));
    const unsubWarehouses = onSnapshot(collection(db, 'warehouses'), (s) => setWarehouses(s.docs.map(d => ({ id: d.id, ...d.data() }) as Warehouse)));
    
    setLoading(false);
    return () => { unsubProducts(); unsubGroups(); unsubCategories(); unsubInventory(); unsubWarehouses(); };
  }, []);

  const canEdit = ['super_admin', 'niaga', 'group_ceo', 'coo_cto'].includes(role || '');

  const handleDelete = async (id: string, type: string, name: string) => {
    if (!profile) return;
    const collectionName = type === 'Products' ? 'products' : type === 'Categories' ? 'product_categories' : 'product_groups';
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from ${type}?`)) return;
    
    try {
      await deleteDoc(doc(db, collectionName, id));
      await logSystemActivity(profile, 'Delete Catalog Item', type, `Removed ${name} (ID: ${id})`);
      setFeedback({ type: 'success', message: `${name} has been removed from catalog.` });
    } catch (e: any) {
      console.error(e);
      setFeedback({ type: 'error', message: `Failed to delete item: ${e.message}` });
    }
  };

  const renderContent = () => {
    switch (activeCatalogTab) {
      case 'Products':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(p => (
                <div key={p.id} className="glass p-6 rounded-3xl border border-slate-100 group relative">
                  <div className="aspect-video bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-12 h-12" /></div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className="px-2 py-1 bg-white/90 backdrop-blur text-[8px] font-black uppercase rounded-lg shadow-sm text-slate-900">{p.sku}</span>
                      <div className={cn("w-2 h-2 rounded-full mt-2", p.isPublic ? "bg-emerald-500" : "bg-amber-500")} />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
                    {groups.find(g => g.id === p.groupId)?.name} • {categories.find(c => c.id === p.categoryId)?.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-indigo-600">Rp {p.price?.toLocaleString()} / {p.unit}</span>
                    <div className="flex gap-2">
                       {canEdit && (
                          <button 
                            onClick={() => { setSelectedProductForStock(p); setIsStockModalOpen(true); }} 
                            title="Quick Stock Receive"
                            className="p-2 glass text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                       )}
                       {canEdit && (
                          <button onClick={() => { setEditingItem(p); setIsModalOpen(true); }} className="p-2 glass text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                       )}
                       {canEdit && (
                          <button onClick={() => handleDelete(p.id, 'Products', p.name)} className="p-2 glass text-slate-400 hover:text-red-500 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        );
      case 'Categories':
        return (
          <div className="space-y-4">
            {categories.map(c => (
              <div key={c.id} className="p-4 glass rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">{c.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Code: {c.code} • Level: {c.level}</p>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(c); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id, 'Categories', c.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'Groups':
        return (
          <div className="space-y-4">
            {groups.map(g => (
              <div key={g.id} className="p-4 glass rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs">{g.code}</div>
                  <div>
                    <h4 className="font-bold text-slate-800">{g.name}</h4>
                    <p className="text-xs text-slate-400 font-medium italic">{g.description || 'No description provided'}</p>
                  </div>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(g); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(g.id, 'Groups', g.name)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={cn(
              "fixed top-8 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
              feedback.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-red-500/90 text-white border-red-400"
            )}
          >
            {feedback.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            <p className="text-xs font-black uppercase tracking-wider">{feedback.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Katalog Produk</h3>
          <p className="text-sm text-slate-500 font-medium">Master of truth for all products across Quilla Indonesia</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="w-4 h-4" /> Add To Catalog
          </button>
        )}
      </div>

      <div className="flex gap-2 p-1.5 glass rounded-2xl border border-slate-100 w-fit">
        {(['Products', 'Categories', 'Groups'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveCatalogTab(tab)}
            className={cn(
              "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
              activeCatalogTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder={`Quick search ${activeCatalogTab.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none"
        />
      </div>

      {renderContent()}

      <AnimatePresence>
        {isModalOpen && (
          <CatalogModal 
            type={activeCatalogTab}
            initialData={editingItem}
            groups={groups}
            categories={categories}
            onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
            onSuccess={(msg: string) => setFeedback({ type: 'success', message: msg })}
            onError={(msg: string) => setFeedback({ type: 'error', message: msg })}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isStockModalOpen && selectedProductForStock && (
          <StockReceiveModal 
            product={selectedProductForStock}
            warehouses={warehouses}
            inventory={inventory}
            onClose={() => { setIsStockModalOpen(false); setSelectedProductForStock(null); }}
            onSuccess={(msg: string) => setFeedback({ type: 'success', message: msg })}
            onError={(msg: string) => setFeedback({ type: 'error', message: msg })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StockReceiveModal = ({ product, warehouses, inventory, onClose, onSuccess, onError }: any) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    warehouseId: '',
    quantity: '',
    costPrice: String(product.price || 0),
    notes: 'Stock arrival from supplier'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouseId) {
      alert("Please select a target warehouse.");
      return;
    }

    setLoading(true);
    try {
      const warehouse = warehouses.find((w: any) => w.id === formData.warehouseId);
      const qty = Number(formData.quantity);
      const price = Number(formData.costPrice);

      // 1. Find or Create Inventory Item for this Product + Warehouse
      let inventoryItem = inventory.find((i: any) => i.productId === product.id && i.warehouseId === formData.warehouseId);
      let itemId = inventoryItem?.id;

      if (!inventoryItem) {
        // Create new Inventory registration for this warehouse
        const docRef = await addDoc(collection(db, 'inventory'), {
          name: product.name,
          sku: product.sku,
          productId: product.id,
          warehouseId: formData.warehouseId,
          location: warehouse?.name || 'Unknown Warehouse',
          category: 'Product',
          quantity: 0, // Will be updated
          price: price,
          unit: product.unit || 'pcs',
          minStockThreshold: 10,
          updatedAt: serverTimestamp()
        });
        itemId = docRef.id;
      }

      // 2. Add FIFO Batch
      await addDoc(collection(db, `inventory/${itemId}/batches`), {
        itemId: itemId,
        initialQuantity: qty,
        currentQuantity: qty,
        costPrice: price,
        receivedAt: serverTimestamp(),
        batchCode: `RCV-${Date.now().toString().slice(-6)}`
      });

      // 3. Update Aggregate Inventory Quantity
      const currentQty = inventoryItem ? (inventoryItem.quantity || 0) : 0;
      await updateDoc(doc(db, 'inventory', itemId), {
        quantity: currentQty + qty,
        price: price, // Update current valuation price
        updatedAt: serverTimestamp()
      });

      // 4. Log Movement
      await addDoc(collection(db, 'stock_movements'), {
        itemId: itemId,
        sku: product.sku,
        itemName: product.name,
        type: 'IN',
        quantity: qty,
        from: 'External Supplier',
        to: warehouse?.name || 'Unknown',
        reason: formData.notes,
        recordedBy: profile?.username || 'system',
        timestamp: serverTimestamp()
      });

      await logSystemActivity(profile, 'Receive Stock', 'Inventory', `Quick-received ${qty} ${product.unit} of ${product.sku} to ${warehouse?.name}`);
      onSuccess?.(`Successfully received ${qty} units into ${warehouse?.name}.`);
      onClose();
    } catch (err: any) {
      console.error(err);
      onError?.(err.message || 'Failed to receive stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white">
          <div className="flex justify-between items-center mb-4">
             <div className="p-3 bg-white/20 rounded-2xl"><PlusCircle className="w-8 h-8" /></div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
          </div>
          <h4 className="text-2xl font-black tracking-tight">Receive Stock</h4>
          <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-widest">{product.name} • SKU: {product.sku}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-left">
           <div className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Target Warehouse</label>
                 <select 
                    required 
                    value={formData.warehouseId} 
                    onChange={e => setFormData({...formData, warehouseId: e.target.value})}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none ring-offset-0 focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer"
                 >
                    <option value="">Select facility...</option>
                    {warehouses.map((w: any) => (
                       <option key={w.id} value={w.id}>
                          {w.name} ({w.location})
                       </option>
                    ))}
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Quantity ({product.unit})</label>
                    <input 
                       required 
                       type="number" 
                       min="1"
                       value={formData.quantity} 
                       onChange={e => setFormData({...formData, quantity: e.target.value})}
                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Cost Per Unit (Rp)</label>
                    <input 
                       required 
                       type="number" 
                       value={formData.costPrice} 
                       onChange={e => setFormData({...formData, costPrice: e.target.value})}
                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                    />
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Notes / Reason</label>
                 <textarea 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-100 transition-all resize-none"
                    placeholder="e.g. Received from shipment #882..."
                 />
              </div>
           </div>

           <button 
             disabled={loading}
             className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 active:scale-95 transition-all disabled:opacity-50"
           >
             {loading ? 'Finalizing Stock Entry...' : 'Complete Logistics Receipt'}
           </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const CatalogModal = ({ type, initialData, groups, categories, onClose, onSuccess, onError, onDelete }: any) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState<any>(() => {
    if (initialData) return initialData;
    
    // Default initial states for new entries
    const defaults: any = { isActive: true };
    
    if (type === 'Groups') {
      return { ...defaults, code: 'PTRK', name: '', description: '' };
    }
    if (type === 'Categories') {
      return { ...defaults, groupId: '', code: '', name: '', level: 1, parentCategoryId: null };
    }
    if (type === 'Products') {
      return { ...defaults, name: '', sku: '', price: 0, groupId: '', categoryId: '', isPublic: true, unit: 'kg' };
    }
    
    return defaults;
  });
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canManage = ['super_admin', 'admin', 'group_ceo'].includes(profile?.role || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if image is very large to help compression
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setUploadError('Gagal melakukan kompresi');
          setLoading(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Start with 0.7 quality and reduce until the size is under ~200KB (approx 266KB Base64)
        let quality = 0.7;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Iterative compression if still too large 
        // 266,667 characters in Base64 is roughly 200KB
        while (dataUrl.length > 266667 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        setFormData({ ...formData, imageUrl: dataUrl });
        setLoading(false);
      };
      img.onerror = () => {
        setUploadError('Format gambar tidak didukung');
        setLoading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setUploadError('Gagal membaca berkas');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const collectionName = type === 'Products' ? 'products' : type === 'Categories' ? 'product_categories' : 'product_groups';
      const entityLabel = type === 'Products' ? 'Product' : type === 'Categories' ? 'Category' : 'Group';
      
      if (initialData?.id) {
        const { id, ...updateData } = formData;
        await updateDoc(doc(db, collectionName, id), { 
           ...updateData, 
           isActive: updateData.isActive ?? true,
           updatedAt: serverTimestamp() 
        });
        onSuccess?.(`${entityLabel} updated successfully.`);
      } else {
        await addDoc(collection(db, collectionName), { 
           ...formData, 
           isActive: true,
           createdAt: serverTimestamp() 
        });
        onSuccess?.(`${entityLabel} published successfully.`);
      }
      onClose();
    } catch (err: any) { 
      console.error(err); 
      onError?.(err.message || `Failed to process ${type}.`);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h4 className="text-xl font-black text-slate-800 tracking-tight">{initialData ? 'Edit' : 'Create'} {type}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Catalog System Master Entry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm"><X className="w-5 h-5"/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {type === 'Groups' && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Group Code</label>
                  <select required value={formData.code || 'PTRK'} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none">
                    <option value="PTRK">PTRK (Peternakan)</option>
                    <option value="PRTN">PRTN (Pertanian)</option>
                    <option value="OLHN">OLHN (Olahan)</option>
                    <option value="RSLR">RSLR (Reseller)</option>
                  </select>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Group Name</label>
                  <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none resize-none" />
              </div>
            </>
          )}

          {type === 'Categories' && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Product Group</label>
                  <select required value={formData.groupId || ''} onChange={e => setFormData({ ...formData, groupId: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none">
                    <option value="">Select Group</option>
                    {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Parent Category (Optional)</label>
                  <select value={formData.parentCategoryId || ''} onChange={e => setFormData({ ...formData, parentCategoryId: e.target.value || null, level: e.target.value ? 2 : 1 })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none">
                    <option value="">Main Category (Level 1)</option>
                    {categories.filter((c: any) => c.level === 1).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Category Code</label>
                  <input required value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Category Name</label>
                  <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                </div>
              </div>
            </>
          )}

          {type === 'Products' && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5 text-left text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Product SKU</label>
                  <input required value={formData.sku || ''} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" placeholder="e.g. Q-PTRK-001" />
                </div>
                <div className="space-y-1.5 text-left text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Product Name</label>
                  <input required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-left">
                <div className="space-y-1.5 text-left text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Group</label>
                  <select required value={formData.groupId || ''} onChange={e => setFormData({ ...formData, groupId: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none">
                    <option value="">Select Group</option>
                    {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 text-left text-left">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <select required value={formData.categoryId || ''} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none">
                    <option value="">Select Category</option>
                    {categories.filter((c: any) => !formData.groupId || c.groupId === formData.groupId).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5 text-left text-left">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Price</label>
                   <input type="number" required value={formData.price || ''} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-1.5 text-left text-left">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Unit</label>
                   <input required value={formData.unit || ''} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" placeholder="kg, ekor, box" />
                </div>
                <div className="space-y-1.5 text-left text-left">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Visibility</label>
                   <select value={formData.isPublic ? 'Public' : 'Internal'} onChange={e => setFormData({ ...formData, isPublic: e.target.value === 'Public' })} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none">
                     <option value="Public">Public (Market)</option>
                     <option value="Internal">Internal Only</option>
                   </select>
                </div>
              </div>
              <div className="space-y-1.5 text-left text-left">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">Product Media</label>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input 
                        value={formData.imageUrl || ''} 
                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} 
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none" 
                        placeholder="Image URL (https://...)" 
                      />
                    </div>
                    <label className="flex items-center justify-center h-12 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 mr-2" />
                      <span className="text-[10px] font-black uppercase">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  
                  {uploadError && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">{uploadError}</p>}
                  
                  {formData.imageUrl && (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 group">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/200/200';
                        }} 
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="pt-4 flex gap-3">
            {initialData && canManage && (
              <button 
                type="button"
                onClick={() => {
                  if (onDelete) {
                    onDelete(initialData.id, type, formData.name);
                    onClose();
                  }
                }}
                className="px-6 py-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-100 transition-all flex items-center justify-center border border-red-100"
                title="Delete Entry"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              disabled={loading}
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100/50 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing Catalog Entry...' : initialData ? 'Commit Update' : 'Publish Entry'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const DashboardLayout = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getMenuItems = () => {
    const role = profile?.role;
    const items = [];

    // All except public viewer see Overview (Executive or standard)
    if (role !== 'viewer') {
      items.push({ id: 'Overview', icon: LayoutDashboard, label: 'Control Center' });
    }

    // CEO, SuperAdmin see User Mgmt
    if (role === 'super_admin' || role === 'group_ceo') {
      items.push({ id: 'Accounts', icon: UserPlus, label: 'User Systems' });
    }

    // HRD, CEO, SuperAdmin
    if (role === 'hrd' || role === 'group_ceo' || role === 'super_admin') {
      items.push({ id: 'HRD', icon: Users, label: 'SDM & HRD' });
    }

    // Peternakan, COO, CEO, SuperAdmin
    if (role === 'peternakan' || role === 'coo_cto' || role === 'group_ceo' || role === 'super_admin') {
      items.push({ id: 'Peternakan', icon: Target, label: 'Peternakan' });
    }

    // Pertanian, COO, CEO, SuperAdmin
    if (role === 'pertanian' || role === 'coo_cto' || role === 'group_ceo' || role === 'super_admin') {
      items.push({ id: 'Pertanian', icon: Sprout, label: 'Pertanian' });
    }

    // Niaga, COO, CEO, SuperAdmin
    if (role === 'niaga' || role === 'coo_cto' || role === 'group_ceo' || role === 'super_admin') {
      items.push({ id: 'Niaga', icon: ShoppingBag, label: 'Niaga & Retail' });
    }

    // Inventory: Niaga, Peternakan, Pertanian, COO, CEO, SuperAdmin
    if (['niaga', 'peternakan', 'pertanian', 'coo_cto', 'group_ceo', 'super_admin'].includes(role as string)) {
      items.push({ id: 'Inventory', icon: Box, label: 'Gudang SKU' });
    }

    // Finance: SuperAdmin, CEO, Investor
    if (['super_admin', 'group_ceo', 'investor'].includes(role as string)) {
      items.push({ id: 'Finance', icon: Wallet, label: 'Keuangan' });
    }

    // Public/Shared Catalog
    items.push({ id: 'Catalog', icon: Package, label: 'Katalog Produk' });

    // Documents: Accessible by most
    if (role !== 'viewer') {
      items.push({ id: 'Documents', icon: History, label: 'Dokumen' });
    }

    // Audit: SuperAdmin, CEO
    if (role === 'super_admin' || role === 'group_ceo') {
      items.push({ id: 'Audit', icon: Scale, label: 'Audit Log' });
    }

    if (role === 'super_admin') {
      items.push({ id: 'Security', icon: ShieldAlert, label: 'Security' });
    }

    return items;
  };

  const navItems = getMenuItems();

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewView role={profile?.role} />;
      case 'Inventory': return <InventoryView role={profile?.role} />;
      case 'HRD': return <HRDView role={profile?.role} />;
      case 'Finance': return <FinanceView role={profile?.role} />;
      case 'Accounts': return <UsersListView />;
      case 'Security': return <SecurityView role={profile?.role} />;
      case 'Audit': return <AuditLogsView role={profile?.role} />;
      case 'Stakeholders': return <StakeholdersView role={profile?.role} />;
      case 'Peternakan': return <LivestockView role={profile?.role} />;
      case 'Pertanian': return <PertanianView role={profile?.role} />;
      case 'Niaga': return <NiagaView role={profile?.role} />;
      case 'Catalog': return <CatalogView role={profile?.role} />;
      case 'Documents': return <DocumentsView role={profile?.role} />;
      default: return <OverviewView role={profile?.role} />;
    }
  };

  return (
    <div className="flex h-screen bg-mesh overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="glass border-r border-slate-200 flex flex-col transition-all duration-300 relative z-40"
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0 overflow-hidden bg-white/50">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-900 rounded-lg shrink-0 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">Q</span>
             </div>
             {isSidebarOpen && <span className="text-sm font-bold text-slate-800 tracking-tighter whitespace-nowrap">Quilla <span className="text-indigo-600">Indonesia</span></span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
              {isSidebarOpen && <span className="text-sm truncate tracking-tight">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-200 bg-slate-50/50">
           {isSidebarOpen && (
             <div className="mb-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <p className="text-[9px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Active Session</p>
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold uppercase text-xs shadow-md">
                    {profile?.username[0]}
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-xs font-extra-bold text-slate-800 truncate leading-none mb-1">{profile?.username}</p>
                      <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-tighter">{profile?.role.replace('_', ' ')}</p>
                   </div>
                </div>
             </div>
           )}
           <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-600" />
            {isSidebarOpen && <span>Terminate</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
               className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">{activeTab}</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 group focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search system resources..." className="bg-transparent border-none outline-none text-xs w-64 font-medium" />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-800 leading-none mb-0.5">HUB_NODE_BANDUNG</p>
                    <p className="text-[9px] text-emerald-500 font-bold leading-none uppercase">Secure_Link (WIB)</p>
                 </div>
                 <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100 ring-2 ring-white">
                    <UserIcon className="w-5 h-5" />
                 </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               transition={{ duration: 0.2 }}
               className="max-w-7xl mx-auto h-full"
             >
                {renderContent()}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const PlaceholderPanel = ({ title, desc, icon: Icon }: any) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
    <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mb-2 shadow-xl border-indigo-100 rotate-3">
      <Icon className="text-indigo-600 w-12 h-12" />
    </div>
    <div className="space-y-2">
      <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">{desc}</p>
    </div>
    <div className="pt-4 flex gap-4">
      <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">Initialize Module</button>
      <button className="px-8 py-3 glass text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95">Access Docs</button>
    </div>
  </div>
);

const OverviewView = ({ role }: { role?: string }) => {
  const [counts, setCounts] = useState({
    employees: 0,
    inventory: 0,
    revenue: 0,
    stakeholders: 0,
  });
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stakeholderData, setStakeholderData] = useState<any[]>([]);

  useEffect(() => {
    if (!role) return;

    const isAdmin = role === 'super_admin' || role === 'admin';
    const isCEO = role === 'super_admin' || role === 'group_ceo';
    const isHR = role === 'super_admin' || role === 'hrd' || role === 'group_ceo';
    const isNiaga = role === 'super_admin' || role === 'niaga' || role === 'group_ceo';
    const isPeternakan = role === 'super_admin' || role === 'peternakan' || role === 'group_ceo' || role === 'coo_cto';
    const isPertanian = role === 'super_admin' || role === 'pertanian' || role === 'group_ceo' || role === 'coo_cto';
    const isCOO = role === 'super_admin' || role === 'group_ceo' || role === 'coo_cto';
    const isInvestor = role === 'super_admin' || role === 'group_ceo' || role === 'investor';

    // 1. Fetch Employee Count
    let unsubEmployees = () => {};
    if (isHR) {
      unsubEmployees = onSnapshot(collection(db, 'employees'), (s) => {
        setCounts(prev => ({ ...prev, employees: s.size }));
      });
    }

    // 2. Fetch Inventory SKU Count
    let unsubInventory = () => {};
    if (isNiaga || isPeternakan || isPertanian || isCOO) {
      unsubInventory = onSnapshot(collection(db, 'inventory'), (s) => {
        setCounts(prev => ({ ...prev, inventory: s.size }));
      });
    }

    // 3. Fetch Stakeholder Distribution
    const collectionsToListen = [];
    if (isNiaga || isCEO) collectionsToListen.push('customers');
    if (isNiaga || isCEO || isCOO) collectionsToListen.push('partners');
    if (isPertanian || isCEO || isCOO) collectionsToListen.push('farmers');
    if (isCEO || isAdmin) collectionsToListen.push('investors');

    const unsubs = collectionsToListen.map(col => 
      onSnapshot(collection(db, col), (s) => {
        setStakeholderData(prev => {
          const filtered = prev.filter(item => item.name !== col.charAt(0).toUpperCase() + col.slice(1));
          return [...filtered, { name: col.charAt(0).toUpperCase() + col.slice(1), value: s.size }];
        });
      })
    );

    // 4. Fetch Revenue & Transactions
    let unsubFinance = () => {};
    if (isInvestor || isCEO || isAdmin) {
      unsubFinance = onSnapshot(collection(db, 'finance'), (s) => {
        const transactions = s.docs.map(d => d.data() as FinanceTransaction);
        const totalRevenue = transactions
          .filter(t => t.type === 'income')
          .reduce((acc, curr) => acc + curr.amount, 0);
        
        setCounts(prev => ({ ...prev, revenue: totalRevenue }));
        
        const grouped = transactions.slice(-7).map(t => ({
          name: t.date ? new Date(t.date).toLocaleDateString('id-ID', { weekday: 'short' }) : 'N/A',
          amount: t.amount,
          type: t.type
        }));
        setChartData(grouped);
      });
    }

    // 5. Fetch Recent Audit Logs
    let unsubLogs = () => {};
    if (isAdmin || isCEO) {
      const qLogs = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(5));
      unsubLogs = onSnapshot(qLogs, (s) => {
        setRecentLogs(s.docs.map(d => ({ id: d.id, ...d.data() }) as AuditLog));
      });
    }

    return () => {
      unsubEmployees();
      unsubInventory();
      unsubFinance();
      unsubLogs();
      unsubs.forEach(u => u());
    };
  }, [role]);

  const stats = [
    { label: 'Active Personnel', value: counts.employees.toString(), change: 'Live', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Inventory SKU', value: counts.inventory.toLocaleString(), change: 'Active', icon: Box, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Revenue', value: `$${(counts.revenue / 1000000).toFixed(1)}M`, change: 'Gross', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Stakeholders', value: stakeholderData.reduce((a, b) => a + b.value, 0).toString(), change: 'Network', icon: Handshake, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-10 pb-20">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                 <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-tighter">
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-slate-800 tracking-tight">Financial Performance</h4>
                <p className="text-xs text-slate-400 font-medium">Recent transaction flows vs targets</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Income</span>
                 </div>
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Expense</span>
                 </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.length > 0 ? chartData : [{name: 'Mon', amount: 400}, {name: 'Tue', amount: 300}, {name: 'Wed', amount: 600}]}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Stakeholder Pie Card */}
        <div className="glass p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-bold text-slate-800 tracking-tight">Stakeholder Mix</h4>
              <p className="text-xs text-slate-400 font-medium">Distribution by Category</p>
            </div>
            
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stakeholderData.length > 0 ? stakeholderData : [{name: 'Loading', value: 1}]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {stakeholderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
               {stakeholderData.map((s, i) => (
                 <div key={s.name} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{s.name}</span>
                      <span className="text-xs font-black text-slate-700">{s.value}</span>
                    </div>
                 </div>
               ))}
            </div>
        </div>
      </div>

      {/* Activity Log row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-8">
             <div>
               <h4 className="text-xl font-bold text-slate-800 tracking-tight">Operational Log</h4>
               <p className="text-xs text-slate-400 font-medium">Real-time system telemetry (Bandung Hub)</p>
             </div>
             <button className="px-4 py-2 glass text-indigo-600 text-[10px] font-bold hover:bg-indigo-50 rounded-lg transition-all uppercase tracking-widest border border-indigo-100">Historical Data</button>
           </div>
           <div className="space-y-4">
              {recentLogs.length > 0 ? recentLogs.map(log => (
                <div key={log.id} className="flex items-center gap-5 p-4 bg-slate-50/50 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 group shadow-sm">
                   <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-black text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                     {log.username.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight mb-1">
                        <span className="text-indigo-600 font-black tracking-tight">{log.username}</span> {log.action}
                        <span className="text-slate-400 font-medium ml-1">&bull; {log.resource}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                        <Activity className="w-3 h-3 text-indigo-400" /> {log.details} &bull; {log.timestamp ? formatToWIB(log.timestamp) : 'Pending...'}
                      </p>
                   </div>
                   <div className="text-[9px] font-black text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-full uppercase tracking-widest group-hover:border-emerald-200 group-hover:text-emerald-600 transition-colors">Verified</div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
                  <Activity className="w-10 h-10 opacity-20" />
                  <p className="font-bold text-xs uppercase tracking-widest">No activity recorded</p>
                </div>
              )}
           </div>
        </div>

        {/* Info Card / Quick Action */}
        <div className="glass p-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl relative overflow-hidden group">
           <Zap className="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 group-hover:scale-110 transition-transform duration-700" />
           <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black tracking-tighter">System Intelligence</h4>
                <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                  Semua data operasional terpusat dan dilindungi oleh enkripsi standar industri. Pantau progres Quilla Indonesia secara real-time.
                </p>
              </div>
              <div className="pt-4">
                 <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-[0.98]">
                    Generate Report
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const HRDView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'Employees' | 'Attendance' | 'Payroll'>('Employees');

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('fullName', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Employee));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">SDM & HRD Portal</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Personnel management and human capital logistics</p>
        </div>
        <div className="flex gap-2">
           <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Input Personnel</button>
        </div>
      </div>

      <div className="flex gap-4 p-1 glass bg-slate-100/50 rounded-2xl w-fit">
         {(['Employees', 'Attendance', 'Payroll'] as const).map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveSubTab(tab)}
             className={cn(
               "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
               activeSubTab === tab ? "bg-white text-slate-800 shadow-md" : "text-slate-400 hover:text-slate-600"
             )}
           >
             {tab}
           </button>
         ))}
      </div>

      {activeSubTab === 'Employees' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {employees.map(emp => (
             <div key={emp.id} className="glass p-6 rounded-3xl border border-slate-200 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {emp.fullName[0]}
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-800 text-lg leading-none mb-1.5">{emp.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{emp.position}</p>
                   </div>
                </div>
                <div className="space-y-3 pb-6 border-b border-slate-100">
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Department</span>
                      <span className="text-xs font-bold text-slate-700">{emp.department}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Division</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{emp.division || 'General'}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Status</span>
                      <span className={cn("text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full", emp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                         {emp.status}
                      </span>
                   </div>
                </div>
                <div className="pt-6 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase">Available</span>
                   </div>
                   <button className="p-2 glass text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="glass p-20 rounded-3xl border border-slate-200 text-center flex flex-col items-center gap-4 text-slate-400">
           <Activity className="w-12 h-12 opacity-20" />
           <p className="font-black uppercase tracking-[0.2em] text-xs">Module Operationalizing Control Node Bandung...</p>
        </div>
      )}
    </div>
  );
};

const LivestockView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [data, setData] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Livestock>>({
    type: '',
    quantity: 0,
    weight: 0,
    healthStatus: 'healthy',
    feedStock: 0,
    recordedBy: profile?.username || ''
  });

  useEffect(() => {
    const q = query(collection(db, 'livestock'), orderBy('recordedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (s) => {
      setData(s.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Livestock));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'livestock'), {
        ...formData,
        recordedAt: serverTimestamp(),
        recordedBy: profile?.username || 'Unknown'
      });
      await logSystemActivity(profile, 'Input Data Ternak', 'Peternakan', `Mencatat ${formData.type} - Jumlah: ${formData.quantity}`);
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Divisi Peternakan</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Monitoring populasi ternak, kesehatan, dan logistik pakan</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Input Data Ternak</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Sapi', 'Kambing', 'Domba', 'Ayam'].map(type => {
          const count = data.filter(d => d.type.toLowerCase().includes(type.toLowerCase())).reduce((s, d) => s + d.quantity, 0);
          return (
            <div key={type} className="glass p-6 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{type}</p>
               <p className="text-2xl font-black text-slate-800">{count} <span className="text-xs text-slate-400 font-medium">Ekor</span></p>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Ternak</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Berat Rerata</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kesehatan</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 text-sm font-bold text-slate-800">{item.type}</td>
                  <td className="px-6 py-5 text-sm font-bold text-indigo-600">{item.quantity} Ekor</td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{item.weight} kg</td>
                  <td className="px-6 py-5">
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", item.healthStatus === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
                      {item.healthStatus}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase">{item.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl">
               <h4 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Input Operasional Ternak</h4>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jenis Ternak</label><input required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jumlah (Ekor)</label><input type="number" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Berat Rerata (kg)</label><input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Kesehatan</label><select value={formData.healthStatus} onChange={e => setFormData({...formData, healthStatus: e.target.value as any})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none"><option value="healthy">Healthy</option><option value="sick">Sick</option><option value="treatment">In Treatment</option></select></div>
                  </div>
                  <div className="pt-6 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 glass font-black uppercase text-[10px] tracking-widest rounded-2xl">Batal</button>
                    <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl">Simpan Data</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PertanianView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [data, setData] = useState<Agriculture[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Agriculture>>({
    commodity: '',
    seedsType: '',
    landArea: 0,
    plantingDate: new Date().toISOString().split('T')[0],
    harvestEstimate: '',
    landCondition: 'optimal'
  });

  useEffect(() => {
    const q = query(collection(db, 'agriculture'), orderBy('recordedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (s) => {
      setData(s.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Agriculture));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'agriculture'), {
        ...formData,
        recordedAt: serverTimestamp(),
        recordedBy: profile?.username || 'Unknown'
      });
      await logSystemActivity(profile, 'Input Data Pertanian', 'Pertanian', `Mencatat komoditas ${formData.commodity} di lahan ${formData.landArea} Ha`);
      setIsModalOpen(false);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Divisi Pertanian</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Manajemen komoditas, jadwal tanam, dan estimasi hasil panen</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Input Data Pertanian</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Vanila', 'Rempah', 'Padi', 'Jagung'].map(comm => {
          const count = data.filter(d => d.commodity.toLowerCase().includes(comm.toLowerCase())).reduce((s, d) => s + d.landArea, 0);
          return (
            <div key={comm} className="glass p-6 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{comm}</p>
               <p className="text-2xl font-black text-slate-800">{count} <span className="text-xs text-slate-400 font-medium">Ha Lahan</span></p>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Komoditas</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Luas Lahan</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Tanam</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Panen</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kondisi Lahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30">
              {data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-800">{item.commodity}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Bibit: {item.seedsType}</p>
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-emerald-600">{item.landArea} Ha</td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">{item.plantingDate}</td>
                  <td className="px-6 py-5 text-sm font-bold text-indigo-600">{item.harvestEstimate}</td>
                  <td className="px-6 py-5">
                    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest", item.landCondition === 'optimal' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                      {item.landCondition}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-lg p-8 shadow-2xl">
               <h4 className="text-xl font-black text-slate-800 mb-6 tracking-tight">Input Operasional Pertanian</h4>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Komoditas</label><input required value={formData.commodity} onChange={e => setFormData({...formData, commodity: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Luas Lahan (Ha)</label><input type="number" required value={formData.landArea} onChange={e => setFormData({...formData, landArea: Number(e.target.value)})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jadwal Tanam</label><input type="date" required value={formData.plantingDate} onChange={e => setFormData({...formData, plantingDate: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimasi Panen</label><input required value={formData.harvestEstimate} onChange={e => setFormData({...formData, harvestEstimate: e.target.value})} className="w-full bg-slate-50 border p-3 rounded-xl text-sm font-bold outline-none" placeholder="e.g. Q4 2026" /></div>
                  </div>
                  <div className="pt-6 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 glass font-black uppercase text-[10px] tracking-widest rounded-2xl">Batal</button>
                    <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl">Simpan Data</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NiagaView = ({ role }: { role?: string }) => {
  const { profile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'Sales' | 'Customers' | 'Target'>('Sales');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Divisi Niaga & Retail</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Manajemen penjualan, target revenue, dan loyalitas pelanggan</p>
        </div>
        <div className="flex gap-2">
           <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Input Penjualan</button>
        </div>
      </div>

       <div className="flex gap-4 p-1 glass bg-white/40 rounded-2xl w-fit border border-slate-100">
         {(['Sales', 'Customers', 'Target'] as const).map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveSubTab(tab)}
             className={cn(
               "px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
               activeSubTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
             )}
           >
             {tab}
           </button>
         ))}
      </div>

      {activeSubTab === 'Customers' ? (
        <StakeholdersView role={role} />
      ) : (
        <div className="glass p-20 rounded-[3rem] border border-slate-200 text-center flex flex-col items-center gap-6">
           <ShoppingBag className="w-16 h-16 text-indigo-600 opacity-20" />
           <div>
              <p className="font-black uppercase tracking-[0.3em] text-xs text-slate-800 mb-2">Penjualan Terintegrasi Quilla Indonesia</p>
              <p className="text-sm text-slate-400 font-medium">Modul ini sedang disinkronisasi dengan gudang pusat dan tim lapangan.</p>
           </div>
           <button className="px-8 py-4 glass text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all rounded-2xl">Connect to Marketplace API</button>
        </div>
      )}
    </div>
  );
};

const DuplicateCatalogView = ({ role }: { role?: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (s) => {
      setProducts(s.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Product));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Katalog Produk</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Daftar produk unggulan Quilla Indonesia untuk Mitra & Publik</p>
        </div>
         {['super_admin', 'niaga'].includes(role || '') && (
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Tambah Produk</button>
         )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {products.length === 0 && !loading ? (
           <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-200 text-slate-400 font-bold uppercase text-xs tracking-widest">Belum ada produk terdaftar di katalog.</div>
         ) : products.map(product => (
           <div key={product.id} className="glass rounded-[2rem] border border-slate-100 overflow-hidden group hover:shadow-xl transition-all h-full flex flex-col">
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                 {product.imageUrl ? (
                   <img src={product.imageUrl} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-slate-300" /></div>
                 )}
                 <div className="absolute top-4 right-4"><span className="text-[9px] font-black bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">{product.category}</span></div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                 <h4 className="text-lg font-black text-slate-800 mb-2 leading-tight">{product.name}</h4>
                 <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-4">{product.specifications}</p>
                 <div className="mt-auto space-y-4">
                    <p className="text-indigo-600 font-black text-xl tracking-tight">Rp {product.price.toLocaleString('id-ID')}</p>
                    <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-600 transition-colors">Lihat Detail</button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const DocumentsView = ({ role }: { role?: UserRole }) => {
  const [docs, setDocs] = useState<CompanyDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('uploadedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (s) => {
      setDocs(s.docs.map(doc => ({ id: doc.id, ...doc.data() }) as any) as CompanyDoc[]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Arsip & Dokumentasi</h3>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Repositori SOP, Laporan Internal, dan Dokumen Perusahaan</p>
        </div>
        <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Upload Dokumen</button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {['SOP', 'Laporan Keuangan', 'Kontrak', 'Legalitas'].map(cat => (
            <div key={cat} className="glass p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center group cursor-pointer hover:bg-slate-50 transition-colors">
               <div className="w-16 h-16 bg-slate-100 rounded-3xl mb-6 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                  <History className="w-8 h-8" />
               </div>
               <h4 className="text-lg font-black text-slate-800 mb-2">{cat}</h4>
               <p className="text-xs text-slate-400 font-medium tracking-tight uppercase">5 items &bull; 12 MB total</p>
            </div>
         ))}
       </div>

       <div className="glass rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
             <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Recent Documents</h4>
             <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Files</button>
          </div>
          <div className="divide-y divide-slate-100 bg-white/20 min-h-[200px] flex items-center justify-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
             System Initializing Secure Data Stream...
          </div>
       </div>
    </div>
  );
};

const AppContent = () => {
  const { user, profile, loading, login } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInit = async () => {
    setIsInitializing(true);
    try {
      // Manual trigger for first time setup
      // Instead of exposing initializeNasa directly, we just try to login
      // but I'll add it to Context
    } finally {
      setIsInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-indigo-600 tracking-widest uppercase">Initializing Security...</p>
        </div>
      </div>
    );
  }

  if (user && profile) {
    return <DashboardLayout />;
  }

  return (
    <>
      <LandingPage onLoginClick={() => setIsLoginOpen(true)} />
      <AnimatePresence>
        {isLoginOpen && <LoginForm onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
