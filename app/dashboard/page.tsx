"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Search,
  LogOut,
  FileText,
  AlertCircle,
  Download,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  deleteAllTransactions,
  getAllTransactions,
  uploadPdfAndParseData,
} from "@/services/transaction";
import { error } from "console";
import { tr } from "zod/v4/locales";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [transactions, setTransactions] = useState<any>([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    claiment: "",
    executant: "",
    houseNo: "",
    surveyNo: "",
    documentNo: "",
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(true);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check authentication
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      router.push("/");
      return;
    }
  }, [router]);

  useEffect(() => {
    getAllTransactions()
      .then((res) => {
        setTransactions(res?.transactions);
        setFilteredTransactions(res?.transactions);
      })
      .catch((error) => {
        console.error("Error parsing saved transactions:", error);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPdfUrl(url);
      setProcessingError(null);
      setShowPdfPreview(true);
    } else if (selectedFile) {
      setProcessingError(
        "Please select a valid PDF file. Other file types are not supported."
      );
      setFile(null);
    }
  };

  const processFile = async () => {
    if (!file) {
      setProcessingError("Please select a PDF file first");
      return;
    }

    console.log("coming here");

    setProcessingStage("Processing PDF...");

    try {
      const response = await uploadPdfAndParseData(file);

      const updatedTransactions = response?.data?.processedTransactions;

      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      setProcessingStage("Processing completed successfully!");
    } catch (error) {
      console.error("Processing error:", error);
      setProcessingError(
        "An error occurred while processing the PDF. Please try again."
      );
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setUploadProgress(0);
        setProcessingStage("");
      }, 3000);
    }
  };

  const handleSearch = () => {
    const filtered = transactions.filter((transaction: any) => {
      return (
        (!searchFilters.executant ||
          transaction?.executants?.some((executant: string) =>
            executant
              .toLowerCase()
              .includes(searchFilters.executant.toLowerCase())
          )) &&
        (!searchFilters.claiment ||
          transaction?.claimants?.some((claiment: string) =>
            claiment
              .toLowerCase()
              .includes(searchFilters.claiment.toLowerCase())
          )) &&
        (!searchFilters.houseNo ||
          transaction?.plotNo?.toString().includes(searchFilters.houseNo)) &&
        (!searchFilters.surveyNo ||
          transaction.prNumber.includes(searchFilters.surveyNo)) &&
        (!searchFilters.documentNo ||
          transaction.docNoAndYear.includes(searchFilters.documentNo))
      );
    });
    setFilteredTransactions(filtered);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    router.push("/");
  };

  const resetForm = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFile(null);
    setPdfUrl(null);
    setProcessingError(null);
    setUploadProgress(0);
    setProcessingStage("");
  };

  const handleDeleteTransactions = async () => {
    try {
      const response = await deleteAllTransactions();
      setTransactions([]);
      setFilteredTransactions([]);
      console.log("Transactions deleted");
    } catch (error) {
      console.log("error deleting transactions", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Real Estate Transaction Extractor
            </h1>
            <div className="flex gap-2">
              <Button onClick={handleDeleteTransactions}>
                Delete All Transactions
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px:6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Upload and Search */}
          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pdf-upload">Select PDF File</Label>
                  <Input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="mt-1"
                    ref={fileInputRef}
                  />
                </div>

                {file && (
                  <div className="text-sm text-gray-500">
                    Selected file: {file.name} (
                    {(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}

                {/* Processing Progress */}
                {(uploadProgress > 0 || processingStage) && (
                  <div className="space-y-3">
                    {processingStage && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>{processingStage}</span>
                      </div>
                    )}

                    {uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing Progress</span>
                          <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                )}

                {processingError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{processingError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={processFile}
                    disabled={!file || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? "Processing..." : "Extract Transactions"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={isProcessing}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {pdfUrl && (
                  <Button
                    variant="outline"
                    onClick={() => setShowPdfPreview(!showPdfPreview)}
                    className="w-full lg:hidden"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {showPdfPreview ? "Hide PDF Preview" : "Show PDF Preview"}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* PDF Preview (Mobile) */}
            {showPdfPreview && pdfUrl && (
              <Card className="lg:hidden">
                <CardHeader>
                  <CardTitle>PDF Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[400px] border rounded"
                    title="PDF Preview"
                  />
                </CardContent>
              </Card>
            )}

            {/* Search Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="claiment">Claiment</Label>
                    <Input
                      id="claiment"
                      placeholder="Search by claiment"
                      value={searchFilters.claiment}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          claiment: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="executant">Executant</Label>
                    <Input
                      id="executant"
                      placeholder="Search by executant"
                      value={searchFilters.executant}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          executant: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="houseNo">House Number</Label>
                    <Input
                      id="houseNo"
                      placeholder="Search by house no."
                      value={searchFilters.houseNo}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          houseNo: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="surveyNo">Survey Number</Label>
                    <Input
                      id="surveyNo"
                      placeholder="Search by survey no."
                      value={searchFilters.surveyNo}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          surveyNo: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="documentNo">Document Number</Label>
                    <Input
                      id="documentNo"
                      placeholder="Search by document no."
                      value={searchFilters.documentNo}
                      onChange={(e) =>
                        setSearchFilters((prev) => ({
                          ...prev,
                          documentNo: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSearch} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchFilters({
                        claiment: "",
                        executant: "",
                        houseNo: "",
                        surveyNo: "",
                        documentNo: "",
                      });
                      setFilteredTransactions(transactions);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results Table and PDF Preview */}
          <div className="space-y-6">
            {/* Results Table */}
            <Card style={{ width: "100%", height: "100%" }}>
              <CardHeader>
                <CardTitle>
                  Extracted Transactions ({filteredTransactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto max-h-[600px] ">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Claimants</TableHead>
                        <TableHead>Consideration Value</TableHead>
                        <TableHead>marketValue</TableHead>
                        <TableHead>dates</TableHead>
                        <TableHead>Document No./Year</TableHead>
                        <TableHead>documentRemarks</TableHead>
                        <TableHead>executants</TableHead>
                        <TableHead>plotNo</TableHead>
                        <TableHead>prNumber</TableHead>
                        <TableHead>scheduleRemarks</TableHead>
                        <TableHead>villageStreet</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction: any) => (
                        <TableRow
                          key={transaction.id}
                          className={`${
                            transaction.error
                              ? "bg-red-50"
                              : transaction.demoData
                              ? "bg-yellow-50"
                              : transaction.isNew
                              ? "bg-green-50"
                              : ""
                          }`}
                        >
                          <TableCell className="font-medium">
                            {transaction.claimants}
                          </TableCell>
                          <TableCell>
                            {transaction.considerationValue}
                          </TableCell>
                          <TableCell>{transaction.marketValue}</TableCell>
                          <TableCell>{transaction.dates}</TableCell>
                          <TableCell>{transaction.docNoAndYear}</TableCell>
                          <TableCell>{transaction.documentRemarks}</TableCell>
                          <TableCell>{transaction.executants}</TableCell>
                          <TableCell>{transaction.plotNo}</TableCell>
                          <TableCell>{transaction.prNumber}</TableCell>
                          <TableCell>{transaction.scheduleRemarks}</TableCell>
                          <TableCell>{transaction.villageStreet}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* PDF Preview (Desktop) */}
        {pdfUrl && (
          <Card className="hidden lg:block m-10">
            <CardHeader>
              <CardTitle>PDF Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                src={pdfUrl}
                className="w-full h-[2000px] border rounded"
                title="PDF Preview"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
