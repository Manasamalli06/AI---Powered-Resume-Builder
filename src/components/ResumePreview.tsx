import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { ResumeData } from "./ResumeBuilder";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface ResumePreviewProps {
  resumeData: ResumeData;
  resumeId: string | null;
}

export const ResumePreview = ({ resumeData }: ResumePreviewProps) => {
  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont("helvetica", "bold");
        } else {
          pdf.setFont("helvetica", "normal");
        }
        const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.5);
      };

      // Header
      addText(resumeData.personalInfo.fullName, 20, true);
      yPosition += 5;
      
      const contactInfo = [
        resumeData.personalInfo.email,
        resumeData.personalInfo.phone,
        resumeData.personalInfo.location,
      ].filter(Boolean).join(" | ");
      addText(contactInfo, 10);
      
      if (resumeData.personalInfo.linkedIn || resumeData.personalInfo.portfolio) {
        const links = [
          resumeData.personalInfo.linkedIn,
          resumeData.personalInfo.portfolio,
        ].filter(Boolean).join(" | ");
        addText(links, 10);
      }
      yPosition += 10;

      // Summary
      addText("PROFESSIONAL SUMMARY", 14, true);
      yPosition += 2;
      addText(resumeData.summary, 10);
      yPosition += 10;

      // Experience
      addText("WORK EXPERIENCE", 14, true);
      yPosition += 2;
      resumeData.experience.forEach((exp) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        addText(`${exp.position} at ${exp.company}`, 11, true);
        addText(`${exp.startDate} - ${exp.endDate}`, 9);
        exp.responsibilities.forEach((resp) => {
          addText(`• ${resp}`, 10);
        });
        yPosition += 5;
      });

      // Education
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      addText("EDUCATION", 14, true);
      yPosition += 2;
      resumeData.education.forEach((edu) => {
        addText(`${edu.degree} in ${edu.field}`, 11, true);
        addText(`${edu.institution} - ${edu.graduationDate}`, 10);
        if (edu.gpa) {
          addText(`GPA: ${edu.gpa}`, 10);
        }
        yPosition += 5;
      });

      // Skills
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      addText("SKILLS", 14, true);
      yPosition += 2;
      addText(`Technical: ${resumeData.skills.technical.join(", ")}`, 10);
      addText(`Soft Skills: ${resumeData.skills.soft.join(", ")}`, 10);
      yPosition += 10;

      // Projects
      if (resumeData.projects && resumeData.projects.length > 0) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        addText("PROJECTS", 14, true);
        yPosition += 2;
        resumeData.projects.forEach((project) => {
          addText(project.name, 11, true);
          addText(project.description, 10);
          addText(`Technologies: ${project.technologies.join(", ")}`, 10);
          if (project.link) {
            addText(project.link, 9);
          }
          yPosition += 5;
        });
      }

      // Certifications
      if (resumeData.certifications && resumeData.certifications.length > 0) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        addText("CERTIFICATIONS", 14, true);
        yPosition += 2;
        resumeData.certifications.forEach((cert) => {
          addText(`• ${cert}`, 10);
        });
      }

      pdf.save(`${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`);
      toast.success("Resume downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to download PDF");
    }
  };

  return (
    <Card className="shadow-lg border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Resume Preview</CardTitle>
        <Button variant="gradient" onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 bg-white text-gray-900 p-8 rounded-lg border">
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {resumeData.personalInfo.fullName}
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {resumeData.personalInfo.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {resumeData.personalInfo.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {resumeData.personalInfo.location}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-700">
              {resumeData.personalInfo.linkedIn && (
                <span className="flex items-center gap-1">
                  <Linkedin className="h-4 w-4" />
                  {resumeData.personalInfo.linkedIn}
                </span>
              )}
              {resumeData.personalInfo.portfolio && (
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {resumeData.personalInfo.portfolio}
                </span>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">PROFESSIONAL SUMMARY</h2>
            <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
          </div>

          {/* Experience */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">WORK EXPERIENCE</h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {exp.startDate} - {exp.endDate}
                    </p>
                  </div>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                    {exp.responsibilities.map((resp, rIdx) => (
                      <li key={rIdx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">EDUCATION</h2>
            <div className="space-y-3">
              {resumeData.education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-gray-700">{edu.institution}</p>
                    </div>
                    <p className="text-sm text-gray-600">{edu.graduationDate}</p>
                  </div>
                  {edu.gpa && <p className="text-sm text-gray-600 mt-1">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">SKILLS</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Technical:</span>{" "}
                {resumeData.skills.technical.join(", ")}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Soft Skills:</span>{" "}
                {resumeData.skills.soft.join(", ")}
              </p>
            </div>
          </div>

          {/* Projects */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">PROJECTS</h2>
              <div className="space-y-3">
                {resumeData.projects.map((project, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    <p className="text-gray-700">{project.description}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Technologies: {project.technologies.join(", ")}
                    </p>
                    {project.link && (
                      <p className="text-sm text-primary mt-1">{project.link}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">CERTIFICATIONS</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {resumeData.certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};