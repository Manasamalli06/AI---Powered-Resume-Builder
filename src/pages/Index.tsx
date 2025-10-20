import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/AuthForm";
import { Dashboard } from "./Dashboard";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Zap, Download, ArrowRight } from "lucide-react";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-2xl font-bold text-primary">Loading...</div>
      </div>
    );
  }

  if (session) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Resume Builder</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Create Professional
              <span className="block text-primary">
                AI-Powered Resumes
              </span>
              in Minutes
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Just describe your experience and career goals. Our advanced AI creates perfectly
              formatted, ATS-friendly resumes tailored to your needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button variant="hero" size="xl" asChild>
                <a href="#auth">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a href="#features">See How It Works</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section id="features" className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose ResumeAI?</h2>
            <p className="text-xl text-muted-foreground">
              Powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-xl shadow-lg border border-primary/20 hover:shadow-glow transition-all">
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Generation</h3>
              <p className="text-muted-foreground">
                Our advanced AI understands your experience and creates compelling, professional
                resumes that stand out.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-lg border border-primary/20 hover:shadow-glow transition-all">
              <div className="h-12 w-12 rounded-lg gradient-secondary flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">ATS-Friendly Format</h3>
              <p className="text-muted-foreground">
                Optimized for Applicant Tracking Systems to ensure your resume gets past the
                initial screening.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-lg border border-primary/20 hover:shadow-glow transition-all">
              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant PDF Download</h3>
              <p className="text-muted-foreground">
                Download your professionally formatted resume as a PDF, ready to send to
                employers immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Start Building Your Resume</h2>
              <p className="text-xl text-muted-foreground">
                Create your account to get started
              </p>
            </div>
            <div className="flex justify-center">
              <AuthForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">ResumeAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 ResumeAI. Powered by AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
