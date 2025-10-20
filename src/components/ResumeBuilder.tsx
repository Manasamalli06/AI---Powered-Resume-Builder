import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ResumePreview } from "./ResumePreview";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications?: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

export const ResumeBuilder = ({ 
  userId, 
  initialResume 
}: { 
  userId: string;
  initialResume?: any;
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(
    initialResume?.content || null
  );
  const [resumeId, setResumeId] = useState<string | null>(
    initialResume?.id || null
  );

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter your requirements");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-resume", {
        body: { 
          prompt,
          existingResume: resumeData // Pass existing resume for edits
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const generatedResume = data.resumeData;
      setResumeData(generatedResume);

      // Save or update in database
      if (resumeId) {
        // Update existing resume
        const { error: updateError } = await supabase
          .from("resumes")
          .update({
            content: generatedResume,
            prompt: prompt, // Update with latest prompt
          })
          .eq("id", resumeId);

        if (updateError) throw updateError;
        toast.success("Resume updated successfully!");
      } else {
        // Create new resume
        const { data: savedResume, error: saveError } = await supabase
          .from("resumes")
          .insert({
            user_id: userId,
            title: generatedResume.personalInfo.fullName
              ? `${generatedResume.personalInfo.fullName}'s Resume`
              : "My Resume",
            prompt,
            content: generatedResume,
          })
          .select()
          .single();

        if (saveError) throw saveError;
        
        setResumeId(savedResume.id);
        toast.success("Resume generated successfully!");
      }
      
      setPrompt(""); // Clear prompt for next edit
    } catch (error: any) {
      console.error("Resume generation error:", error);
      toast.error(error.message || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="h-fit shadow-lg border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>AI Resume Builder</CardTitle>
          </div>
          <CardDescription>
            Describe your experience, skills, and the type of position you're targeting. Our AI will
            create a professional, ATS-friendly resume for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">
              {resumeData ? "Edit Your Resume" : "Your Requirements"}
            </Label>
            <Textarea
              id="prompt"
              placeholder={
                resumeData
                  ? "Example: Make the summary more concise, add Python to skills, update job title to Senior Engineer..."
                  : "Example: I'm a senior software engineer with 5 years of experience in React, Node.js, and AWS. I've led teams of 5+ developers and delivered multiple SaaS products. I hold a Computer Science degree from MIT. Looking for a Staff Engineer position..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={resumeData ? 6 : 12}
              className="resize-none"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            variant="gradient"
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {resumeData ? "Updating Resume..." : "Generating Resume..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {resumeData ? "Update Resume" : "Generate Resume"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {resumeData && (
        <ResumePreview resumeData={resumeData} resumeId={resumeId} />
      )}
    </div>
  );
};