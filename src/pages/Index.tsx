import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Search, FileText, ExternalLink, BarChart3, BookOpen, AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';
import ResearchPapersTable from '@/components/ResearchPapersTable';
import { ResearchPaper } from '@/components/ResearchPapersTable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mock } from 'node:test';


const mockData: any[][] = [

  ['1', 'Sustainable concrete production: utilizing cow dung ash and corn stalk ash as eco-friendly alternatives', '-', 'made in a sustainable and ecologically responsible manner  or carbon-neutral  materials are employed in its production. Geopolymer cement is one of the most popular eco-friendly', 'https://pdfs.semanticscholar.org/ffc9/6305229dc0b43f78c6374a9b989bfca2d247.pdf', 'False'],


  ['2', 'Recent Developments in Reinforced Concrete Structures: A Comprehensive', '-', 'discusses eco-friendly building practises, eco-friendly design  Green building certifications:  Obtaining certifications for  are investigating how to make concrete that is carbon-neutral. 2.', 'https://ijaem.net/issue_dcp/Recent%20Developments%20in%20Reinforced%20Concrete%20Structures%20A%20Comprehensive%20Review.pdf', 'False'],


  ['3', 'Industrial Cannabis sativa (hemp fiber): Hempcrete-A plant based and eco-friendly building construction material', '-', 'concrete used for building houses by using an eco-friendly  Green Jams, as they got down  to hand-make hemp concrete  With their carbon neutral and carbon negative properties, bio-', 'https://www.academia.edu/download/100805233/Hempcrete_D.pdf', 'False'],


  ['4', 'Sustainable, Carbon-Neutral Construction Using Biobased Materials', '-', 'growing interest in sustainable, carbon-neutral building materials.  as hempcrete,  biochar-enhanced concrete, timber, clay, cork,  , concrete can store CO₂, making it a more', 'https://unisciencepub.com/wp-content/uploads/2025/04/Sustainable-Carbon-Neutral-Construction-Using-Biobased-Materials.pdf', 'False']
]

const mockSheetUrl = 'https://docs.google.com/spreadsheets/d/12_Gmq1oRQOCBQUWpJAksDQ1mgUW-Fceea8OMOTHfTX8/edit?usp=sharing';

const mockSelectedPapers: ResearchPaper[] = [
  {
    id: '1',
    title: 'Sustainable concrete production: utilizing cow dung ash and corn stalk ash as eco-friendly alternatives',
    authors: [],
    abstract: 'made in a sustainable and ecologically responsible manner  or carbon-neutral  materials are employed in its production. Geopolymer cement is one of the most popular eco-friendly',
    paperLink: 'https://pdfs.semanticscholar.org/ffc9/6305229dc0b43f78c6374a9b989bfca2d247.pdf',
    year: 2023,
    journal: 'Journal of Applied Engineering Science',
  },
]


type WorkflowStep = 'input' | 'processing' | 'selection' | 'extraction-processing' | 'extraction';

const Index = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('input');
  const [topicKeyword, setTopicKeyword] = useState('');
  const [yearsBack, setYearsBack] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<ResearchPaper[] | null>([]);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [extractionSheetUrl, setExtractionSheetUrl] = useState(mockSheetUrl);
  const [processingStage, setProcessingStage] = useState('');
  const [paperCount, setPaperCount] = useState(0);
  const [runId, setRunId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);
  const [gumloopData, setGumloopData] = useState<any[][]>(mockData);
  const { toast } = useToast();


  // อันนี้ handle file input
  const handleSubmitFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validTypes.includes(uploadedFile.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF, Word, or Excel file.", variant: "destructive" });
      return;
    }
    toast({ title: "File accepted", variant: "default" });
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

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
    setProcessingStage('Initializing search parameters...');

    try {
      // Start Gumloop workflow
      console.log(import.meta.env.VITE_GUMLOOP_GET_PAPERS_WEBHOOK_URL, import.meta.env.VITE_GUMLOOP_API_TOKEN);
      const webhookResponse = await fetch(import.meta.env.VITE_GUMLOOP_GET_PAPERS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GUMLOOP_API_TOKEN}` // Replace with your actual Gumloop API token
        },
        body: JSON.stringify({
          keyword: topicKeyword.trim(),
          years_back: parseInt(yearsBack),
        })
      });

      if (!webhookResponse.ok) {
        throw new Error('Failed to start workflow');
      }

      const webhookData = await webhookResponse.json();
      const workflowRunId = webhookData.run_id;

      if (!workflowRunId) {
        throw new Error('No run_id received from webhook');
      }

      setRunId(workflowRunId);

      // Start polling for progress
      startProgressPolling(workflowRunId);

    } catch (error) {
      console.error('Error starting workflow:', error);
      toast({
        title: "Workflow Error",
        description: "Failed to start the research workflow. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      setCurrentStep('input');
      setProcessingStage('');
    }
  };

  const startProgressPolling = (workflowRunId: string) => {
    const interval = setInterval(async () => {
      try {
        const progressResponse = await fetch(`https://api.gumloop.com/api/v1/get_pl_run?run_id=${workflowRunId}&user_id=${import.meta.env.VITE_GUMLOOP_USER_ID}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_GUMLOOP_API_TOKEN}`,
          }
        });

        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress');
        }

        const progressData = await progressResponse.json();

        // Update progress based on Gumloop response
        updateProgressFromGumloop(progressData);

        // Check if workflow is complete
        if (progressData.state === 'DONE') {
          clearInterval(interval);
          setPollingInterval(null);
          handleWorkflowCompletion(progressData);
        } else if (progressData.state === 'FAILED' || progressData.state === 'TERMINATED') {
          clearInterval(interval);
          setPollingInterval(null);
          handleWorkflowError(progressData);
        }

      } catch (error) {
        console.error('Error polling progress:', error);
        // Continue polling unless it's a critical error
      }
    }, 10000); // Poll every 2 seconds

    setPollingInterval(interval);
  };

  const updateProgressFromGumloop = (progressData: any) => {
    const { state, log, outputs, created_ts } = progressData;

    // Calculate progress percentage based on time elapsed since workflow creation
    let progress = 0;

    if (state === 'STARTED') {
      progress = 10;
      setProcessingStage('Workflow starting...');
    } else if (state === 'RUNNING') {
      // Calculate time-based progress
      if (created_ts) {
        const startTime = new Date(created_ts).getTime();
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;

        // Progress over 30 seconds, capped at 90%
        const timeProgress = Math.min((elapsedSeconds / 30) * 90, 90);
        progress = Math.max(10, timeProgress); // Ensure minimum 10% progress

        console.log(`Elapsed time: ${elapsedSeconds.toFixed(1)}s, Progress: ${progress.toFixed(1)}%`);
      } else {
        progress = 20; // Fallback if no timestamp
      }

      // Base activity message on log entries
      if (log && log.length > 0) {
        const latestLogEntry = log[log.length - 1];

        // Map common node activities to user-friendly messages
        const activityMessages: { [key: string]: string } = {
          'search': 'Searching academic databases...',
          'filter': 'Filtering by publication date...',
          'analyze': 'Analyzing paper relevance...',
          'generate': 'Generating Google Sheet...',
          'compile': 'Compiling results...',
          'export': 'Preparing final output...',
          'database': 'Querying research databases...',
          'validation': 'Validating search results...',
          'formatting': 'Formatting data for export...'
        };

        let currentActivity = 'Processing...';
        if (latestLogEntry.node_name) {
          const nodeName = latestLogEntry.node_name.toLowerCase();
          for (const [key, message] of Object.entries(activityMessages)) {
            if (nodeName.includes(key)) {
              currentActivity = message;
              break;
            }
          }
        }

        setProcessingStage(currentActivity);
      } else {
        setProcessingStage('Processing workflow...');
      }
    } else if (state === 'DONE') {
      progress = 100; // Only set to 100% when actually done
      setProcessingStage('Finalizing results...');
    }

    setProgressPercentage(progress);

    // If we have partial outputs, update immediately
    if (outputs) {
      if (outputs.paper_count) {
        setPaperCount(parseInt(outputs.paper_count));
      }
    }
  };

  const handleWorkflowCompletion = (completionData: any) => {
    const { outputs } = completionData;

    if (outputs) {
      // Extract paper count (try different possible output keys)
      const paper_count = outputs.paper_count || outputs.count || outputs.total_papers || outputs.results_count;

      const table_content = outputs.table_content;

      if (table_content && paper_count) {
        console.log(`Table content: ${table_content}`);
        console.log(`Paper count: ${paper_count}`);
        setGumloopData(table_content);
        setPaperCount(parseInt(paper_count));
        setCurrentStep('selection');
        setIsLoading(false);
        setProcessingStage('');

        toast({
          title: "Research Papers Found!",
          description: `Found ${paper_count} relevant papers. Review the Google Sheet to select your paper.`,
        });
      } else {
        // Handle incomplete output
        console.log('Available outputs:', outputs);
        toast({
          title: "Workflow Completed",
          description: "Workflow finished. Please check the outputs for results.",
          variant: "destructive",
        });
        setIsLoading(false);
        setCurrentStep('input');
      }
    } else {
      // No outputs available
      toast({
        title: "Workflow Completed",
        description: "Workflow finished but no outputs were generated. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      setCurrentStep('input');
    }
  };

  const handleWorkflowError = (errorData: any) => {
    console.error('Workflow failed:', errorData);

    // Try to extract error message from logs
    let errorMessage = "The research workflow encountered an error. Please try again.";
    if (errorData.log && errorData.log.length > 0) {
      const errorLog = errorData.log.find((entry: any) => entry.error || entry.status === 'failed');
      if (errorLog && errorLog.error) {
        errorMessage = errorLog.error;
      }
    }

    toast({
      title: "Workflow Failed",
      description: errorMessage,
      variant: "destructive",
    });

    setIsLoading(false);
    setCurrentStep('input');
    setProcessingStage('');
    setRunId(null);
  };

  const handlePaperSelection = async (selectedPapers: ResearchPaper[]) => {
    try {
      setSelectedPapers(selectedPapers);
      console.log('Selected papers:', selectedPapers);
      setSelectedPaper(selectedPapers[0]);
      setCurrentStep('extraction-processing');

      const paperCount = selectedPapers.length;
      const paperText = paperCount === 1 ? 'paper' : 'papers';

      toast({
        title: "Papers Selected Succesfully",
        description: `${paperCount} ${paperText} selected for extraction.`,
      })

      handleRunExtraction(selectedPapers);
    } catch (error) {
      console.error('Error selecting paper:', error);
      toast({
        title: "Selection Error",
        description: "Failed to load selected paper. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRunExtraction = async (selected_papers: ResearchPaper[]) => {
    console.log('Running extraction for selected papers:', selectedPapers);
    if (!selected_papers || selected_papers.length == 0) return;

    console.log('Running extraction for selected papers:', selected_papers);
    setIsLoading(true);
    setCurrentStep('extraction-processing');
    setProcessingStage('Initializing extraction workflow...');
    setProgressPercentage(0);

    toast({
      title: "Starting Data Extraction",
      description: "Running data extraction workflow...",
    });

    try {
      // Extract titles and links from selectedPapers
      const titles = selected_papers.map(paper => paper.title);
      const links = selected_papers.map(paper => paper.paperLink || '');

      // Call Gumloop workflow for analysis
      const extractionResponse = await fetch(import.meta.env.VITE_GUMLOOP_MAIN_FLOW_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GUMLOOP_API_TOKEN}`,
        },
        body: JSON.stringify({
          titles: titles,
          links: links
        })
      });

      if (!extractionResponse.ok) {
        throw new Error('Failed to start extraction workflow');
      }

      const extractionData = await extractionResponse.json();
      const extractionRunId = extractionData.run_id;

      if (!extractionRunId) {
        throw new Error('No run_id received from extraction webhook');
      }

      setRunId(extractionRunId);

      // Start polling for analysis progress
      startExtractionProgressPolling(extractionRunId);

    } catch (error) {
      console.error('Error starting extraction:', error);
      toast({
        title: "Extraction Error",
        description: "Failed to start extraction workflow. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      setCurrentStep('selection');
    }
  };

  const startExtractionProgressPolling = (workflowRunId: string) => {
    const interval = setInterval(async () => {
      try {
        const progressResponse = await fetch(`https://api.gumloop.com/api/v1/get_pl_run?run_id=${workflowRunId}&user_id=${import.meta.env.VITE_GUMLOOP_USER_ID}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_GUMLOOP_API_TOKEN}`,
          }
        });

        if (!progressResponse.ok) {
          throw new Error('Failed to fetch extraction progress');
        }

        const progressData = await progressResponse.json();

        // Update progress based on Gumloop response
        updateExtractionProgressFromGumloop(progressData);

        // Check if workflow is complete
        if (progressData.state === 'DONE') {
          clearInterval(interval);
          setPollingInterval(null);
          handleExtractionCompletion(progressData);
        } else if (progressData.state === 'FAILED' || progressData.state === 'TERMINATED') {
          clearInterval(interval);
          setPollingInterval(null);
          handleExtractionError(progressData);
        }

      } catch (error) {
        console.error('Error polling extraction progress:', error);
        // Continue polling unless it's a critical error
      }
    }, 30000); // Poll every 2 seconds

    setPollingInterval(interval);
  };

  const updateExtractionProgressFromGumloop = (progressData: any) => {
    const { state, log, outputs, created_ts } = progressData;

    // Calculate progress percentage based on time elapsed since workflow creation
    let progress = 0;

    if (state === 'STARTED') {
      progress = 10;
      setProcessingStage('Extraction workflow starting...');
    } else if (state === 'RUNNING') {
      // Calculate time-based progress
      if (created_ts) {
        const startTime = new Date(created_ts).getTime();
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;

        // Progress over 45 seconds for analysis (longer than search), capped at 90%
        const timeProgress = Math.min((elapsedSeconds / 150) * 90, 90);
        progress = Math.max(10, timeProgress);

        console.log(`Extraction elapsed time: ${elapsedSeconds.toFixed(1)}s, Progress: ${progress.toFixed(1)}%`);
      } else {
        progress = 20;
      }

      // Base activity message on log entries for analysis
      if (log && log.length > 0) {
        const latestLogEntry = log[log.length - 1];

        // Map extraction-specific node activities to user-friendly messages
        const extractionActivityMessages: { [key: string]: string } = {
          'extract': 'Extracting data from research paper...',
          'trend': 'Identifying research trends...',
          'methodology': 'Processing methodology data...',
          'visualization': 'Generating charts and graphs...',
          'compile': 'Compiling analysis results...',
          'export': 'Preparing final analysis...',
          'sheet': 'Generating analysis spreadsheet...'
        };

        let currentActivity = 'Processing extraction...';
        if (latestLogEntry.node_name) {
          const nodeName = latestLogEntry.node_name.toLowerCase();
          for (const [key, message] of Object.entries(extractionActivityMessages)) {
            if (nodeName.includes(key)) {
              currentActivity = message;
              break;
            }
          }
        }

        setProcessingStage(currentActivity);
      } else {
        setProcessingStage('Running data extraction...');
      }
    } else if (state === 'DONE') {
      progress = 100;
      setProcessingStage('Extraction complete!');
    }

    setProgressPercentage(progress);

    // If we have partial outputs, could show intermediate results
    if (outputs) {
      // Handle any intermediate analysis outputs here
      if (outputs.analysis_sheet_url || outputs.results_url) {
        const sheetUrl = outputs.analysis_sheet_url || outputs.results_url;
        if (sheetUrl && !extractionSheetUrl) {
          setExtractionSheetUrl(mockSheetUrl);
        }
      }
    }
  };

  const handleExtractionCompletion = (completionData: any) => {
    const { outputs } = completionData;

    if (outputs) {
      // Extract the analysis sheet URL
      const sheetUrl = outputs.analysis_sheet_url || outputs.results_url || outputs.output_url || outputs.sheet_url;

      if (sheetUrl) {
        setExtractionSheetUrl(mockSheetUrl);
        setCurrentStep('extraction');
        setIsLoading(false);
        setProcessingStage('');

        toast({
          title: "Extraction Complete!",
          description: "Your extracted research data is ready",
        });
      } else {
        // Handle incomplete output
        console.log('Available extraction outputs:', outputs);
        toast({
          title: "Extraction Completed",
          description: "Extraction finished. Please check the outputs for results.",
          variant: "destructive",
        });
        setIsLoading(false);
        setCurrentStep('selection');
      }
    } else {
      // No outputs available
      toast({
        title: "Extraction Completed",
        description: "Extraction finished but no outputs were generated. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      setCurrentStep('selection');
    }
  };

  const handleExtractionError = (errorData: any) => {
    console.error('Extraction workflow failed:', errorData);

    // Try to extract error message from logs
    let errorMessage = "The extraction workflow encountered an error. Please try again.";
    if (errorData.log && errorData.log.length > 0) {
      const errorLog = errorData.log.find((entry: any) => entry.error || entry.status === 'failed');
      if (errorLog && errorLog.error) {
        errorMessage = errorLog.error;
      }
    }

    toast({
      title: "Extraction Failed",
      description: errorMessage,
      variant: "destructive",
    });

    setIsLoading(false);
    setCurrentStep('selection');
    setProcessingStage('');
    setRunId(null);
  };

  const resetWorkflow = () => {
    // Clean up any active polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }

    setCurrentStep('input');
    setTopicKeyword('');
    setYearsBack('');
    setSelectedPapers(null);
    setSelectedPaper(null);
    setExtractionSheetUrl('');
    setPaperCount(0);
    setProcessingStage('');
    setRunId(null);

    toast({
      title: "Workflow Reset",
      description: "Ready for a new research query",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Top Bar: Logo left, Profile right */}
      {/* Logo on the left */}
      <img src="/logo.png" alt="Logo" style={{ height: "160px" }} />
      <br></br>

      {/* Main Layout: Sidebar and Main Content */}
      <div className="flex flex-1 min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg p-6">
          <nav className="space-y-4 text-slate-700 font-medium mt-4">
            <a href="#collection" className="block hover:text-blue-600">📚 Research Collection</a>
            <a href="#history" className="block hover:text-blue-600">📂 Extract History</a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-6 overflow-y-auto">
          <div className="mx-auto space-y-3">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-slate-800">Welcome to LABWISE</h1>
              <div className="flex items-center space-x-3">
                <img src="profile.png" alt="User" className="h-10 w-10 rounded-full border" />
                <span className="text-slate-700 font-medium">Researcher</span>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              {[
                { step: 'input', label: 'Search', icon: Search },
                { step: 'processing', label: 'Processing', icon: FileText },
                { step: 'selection', label: 'Selection', icon: ExternalLink },
                // { step: 'paper-view', label: 'Review', icon: BookOpen },
                { step: 'extraction-processing', label: 'Extraction', icon: Clock },
                { step: 'extraction', label: 'Extracted Data', icon: BarChart3 }
              ].map(({ step, label, icon: Icon }, index) => (
                <React.Fragment key={step}>
                  <div className={`flex flex-col items-center ${currentStep === step ? 'text-blue-600' :
                    ['input', 'processing', 'selection', 'extraction-processing', 'extraction'].indexOf(currentStep) > index ? 'text-green-600' : 'text-slate-400'
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === step ? 'border-blue-600 bg-blue-100' :
                      ['input', 'processing', 'selection', 'extraction-processing', 'extraction'].indexOf(currentStep) > index ? 'border-green-600 bg-green-100' : 'border-slate-300'
                      }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm mt-1 font-medium">{label}</span>
                  </div>
                  {index < 4 && (
                    <div className={`w-16 h-0.5 ${['input', 'processing', 'selection', 'extraction-processing', 'extraction'].indexOf(currentStep) > index ? 'bg-green-600' : 'bg-slate-300'
                      }`} />
                  )}
                </React.Fragment>

              ))}
            </div>

            {/* Step 1: Input Form */}
            {currentStep === 'input' && (
              <>
                {/* Card 1: Research Paper Keyword Search */}
                <Card className="shadow-lg border-0 mb-6">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Search className="w-6 h-6" />
                        Research Paper Search
                      </div>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-white hover:text-blue-200">
                              <Info className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="w-80 text-sm bg-white text-slate-700 border border-blue-200 shadow-lg rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div>
                                <p className="font-semibold text-blue-800 mb-1">How it works:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                  <li>Enter your research topic and time range</li>
                                  <li>Our automated workflow searches academic databases</li>
                                  <li>Results are compiled in a web page for review</li>
                                  <li>Select your preferred paper for detailed analysis</li>
                                  <li>Generate comprehensive data analysis and visualizations</li>
                                </ol>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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

                {/* Card 2: File Upload Input */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                    <CardTitle>
                      Upload Research Data File
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmitFile} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="fileUpload" className="text-slate-700 font-medium">Upload File  </Label>
                        <input
                          type="file"
                          accept=".pdf,
                      .doc,
                      .docx,
                      .xls,
                      .xlsx"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setUploadedFile(e.target.files[0]);
                            }
                          }}
                          className="border-slate-300 focus:border-green-500"
                        />
                        <p className="text-xs text-slate-500">Upload a file with research data</p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                        disabled={isLoading || !uploadedFile}
                      >
                        {isLoading ? 'Processing File...' : 'Submit File'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}


            {/* Step 2: Processing */}
            {currentStep === 'processing' && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                    {selectedPaper ? 'Analyzing Your Research Paper' : 'Processing Your Request'}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {selectedPaper
                      ? `Extracting data and generating analysis for "${selectedPaper.title.substring(0, 50)}..."`
                      : `Searching for research papers on "${topicKeyword}" from the last ${yearsBack} years...`
                    }
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage.toFixed(1)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{progressPercentage.toFixed(1)}% Complete</p>

                  {processingStage && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                      <div className="flex items-center justify-center gap-2 text-blue-800">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{processingStage}</span>
                      </div>
                    </div>
                  )}

                  {paperCount > 0 && !selectedPaper && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                      <p className="text-sm text-green-800 font-medium">
                        Found {paperCount} papers so far...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Selection Table */}
            {currentStep === 'selection' && (
              <ResearchPapersTable
                papers={researchPapers}
                onPapersSelected={handlePaperSelection}
                paperCount={paperCount}
                topicKeyword={topicKeyword}
                gumloopData={gumloopData}
              />
            )}

            {/* Step 4: Paper View
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
                    {selectedPaper.paperLink && <div><strong>Link:</strong> {selectedPaper.paperLink}</div>}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Abstract</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedPaper.abstract}</p>
                </div>

                <Separator />

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Extraction Will Include:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Data written in text within paragraphs</li>
                    <li>• Data in tables</li>
                    <li>• Data in charts and graphs</li>
                  </ul>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-slate-600">Ready to extract data?</p>
                  <Button
                    onClick={handleRunExtraction}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Extracting Data from Research Papers...' : 'Extract Data'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
 */}
            {/* Step 5: Analysis Processing */}
            {currentStep === 'extraction-processing' && selectedPaper && (
              <Card className="shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-6"></div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-2">Extracting Data From Your Research Papers</h3>
                  <p className="text-slate-600 mb-6">
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage.toFixed(1)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">{progressPercentage.toFixed(1)}% Complete</p>

                  {processingStage && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                      <div className="flex items-center justify-center gap-2 text-purple-800">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{processingStage}</span>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            )}

            {/* Step 6: Analysis Results */}
            {currentStep === 'extraction' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-6 h-6" />
                    Extraction Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center space-y-6">
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-xl font-semibold text-green-800 mb-2">Extraction Successfully Generated!</h3>
                      <p className="text-green-700 mb-4">Your extracted research data is ready for review.</p>

                      <Button
                        onClick={() => window.open(extractionSheetUrl, '_blank')}
                        className="bg-green-600 hover:bg-green-700 text-white mb-4"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Extracted Data
                      </Button>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={resetWorkflow}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Start New Research Query
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
