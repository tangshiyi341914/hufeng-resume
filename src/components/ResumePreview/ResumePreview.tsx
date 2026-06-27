import React from 'react';
import { useResumeStore } from '../../store/resumeStore';
import ClassicTemplate from './ClassicTemplate';
import ModernTemplate from './ModernTemplate';
import MinimalTemplate from './MinimalTemplate';
import PaginatedPreview from './PaginatedPreview';

export default function ResumePreview() {
  const { currentResume } = useResumeStore();
  const { template, data, config, sectionOrder = ['workExperience', 'internships', 'education', 'skills', 'projects', 'languages', 'certifications'] } = currentResume;

  const render = () => {
    switch (template) {
      case 'classic': return <ClassicTemplate data={data} config={config} sectionOrder={sectionOrder} />;
      case 'modern': return <ModernTemplate data={data} config={config} sectionOrder={sectionOrder} />;
      case 'minimal': return <MinimalTemplate data={data} config={config} sectionOrder={sectionOrder} />;
      default: return <ClassicTemplate data={data} config={config} sectionOrder={sectionOrder} />;
    }
  };

  return (
    <div className="sticky top-4">
      <div className="resume-preview" id="resume-preview">
        <PaginatedPreview>
          {render()}
        </PaginatedPreview>
      </div>
    </div>
  );
}
