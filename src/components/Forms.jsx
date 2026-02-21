
import React, { useContext, useState, useRef } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { Input, Select } from '@/components/UI';
import { SettingsContext } from '@/context/SettingsContext';
import { Camera, X } from 'lucide-react';

export const EmployeeForm = ({ initialData = {}, projects = [], onClose, onSave }) => {
    const { language, translations, roles } = useContext(SettingsContext);
    const T = translations[language];
    const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null);
    const fileInputRef = useRef(null);

    const employeeRoles = roles || [];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 300;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to WebP
                const webpData = canvas.toDataURL('image/webp', 0.8);
                setImagePreview(webpData);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = String(formData.get('name') || '');
      
      onSave({
        name: name,
        role: String(formData.get('role') || 'Labor (Jogali)'),
        phone: String(formData.get('phone') || ''),
        projectId: String(formData.get('projectId') || ''),
        status: String(formData.get('status') || 'Active'),
        imageUrl: imagePreview || `https://picsum.photos/seed/${encodeURIComponent(name || 'user')}/200/200`,
        totalPaid: Number(initialData?.totalPaid || 0),
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image Upload Section */}
        <div className="flex flex-col items-center justify-center mb-2">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden bg-muted group"
            >
                {imagePreview ? (
                    <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={20} className="text-white" />
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <Camera size={24} className="text-muted-foreground mx-auto" />
                        <span className="text-[10px] text-muted-foreground font-bold uppercase mt-1 block">Photo</span>
                    </div>
                )}
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
            />
            {imagePreview && (
                <button 
                    type="button" 
                    onClick={() => setImagePreview(null)}
                    className="text-[10px] text-destructive font-bold uppercase mt-2 hover:underline"
                >
                    Remove Photo
                </button>
            )}
        </div>

        <Input name="name" label={T.fullName} defaultValue={initialData?.name} placeholder={T.fullNameEg} required={true} />
        
        <Select name="role" label={T.roleCategory} defaultValue={initialData?.role || (employeeRoles.includes('Labor (Jogali)') ? 'Labor (Jogali)' : employeeRoles[0])} required={true}>
          {employeeRoles.map(role => (
            <option key={role} value={role}>{T[`role${role.replace(/\s/g, '').replace(/[()]/g, '')}`] || role}</option>
          ))}
        </Select>

        <Input name="phone" label={T.phoneNumber} defaultValue={initialData?.phone} placeholder="e.g., 017..." required={false} />
        
        <Select name="projectId" label={T.assignedProject} defaultValue={initialData?.projectId || ""} required={false}>
          <option value="">{T.noAssignment} (Optional)</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>

        <Select name="status" label={T.status} defaultValue={initialData?.status || 'Active'} required={true}>
          <option value="Active">{T.statusActive}</option>
          <option value="Inactive">{T.statusInactive}</option>
          <option value="On Leave">{T.statusOnLeave}</option>
        </Select>

        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 mt-2">
          {initialData?.id ? T.updateEmployee : T.addEmployee}
        </button>
      </form>
    );
};
  
export const EmployeePaymentForm = ({ employee, onClose, onPay }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const amount = Number(formData.get('amount'));
      const date = String(formData.get('date'));
      if (amount > 0 && date) {
        onPay(amount, date);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-1">
        <div className="bg-muted p-4 rounded-lg mb-4">
          <p className="text-sm text-muted-foreground">{T.payingTo}:</p>
          <p className="font-bold text-foreground text-lg">{employee.name}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{employee.role}</span>
            <p className="text-xs text-muted-foreground">{T.totalPaid}: ৳{employee.totalPaid || 0}</p>
          </div>
        </div>
        <Input name="amount" type="number" label={T.paymentAmount} placeholder="0.00" required={true} />
        <Input name="date" type="date" label={T.paymentDate} defaultValue={new Date().toISOString().split('T')[0]} required={true} />
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md active:scale-95 mt-4">{T.confirmPayment}</button>
      </form>
    );
};
  
export const ProjectForm = ({ initialData = {}, clients = [], onClose, onSave }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      onSave({
        name: String(formData.get('name') || ''),
        clientId: String(formData.get('clientId') || ''),
        location: String(formData.get('location') || ''),
        budget: Number(formData.get('budget')) || 0,
        status: String(formData.get('status') || 'Planned'),
        startDate: String(formData.get('startDate') || ''),
        endDate: String(formData.get('endDate') || ''),
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-1">
        <Input name="name" label={T.projectName} defaultValue={initialData?.name} required={true} />
        <Select name="clientId" label={T.client} defaultValue={initialData?.clientId || ""} required={true}>
          <option value="" disabled>{T.selectClient}</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Input name="location" label={T.location} defaultValue={initialData?.location} required={false} />
        <div className="grid grid-cols-2 gap-4">
          <Input name="startDate" type="date" label={T.startDate} defaultValue={initialData?.startDate} required={false} />
          <Input name="endDate" type="date" label={T.endDate} defaultValue={initialData?.endDate} required={false} />
        </div>
        <Input name="budget" type="number" label={T.budget} defaultValue={initialData?.budget} required={false} />
        <Select name="status" label={T.status} defaultValue={initialData?.status || 'Planned'} required={true}>
          <option value="Planned">{T.statusPlanned}</option>
          <option value="Ongoing">{T.statusOngoing}</option>
          <option value="Completed">{T.statusCompleted}</option>
          <option value="On Hold">{T.statusOnHold}</option>
        </Select>
        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 mt-4">{initialData?.id ? T.updateProject : T.saveProject}</button>
      </form>
    );
};
  
export const ClientForm = ({ initialData = {}, onClose, onSave }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      onSave({
        name: String(formData.get('name') || ''),
        phone: String(formData.get('phone') || ''),
        address: String(formData.get('address') || ''),
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-1">
        <Input name="name" label={T.fullName} defaultValue={initialData?.name} required={true} />
        <Input name="phone" label={T.phoneNumber} defaultValue={initialData?.phone} required={false} />
        <Input name="address" label={T.address} defaultValue={initialData?.address} required={false} />
        <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 mt-4">{initialData?.id ? T.updateClient : T.saveClient}</button>
      </form>
    );
};

export const TransactionForm = ({ initialData = {}, projects = [], onClose, onSave }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      onSave({
        description: String(formData.get('description') || ''),
        amount: Number(formData.get('amount')) || 0,
        type: String(formData.get('type') || 'expense'),
        category: String(formData.get('category') || 'overhead'),
        date: String(formData.get('date') || new Date().toISOString().split('T')[0]),
        projectId: String(formData.get('projectId') || ''), 
        paymentMethod: String(formData.get('paymentMethod') || 'Cash'),
        reference: String(formData.get('reference') || ''),
        status: 'Paid',
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-1">
        <Input name="description" label={T.description} defaultValue={initialData?.description} placeholder={T.descriptionEg} required={true} />
        <div className="grid grid-cols-2 gap-4">
          <Input name="amount" type="number" label={T.amount} defaultValue={initialData?.amount} placeholder="0.00" required={true} />
          <Input name="date" type="date" label={T.date} defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} required={true} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-1">{T.linkToProject}</label>
          <select name="projectId" defaultValue={initialData?.projectId || ""} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all bg-background text-foreground">
            <option value="">{T.generalOverhead}</option>
            {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select name="type" label={T.type} defaultValue={initialData?.type || 'expense'} required={true}>
            <option value="expense">{T.expense}</option>
            <option value="income">{T.income}</option>
          </Select>
          <Select name="category" label={T.category} defaultValue={initialData?.category || 'materials'} required={true}>
            <option value="materials">{T.catMaterials}</option>
            <option value="labor">{T.catLabor}</option>
            <option value="payment">{T.catPayment}</option>
            <option value="equipment">{T.catEquipment}</option>
            <option value="transport">{T.catTransport}</option>
            <option value="overhead">{T.catOverhead}</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select name="paymentMethod" label={T.paymentMethod} defaultValue={initialData?.paymentMethod || 'Cash'} required={true}>
            <option value="Cash">{T.payCash}</option>
            <option value="Bank Transfer">{T.payBank}</option>
            <option value="Check">{T.payCheck}</option>
            <option value="Mobile Money">{T.payMobile}</option>
          </Select>
          <Input name="reference" label={T.refNo} defaultValue={initialData?.reference} placeholder="#12345" required={false} />
        </div>
        <button type="submit" className="w-full bg-foreground text-background py-3 rounded-lg font-bold hover:bg-foreground/90 transition-all shadow-md active:scale-95 mt-4">{initialData?.id ? T.updateTransaction : T.recordTransaction}</button>
      </form>
    );
};

export const AttendanceForm = ({ initialData = {}, employees = [], projects = [], onSave }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];
    const handleSubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      onSave({
        employeeId: String(fd.get('employeeId') || ''),
        projectId: String(fd.get('projectId') || ''),
        date: String(fd.get('date') || ''),
        checkIn: String(fd.get('checkIn') || ''),
        checkOut: String(fd.get('checkOut') || ''),
        status: String(fd.get('status') || 'Present'),
        overtime: Number(fd.get('overtime')) || 0,
      });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-1">
            <Select name="employeeId" label={T.employee} defaultValue={initialData?.employeeId} required={true}>
                <option value="" disabled>Select Employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
            <Select name="projectId" label={T.projects} defaultValue={initialData?.projectId} required={true}>
                <option value="" disabled>Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Input name="date" type="date" label={T.date} defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} required={true} />
            <div className="grid grid-cols-2 gap-4">
                <Input name="checkIn" type="time" label={T.checkIn} defaultValue={initialData?.checkIn} required={false} />
                <Input name="checkOut" type="time" label={T.checkOut} defaultValue={initialData?.checkOut} required={false} />
            </div>
            <Select name="status" label={T.status} defaultValue={initialData?.status || "Present"} required={true}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Half-day">Half-day</option>
            </Select>
            <Input name="overtime" type="number" label={T.overtime} defaultValue={initialData?.overtime || "0"} required={false} />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all mt-4">{T.saveChanges}</button>
        </form>
    );
};

export const EquipmentForm = ({ initialData = {}, projects = [], onSave }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];
    const handleSubmit = e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        onSave({
            name: String(fd.get('name') || ''),
            category: String(fd.get('category') || 'Heavy'),
            ownership: String(fd.get('ownership') || 'Owned'),
            status: String(fd.get('status') || 'Idle'),
            projectId: String(fd.get('projectId') || ''),
            lastService: String(fd.get('lastService') || ''),
            nextService: String(fd.get('nextService') || ''),
        });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-1">
            <Input name="name" label={T.equipmentName} defaultValue={initialData?.name} placeholder="e.g., Concrete Mixer" required={true} />
            <div className="grid grid-cols-2 gap-4">
                <Select name="category" label={T.category} defaultValue={initialData?.category || "Heavy"} required={true}>
                    <option value="Heavy">Heavy</option>
                    <option value="Light">Light</option>
                </Select>
                 <Select name="ownership" label={T.ownership} defaultValue={initialData?.ownership || "Owned"} required={true}>
                    <option value="Owned">{T.owned}</option>
                    <option value="Rented">{T.rented}</option>
                </Select>
            </div>
            <Select name="projectId" label={T.assignedProject} defaultValue={initialData?.projectId || ""} required={false}>
                <option value="">{T.unassigned}</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select name="status" label={T.status} defaultValue={initialData?.status || "Idle"} required={true}>
                <option value="In Use">{T.inUse}</option>
                <option value="Idle">{T.idle}</option>
                <option value="Maintenance">{T.maintenance}</option>
            </Select>
            <div className="grid grid-cols-2 gap-4">
                <Input name="lastService" type="date" label={T.lastServiceDate} defaultValue={initialData?.lastService} required={false} />
                <Input name="nextService" type="date" label={T.nextService} defaultValue={initialData?.nextService} required={false} />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all mt-4">{initialData?.id ? T.update : T.addEquipment}</button>
        </form>
    );
};

export const MaterialForm = ({ initialData = {}, onClose, onSave }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];
    const handleSubmit = e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        onSave({
            name: String(fd.get('name') || ''),
            unit: String(fd.get('unit') || ''),
            currentStock: Number(fd.get('currentStock')) || 0,
            reorderLevel: Number(fd.get('reorderLevel')) || 0,
            lastUpdated: new Date().toISOString().split('T')[0]
        });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-1">
            <Input name="name" label={T.material} defaultValue={initialData?.name} placeholder="e.g. Cement" required={true} />
            <Input name="unit" label={T.unit} defaultValue={initialData?.unit} placeholder="e.g. Bags" required={false} />
            <div className="grid grid-cols-2 gap-4">
                <Input name="currentStock" type="number" label={T.currentStock} defaultValue={initialData?.currentStock} required={false} />
                <Input name="reorderLevel" type="number" label={T.reorderLevel} defaultValue={initialData?.reorderLevel} required={false} />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all mt-4">{initialData?.id ? T.update : T.add}</button>
        </form>
    );
};

export const MaterialStockInForm = ({ materials = [], projects = [], onSave }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];
    const handleSubmit = e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        onSave({
            materialId: String(fd.get('materialId') || ''),
            quantity: Number(fd.get('quantity')) || 0,
            totalCost: Number(fd.get('totalCost')) || 0,
            date: String(fd.get('date') || ''),
            paymentMethod: String(fd.get('paymentMethod') || 'Cash'),
            projectId: String(fd.get('projectId') || ''),
        });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-1">
            <Select name="materialId" label={T.material} required={true}>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Select>
            <Input name="quantity" type="number" label={T.quantity} placeholder="e.g., 100" required={true} />
            <Input name="totalCost" type="number" label={T.totalCost} placeholder="0.00" required={true} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">{T.linkToProject}</label>
              <select name="projectId" defaultValue="" className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all bg-background text-foreground">
                <option value="">{T.generalOverhead}</option>
                {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <Input name="date" type="date" label={T.date} defaultValue={new Date().toISOString().split('T')[0]} required={true} />
            <Select name="paymentMethod" label={T.paymentMethod} required={true}>
                <option value="Cash">{T.payCash}</option>
                <option value="Bank Transfer">{T.payBank}</option>
            </Select>
            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all mt-4">{T.stockIn}</button>
        </form>
    );
};

export const MaterialStockOutForm = ({ materials = [], projects = [], onSave }) => {
    const { language, translations } = useContext(SettingsContext);
    const T = translations[language];
    const handleSubmit = e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        onSave({
            materialId: String(fd.get('materialId') || ''),
            quantity: Number(fd.get('quantity')) || 0,
            projectId: String(fd.get('projectId') || ''),
        });
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-1">
            <Select name="materialId" label={T.material} required={true}>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({T.currentStock}: {m.currentStock})</option>)}
            </Select>
            <Input name="quantity" type="number" label={T.quantityUsed} placeholder="e.g., 25" required={true} />
            <Select name="projectId" label={T.usedInProject} required={true}>
                <option value="" disabled>Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all mt-4">{T.stockOut}</button>
        </form>
    );
};
