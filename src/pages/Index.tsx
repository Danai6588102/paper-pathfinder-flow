
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, ExternalLink, BarChart3, BookOpen, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type WorkflowStep = 'input' | 'processing' | 'selection' | 'paper-view' | 'analysis';

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  journal: string;
  doi?: string;
  citations?: number;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('input');
  const [topicKeyword, setTopicKeyword] = useState('');
  const [yearsBack, setYearsBack] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [analysisSheetUrl, setAnalysisSheetUrl] = useState('');
  const [processingStage, setProcessingStage] = useState('');
  const [paperCount, setPaperCount] = useState(0);
  const { toast } = useToast();

  const handleSubmitSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topicKeyword.trim()) {
      toast({
        title: "Missing Topic",
        description: "Please enter a research topic keyword",
        variant: "destructive",
      });
      return;
    }

    if (!yearsBack) {
      toast({
        title: "Missing Time Range",
        description: "Please select how many years back to search",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentStep('processing');
    
    // Simulate realistic n8n workflow stages
    setProcessingStage('Initializing search parameters...');
    
    setTimeout(() => {
      setProcessingStage('Querying academic databases...');
    }, 1000);
    
    setTimeout(() => {
      setProcessingStage('Filtering by publication date...');
    }, 2000);
    
    setTimeout(() => {
      setProcessingStage('Analyzing paper relevance...');
    }, 3000);
    
    setTimeout(() => {
      setProcessingStage('Generating Google Sheet...');
      const mockCount = Math.floor(Math.random() * 50) + 25; // 25-75 papers
      setPaperCount(mockCount);
    }, 4000);
    
    setTimeout(() => {
      setGoogleSheetUrl(`https://docs.google.com/spreadsheets/d/research-${Date.now()}`);
      setCurrentStep('selection');
      setIsLoading(false);
      setProcessingStage('');
      toast({
        title: "Research Papers Found!",
        description: `Found ${paperCount} relevant papers. Review the Google Sheet to select your paper.`,
      });
    }, 5000);
  };

  const handlePaperSelection = () => {
    // Simulate paper selection from Google Sheet with more realistic data
    const mockPaper: ResearchPaper = {
      id: `paper_${Date.now()}`,
      title: `${topicKeyword.charAt(0).toUpperCase() + topicKeyword.slice(1)} in Modern Research: Trends and Applications`,
      authors: ['Dr. Sarah Johnson', 'Prof. Michael Chen', 'Dr. Elena Rodriguez', 'Prof. David Kim'],
      year: 2024 - parseInt(yearsBack) + Math.floor(Math.random() * parseInt(yearsBack)),
      abstract: `This comprehensive study examines the current state and future directions of ${topicKeyword} research. Through systematic analysis of recent publications and emerging methodologies, we identify key trends, challenges, and opportunities in the field. Our findings suggest significant potential for advancement in both theoretical understanding and practical applications. The research methodology employed combines quantitative analysis with qualitative assessment to provide a holistic view of the research landscape.`,
      journal: 'International Journal of Advanced Research',
      doi: '10.1000/xyz123',
      citations: Math.floor(Math.random() * 500) + 50
    };
    
    setSelectedPaper(mockPaper);
    setCurrentStep('paper-view');
    toast({
      title: "Paper Selected Successfully",
      description: `"${mockPaper.title.substring(0, 50)}..." is now loaded for analysis`,
    });
  };

  const handleRunAnalysis = async () => {
    if (!selectedPaper) return;
    
    setIsLoading(true);
    
    // Simulate n8n analysis workflow
    toast({
      title: "Starting Analysis",
      description: "Running data analysis workflow...",
    });
    
    setTimeout(() => {
      setAnalysisSheetUrl(`https://docs.google.com/spreadsheets/d/analysis-${selectedPaper.id}`);
      setCurrentStep('analysis');
      setIsLoading(false);
      toast({
        title: "Analysis Complete!",
        description: "Your research data analysis and visualizations are ready",
      });
    }, 3500);
  };

  const resetWorkflow = () => {
    setCurrentStep('input');
    setTopicKeyword('');
    setYearsBack('');
    setGoogleSheetUrl('');
    setSelectedPaper(null);
    setAnalysisSheetUrl('');
    setPaperCount(0);
    setProcessingStage('');
    toast({
      title: "Workflow Reset",
      description: "Ready for a new research query",
    });
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
          <p className="text-slate-600 text-lg">Discover, analyze, and visualize academic research data with n8n workflows</p>
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
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Enter your research topic and time range</li>
                      <li>Our n8n workflow searches academic databases</li>
                      <li>Results are compiled in a Google Sheet for review</li>
                      <li>Select your preferred paper for detailed analysis</li>
                      <li>Generate comprehensive data analysis and visualizations</li>
                    </ol>
                  </div>
                </div>
              </div>

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
                    <p className="text-xs text-slate-500">Use specific keywords for better results</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="years" className="text-slate-700 font-medium">Search Time Range</Label>
                    <Select value={yearsBack} onValueChange={setYearsBack}>
                      <SelectTrigger className="border-slate-300 focus:border-blue-500">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Last 1 year</SelectItem>
                        <SelectItem value="2">Last 2 years</SelectItem>
                        <SelectItem value="3">Last 3 years</SelectItem>
                        <SelectItem value="5">Last 5 years</SelectItem>
                        <SelectItem value="10">Last 10 years</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Recent papers may have more relevant data</p>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Initializing Search...' : 'Search Research Papers'}
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
              <p className="text-slate-600 mb-6">Searching for research papers on "<strong>{topicKeyword}</strong>" from the last {yearsBack} years...</p>
              
              {processingStage && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <div className="flex items-center justify-center gap-2 text-blue-800">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{processingStage}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 text-sm text-slate-500">
                <p>🔍 Scanning academic databases (PubMed, IEEE, ACM, etc.)</p>
                <p>📊 Applying filters and relevance scoring</p>
                <p>📝 Compiling results in Google Sheets</p>
                <p>⚡ Powered by n8n automation</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Selection */}
        {currentStep === 'selection' && (
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Paper Selection Available
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium mb-2">
                    ✅ Found {paperCount} relevant research papers!
                  </p>
                  <p className="text-sm text-green-700">
                    Your search results have been compiled and are ready for review in Google Sheets.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Next Steps:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1 mb-4">
                    <li>Click the link below to open the Google Sheet</li>
                    <li>Review the list of papers and their metadata</li>
                    <li>Select your preferred paper by marking it in the sheet</li>
                    <li>Return here and click "I've Selected My Paper"</li>
                  </ol>
                  <Button 
                    onClick={() => window.open(googleSheetUrl, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Research Papers Sheet
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <p className="text-slate-600">After selecting your paper in the Google Sheet:</p>
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
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{selectedPaper.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedPaper.authors.map((author, index) => (
                      <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700">
                        {author}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                    <div><strong>Year:</strong> {selectedPaper.year}</div>
                    <div><strong>Journal:</strong> {selectedPaper.journal}</div>
                    {selectedPaper.citations && <div><strong>Citations:</strong> {selectedPaper.citations}</div>}
                    {selectedPaper.doi && <div><strong>DOI:</strong> {selectedPaper.doi}</div>}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Abstract</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedPaper.abstract}</p>
                </div>
                
                <Separator />
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Analysis Will Include:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Citation network analysis and trends</li>
                    <li>• Research methodology breakdown</li>
                    <li>• Key findings visualization</li>
                    <li>• Comparative analysis with related papers</li>
                    <li>• Impact metrics and trend analysis</li>
                  </ul>
                </div>
                
                <div className="text-center space-y-4">
                  <p className="text-slate-600">Ready to generate comprehensive analysis data?</p>
                  <Button 
                    onClick={handleRunAnalysis}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Running Analysis Workflow...' : 'Generate Data Analysis'}
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
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Analysis Successfully Generated!</h3>
                  <p className="text-green-700 mb-4">Your comprehensive research data analysis and visualizations are ready for review.</p>
                  
                  <Button 
                    onClick={() => window.open(analysisSheetUrl, '_blank')}
                    className="bg-green-600 hover:bg-green-700 text-white mb-4"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analysis & Visualizations
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Analysis Includes:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Citation network graphs</li>
                      <li>• Research trend analysis</li>
                      <li>• Methodology comparison charts</li>
                      <li>• Impact metrics visualization</li>
                      <li>• Related papers mapping</li>
                      <li>• Statistical data tables</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">Next Steps:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Download charts and graphs</li>
                      <li>• Export raw data for further analysis</li>
                      <li>• Share results with research team</li>
                      <li>• Generate reports and presentations</li>
                      <li>• Start analysis on related papers</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={resetWorkflow}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Start New Research Query
                  </Button>
                  <Button 
                    onClick={() => window.open(analysisSheetUrl, '_blank')}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Analysis Sheet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
