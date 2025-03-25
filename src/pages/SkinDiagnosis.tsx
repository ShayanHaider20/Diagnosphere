
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { diagnosisAPI } from '@/services/api';
import { 
  AlertTriangle, Download, Share2, FileText, 
  AlertCircle, ExternalLink, Printer, ThumbsUp,
  Calendar, Clock, Microscope, Activity, ArrowRight,
  ChevronRight, Pill, Stethoscope
} from 'lucide-react';

interface DiagnosisResult {
  id: string;
  imageUrl: string;
  date: string;
  conditions: {
    name: string;
    probability: number;
    description: string;
    nextSteps: string[];
    treatments?: string[];
    severity?: string;
  }[];
  symptoms: Record<string, any>;
  patientInfo?: {
    age?: number;
    gender?: string;
    skinType?: string;
    medicalHistory?: string[];
  };
  analysisDetails?: {
    areaAffected?: string;
    duration?: string;
    characteristics?: string[];
  };
}

// Mock data for demo purposes
const mockDiagnosisData: DiagnosisResult = {
  id: "diag-12345",
  imageUrl: "https://images.unsplash.com/photo-1612776780584-bdf3855a4e80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80",
  date: new Date().toISOString(),
  conditions: [
    {
      name: "Eczema (Atopic Dermatitis)",
      probability: 87,
      severity: "Moderate",
      description: "A chronic inflammatory skin condition characterized by dry, itchy, and inflamed skin. It often appears in patches and can cause significant discomfort.",
      nextSteps: [
        "Consult with a dermatologist for proper evaluation and treatment plan",
        "Avoid triggers such as harsh soaps, certain fabrics, and extreme temperatures",
        "Keep skin moisturized with fragrance-free emollients",
        "Apply prescribed topical medications as directed"
      ],
      treatments: [
        "Topical corticosteroids to reduce inflammation",
        "Calcineurin inhibitors (tacrolimus, pimecrolimus)",
        "Moisturizers and emollients to maintain skin hydration",
        "Antihistamines for itching relief",
        "Phototherapy for severe cases"
      ]
    },
    {
      name: "Contact Dermatitis",
      probability: 42,
      severity: "Mild",
      description: "An inflammatory skin condition resulting from contact with allergens or irritants. It causes redness, itching, and sometimes blistering at the site of contact.",
      nextSteps: [
        "Identify and avoid potential allergens or irritants",
        "Use hypoallergenic products for skin care and cleaning",
        "Apply cool compresses to relieve symptoms",
        "Consider patch testing to identify specific allergens"
      ],
      treatments: [
        "Topical corticosteroids for inflammation reduction",
        "Barrier creams to protect skin from irritants",
        "Oral antihistamines for itching",
        "Calamine lotion for symptom relief"
      ]
    },
    {
      name: "Psoriasis",
      probability: 23,
      severity: "Low probability",
      description: "A chronic autoimmune condition that causes rapid skin cell turnover, resulting in thick, red patches with silvery scales. It can affect various body areas.",
      nextSteps: [
        "Monitor for changes in skin condition",
        "Maintain good skin hygiene and moisturizing routine",
        "Consider evaluation if symptoms worsen or change"
      ],
      treatments: [
        "Currently not indicated due to low probability",
        "General skin care with gentle cleansers and moisturizers is recommended"
      ]
    }
  ],
  symptoms: {
    itching: "Moderate to severe",
    redness: "Present in patches",
    flaking: "Mild",
    swelling: "Minimal",
    pain: "None reported",
    duration: "2 weeks"
  },
  patientInfo: {
    age: 34,
    gender: "Female",
    skinType: "Sensitive/Dry",
    medicalHistory: ["Seasonal allergies", "No previous skin conditions"]
  },
  analysisDetails: {
    areaAffected: "Inner elbow, neck",
    duration: "Approximately 2 weeks",
    characteristics: ["Red patches", "Dry, flaky skin", "Intense itching at night", "Worsens with stress"]
  }
};

const SkinDiagnosis = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDiagnosisResult = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        // For demo/development, use mock data instead of API call
        // In production, uncomment the API call and remove the mock data
        // const data = await diagnosisAPI.getResults(id);
        setTimeout(() => {
          setResult(mockDiagnosisData);
          setIsLoading(false);
        }, 1500); // Simulate loading delay
      } catch (error) {
        console.error('Error fetching diagnosis result:', error);
        setError('Failed to load the diagnosis results. Please try again later.');
        toast.error('Error loading diagnosis results');
        setIsLoading(false);
      }
    };

    fetchDiagnosisResult();
  }, [id]);

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
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-10 w-3/4 mx-auto mb-4 bg-white/5" />
              <Skeleton className="h-4 w-1/2 mx-auto mb-12 bg-white/5" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-[300px] w-full rounded-xl bg-white/5" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-4 w-2/3 bg-white/5" />
                  
                  <div className="pt-4">
                    <Skeleton className="h-6 w-1/2 bg-white/5" />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Skeleton className="h-10 w-full bg-white/5" />
                      <Skeleton className="h-10 w-full bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center p-8 bg-white/5 border border-white/10 rounded-xl max-w-md">
            <AlertTriangle className="h-12 w-12 text-diagnosphere-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Diagnosis Not Found</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link to="/skin-check">
              <Button className="bg-diagnosphere-primary hover:bg-diagnosphere-primary/90">
                Try a New Diagnosis
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Medical Diagnosis Report
                </h1>
                <p className="text-gray-400 mt-2">
                  Report ID: {result?.id} • Generated on {new Date(result?.date || "").toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/10 text-white hover:bg-white/5"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-1" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/10 text-white hover:bg-white/5"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button 
                  size="sm" 
                  className="bg-diagnosphere-primary hover:bg-diagnosphere-primary/90"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </motion.div>

            {/* Alert Banner */}
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-8 flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-400 font-medium">Important Medical Disclaimer</h3>
                <p className="text-yellow-200/70 text-sm mt-1">
                  This AI-generated diagnosis is provided for informational purposes only and does not constitute professional medical advice. 
                  Always consult with a qualified healthcare provider for proper evaluation, diagnosis, and treatment recommendations.
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-white/10 mb-8">
              <div className="flex space-x-1 overflow-x-auto scrollbar-none">
                <Button 
                  variant={activeTab === 'overview' ? 'default' : 'ghost'} 
                  className={activeTab === 'overview' ? 'bg-diagnosphere-primary text-white' : 'text-white/70 hover:text-white hover:bg-white/5'}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </Button>
                <Button 
                  variant={activeTab === 'details' ? 'default' : 'ghost'} 
                  className={activeTab === 'details' ? 'bg-diagnosphere-primary text-white' : 'text-white/70 hover:text-white hover:bg-white/5'} 
                  onClick={() => setActiveTab('details')}
                >
                  Analysis Details
                </Button>
                <Button 
                  variant={activeTab === 'treatments' ? 'default' : 'ghost'} 
                  className={activeTab === 'treatments' ? 'bg-diagnosphere-primary text-white' : 'text-white/70 hover:text-white hover:bg-white/5'} 
                  onClick={() => setActiveTab('treatments')}
                >
                  Treatment Options
                </Button>
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && result && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-xl overflow-hidden border border-white/20"
                  >
                    <img
                      src={result.imageUrl}
                      alt="Analyzed skin"
                      className="w-full object-cover h-[300px]"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-white text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Uploaded on {new Date(result.date).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                        <Microscope className="w-5 h-5 mr-2 text-diagnosphere-primary" />
                        Primary Diagnosis
                      </h2>
                      
                      <div className="space-y-3">
                        {result.conditions.slice(0, 1).map((condition, index) => (
                          <div key={index} className="bg-diagnosphere-primary/10 p-4 rounded-lg border border-diagnosphere-primary/30">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white text-lg">{condition.name}</h3>
                              <span 
                                className="text-sm font-medium px-3 py-1 rounded-full bg-diagnosphere-primary/30 text-diagnosphere-primary"
                              >
                                {condition.probability}% Match
                              </span>
                            </div>
                            
                            <p className="text-gray-300 mt-2 text-sm">{condition.description}</p>
                            
                            {condition.severity && (
                              <div className="mt-4 flex items-center">
                                <span className="text-white text-sm font-medium">Severity:</span>
                                <span className={`ml-2 text-sm px-2 py-0.5 rounded ${
                                  condition.severity === 'Severe' 
                                    ? 'bg-red-500/20 text-red-400' 
                                    : condition.severity === 'Moderate'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-green-500/20 text-green-400'
                                }`}>
                                  {condition.severity}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-diagnosphere-primary" />
                        Recommended Next Steps
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        {result.conditions[0].nextSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <ChevronRight className="w-4 h-4 text-diagnosphere-primary mt-0.5 mr-2 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Secondary Potential Conditions</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {result.conditions.slice(1).map((condition, index) => (
                      <div 
                        key={index} 
                        className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-white">{condition.name}</h3>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                            {condition.probability}% match
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2">{condition.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-medium text-white mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-diagnosphere-primary" />
                      Patient Information
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-400">Age:</span>
                        <span className="text-white">{result.patientInfo?.age || 'Not provided'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Gender:</span>
                        <span className="text-white">{result.patientInfo?.gender || 'Not provided'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Skin Type:</span>
                        <span className="text-white">{result.patientInfo?.skinType || 'Not provided'}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-medium text-white mb-3 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-diagnosphere-primary" />
                      Condition Timeline
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{result.analysisDetails?.duration || 'Not provided'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Area Affected:</span>
                        <span className="text-white">{result.analysisDetails?.areaAffected || 'Not provided'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Diagnosis Date:</span>
                        <span className="text-white">{new Date(result.date).toLocaleDateString()}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-medium text-white mb-3 flex items-center">
                      <Stethoscope className="w-5 h-5 mr-2 text-diagnosphere-primary" />
                      Medical History
                    </h3>
                    {result.patientInfo?.medicalHistory && result.patientInfo.medicalHistory.length > 0 ? (
                      <ul className="space-y-1 text-sm">
                        {result.patientInfo.medicalHistory.map((item, idx) => (
                          <li key={idx} className="text-gray-300 flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-diagnosphere-primary mt-1.5 mr-2"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-sm">No relevant medical history provided</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && result && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 h-full">
                      <h3 className="font-medium text-white mb-4">Reported Symptoms</h3>
                      <div className="space-y-3">
                        {Object.entries(result.symptoms).filter(([key]) => key !== 'duration').map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <span className="text-gray-300 capitalize">{key}:</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h3 className="font-medium text-white mb-4">Condition Characteristics</h3>
                      
                      {result.analysisDetails?.characteristics && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {result.analysisDetails.characteristics.map((characteristic, idx) => (
                            <div key={idx} className="flex items-start bg-white/5 p-3 rounded-lg">
                              <span className="inline-block w-2 h-2 rounded-full bg-diagnosphere-primary mt-1.5 mr-2"></span>
                              <span className="text-gray-300 text-sm">{characteristic}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-6">
                      <h3 className="font-medium text-white mb-4">Analysis Methodology</h3>
                      <p className="text-gray-300 text-sm mb-4">
                        This analysis uses artificial intelligence to evaluate the uploaded image and reported symptoms. 
                        The system compares the data against a database of known skin conditions and provides confidence 
                        percentages based on visual and symptomatic similarities.
                      </p>
                      
                      <div className="bg-diagnosphere-primary/10 border border-diagnosphere-primary/20 rounded-lg p-4">
                        <h4 className="text-diagnosphere-primary text-sm font-medium mb-2">Confidence Assessment</h4>
                        <p className="text-gray-300 text-sm">
                          The primary diagnosis has a high confidence level ({result.conditions[0].probability}%) based on 
                          consistent presentation with typical {result.conditions[0].name} cases. Secondary conditions are 
                          listed for differential diagnosis consideration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-medium text-white mb-4">Detailed Diagnosis Explanation</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white font-medium mb-2">{result.conditions[0].name}</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        Based on the analysis of your skin image and reported symptoms, the AI model has identified patterns 
                        consistent with {result.conditions[0].name}. The presentation shows typical characteristics including
                        {result.analysisDetails?.characteristics?.slice(0, 2).join(', ')}. 
                        These features, combined with your reported symptoms of
                        {Object.entries(result.symptoms)
                          .filter(([key, value]) => key !== 'duration' && value.toString().toLowerCase() !== 'none' && value.toString().toLowerCase() !== 'none reported')
                          .map(([key]) => ` ${key}`)
                          .join(', ')}, 
                        strongly suggest this diagnosis.
                      </p>
                      
                      <div className="bg-white/5 p-4 rounded-lg mt-3">
                        <h5 className="text-white text-sm font-medium mb-2">Key Diagnostic Indicators:</h5>
                        <ul className="space-y-1">
                          <li className="text-gray-300 text-sm flex items-start">
                            <ArrowRight className="w-3 h-3 text-diagnosphere-primary mt-1 mr-2 flex-shrink-0" />
                            Visual presentation in the affected areas matches known patterns
                          </li>
                          <li className="text-gray-300 text-sm flex items-start">
                            <ArrowRight className="w-3 h-3 text-diagnosphere-primary mt-1 mr-2 flex-shrink-0" />
                            Symptom profile aligns with typical patient experiences
                          </li>
                          <li className="text-gray-300 text-sm flex items-start">
                            <ArrowRight className="w-3 h-3 text-diagnosphere-primary mt-1 mr-2 flex-shrink-0" />
                            Duration and progression are consistent with condition development
                          </li>
                          <li className="text-gray-300 text-sm flex items-start">
                            <ArrowRight className="w-3 h-3 text-diagnosphere-primary mt-1 mr-2 flex-shrink-0" />
                            Affected areas ({result.analysisDetails?.areaAffected}) are common sites for this condition
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Differential Diagnoses</h4>
                      <p className="text-gray-300 text-sm mb-3">
                        While the primary diagnosis shows strong probability, these alternative conditions 
                        should be considered due to some overlapping symptoms:
                      </p>
                      
                      <div className="space-y-2 mt-3">
                        {result.conditions.slice(1).map((condition, idx) => (
                          <div key={idx} className="bg-white/5 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <h5 className="text-white text-sm font-medium">{condition.name}</h5>
                              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                                {condition.probability}% match
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs mt-1">{condition.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Treatments Tab */}
            {activeTab === 'treatments' && result && (
              <div className="space-y-8">
                <div className="bg-diagnosphere-primary/10 border border-diagnosphere-primary/30 rounded-xl p-6">
                  <div className="flex items-start">
                    <Pill className="w-6 h-6 text-diagnosphere-primary mr-3 flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-semibold text-white">Treatment Options for {result.conditions[0].name}</h2>
                      <p className="text-gray-300 mt-2">
                        The following treatment approaches are commonly recommended for this condition. Your healthcare 
                        provider will determine the most appropriate treatment plan based on your specific case.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.conditions[0].treatments?.map((treatment, idx) => (
                      <div key={idx} className="bg-white/10 p-4 rounded-lg border border-white/5">
                        <div className="flex items-start">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-diagnosphere-primary/20 text-diagnosphere-primary text-xs font-medium mr-3 flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-white text-sm">{treatment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-medium text-white mb-4">Lifestyle Recommendations</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <ThumbsUp className="w-4 h-4 text-diagnosphere-primary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">Skin Care Routine</p>
                          <p className="text-gray-400 text-sm">Use gentle, fragrance-free cleansers and apply moisturizer regularly to maintain skin hydration.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <ThumbsUp className="w-4 h-4 text-diagnosphere-primary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">Avoid Triggers</p>
                          <p className="text-gray-400 text-sm">Identify and avoid potential irritants such as harsh soaps, certain fabrics, and extreme temperatures.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <ThumbsUp className="w-4 h-4 text-diagnosphere-primary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">Stress Management</p>
                          <p className="text-gray-400 text-sm">Practice stress-reduction techniques like meditation or yoga, as stress can exacerbate symptoms.</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <ThumbsUp className="w-4 h-4 text-diagnosphere-primary mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">Dietary Considerations</p>
                          <p className="text-gray-400 text-sm">Maintain a balanced diet rich in anti-inflammatory foods and consider keeping a food diary to identify potential triggers.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-medium text-white mb-4">When to Seek Medical Attention</h3>
                    <div className="space-y-3">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <h4 className="text-red-400 text-sm font-medium mb-1">Urgent Symptoms</h4>
                        <p className="text-gray-300 text-sm">
                          Seek immediate medical attention if you experience severe swelling, difficulty breathing, 
                          spreading infection, or fever with your skin condition.
                        </p>
                      </div>
                      
                      <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
                        <h4 className="text-yellow-500 text-sm font-medium mb-1">Follow-up Care</h4>
                        <p className="text-gray-300 text-sm">
                          Schedule a follow-up appointment with a dermatologist to:
                        </p>
                        <ul className="mt-2 space-y-1">
                          <li className="text-gray-300 text-sm flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 mr-2"></span>
                            Confirm this AI diagnosis
                          </li>
                          <li className="text-gray-300 text-sm flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 mr-2"></span>
                            Establish a personalized treatment plan
                          </li>
                          <li className="text-gray-300 text-sm flex items-start">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 mr-2"></span>
                            Monitor your response to treatment
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        size="sm" 
                        className="w-full bg-diagnosphere-primary hover:bg-diagnosphere-primary/90"
                        asChild
                      >
                        <Link to="/contact">
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Find a Specialist
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-medium text-white mb-4">Additional Resources</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                      <h4 className="font-medium text-white text-sm mb-2">American Academy of Dermatology</h4>
                      <p className="text-gray-400 text-xs mb-3">
                        Comprehensive information on skin conditions, treatment options, and finding a dermatologist.
                      </p>
                      <Button variant="link" size="sm" className="text-diagnosphere-primary p-0 h-auto flex items-center">
                        Visit Website <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                      <h4 className="font-medium text-white text-sm mb-2">National Eczema Association</h4>
                      <p className="text-gray-400 text-xs mb-3">
                        Resources for understanding and managing eczema and related skin conditions.
                      </p>
                      <Button variant="link" size="sm" className="text-diagnosphere-primary p-0 h-auto flex items-center">
                        Visit Website <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 flex justify-center">
              <Link to="/skin-check">
                <Button 
                  variant="outline" 
                  className="mr-4 border-white/10 text-white hover:bg-white/5"
                >
                  Start a New Diagnosis
                </Button>
              </Link>
              <Button 
                className="bg-diagnosphere-primary hover:bg-diagnosphere-primary/90"
                asChild
              >
                <Link to="/dashboard">View Your History</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SkinDiagnosis;
