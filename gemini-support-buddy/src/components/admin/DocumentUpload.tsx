import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { chatStore, Document } from "@/store/chatStore";
import { toast } from "@/components/ui/sonner";
import { Trash } from "lucide-react";

const DocumentUpload: React.FC = observer(() => {
  const [documentName, setDocumentName] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim() || !documentContent.trim()) {
      toast.error("Please fill in both name and content fields");
      return;
    }

    setIsSubmitting(true);
    try {
      chatStore.uploadDocument(documentName, documentContent);
      toast.success("Document uploaded successfully");
      setDocumentName("");
      setDocumentContent("");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = (id: string) => {
    chatStore.deleteDocument(id);
    toast.success("Document deleted successfully");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Upload Knowledge Base Document</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Document Name</Label>
              <Input
                id="name"
                placeholder="Enter document name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="content" className="text-sm sm:text-base">Document Content</Label>
              <Textarea
                id="content"
                placeholder="Enter document content (FAQs, product info, etc.)"
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                className="min-h-[150px] sm:min-h-[200px] text-sm sm:text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
            <Button
              type="submit"
              className="w-full text-sm sm:text-base py-2 sm:py-2.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Upload Document"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Existing Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {chatStore.documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-3 sm:py-4 text-sm sm:text-base">
              No documents uploaded yet
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {chatStore.documents.map((doc: Document) => (
                <div key={doc.id} className="border rounded-md p-3 sm:p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm sm:text-base">{doc.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                    Uploaded: {doc.uploadedAt.toLocaleDateString()}
                  </p>
                  <div className="text-xs sm:text-sm bg-muted p-2 rounded max-h-[80px] sm:max-h-[100px] overflow-y-auto">
                    {doc.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default DocumentUpload;
