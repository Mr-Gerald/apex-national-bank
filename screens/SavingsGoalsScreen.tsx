
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StarIcon, PlusCircleIcon, PencilSquareIcon, TrashIcon, InformationCircleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const SavingsGoalsScreen: React.FC = () => {
  const { user, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.savingsGoals) {
      setGoals(user.savingsGoals);
    } else {
      setGoals([]);
    }
  }, [user]);

  const handleAddGoal = async (newGoalData: Omit<SavingsGoal, 'id'>) => {
    setModalMessage(null);
    try {
      await addSavingsGoal(newGoalData);
      // User object in AuthContext will update, triggering useEffect to refresh goals
      setShowAddModal(false);
    } catch (e: any) {
      setModalMessage(e.message || "Failed to add goal.");
    }
  };

  const handleEditGoal = async (updatedGoalData: SavingsGoal) => {
    setModalMessage(null);
    try {
      await updateSavingsGoal(updatedGoalData);
      setEditingGoal(null);
      setShowAddModal(false);
    } catch (e: any) {
      setModalMessage(e.message || "Failed to update goal.");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      try {
        await deleteSavingsGoal(goalId);
      } catch (e: any) {
        alert(e.message || "Failed to delete goal.");
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <Link to="/profile" className="text-primary hover:text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-800">My Savings Goals</h1>
        </div>
        <Button size="sm" variant="primary" leftIcon={<PlusCircleIcon className="w-4 h-4" />} onClick={() => { setEditingGoal(null); setModalMessage(null); setShowAddModal(true); }}>
          New Goal
        </Button>
      </div>

      {goals.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <StarIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">No Savings Goals Yet</h3>
          <p className="mt-1 text-sm text-neutral-500">Start planning for your future today!</p>
        </div>
      )}

      <div className="space-y-4">
        {goals.map(goal => {
          const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
          return (
            <div key={goal.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{goal.name}</h3>
                  <p className="text-sm text-neutral-600">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                  </p>
                  {goal.deadline && <p className="text-xs text-neutral-500">Deadline: {formatDate(goal.deadline)}</p>}
                </div>
                <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingGoal(goal); setModalMessage(null); setShowAddModal(true); }} aria-label="Edit goal"> <PencilSquareIcon className="w-4 h-4"/> </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)} className="text-red-500 hover:text-red-700" aria-label="Delete goal"> <TrashIcon className="w-4 h-4"/> </Button>
                </div>
              </div>
              <div className="mt-2 w-full bg-neutral-200 rounded-full h-2.5">
                <div 
                  className="bg-accent h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
               <p className="text-xs text-right mt-1 text-neutral-500">{progress.toFixed(0)}% Complete</p>
            </div>
          );
        })}
      </div>
      
      {(showAddModal || editingGoal) && 
        <GoalModal 
            isOpen={showAddModal || !!editingGoal} 
            onClose={() => {setShowAddModal(false); setEditingGoal(null); setModalMessage(null);}} 
            onSave={editingGoal ? handleEditGoal : handleAddGoal}
            existingGoal={editingGoal}
            errorMessage={modalMessage}
        />
      }
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Savings goals are a great way to plan for your future. Consider setting up recurring transfers to your goals to reach them faster.</span>
      </div>
    </div>
  );
};


interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: SavingsGoal | Omit<SavingsGoal, 'id'>) => Promise<void>; // Make it async
    existingGoal?: SavingsGoal | null;
    errorMessage?: string | null;
}

const GoalModal: React.FC<GoalModalProps> = ({isOpen, onClose, onSave, existingGoal, errorMessage}) => {
    const [name, setName] = useState(existingGoal?.name || '');
    const [targetAmount, setTargetAmount] = useState(existingGoal?.targetAmount.toString() || '');
    const [currentAmount, setCurrentAmount] = useState(existingGoal?.currentAmount.toString() || '0');
    const [deadline, setDeadline] = useState(existingGoal?.deadline ? existingGoal.deadline.split('T')[0] : '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const goalData = {
            name,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount),
            deadline: deadline || undefined, // Keep as undefined if empty
        };
        try {
            if (existingGoal) {
                await onSave({...existingGoal, ...goalData});
            } else {
                await onSave(goalData);
            }
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{existingGoal ? 'Edit' : 'Add New'} Savings Goal</h2>
                {errorMessage && <p className="text-red-500 text-sm mb-3">{errorMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="goalName" className="block text-sm font-medium">Goal Name</label>
                        <input type="text" id="goalName" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-md" required/>
                    </div>
                    <div>
                        <label htmlFor="targetAmount" className="block text-sm font-medium">Target Amount ($)</label>
                        <input type="number" id="targetAmount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="w-full p-2 border rounded-md" required min="0.01" step="0.01"/>
                    </div>
                     <div>
                        <label htmlFor="currentAmount" className="block text-sm font-medium">Current Amount ($)</label>
                        <input type="number" id="currentAmount" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="w-full p-2 border rounded-md" min="0" step="0.01"/>
                    </div>
                    <div>
                        <label htmlFor="deadline" className="block text-sm font-medium">Deadline (Optional)</label>
                        <input type="date" id="deadline" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full p-2 border rounded-md"/>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
                        <Button type="submit" variant="primary" isLoading={isSaving} disabled={isSaving}>Save Goal</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SavingsGoalsScreen;
