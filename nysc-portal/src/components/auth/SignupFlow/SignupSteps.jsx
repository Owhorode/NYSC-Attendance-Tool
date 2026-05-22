/**
 * @file components/auth/SignupFlow/SignupSteps.jsx
 * The five registration step forms for new corps members.
 * Pure presentational — receives formData and handleChange as props.
 * No internal state, no Firebase dependencies.
 */

import React from 'react';
import { InputGroup } from '../../ui/FormControls';
import { CDS_GROUPS, CDS_DAYS, NIGERIA_STATES } from '../../../constants';

const INPUT_CLS =
  'w-full p-3 border rounded-xl bg-slate-50 outline-none focus:border-[#006533] focus:bg-white transition-all';

// ---------------------------------------------------------------------------
// Step 1 — Core Profile
// ---------------------------------------------------------------------------
export const Step1_CoreProfile = ({ formData, handleChange }) => {
  const originState = NIGERIA_STATES.find(s => s.state === formData.stateOrigin);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Personal Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup label="Surname" required>
          <input name="surname" value={formData.surname} onChange={handleChange} className={INPUT_CLS} />
        </InputGroup>
        <InputGroup label="First Name" required>
          <input name="firstName" value={formData.firstName} onChange={handleChange} className={INPUT_CLS} />
        </InputGroup>
        <InputGroup label="Other Names" required>
          <input name="otherNames" value={formData.otherNames} onChange={handleChange} className={INPUT_CLS} />
        </InputGroup>
        <InputGroup label="Date of Birth" required>
          <input name="dob" type="date" value={formData.dob} onChange={handleChange} className={INPUT_CLS} />
        </InputGroup>
        <InputGroup label="Gender" required>
          <select name="gender" value={formData.gender} onChange={handleChange} className={INPUT_CLS}>
            <option value="">Select...</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </InputGroup>
        <InputGroup label="State of Origin" required>
          <select name="stateOrigin" value={formData.stateOrigin} onChange={handleChange} className={INPUT_CLS}>
            <option value="">Select...</option>
            {NIGERIA_STATES.map(s => (
              <option key={s.state} value={s.state}>{s.state}</option>
            ))}
          </select>
        </InputGroup>
        <InputGroup label="LGA of Origin" required>
          <select
            name="lgaOrigin"
            value={formData.lgaOrigin}
            onChange={handleChange}
            className={INPUT_CLS}
            disabled={!formData.stateOrigin}
          >
            <option value="">Select State first...</option>
            {originState?.lgas.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </InputGroup>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step 2 — Contact & Location
// ---------------------------------------------------------------------------
export const Step2_Contact = ({ formData, handleChange }) => {
  const currentState = NIGERIA_STATES.find(s => s.state === formData.stateCurrent);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black text-slate-900">Contact & Location</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup label="Phone Number" required>
          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className={INPUT_CLS} />
        </InputGroup>
        <InputGroup label="Email Address" required>
          <input name="email" type="email" value={formData.email} onChange={handleChange} className={INPUT_CLS} />
        </InputGroup>
        <InputGroup label="Password" required>
          <input name="password" type="password" value={formData.password} onChange={handleChange} className={INPUT_CLS} />
        </InputGroup>
        <InputGroup label="State of Residence" required>
          <select name="stateCurrent" value={formData.stateCurrent} onChange={handleChange} className={INPUT_CLS}>
            <option value="">Select...</option>
            {NIGERIA_STATES.map(s => (
              <option key={s.state} value={s.state}>{s.state}</option>
            ))}
          </select>
        </InputGroup>
        <InputGroup label="Current LGA" required>
          <select
            name="lgaCurrent"
            value={formData.lgaCurrent}
            onChange={handleChange}
            className={INPUT_CLS}
            disabled={!formData.stateCurrent}
          >
            <option value="">Select State first...</option>
            {currentState?.lgas.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </InputGroup>
        <InputGroup label="Residential Address" required>
          <input name="address" value={formData.address} onChange={handleChange} className={INPUT_CLS} />
        </InputGroup>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step 3 — Academic Background
// ---------------------------------------------------------------------------
export const Step3_Academic = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h2 className="text-lg font-black text-slate-900">Academic Background</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InputGroup label="Institution" required>
        <input name="institution" value={formData.institution} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
      <InputGroup label="Course of Study" required>
        <input name="course" value={formData.course} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
      <InputGroup label="Matric Number" required>
        <input name="matricNo" value={formData.matricNo} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
      <InputGroup label="JAMB Reg. Number" required>
        <input name="jambReg" value={formData.jambReg} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Step 4 — Next of Kin
// ---------------------------------------------------------------------------
export const Step4_NextOfKin = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h2 className="text-lg font-black text-slate-900">Next of Kin</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InputGroup label="Full Name" required>
        <input name="nokName" value={formData.nokName} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
      <InputGroup label="Relationship" required>
        <input name="nokRel" value={formData.nokRel} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
      <InputGroup label="Phone Number" required>
        <input name="nokPhone" type="tel" value={formData.nokPhone} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Step 5 — Official NYSC Details
// ---------------------------------------------------------------------------
export const Step5_Documents = ({ formData, handleChange }) => (
  <div className="space-y-6">
    <h2 className="text-lg font-black text-slate-900">Official NYSC Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <InputGroup label="Camp Date" required>
        <input name="campDate" type="date" value={formData.campDate} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
      <InputGroup label="File Number" required>
        <input name="fileNo" value={formData.fileNo} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
      <InputGroup label="State Code" required>
        <input
          name="stateCode"
          value={formData.stateCode}
          onChange={handleChange}
          className={`${INPUT_CLS} uppercase`}
          placeholder="e.g. LA/24B/1234"
        />
      </InputGroup>
      <InputGroup label="CDS Group" required>
        <select name="cdsGroup" value={formData.cdsGroup} onChange={handleChange} className={INPUT_CLS}>
          <option value="">Select...</option>
          {CDS_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </InputGroup>
      <InputGroup label="CDS Day" required>
        <select name="cdsDay" value={formData.cdsDay} onChange={handleChange} className={INPUT_CLS}>
          <option value="">Select...</option>
          {CDS_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </InputGroup>
      <InputGroup label="PPA (Place of Primary Assignment)" required>
        <input name="ppa" value={formData.ppa} onChange={handleChange} className={INPUT_CLS} />
      </InputGroup>
    </div>
  </div>
);