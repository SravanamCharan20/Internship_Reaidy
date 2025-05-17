
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Knowledge Base Document</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Document Name</Label>
              <Input
                id="name"
                placeholder="Enter document name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Document Content</Label>
              <Textarea
                id="content"
                placeholder="Enter document content (FAQs, product info, etc.)"
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Upload Document"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {chatStore.documents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No documents uploaded yet
            </p>
          ) : (
            <div className="space-y-4">
              {chatStore.documents.map((doc: Document) => (
                <div key={doc.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{doc.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Uploaded: {doc.uploadedAt.toLocaleDateString()}
                  </p>
                  <div className="text-sm bg-muted p-2 rounded max-h-[100px] overflow-y-auto">
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
