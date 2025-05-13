import { useState } from 'react';
import { UCPForm } from './UCPForm';
import { TCFForm } from './TCFForm';
import { EFForm } from './EFForm';
import { Results } from './Results';
import { Instructions } from './Instructions';
import { AIChatBox } from './AIChatBox';
import { CalculatorIcon, InfoIcon, SettingsIcon, ChevronRightIcon, BotMessageSquare } from 'lucide-react';

export interface UAWData {
  simple: number;
  average: number;
  complex: number;
}

export interface UUCWData {
  simple: number;
  average: number;
  complex: number;
}

export interface UCPData {
  uaw: UAWData;
  uucw: UUCWData;
}

interface Factor {
  id: number;
  name: string;
  weight: number;
  value: number;
}

interface TCFData {
  factors: Factor[];
}

interface EFData {
  factors: Factor[];
}

interface FormData {
  ucp: UCPData;
  tcf: TCFData;
  ef: EFData;
  productivityFactor: number;
}

interface AIAnalysisValues {
  uaw?: {
    simple?: number;
    average?: number;
    complex?: number;
    total?: number;
  };
  uucw?: {
    simple?: number;
    average?: number;
    complex?: number;
    total?: number;
  };
  tcf?: {
    factors?: {
      id: number;
      value: number;
    }[];
  };
  ef?: {
    factors?: {
      id: number;
      value: number;
    }[];
  };
  explanation?: string;
}

export function Calculator() {
  const [activeTab, setActiveTab] = useState('ucp');
  const [formData, setFormData] = useState<FormData>({
    ucp: {
      uaw: {
        simple: 0,
        average: 0,
        complex: 0
      },
      uucw: {
        simple: 0,
        average: 0,
        complex: 0
      }
    },
    tcf: {
      factors: [{
        id: 1,
        name: 'Distributed System',
        weight: 2,
        value: 3
      }, {
        id: 2,
        name: 'Response Time/Performance',
        weight: 1,
        value: 3
      }, {
        id: 3,
        name: 'End-User Efficiency',
        weight: 1,
        value: 3
      }, {
        id: 4,
        name: 'Complex Processing',
        weight: 1,
        value: 3
      }, {
        id: 5,
        name: 'Reusability',
        weight: 1,
        value: 3
      }, {
        id: 6,
        name: 'Easy to Install',
        weight: 0.5,
        value: 3
      }, {
        id: 7,
        name: 'Easy to Use',
        weight: 0.5,
        value: 3
      }, {
        id: 8,
        name: 'Portability',
        weight: 2,
        value: 3
      }, {
        id: 9,
        name: 'Easy to Change',
        weight: 1,
        value: 3
      }, {
        id: 10,
        name: 'Concurrency',
        weight: 1,
        value: 3
      }, {
        id: 11,
        name: 'Special Security Features',
        weight: 1,
        value: 3
      }, {
        id: 12,
        name: 'Direct Access for Third Parties',
        weight: 1,
        value: 3
      }, {
        id: 13,
        name: 'Special User Training Facilities',
        weight: 1,
        value: 3
      }]
    },
    ef: {
      factors: [{
        id: 1,
        name: 'Familiarity with Project',
        weight: 1.5,
        value: 3
      }, {
        id: 2,
        name: 'Application Experience',
        weight: 0.5,
        value: 3
      }, {
        id: 3,
        name: 'Object-Oriented Experience',
        weight: 1,
        value: 3
      }, {
        id: 4,
        name: 'Lead Analyst Capability',
        weight: 0.5,
        value: 3
      }, {
        id: 5,
        name: 'Motivation',
        weight: 1,
        value: 3
      }, {
        id: 6,
        name: 'Stable Requirements',
        weight: 2,
        value: 3
      }, {
        id: 7,
        name: 'Part-Time Staff',
        weight: -1,
        value: 3
      }, {
        id: 8,
        name: 'Difficult Programming Language',
        weight: -1,
        value: 3
      }]
    },
    productivityFactor: 20
  });
  const calculateUUCP = () => {
    const {
      uaw,
      uucw
    } = formData.ucp;
    const uawTotal = uaw.simple * 1 + uaw.average * 2 + uaw.complex * 3;
    const uucwTotal = uucw.simple * 5 + uucw.average * 10 + uucw.complex * 15;
    return uawTotal + uucwTotal;
  };
  const calculateTCF = () => {
    const tfSum = formData.tcf.factors.reduce((sum, factor) => {
      return sum + factor.weight * factor.value;
    }, 0);
    return 0.6 + 0.01 * tfSum;
  };
  const calculateEF = () => {
    const efSum = formData.ef.factors.reduce((sum, factor) => {
      return sum + factor.weight * factor.value;
    }, 0);
    return 1.4 + -0.03 * efSum;
  };
  const calculateUCP = () => {
    const uucp = calculateUUCP();
    const tcf = calculateTCF();
    const ef = calculateEF();
    return uucp * tcf * ef;
  };
  const calculateEffort = () => {
    const ucp = calculateUCP();
    return ucp * formData.productivityFactor;
  };
  const handleInputChange = (section: keyof FormData, data: any) => {
    setFormData({
      ...formData,
      [section]: data
    });
  };
  const handleProductivityFactorChange = (value: number) => {
    setFormData({
      ...formData,
      productivityFactor: value
    });
  };

  const handleAIAnalysisValues = (values: AIAnalysisValues) => {
    console.log("Calculator received values:", values);
    let shouldUpdateUI = false;

    // Update UCP values (UAW & UUCW)
    if (values.uaw || values.uucw) {
      shouldUpdateUI = true;

      // Create a new UCP object with updated values
      const newUCP = {
        ...formData.ucp
      };

      // Update UAW values if provided
      if (values.uaw) {
        newUCP.uaw = {
          simple: values.uaw.simple !== undefined ? Number(values.uaw.simple) : formData.ucp.uaw.simple,
          average: values.uaw.average !== undefined ? Number(values.uaw.average) : formData.ucp.uaw.average,
          complex: values.uaw.complex !== undefined ? Number(values.uaw.complex) : formData.ucp.uaw.complex
        };
        console.log("Updated UAW values:", newUCP.uaw);
      }

      // Update UUCW values if provided
      if (values.uucw) {
        newUCP.uucw = {
          simple: values.uucw.simple !== undefined ? Number(values.uucw.simple) : formData.ucp.uucw.simple,
          average: values.uucw.average !== undefined ? Number(values.uucw.average) : formData.ucp.uucw.average,
          complex: values.uucw.complex !== undefined ? Number(values.uucw.complex) : formData.ucp.uucw.complex
        };
        console.log("Updated UUCW values:", newUCP.uucw);
      }

      // Apply the UCP updates - using the function directly to ensure state updates
      setFormData(prev => ({
        ...prev,
        ucp: newUCP
      }));
    }

    // Update TCF values if provided
    if (values.tcf && values.tcf.factors && values.tcf.factors.length > 0) {
      shouldUpdateUI = true;
      const newTCF = {
        ...formData.tcf
      };

      values.tcf.factors.forEach(factor => {
        if (!factor.id || factor.id < 1 || factor.id > 13) {
          console.warn(`Invalid TCF factor ID: ${factor.id}`);
          return;
        }

        const factorIndex = newTCF.factors.findIndex(f => f.id === Number(factor.id));
        if (factorIndex !== -1) {
          newTCF.factors[factorIndex].value = Number(factor.value);
        } else {
          console.warn(`TCF factor with ID ${factor.id} not found in form data`);
        }
      });

      // Apply TCF updates directly
      setFormData(prev => ({
        ...prev,
        tcf: newTCF
      }));
    }

    // Update EF values if provided
    if (values.ef && values.ef.factors && values.ef.factors.length > 0) {
      shouldUpdateUI = true;
      const newEF = {
        ...formData.ef
      };

      values.ef.factors.forEach(factor => {
        // Check if factor.id is a string with spaces (common in malformed JSON)
        const factorId = typeof factor.id === 'string'
          ? Number(String(factor.id).trim())
          : Number(factor.id);

        if (isNaN(factorId) || factorId < 1 || factorId > 8) {
          console.warn(`Invalid EF factor ID: ${factor.id}`);
          return;
        }

        const factorIndex = newEF.factors.findIndex(f => f.id === factorId);
        if (factorIndex !== -1) {
          // Ensure we're setting a proper number value after trimming any whitespace
          const factorValue = typeof factor.value === 'string'
            ? Number(String(factor.value).trim())
            : Number(factor.value);

          newEF.factors[factorIndex].value = isNaN(factorValue) ? 0 : factorValue;
          console.log(`Updated EF factor ${factorId} to value ${newEF.factors[factorIndex].value}`);
        } else {
          console.warn(`EF factor with ID ${factorId} not found in form data`);
        }
      });

      // Apply EF updates directly
      setFormData(prev => ({
        ...prev,
        ef: newEF
      }));
    }

    // Only switch tab if we actually updated something
    if (shouldUpdateUI) {
      console.log("Switching to UCP tab with updated data:", formData);
      setActiveTab('ucp'); // Switch to UCP tab to show filled values
    }
  };

  return <div className="overflow-hidden bg-white rounded-lg shadow-lg">
    <div className="flex border-b">
      <button className={`flex items-center px-4 py-3 ${activeTab === 'ucp' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('ucp')}>
        <CalculatorIcon className="w-4 h-4 mr-2" />
        <span>UCP</span>
      </button>
      <button className={`flex items-center px-4 py-3 ${activeTab === 'tcf' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('tcf')}>
        <SettingsIcon className="w-4 h-4 mr-2" />
        <span>TCF</span>
      </button>
      <button className={`flex items-center px-4 py-3 ${activeTab === 'ef' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('ef')}>
        <SettingsIcon className="w-4 h-4 mr-2" />
        <span>EF</span>
      </button>
      <button className={`flex items-center px-4 py-3 ${activeTab === 'results' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('results')}>
        <ChevronRightIcon className="w-4 h-4 mr-2" />
        <span>Results</span>
      </button>
      <button className={`flex items-center px-4 py-3 ${activeTab === 'ai' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('ai')}>
        <BotMessageSquare className="w-4 h-4 mr-2" />
        <span>AI Assistant</span>
      </button>
      <button className={`flex items-center px-4 py-3 ${activeTab === 'instructions' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => setActiveTab('instructions')}>
        <InfoIcon className="w-4 h-4 mr-2" />
        <span>Instructions</span>
      </button>
    </div>
    <div className="p-4">
      {activeTab === 'ucp' && <UCPForm data={formData.ucp} onChange={(data: UCPData) => handleInputChange('ucp', data)} productivityFactor={formData.productivityFactor} onProductivityFactorChange={handleProductivityFactorChange} />}
      {activeTab === 'tcf' && <TCFForm data={formData.tcf} onChange={(data: TCFData) => handleInputChange('tcf', data)} />}
      {activeTab === 'ef' && <EFForm data={formData.ef} onChange={(data: EFData) => handleInputChange('ef', data)} />}
      {activeTab === 'results' && <Results uucp={calculateUUCP()} tcf={calculateTCF()} ef={calculateEF()} ucp={calculateUCP()} effort={calculateEffort()} productivityFactor={formData.productivityFactor} />}
      {activeTab === 'ai' && <AIChatBox onInsertValues={handleAIAnalysisValues} />}
      {activeTab === 'instructions' && <Instructions />}
    </div>
  </div>;
}