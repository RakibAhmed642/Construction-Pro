
'use client';
import React, { useState, useEffect, useContext } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  doc,
  updateDoc,
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import Finance from '@/pages/Finance';
import Employees from '@/pages/Employees';
import Projects from '@/pages/Projects';
import Clients from '@/pages/Clients';
import Settings from '@/pages/Settings';
import Workforce from '@/pages/Workforce';
import ProfitPilot from '@/pages/ProfitPilot';
import Auth from '@/components/Auth';
import { Modal } from '@/components/UI';
import { 
  ProjectForm, 
  EmployeeForm, 
  ClientForm, 
  TransactionForm, 
  EmployeePaymentForm,
  AttendanceForm,
  EquipmentForm,
  MaterialStockInForm,
  MaterialStockOutForm,
  MaterialForm
} from '@/components/Forms';
import { Menu, Calendar } from 'lucide-react';
import { SettingsContext, DEFAULT_PAYROLL_RATES, DEFAULT_ROLES } from '@/context/SettingsContext';
import { 
  initializeFirebase, 
  FirebaseClientProvider,
  useFirestore,
  useAuth
} from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

const { firebaseApp, auth, firestore } = initializeFirebase();

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { 
    language, translations, 
    setUserName, setBusinessName, setLogoUrl,
    setPayrollRates, setOvertimeMultiplier,
    setRoles, setSaveToDb 
  } = useContext(SettingsContext);
  const T = translations[language];

  // Cross-page navigation state
  const [jumpToEmployeeId, setJumpToEmployeeId] = useState<string | null>(null);
  const [workforceInitialTab, setWorkforceInitialTab] = useState('attendance');
  const [jumpToEquipmentId, setJumpToEquipmentId] = useState<string | null>(null);

  // Data States
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [modalState, setModalState] = useState({ type: null, data: null });

  const db = useFirestore();
  const firebaseAuth = useAuth();

  // 1. Auth Listener
  useEffect(() => {
    if (!firebaseAuth) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [firebaseAuth]);

  // 2. Data Listeners & Settings Sync
  useEffect(() => {
    if (!db || !user) return;

    setLoading(true);
    
    // Setup save to DB function in context
    setSaveToDb(() => (data: any) => {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'config');
      const sanitizedData = JSON.parse(JSON.stringify(data));
      setDoc(settingsRef, sanitizedData, { merge: true }).catch(err => {
        const permissionError = new FirestorePermissionError({
          path: settingsRef.path,
          operation: 'update',
          requestResourceData: sanitizedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    });

    const unsubs = [
      // Settings Listener
      onSnapshot(doc(db, 'users', user.uid, 'settings', 'config'), snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.userName) setUserName(data.userName);
          if (data.businessName) setBusinessName(data.businessName);
          if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
          if (data.payrollRates) setPayrollRates(data.payrollRates);
          if (data.overtimeMultiplier) setOvertimeMultiplier(data.overtimeMultiplier);
          if (data.roles) setRoles(data.roles);
        }
      }, err => {
          const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/settings/config`,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
      }),

      onSnapshot(query(collection(db, 'users', user.uid, 'projects'), orderBy('createdAt', 'desc')), 
        s => setProjects(s.docs.map(d => ({id:d.id, ...d.data()}))), 
        err => console.error("Error loading projects")),
      
      onSnapshot(query(collection(db, 'users', user.uid, 'clients'), orderBy('createdAt', 'desc')), 
        s => setClients(s.docs.map(d => ({id:d.id, ...d.data()}))), 
        err => console.error("Error loading clients")),
      
      onSnapshot(query(collection(db, 'users', user.uid, 'transactions'), orderBy('createdAt', 'desc')), 
        s => setTransactions(s.docs.map(d => ({id:d.id, ...d.data()}))), 
        err => console.error("Error loading transactions")),
      
      onSnapshot(query(collection(db, 'users', user.uid, 'employees'), orderBy('createdAt', 'desc')), 
        s => setEmployees(s.docs.map(d => ({id:d.id, ...d.data()}))), 
        err => console.error("Error loading employees")),
      
      onSnapshot(query(collection(db, 'users', user.uid, 'attendance'), orderBy('date', 'desc')), 
        s => setAttendance(s.docs.map(d => ({id:d.id, ...d.data()}))), 
        err => console.error("Error loading attendance")),
      
      onSnapshot(query(collection(db, 'users', user.uid, 'equipment')), 
        s => setEquipment(s.docs.map(d => ({id:d.id, ...d.data()}))), 
        err => console.error("Error loading equipment")),

      onSnapshot(query(collection(db, 'users', user.uid, 'scenarios'), orderBy('createdAt', 'desc')), 
        s => setScenarios(s.docs.map(d => ({id:d.id, ...d.data()}))), 
        err => console.error("Error loading scenarios")),

      onSnapshot(query(collection(db, 'users', user.uid, 'documents'), orderBy('createdAt', 'desc')), 
        s => setDocuments(s.docs.map(d => ({id:d.id, ...d.data()}))), 
        err => {
          const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}/documents`,
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }),
      
      onSnapshot(query(collection(db, 'users', user.uid, 'materials')), 
        s => { setMaterials(s.docs.map(d => ({id:d.id, ...d.data()}))); setLoading(false); }, 
        err => { console.error("Error loading materials"); setLoading(false); })
    ];
    
    return () => unsubs.forEach(u => u());
  }, [db, user]);

  const handleAdd = (coll: string, data: any) => {
    if(!db || !user) return;
    const { id: _, ...addData } = data;
    const sanitizedData = JSON.parse(JSON.stringify(addData));
    const colRef = collection(db, 'users', user.uid, coll);
    
    addDoc(colRef, { 
      ...sanitizedData, 
      createdAt: serverTimestamp() 
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}/${coll}`,
        operation: 'create',
        requestResourceData: sanitizedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    closeModal();
  };

  const handleUpdate = (coll: string, id: string, data: any) => {
    if(!db || !user || !id) return;
    const { id: _, createdAt: __, ...updateData } = data;
    const sanitizedData = JSON.parse(JSON.stringify(updateData));
    const docRef = doc(db, 'users', user.uid, coll, id);
    
    updateDoc(docRef, { 
      ...sanitizedData, 
      updatedAt: serverTimestamp() 
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: sanitizedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });

    closeModal();
  };

  const handleDelete = (coll: string, id: string) => {
    if(!db || !user || !id) return;
    if(window.confirm(T.confirmDelete)) {
      const docRef = doc(db, 'users', user.uid, coll, id);
      deleteDoc(docRef).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    }
  };

  const openModal = (type: any, data = null) => {
    setModalState({ type, data });
  };

  const closeModal = () => {
    setModalState({ type: null, data: null });
  }

  const handleNavigate = (tab: string, data?: any) => {
    setActiveTab(tab);
    if (tab === 'employees' && data?.employeeId) {
      setJumpToEmployeeId(data.employeeId);
    } else if (tab === 'workforce') {
      if (data?.tab) setWorkforceInitialTab(data.tab);
      if (data?.equipmentId) setJumpToEquipmentId(data.equipmentId);
    }
  };

  const [date, setDate] = useState(new Date());

  useEffect(() => {
    setDate(new Date());
  }, []);

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">{T.loadingSystem}</p>
      </div>
    </div>
  );

  if (!user) return <Auth />;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <FirebaseErrorListener />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold capitalize text-card-foreground hidden sm:block">{T[activeTab.replace('-', '_')] || activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm text-muted-foreground">
              <Calendar size={14} />
              {date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs uppercase">
              {user.email?.charAt(0) || 'U'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="w-full">
            {activeTab === 'dashboard' && <Dashboard projects={projects} clients={clients} transactions={transactions} employees={employees} equipment={equipment} attendance={attendance} materials={materials} onNavigate={handleNavigate} onQuickAdd={(type) => openModal(type)} />}
            {activeTab === 'projects' && <Projects projects={projects} clients={clients} onAdd={(data) => handleAdd('projects', data)} onUpdate={(id, data) => handleUpdate('projects', id, data)} onDelete={(id) => handleDelete('projects', id)} employees={employees} transactions={transactions} equipment={equipment} attendance={attendance} materials={materials} documents={documents} onAddDocument={(data) => handleAdd('documents', data)} onDeleteDocument={(id) => handleDelete('documents', id)} onNavigate={handleNavigate} onOpenModal={openModal} />}
            {activeTab === 'employees' && <Employees employees={employees} projects={projects} transactions={transactions} attendance={attendance} onAdd={(data) => handleAdd('employees', data)} onUpdate={(id, data) => handleUpdate('employees', id, data)} onDelete={(id) => handleDelete('employees', id)} onOpenModal={openModal} initialEmployeeId={jumpToEmployeeId} onClearInitialEmployee={() => setJumpToEmployeeId(null)} />}
            {activeTab === 'clients' && <Clients clients={clients} projects={projects} transactions={transactions} onAdd={(data) => handleAdd('clients', data)} onUpdate={(id, data) => handleUpdate('clients', id, data)} onDelete={(id) => handleDelete('clients', id)} onOpenModal={openModal} />}
            {activeTab === 'workforce' && <Workforce attendance={attendance} payrollData={transactions} equipment={equipment} materials={materials} employees={employees} projects={projects} onOpenModal={openModal} onDelete={(coll, id) => handleDelete(coll, id)} initialTab={workforceInitialTab} initialEquipmentId={jumpToEquipmentId} onClearInitialEquipment={() => { setJumpToEquipmentId(null); setWorkforceInitialTab('attendance'); }} />}
            {activeTab === 'finance' && <Finance transactions={transactions} projects={projects} onAdd={(data) => handleAdd('transactions', data)} onUpdate={(id, data) => handleUpdate('transactions', id, data)} onDelete={(id) => handleDelete('transactions', id)} onOpenModal={openModal} />}
            {activeTab === 'profit-pilot' && <ProfitPilot scenarios={scenarios} onAddScenario={(data) => handleAdd('scenarios', data)} onDeleteScenario={(id) => handleDelete('scenarios', id)} />}
            {activeTab === 'settings' && <Settings />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {modalState.type === 'projects' && <Modal title={T.newProject} onClose={closeModal}><ProjectForm clients={clients} onClose={closeModal} onSave={(data) => handleAdd('projects', data)} /></Modal>}
      {modalState.type === 'edit_project' && <Modal title={T.editProject} onClose={closeModal}><ProjectForm initialData={modalState.data} clients={clients} onClose={closeModal} onSave={(data) => handleUpdate('projects', modalState.data.id, data)} /></Modal>}
      
      {modalState.type === 'employees' && <Modal title={T.addNewEmployee} onClose={closeModal}><EmployeeForm projects={projects} onClose={closeModal} onSave={(data) => handleAdd('employees', data)} /></Modal>}
      {modalState.type === 'edit_employee' && <Modal title={T.editEmployee} onClose={closeModal}><EmployeeForm initialData={modalState.data} projects={projects} onClose={closeModal} onSave={(data) => handleUpdate('employees', modalState.data.id, data)} /></Modal>}
      
      {modalState.type === 'clients' && <Modal title={T.addNewClient} onClose={closeModal}><ClientForm onClose={closeModal} onSave={(data) => handleAdd('clients', data)} /></Modal>}
      {modalState.type === 'edit_client' && <Modal title={T.editClient} onClose={closeModal}><ClientForm initialData={modalState.data} onClose={closeModal} onSave={(data) => handleUpdate('clients', modalState.data.id, data)} /></Modal>}

      {modalState.type === 'transactions' && <Modal title={T.addTransaction} onClose={closeModal}><TransactionForm projects={projects} onClose={closeModal} onSave={(data) => handleAdd('transactions', data)} /></Modal>}
      {modalState.type === 'edit_transaction' && <Modal title={T.editTransaction} onClose={closeModal}><TransactionForm initialData={modalState.data} projects={projects} onClose={closeModal} onSave={(data) => handleUpdate('transactions', modalState.data.id, data)} /></Modal>}

      {modalState.type === 'pay_employee' && modalState.data && <Modal title={T.paymentFor(modalState.data.name)} onClose={closeModal}><EmployeePaymentForm employee={modalState.data} onClose={closeModal} onPay={(amount, date) => { handleAdd('transactions', { description: `Salary: ${modalState.data.name} (${modalState.data.role})`, employeeId: modalState.data.id, amount: Number(amount), type: 'expense', category: 'labor', date: date }); handleUpdate('employees', modalState.data.id, { totalPaid: Number(modalState.data.totalPaid || 0) + Number(amount) }); }} /></Modal>}
    
      {/* Workforce Modals */}
      {modalState.type === 'mark_attendance' && <Modal title={T.markAttendance} onClose={closeModal}> <AttendanceForm employees={employees} projects={projects} onSave={(data) => handleAdd('attendance', data)} /> </Modal>}
      {modalState.type === 'edit_attendance' && <Modal title={T.markAttendance} onClose={closeModal}> <AttendanceForm initialData={modalState.data} employees={employees} projects={projects} onSave={(data) => handleUpdate('attendance', modalState.data.id, data)} /> </Modal>}
      
      {modalState.type === 'add_equipment' && <Modal title={T.addEquipment} onClose={closeModal}> <EquipmentForm projects={projects} onSave={(data) => handleAdd('equipment', data)} /> </Modal>}
      {modalState.type === 'edit_equipment' && <Modal title={T.editEquipment} onClose={closeModal}> <EquipmentForm initialData={modalState.data} projects={projects} onSave={(data) => handleUpdate('equipment', modalState.data.id, data)} /> </Modal>}
      
      {modalState.type === 'add_material' && <Modal title={T.addMaterial} onClose={closeModal}> <MaterialForm onSave={(data) => handleAdd('materials', data)} /> </Modal>}
      {modalState.type === 'edit_material' && <Modal title={T.editMaterial} onClose={closeModal}> <MaterialForm initialData={modalState.data} onSave={(data) => handleUpdate('materials', modalState.data.id, data)} /> </Modal>}

      {modalState.type === 'stock_in' && (
          <Modal title={T.stockIn} onClose={closeModal}>
              <MaterialStockInForm 
                  materials={materials} 
                  projects={projects}
                  onSave={(data) => {
                      const material = materials.find(m => m.id === data.materialId);
                      if(material) {
                          handleAdd('transactions', {
                              description: `Stock In: ${material.name} (x${data.quantity})`,
                              amount: data.totalCost,
                              type: 'expense',
                              category: 'materials',
                              date: data.date,
                              paymentMethod: data.paymentMethod,
                              projectId: data.projectId || null
                          });
                          handleUpdate('materials', data.materialId, {
                              currentStock: Number(material.currentStock) + Number(data.quantity)
                          });
                      }
                  }} 
              />
          </Modal>
      )}
      {modalState.type === 'stock_out' && (
          <Modal title={T.stockOut} onClose={closeModal}>
              <MaterialStockOutForm 
                  materials={materials} 
                  projects={projects}
                  onSave={(data) => {
                       const material = materials.find(m => m.id === data.materialId);
                       if(material) {
                            handleUpdate('materials', data.materialId, {
                                currentStock: Number(material.currentStock) - Number(data.quantity)
                            });
                       }
                  }} 
              />
          </Modal>
      )}
    </div>
  );
}

export default function App() {
  return (
    <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      <AppContent />
    </FirebaseClientProvider>
  );
}
