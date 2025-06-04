
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, ExternalLink, BarChart3, BookOpen } from 'lucide-react';

type WorkflowStep = 'input' | 'processing' | 'selection' | 'paper-view' | 'analysis';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  journal: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('input');
  const [topicKeyword, setTopicKeyword] = useState('');
  const [yearsBack, setYearsBack] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [analysisSheetUrl, setAnalysisSheetUrl] = useState('');
  const { toast } = useToast();

  const handleSubmitSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topicKeyword || !yearsBack) {
      toast({
        title: "Missing Information",
        description: "Please fill in both topic keyword and years back",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentStep('processing');
    
    // Simulate API call to n8n workflow
    setTimeout(() => {
      setGoogleSheetUrl('https://docs.google.com/spreadsheets/d/example-sheet-id');
      setCurrentStep('selection');
      setIsLoading(false);
      toast({
        title: "Research Papers Found!",
        description: "Check the Google Sheet to select your desired paper",
      });
    }, 3000);
  };

  const handlePaperSelection = () => {
    // Simulate paper selection from Google Sheet
    const mockPaper: ResearchPaper = {
      id: '1',
      title: `Advanced Research in ${topicKeyword}: A Comprehensive Analysis`,
      authors: ['Dr. Jane Smith', 'Prof. John Doe', 'Dr. Maria Garcia'],
      year: 2024 - parseInt(yearsBack) + 1,
      abstract: `This paper presents a comprehensive analysis of ${topicKeyword} research trends and methodologies. The study examines various approaches and their effectiveness in addressing current challenges in the field.`,
      journal: 'Journal of Advanced Research'
    };
    
    setSelectedPaper(mockPaper);
    setCurrentStep('paper-view');
    toast({
      title: "Paper Selected",
      description: "Paper details loaded successfully",
    });
  };

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    
    // Simulate running another n8n flow for analysis
    setTimeout(() => {
      setAnalysisSheetUrl('https://docs.google.com/spreadsheets/d/analysis-sheet-id');
      setCurrentStep('analysis');
      setIsLoading(false);
      toast({
        title: "Analysis Complete!",
        description: "Your research data analysis is ready",
      });
    }, 2500);
  };

  const resetWorkflow = () => {
    setCurrentStep('input');
    setTopicKeyword('');
    setYearsBack('');
    setGoogleSheetUrl('');
    setSelectedPaper(null);
    setAnalysisSheetUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-800">Research Paper Analytics</h1>
          </div>
          <p className="text-slate-600 text-lg">Discover, analyze, and visualize academic research data</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[
            { step: 'input', label: 'Search', icon: Search },
            { step: 'processing', label: 'Processing', icon: FileText },
            { step: 'selection', label: 'Selection', icon: ExternalLink },
            { step: 'paper-view', label: 'Review', icon: BookOpen },
            { step: 'analysis', label: 'Analysis', icon: BarChart3 }
          ].map(({ step, label, icon: Icon }, index) => (
            <React.Fragment key={step}>
              <div className={`flex flex-col items-center ${
                currentStep === step ? 'text-blue-600' : 
                ['input', 'processing', 'selection', 'paper-view', 'analysis'].indexOf(currentStep) > index ? 'text-green-600' : 'text-slate-400'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep === step ? 'border-blue-600 bg-blue-100' :
                  ['input', 'processing', 'selection', 'paper-view', 'analysis'].indexOf(currentStep) > index ? 'border-green-600 bg-green-100' : 'border-slate-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm mt-1 font-medium">{label}</span>
              </div>
              {index < 4 && (
                <div className={`w-16 h-0.5 ${
                  ['input', 'processing', 'selection', 'paper-view', 'analysis'].indexOf(currentStep) > index ? 'bg-green-600' : 'bg-slate-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Input Form */}
        {currentStep === 'input' && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-6 h-6" />
                Research Paper Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitSearch} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-slate-700 font-medium">Research Topic Keyword</Label>
                    <Input
                      id="topic"
                      type="text"
                      placeholder="e.g., machine learning, climate change, quantum computing"
                      value={topicKeyword}
                      onChange={(e) => setTopicKeyword(e.target.value)}
                      className="border-slate-300 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="years" className="text-slate-700 font-medium">Years Back</Label>
                    <Select value={yearsBack} onValueChange={setYearsBack}>
                      <SelectTrigger className="border-slate-300 focus:border-blue-500">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="10">10 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Searching...' : 'Search Research Papers'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Processing */}
        {currentStep === 'processing' && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">Processing Your Request</h3>
              <p className="text-slate-600 mb-4">Searching for research papers on "{topicKeyword}" from the last {yearsBack} years...</p>
              <div className="space-y-2 text-sm text-slate-500">
                <p>🔍 Scanning academic databases</p>
                <p>📊 Filtering by publication date</p>
                <p>📝 Compiling results</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Selection */}
        {currentStep === 'selection' && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-6 h-6" />
                Paper Selection Available
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-slate-700">Your research papers have been compiled! Please review and select your preferred paper from the Google Sheet.</p>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Instructions:</strong> Click the link below to view available papers, then select your preferred research paper in the Google Sheet.
                  </p>
                  <Button 
                    onClick={() => window.open(googleSheetUrl, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Google Sheet
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <p className="text-slate-600">After selecting your paper in the Google Sheet, click below to continue:</p>
                  <Button 
                    onClick={handlePaperSelection}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    I've Selected My Paper
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Paper View */}
        {currentStep === 'paper-view' && selectedPaper && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Selected Research Paper
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedPaper.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedPaper.authors.map((author, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700">
                        {author}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-4 text-sm text-slate-600 mb-4">
                    <span><strong>Year:</strong> {selectedPaper.year}</span>
                    <span><strong>Journal:</strong> {selectedPaper.journal}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Abstract</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedPaper.abstract}</p>
                </div>
                
                <Separator />
                
                <div className="text-center space-y-4">
                  <p className="text-slate-600">Ready to generate analysis and visualization data for this paper?</p>
                  <Button 
                    onClick={handleRunAnalysis}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating Analysis...' : 'Run Data Analysis'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Analysis Results */}
        {currentStep === 'analysis' && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Analysis Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Analysis Successfully Generated!</h3>
                  <p className="text-green-700 mb-4">Your research data analysis and visualizations are ready for review.</p>
                  
                  <Button 
                    onClick={() => window.open(analysisSheetUrl, '_blank')}
                    className="bg-green-600 hover:bg-green-700 text-white mb-4"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analysis & Graphs
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Analysis Includes:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Citation analysis and trends</li>
                      <li>• Research methodology breakdown</li>
                      <li>• Key findings visualization</li>
                      <li>• Comparative data charts</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Next Steps:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Download charts and graphs</li>
                      <li>• Export data for further analysis</li>
                      <li>• Share results with colleagues</li>
                      <li>• Start a new research query</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={resetWorkflow}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Start New Research Query
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
