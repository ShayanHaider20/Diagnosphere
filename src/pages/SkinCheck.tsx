
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageUploader from '@/components/ImageUploader';
import DiagnosisForm from '@/components/DiagnosisForm';
import { Button } from '@/components/ui/button';
import { diagnosisAPI } from '@/services/api';
import { Upload, FileText, CheckCircle } from 'lucide-react';

const SkinCheck = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  
  // Load the model when component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        await diagnosisAPI.loadModel();
        toast.success("Skin analysis model loaded successfully!");
        setModelLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        toast.error("Failed to load the skin analysis model. Some features may be unavailable.");
        setModelLoading(false);
      }
    };
    
    loadModel();
  }, []);

  const handleImageSelected = async (file: File) => {
    setSelectedImage(file);
    setIsLoading(true);
    
    try {
      // Upload the image to the Flask backend for diagnosis
      const response = await diagnosisAPI.uploadImage(file);
      
      if (response.status === 'success') {
        // Store the prediction
        setPrediction(response);
        toast.success(`Analysis complete: ${response.prediction} detected with ${response.confidence.toFixed(2)}% confidence`);
        
        // Generate a temporary diagnosis ID
        const tempId = 'diag-' + Date.now().toString();
        setDiagnosisId(tempId);
        
        // Move to the next step after successful upload
        setCurrentStep(1);
      } else {
        throw new Error(response.message || 'Failed to analyze image');
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (!diagnosisId) {
      toast.error("Missing diagnosis ID. Please restart the process.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, you would submit form data to the server
      // For now, we'll skip this step and just navigate to results
      
      // Navigate to results page with the diagnosis ID
      navigate(`/diagnosis-results/${diagnosisId}`, { 
        state: { 
          prediction: prediction,
          formData: formData
        }
      });
    } catch (error) {
      console.error("Error submitting symptoms:", error);
      toast.error("Failed to submit symptoms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      id: 'upload',
      title: 'Upload Image',
      description: 'Upload a clear photo of the affected skin area',
      icon: <Upload className="w-5 h-5" />,
      component: <ImageUploader onImageSelected={handleImageSelected} isLoading={isLoading} />,
    },
    {
      id: 'symptoms',
      title: 'Symptom Details',
      description: 'Tell us more about your symptoms',
      icon: <FileText className="w-5 h-5" />,
      component: <DiagnosisForm onSubmit={handleFormSubmit} prediction={prediction} />,
    },
  ];

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
              Check Your Skin Type
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-center mb-12 max-w-2xl mx-auto"
            >
              Our AI-powered tool analyzes your skin and provides personalized recommendations. Follow the steps below to get started.
            </motion.p>

            {/* Model loading indicator */}
            {modelLoading && (
              <div className="mb-6 text-center">
                <div className="inline-block p-3 rounded-full bg-diagnosphere-primary/20 animate-pulse mb-3">
                  <div className="w-6 h-6 border-2 border-diagnosphere-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-diagnosphere-primary">Loading skin analysis model...</p>
              </div>
            )}

            <div className="flex justify-between mb-12">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <div className="relative w-full mb-2">
                    <div
                      className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-white/10"
                      style={{
                        right: index === steps.length - 1 ? '50%' : 0,
                        left: index === 0 ? '50%' : 0,
                      }}
                    />
                    <div
                      className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-diagnosphere-primary transition-all duration-500 ${
                        index < currentStep ? 'right-0' : index === currentStep ? 'right-1/2' : 'right-full'
                      }`}
                      style={{
                        right: index === steps.length - 1 ? '50%' : 0,
                        left: index === 0 ? '50%' : 0,
                      }}
                    />
                    <div
                      className={`relative z-10 mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        index < currentStep
                          ? 'bg-diagnosphere-primary text-white'
                          : index === currentStep
                          ? 'bg-diagnosphere-primary/20 border-2 border-diagnosphere-primary text-white'
                          : 'bg-white/5 border-2 border-white/20 text-white/50'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                  </div>
                  <h3 className={`text-center font-medium mt-2 ${
                    index === currentStep ? 'text-diagnosphere-primary' : 'text-white/70'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs text-center mt-1 ${
                    index === currentStep ? 'text-white/70' : 'text-white/40'
                  }`}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SkinCheck;
