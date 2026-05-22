/**
 * @file components/auth/SignupFlow/SignupFlow.jsx
 * Multi-step registration wizard. Manages step navigation state and handles
 * the final Firebase account creation. Delegates rendering to SignupSteps.jsx.
 */

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';

import { auth, db }                    from '../../../services/firebase';
import { getOrGenerateDeviceToken }    from '../../../utils/device';
import {
  Step1_CoreProfile,
  Step2_Contact,
  Step3_Academic,
  Step4_NextOfKin,
  Step5_Documents,
} from './SignupSteps';

const TOTAL_STEPS = 5;
const STEP_LABELS = ['Profile', 'Contact', 'Academic', 'Next of Kin', 'Official'];

const STEP_FIELDS = {
  1: ['surname', 'firstName', 'otherNames', 'dob', 'gender', 'stateOrigin', 'lgaOrigin'],
  2: ['phone', 'email', 'password', 'address', 'stateCurrent', 'lgaCurrent'],
  3: ['institution', 'course', 'matricNo', 'jambReg'],
  4: ['nokName', 'nokRel', 'nokPhone'],
  5: ['campDate', 'fileNo', 'stateCode', 'cdsGroup', 'cdsDay', 'ppa'],
};

const INITIAL_FORM = {
  surname: '', firstName: '', otherNames: '', dob: '', gender: '',
  stateOrigin: '', lgaOrigin: '', phone: '', email: '', password: '',
  address: '', stateCurrent: '', lgaCurrent: '', institution: '',
  course: '', matricNo: '', jambReg: '', nokName: '', nokRel: '',
  nokPhone: '', campDate: '', fileNo: '', cdsGroup: '', cdsDay: '',
  stateCode: '', ppa: '',
};

const SignupFlow = ({ switchToLogin, addToast, onSignupComplete }) => {
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const isStepValid = (s) =>
    (STEP_FIELDS[s] || []).every(f => formData[f]?.trim());

  const handleNext = () => {
    if (isStepValid(step)) {
      setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      addToast('Please fill in all required fields.', 'error');
    }
  };

  const handleSignup = async () => {
    if (!isStepValid(step)) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(
        auth, formData.email, formData.password,
      );
      const { user } = credential;
      const deviceToken = getOrGenerateDeviceToken();

      const userData = {
        ...formData,
        role:            'member',
        deviceToken,
        createdAt:       serverTimestamp(),
        attendanceScore: 100,
        status:          'Active',
        uid:             user.uid,
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.surname}`,
      });

      addToast('Account created successfully!', 'success');
      onSignupComplete(userData);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const props = { formData, handleChange };
    switch (step) {
      case 1: return <Step1_CoreProfile {...props} />;
      case 2: return <Step2_Contact     {...props} />;
      case 3: return <Step3_Academic    {...props} />;
      case 4: return <Step4_NextOfKin   {...props} />;
      case 5: return <Step5_Documents   {...props} />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
      {/* Progress Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Create Account</h1>
        <p className="text-slate-500 text-sm mb-5">
          Step {step} of {TOTAL_STEPS}:{' '}
          <span className="font-bold text-slate-700">{STEP_LABELS[step - 1]}</span>
        </p>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#006533] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white min-h-[300px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
        {step > 1 ? (
          <button
            onClick={() => setStep(prev => prev - 1)}
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={18} /> Previous
          </button>
        ) : <div />}

        {step < TOTAL_STEPS ? (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-[#006533] text-white rounded-xl font-bold shadow-lg hover:bg-[#005229] transition-all flex items-center gap-2"
          >
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button
            disabled={loading}
            onClick={handleSignup}
            className="px-8 py-3 bg-gradient-to-r from-[#006533] to-emerald-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 disabled:opacity-60"
          >
            {loading
              ? <Loader2 className="animate-spin" size={18} />
              : <><CheckCircle size={18} /> Submit Registration</>}
          </button>
        )}
      </div>

      <p className="mt-6 text-center text-slate-400 text-xs font-medium">
        Already have an account?{' '}
        <button onClick={switchToLogin} className="text-[#006533] font-bold hover:underline">
          Login
        </button>
      </p>
    </div>
  );
};

export default SignupFlow;