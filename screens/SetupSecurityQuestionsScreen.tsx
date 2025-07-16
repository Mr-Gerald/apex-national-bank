
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { InformationCircleIcon, QuestionMarkCircleIcon } from '../constants';
import { PREDEFINED_SECURITY_QUESTIONS, SecurityQuestionAnswer } from '../types';

const SetupSecurityQuestionsScreen: React.FC = () => {
  const { user, updateSecuritySettings } = useAuth();
  const navigate = useNavigate();

  const [question1, setQuestion1] = useState(user?.securityQuestions?.[0]?.questionId || PREDEFINED_SECURITY_QUESTIONS[0].id);
  const [answer1, setAnswer1] = useState(user?.securityQuestions?.[0]?.answerHash ? '********' : ''); // Mask if set
  const [question2, setQuestion2] = useState(user?.securityQuestions?.[1]?.questionId || PREDEFINED_SECURITY_QUESTIONS[1].id);
  const [answer2, setAnswer2] = useState(user?.securityQuestions?.[1]?.answerHash ? '********' : ''); // Mask if set
  
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!user?.securitySettings?.hasSecurityQuestionsSet);

  useEffect(() => {
    if (user?.securitySettings?.hasSecurityQuestionsSet) {
        setIsEditing(false); // Default to non-edit mode if questions are already set
        // Populate questions if they exist, answers are masked.
        if(user.securityQuestions && user.securityQuestions.length > 0) setQuestion1(user.securityQuestions[0].questionId);
        if(user.securityQuestions && user.securityQuestions.length > 1) setQuestion2(user.securityQuestions[1].questionId);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!answer1.trim() || !answer2.trim() || answer1 === '********' || answer2 === '********') {
      setMessage("Please provide answers for both security questions.");
      setIsLoading(false);
      return;
    }
    if (question1 === question2) {
        setMessage("Please select two different security questions.");
        setIsLoading(false);
        return;
    }

    const newSecurityQuestions: SecurityQuestionAnswer[] = [
        { questionId: question1, answerHash: answer1 }, // Storing plain answer for demo; hash in real app
        { questionId: question2, answerHash: answer2 },
    ];

    try {
      await updateSecuritySettings({ hasSecurityQuestionsSet: true }, newSecurityQuestions);
      setMessage("Security questions updated successfully.");
      setIsEditing(false); // Exit edit mode after saving
      // Mask answers again after successful save for display
      setAnswer1('********');
      setAnswer2('********');
    } catch (error: any) {
      setMessage(error.message || "Failed to update security questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const QuestionRow: React.FC<{
    qNum: number, 
    selectedQ: string, 
    onQChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    answer: string,
    onAnsChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    disabled: boolean,
    otherSelectedQ?: string
  }> = ({qNum, selectedQ, onQChange, answer, onAnsChange, disabled, otherSelectedQ}) => (
    <div className="space-y-1">
        <label htmlFor={`question${qNum}`} className="block text-sm font-medium text-neutral-700">Question {qNum}</label>
        <select 
            id={`question${qNum}`} 
            value={selectedQ} 
            onChange={onQChange} 
            className="w-full p-2 border border-neutral-300 rounded-md bg-white"
            disabled={disabled || isLoading}
        >
            {PREDEFINED_SECURITY_QUESTIONS.map(q => (
                <option key={q.id} value={q.id} disabled={q.id === otherSelectedQ}>
                    {q.text}
                </option>
            ))}
        </select>
        <label htmlFor={`answer${qNum}`} className="block text-sm font-medium text-neutral-700 mt-1.5">Answer {qNum}</label>
        <input 
            type="text" // Changed to text for demo, ideally password but then can't see if masked
            id={`answer${qNum}`} 
            value={answer} 
            onChange={onAnsChange}
            placeholder={disabled ? "********" : "Enter your answer"}
            className="w-full p-2 border border-neutral-300 rounded-md" 
            required 
            disabled={disabled || isLoading}
        />
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/security" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Security Questions</h1>
      </div>

      {message && <div className={`p-3 my-2 rounded-md ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <QuestionRow 
            qNum={1} 
            selectedQ={question1} 
            onQChange={e => setQuestion1(e.target.value)}
            answer={answer1}
            onAnsChange={e => setAnswer1(e.target.value)}
            disabled={!isEditing}
            otherSelectedQ={question2}
        />
        <QuestionRow 
            qNum={2} 
            selectedQ={question2} 
            onQChange={e => setQuestion2(e.target.value)}
            answer={answer2}
            onAnsChange={e => setAnswer2(e.target.value)}
            disabled={!isEditing}
            otherSelectedQ={question1}
        />
        
        {isEditing ? (
            <div className="flex space-x-2 pt-2">
                <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading} disabled={isLoading}>
                Save Questions
                </Button>
                {user?.securitySettings?.hasSecurityQuestionsSet && (
                    <Button type="button" variant="outline" onClick={() => {
                        setIsEditing(false); 
                        setMessage(null);
                        setAnswer1('********'); 
                        setAnswer2('********');
                    }} disabled={isLoading}>
                        Cancel
                    </Button>
                )}
            </div>
        ) : (
            <Button type="button" variant="primary" onClick={() => {
                setIsEditing(true); 
                setMessage(null);
                // Clear answers for editing, prompt user to re-enter
                setAnswer1(''); 
                setAnswer2('');
            }} className="w-full">
                Change Security Questions
            </Button>
        )}
      </form>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Choose questions and answers that are easy for you to remember but hard for others to guess. Your answers are case-sensitive.</span>
      </div>
    </div>
  );
};

export default SetupSecurityQuestionsScreen;
