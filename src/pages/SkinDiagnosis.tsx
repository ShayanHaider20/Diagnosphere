
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { diagnosisAPI } from '@/services/api';
import { AlertTriangle, Download, Share2, FileText } from 'lucide-react';

interface DiagnosisResult {
  id: string;
  imageUrl: string;
  date: string;
  conditions: {
    name: string;
    probability: number;
    description: string;
    nextSteps: string[];
  }[];
  symptoms: Record<string, any>;
}

const SkinDiagnosis = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnosisResult = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await diagnosisAPI.getResults(id);
        setResult(data);
      } catch (error) {
        console.error('Error fetching diagnosis result:', error);
        setError('Failed to load the diagnosis results. Please try again later.');
        toast.error('Error loading diagnosis results');
      } finally {
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
          <div className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold text-white text-center mb-3"
            >
              Your Skin Diagnosis Results
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-center mb-12 max-w-2xl mx-auto"
            >
              Based on your uploaded image and symptom information, our AI has analyzed your skin condition.
            </motion.p>

            {result && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative rounded-xl overflow-hidden border border-white/20"
                >
                  <img
                    src={result.imageUrl}
                    alt="Analyzed skin"
                    className="w-full object-cover max-h-[400px]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-white text-sm">
                      Uploaded on {new Date(result.date).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-3">Potential Conditions</h2>
                    <div className="space-y-4">
                      {result.conditions.map((condition, index) => (
                        <div 
                          key={index} 
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-diagnosphere-primary/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-white">{condition.name}</h3>
                            <span 
                              className={`text-sm font-medium px-2 py-1 rounded ${
                                condition.probability > 75 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : condition.probability > 50 
                                  ? 'bg-yellow-500/20 text-yellow-400' 
                                  : 'bg-green-500/20 text-green-400'
                              }`}
                            >
                              {condition.probability}% match
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{condition.description}</p>
                          <div>
                            <h4 className="text-white text-xs font-medium mb-1">Recommended next steps:</h4>
                            <ul className="text-gray-400 text-xs space-y-1">
                              {condition.nextSteps.map((step, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-diagnosphere-primary mt-1.5 mr-2"></span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-medium text-white mb-3">Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={handleDownloadPDF}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button 
                        onClick={handleShare}
                        className="bg-diagnosphere-primary hover:bg-diagnosphere-primary/90"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Results
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-diagnosphere-primary/20 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-diagnosphere-primary" />
                </div>
                <h2 className="text-xl font-semibold text-white">Important Disclaimer</h2>
              </div>
              <p className="text-gray-400 text-sm">
                This AI-based analysis is meant for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>

            <div className="text-center">
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
                <Link to="/contact">Consult a Specialist</Link>
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
