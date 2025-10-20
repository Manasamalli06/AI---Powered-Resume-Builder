import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { ResumeBuilder } from "@/components/ResumeBuilder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any>(null);

  useEffect(() => {
    getUser();
    fetchResumes();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching resumes:", error);
      return;
    }
    setResumes(data || []);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const handleResumeClick = (resume: any) => {
    setSelectedResume(resume);
    setShowBuilder(true);
  };

  const handleBackToDashboard = () => {
    setShowBuilder(false);
    setSelectedResume(null);
    fetchResumes(); // Refresh the list
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent gradient-hero">
              ResumeAI
            </h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {!showBuilder ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">My Resumes</h2>
                <p className="text-muted-foreground mt-1">
                  Create and manage your AI-powered resumes
                </p>
              </div>
              <Button 
                variant="gradient" 
                size="lg" 
                onClick={() => {
                  setSelectedResume(null);
                  setShowBuilder(true);
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Resume
              </Button>
            </div>

            {resumes.length === 0 ? (
              <Card className="border-dashed border-2 border-primary/30">
                <CardHeader className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <CardTitle>No resumes yet</CardTitle>
                  <CardDescription>
                    Get started by creating your first AI-powered resume
                  </CardDescription>
                  <Button
                    variant="gradient"
                    className="mt-6"
                    onClick={() => {
                      setSelectedResume(null);
                      setShowBuilder(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Resume
                  </Button>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20"
                    onClick={() => handleResumeClick(resume)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {resume.title}
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(resume.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {resume.prompt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">
                {selectedResume ? 'Edit Resume' : 'Create New Resume'}
              </h2>
              <Button variant="outline" onClick={handleBackToDashboard}>
                Back to Dashboard
              </Button>
            </div>
            <ResumeBuilder 
              userId={user?.id} 
              initialResume={selectedResume}
            />
          </div>
        )}
      </main>
    </div>
  );
};