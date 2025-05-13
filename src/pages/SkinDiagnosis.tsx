
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DiagnosisHeader from '@/components/diagnosis/DiagnosisHeader';
import MedicalDisclaimer from '@/components/diagnosis/MedicalDisclaimer';
import DiagnosisTabs from '@/components/diagnosis/DiagnosisTabs';
import DiagnosisActions from '@/components/diagnosis/DiagnosisActions';
import DiagnosisLoading from '@/components/diagnosis/DiagnosisLoading';
import DiagnosisError from '@/components/diagnosis/DiagnosisError';
import OverviewTab from '@/components/diagnosis/tabs/OverviewTab';
import DetailsTab from '@/components/diagnosis/tabs/DetailsTab';
import TreatmentsTab from '@/components/diagnosis/tabs/TreatmentsTab';
import { DiagnosisResult } from '@/types/diagnosis';

const SkinDiagnosis = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const generateDiagnosisResult = () => {
      try {
        setIsLoading(true);
        // Get prediction from location state if available
        const predictionData = location.state?.prediction;
        
        if (!predictionData) {
          setError('No diagnosis data found. Please try again.');
          toast.error('Error loading diagnosis results');
          setIsLoading(false);
          return;
        }
        
        // Map the Flask prediction to our DiagnosisResult format
        const condition = {
          name: capitalizeFirstLetter(predictionData.prediction),
          probability: predictionData.confidence,
          severity: getSeverity(predictionData.confidence),
          description: getDescription(predictionData.prediction),
          nextSteps: getNextSteps(predictionData.prediction),
          treatments: getTreatments(predictionData.prediction)
        };
        
        // Calculate other possible conditions with lower probabilities
        const otherConditions = Object.entries(predictionData.all_predictions)
          .filter(([name]) => name !== predictionData.prediction.toLowerCase())
          .map(([name, probability]) => ({
            name: capitalizeFirstLetter(name),
            probability: probability as number,
            severity: getSeverity(probability as number),
            description: getDescription(name),
            nextSteps: getNextSteps(name),
            treatments: getTreatments(name)
          }))
          .sort((a, b) => b.probability - a.probability);
        
        // Create the diagnosis result object
        const diagnosisResult: DiagnosisResult = {
          id: id || 'diag-unknown',
          imageUrl: location.state?.imageUrl || "https://images.unsplash.com/photo-1612776780584-bdf3855a4e80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
          date: new Date().toISOString(),
          conditions: [condition, ...otherConditions],
          symptoms: {
            itching: "Not provided",
            redness: "Not provided",
            flaking: "Not provided",
            swelling: "Not provided",
            pain: "Not provided",
            duration: "Not provided"
          },
          patientInfo: {
            age: 0,
            gender: "Not provided",
            skinType: "Not provided",
            medicalHistory: []
          },
          analysisDetails: {
            areaAffected: "Not provided",
            duration: "Not provided",
            characteristics: []
          }
        };
        
        setResult(diagnosisResult);
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating diagnosis result:', error);
        setError('Failed to load the diagnosis results. Please try again later.');
        toast.error('Error loading diagnosis results');
        setIsLoading(false);
      }
    };

    generateDiagnosisResult();
  }, [id, location.state]);

  // Helper functions for creating the diagnosis result
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getSeverity = (probability: number) => {
    if (probability >= 80) return "High";
    if (probability >= 60) return "Moderate";
    if (probability >= 40) return "Low";
    return "Very Low";
  };

  const getDescription = (condition: string) => {
    const descriptions: Record<string, string> = {
      eczema: "A chronic inflammatory skin condition characterized by dry, itchy, and inflamed skin. It often appears in patches and can cause significant discomfort.",
      psoriasis: "A chronic autoimmune condition that causes rapid skin cell turnover, resulting in thick, red patches with silvery scales. It can affect various body areas.",
      melanoma: "A serious form of skin cancer that develops in melanocytes (cells that produce melanin). It can appear as a new spot or changes in an existing mole."
    };
    return descriptions[condition.toLowerCase()] || "No description available.";
  };

  const getNextSteps = (condition: string) => {
    const nextSteps: Record<string, string[]> = {
      eczema: [
        "Consult with a dermatologist for proper evaluation and treatment plan",
        "Avoid triggers such as harsh soaps, certain fabrics, and extreme temperatures",
        "Keep skin moisturized with fragrance-free emollients",
        "Apply prescribed topical medications as directed"
      ],
      psoriasis: [
        "Consult with a dermatologist for evaluation and treatment options",
        "Maintain a consistent skincare routine with gentle products",
        "Apply prescribed medications as directed",
        "Consider lifestyle changes to reduce triggers"
      ],
      melanoma: [
        "Seek immediate medical attention from a dermatologist or oncologist",
        "Follow up for a professional biopsy and diagnosis",
        "Discuss treatment options based on staging",
        "Schedule regular skin checks for early detection of any new concerns"
      ]
    };
    return nextSteps[condition.toLowerCase()] || ["Consult with a healthcare provider for proper diagnosis and treatment."];
  };

  const getTreatments = (condition: string) => {
    const treatments: Record<string, string[]> = {
      eczema: [
        "Topical corticosteroids to reduce inflammation",
        "Calcineurin inhibitors (tacrolimus, pimecrolimus)",
        "Moisturizers and emollients to maintain skin hydration",
        "Antihistamines for itching relief",
        "Phototherapy for severe cases"
      ],
      psoriasis: [
        "Topical treatments (corticosteroids, vitamin D analogs)",
        "Phototherapy with UVB light",
        "Systemic medications for severe cases",
        "Biologic drugs that target specific parts of the immune system",
        "Lifestyle modifications to reduce triggers"
      ],
      melanoma: [
        "Surgical removal of the melanoma and surrounding tissue",
        "Lymph node biopsy to check for spread",
        "Immunotherapy to help the immune system fight cancer cells",
        "Targeted therapy for melanomas with specific gene mutations",
        "Radiation therapy for certain cases"
      ]
    };
    return treatments[condition.toLowerCase()] || ["Specific treatments should be recommended by a healthcare provider after proper diagnosis."];
  };

  const handleDownloadPDF = () => {
    toast.success('Your PDF report is being generated and will download shortly.');
    // In a real implementation, this would call an API endpoint to generate and download a PDF
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened.');
  };

  if (isLoading) {
    return <DiagnosisLoading />;
  }

  if (error) {
    return <DiagnosisError error={error} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <DiagnosisHeader 
              id={result?.id || ''} 
              date={result?.date || ''} 
              onShare={handleShare}
              onPrint={handlePrint}
              onDownload={handleDownloadPDF}
            />

            <MedicalDisclaimer />

            <DiagnosisTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />

            {activeTab === 'overview' && result && (
              <OverviewTab result={result} />
            )}

            {activeTab === 'details' && result && (
              <DetailsTab result={result} />
            )}

            {activeTab === 'treatments' && result && (
              <TreatmentsTab result={result} />
            )}

            <DiagnosisActions />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SkinDiagnosis;
