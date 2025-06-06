import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle } from 'lucide-react';

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  paperLink?: string;
  year: number;
  journal: string;
  citations?: number;
}

interface ResearchPapersTableProps {
  papers: ResearchPaper[];
  onPapersSelected: (papers: ResearchPaper[]) => void;
  paperCount: number;
  topicKeyword: string;
  gumloopData?: any[][]; // Raw data from Gumloop
}

const ResearchPapersTable: React.FC<ResearchPapersTableProps> = ({
  papers,
  onPapersSelected,
  paperCount,
  topicKeyword,
  gumloopData
}) => {
  const [selectedPaperIds, setSelectedPaperIds] = useState<Set<string>>(new Set());

  // Convert Gumloop data format to ResearchPaper format
  console.log('Gumloop data:', gumloopData);
  const processedPapers = React.useMemo(() => {
    console.log('Gumloop Data length:', gumloopData?.length);
    if (gumloopData && gumloopData.length > 0) {
      // Skip the header row (index 0) and process data rows
      return gumloopData.map((row, index) => ({
        id: `gumloop_paper_${index}`,
        title: row[1] || 'Untitled Paper',
        authors: [row[2] || 'Unknown Author'], // Gumloop has single author field
        abstract: row[3] || 'No abstract available',
        paperLink: row[4] || undefined,
        year: 2024, // Default year since not in Gumloop data
        journal: 'Unknown Journal', // Default journal since not in Gumloop data
        citations: undefined
      }));
    }
    return papers;
  }, [gumloopData, papers]);

  const handleCheckboxChange = (paperId: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedPaperIds);

    if (checked) {
      newSelectedIds.add(paperId);
    } else {
      newSelectedIds.delete(paperId);
    }

    setSelectedPaperIds(newSelectedIds);
  };

  const handleContinue = () => {
    if (selectedPaperIds.size > 0) {
      const selectedPapers = processedPapers.filter(p => selectedPaperIds.has(p.id));
      onPapersSelected(selectedPapers);
      console.log('Selected papers:', selectedPapers);
    }
  };

  const [selectedSource, setSelectedSource] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("");

  // const filteredPapers = processedPapers.filter((paper) => {
  //   const matchSource =
  //     !selectedSource || paper.source === selectedSource;
  //   const matchType =
  //     !selectedFileType || paper.fileType === selectedFileType;
  //   return matchSource && matchType;
  // });

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          Select Your Research Papers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
            <p className="text-green-800 font-medium mb-1">
              ✅ Found {processedPapers.length} relevant papers for "{topicKeyword}"
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Source Filter */}
          <select
            className="border border-gray-300 rounded px-4 py-2 bg-white"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="ResearchGate">ResearchGate</option>
            <option value="JSTOR">JSTOR</option>
            <option value="BASE">BASE</option>
            <option value="CORE">CORE</option>
            <option value="ScienceDirect">ScienceDirect</option>
            <option value="PubMed Central">PubMed Central</option>
            <option value="Science.gov">Science.gov</option>
          </select>

          {/* File Type Filter */}
          <select
            className="border border-gray-300 rounded px-4 py-2 bg-white"
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
          >
            <option value="">All File Types</option>
            <option value=".pdf">PDF (.pdf)</option>
            <option value=".doc">Word (.doc)</option>
            <option value=".docx">Word (.docx)</option>
            <option value=".xls">Excel (.xls)</option>
            <option value=".xlsx">Excel (.xlsx)</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-300 px-4 py-3 text-left font-medium text-slate-700 w-12">No.</th>
                <th className="border border-slate-300 px-4 py-3 text-left font-medium text-slate-700">Title</th>
                <th className="border border-slate-300 px-4 py-3 text-left font-medium text-slate-700">Authors</th>
                <th className="border border-slate-300 px-4 py-3 text-left font-medium text-slate-700">Abstract</th>
                <th className="border border-slate-300 px-4 py-3 text-left font-medium text-slate-700 w-24">Paper Link</th>
                <th className="border border-slate-300 px-4 py-3 text-center font-medium text-slate-700 w-20">Select</th>
              </tr>
            </thead>
            <tbody>
              {processedPapers.map((paper, index) => (
                <tr key={paper.id} className={`hover:bg-slate-50 ${selectedPaperIds.has(paper.id) ? 'bg-blue-50' : ''}`}>
                  <td className="border border-slate-300 px-4 py-3 text-sm text-slate-600">
                    {index + 1}
                  </td>
                  <td className="border border-slate-300 px-4 py-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-slate-800 text-sm leading-tight">
                        {paper.title}
                      </h4>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <span>{paper.journal}</span>
                        <span>•</span>
                        <span>{paper.year}</span>
                        {paper.citations && (
                          <>
                            <span>•</span>
                            <span>{paper.citations} citations</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="border border-slate-300 px-4 py-3">
                    <div className="space-y-1">
                      {paper.authors.slice(0, 3).map((author, authorIndex) => (
                        <Badge key={authorIndex} variant="secondary" className="text-xs mr-1 mb-1">
                          {author}
                        </Badge>
                      ))}
                      {paper.authors.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{paper.authors.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="border border-slate-300 px-4 py-3">
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {paper.abstract.length > 150
                        ? `${paper.abstract.substring(0, 150)}...`
                        : paper.abstract
                      }
                    </p>
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-center">
                    {paper.paperLink ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(paper.paperLink, '_blank')}
                        className="p-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    ) : (
                      <span className="text-slate-400 text-xs">Not available</span>
                    )}
                  </td>
                  <td className="border border-slate-300 px-4 py-3 text-center">
                    <Checkbox
                      checked={selectedPaperIds.has(paper.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(paper.id, checked as boolean)}
                      className="mx-auto"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-slate-600">
            {selectedPaperIds.size === 0
              ? 'Please select one or more papers to continue'
              : `${selectedPaperIds.size} paper${selectedPaperIds.size === 1 ? '' : 's'} selected`
            }
          </p>
          <Button
            onClick={handleContinue}
            disabled={selectedPaperIds.size === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Extract Data from Selected Papers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchPapersTable;