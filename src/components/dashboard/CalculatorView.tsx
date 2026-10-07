import React, { useState } from 'react';
import { useSemesterStore } from '../../store';
import { calculateCumulativeStats } from '../../core/gwa-engine';
import { DashboardStrip } from './DashboardStrip';
import { ActionToolbar } from '../toolbar/ActionToolbar';
import { SemesterList } from '../semester/SemesterList';
import { BulkPasteModal } from '../modals/BulkPasteModal';
import { LatinHonorsModal } from '../modals/LatinHonorsModal';
import { AchievementsModal } from '../modals/AchievementsModal';
import { CorScanModal } from '../scanner/CorScanModal';
import { PhotoScanModal } from '../scanner/PhotoScanModal';
import { ImportSuccessModal } from '../modals/ImportSuccessModal';
import { StoryMilestoneModal } from '../modals/StoryMilestoneModal';

export const CalculatorView: React.FC = () => {
  const semesters = useSemesterStore((s) => s.semesters);
  const addSemester = useSemesterStore((s) => s.addSemester);
  const stats = calculateCumulativeStats(semesters);

  // Modals state
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
  const [isLatinHonorsOpen, setIsLatinHonorsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isCorScanOpen, setIsCorScanOpen] = useState(false);
  const [isPhotoScanOpen, setIsPhotoScanOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ isOpen: boolean; count: number; title: string }>({
    isOpen: false,
    count: 0,
    title: '',
  });

  const handleAddSemester = () => {
    const semNumber = semesters.length + 1;
    const year = Math.ceil(semNumber / 2);
    const term = semNumber % 2 === 1 ? '1st Semester' : '2nd Semester';

    addSemester({
      id: crypto.randomUUID(),
      title: `Year ${year} - ${term}`,
      underload: false,
      computed: false,
      subjects: [
        { code: '', name: '', grade: '', units: 3 },
        { code: '', name: '', grade: '', units: 3 },
        { code: '', name: '', grade: '', units: 3 },
      ],
    });
  };

  return (
    <div>
      {/* ── PRINT ONLY OFFICIAL ACADEMIC TRANSCRIPT HEADER ── */}
      <div className="print-transcript-header">
        <h2>BICOL UNIVERSITY</h2>
        <h3>Official Academic Grade Transcript &amp; GWA Summary</h3>
        <div className="print-disclaimer">
          <i className="fa-solid fa-triangle-exclamation"></i> <strong>Disclaimer:</strong> This is an <strong>unofficial</strong> evaluation tool created to assist Bicol University students with GWA calculations and academic planning. This document is <strong>not</strong> an official transcript, certifiable record, or university-issued document.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '10px', padding: '6px 0', borderTop: '1px solid #ccc' }}>
          <span><strong>Cumulative GWA:</strong> <span>{stats.cumulativeGWA.toFixed(4)}</span></span>
          <span><strong>Total Earned Units:</strong> <span>{stats.totalUnits.toFixed(1)}</span></span>
          <span><strong>Date Generated:</strong> <span>{new Date().toLocaleDateString()}</span></span>
        </div>
      </div>

      {/* DASHBOARD SUMMARY CARDS */}
      <DashboardStrip />

      {/* TOOLBAR */}
      <ActionToolbar
        onAddSemester={handleAddSemester}
        onOpenScanCor={() => setIsCorScanOpen(true)}
        onOpenScanPhoto={() => setIsPhotoScanOpen(true)}
        onOpenBulkPaste={() => setIsBulkPasteOpen(true)}
        onOpenLatinHonors={() => setIsLatinHonorsOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenStoryCard={() => setIsStoryModalOpen(true)}
      />

      {/* SEMESTERS CONTAINER */}
      <SemesterList
        onAddSemester={handleAddSemester}
        onOpenScanCor={() => setIsCorScanOpen(true)}
        onOpenScanPhoto={() => setIsPhotoScanOpen(true)}
        onOpenLatinHonors={() => setIsLatinHonorsOpen(true)}
      />

      {/* MODALS */}
      <BulkPasteModal
        isOpen={isBulkPasteOpen}
        onClose={() => setIsBulkPasteOpen(false)}
      />

      <LatinHonorsModal
        isOpen={isLatinHonorsOpen}
        onClose={() => setIsLatinHonorsOpen(false)}
      />

      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <StoryMilestoneModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      <CorScanModal
        isOpen={isCorScanOpen}
        onClose={() => setIsCorScanOpen(false)}
        onSuccess={(count, title) => setSuccessInfo({ isOpen: true, count, title })}
      />

      <PhotoScanModal
        isOpen={isPhotoScanOpen}
        onClose={() => setIsPhotoScanOpen(false)}
        onSuccess={(count, title) => setSuccessInfo({ isOpen: true, count, title })}
      />

      <ImportSuccessModal
        isOpen={successInfo.isOpen}
        onClose={() => setSuccessInfo({ isOpen: false, count: 0, title: '' })}
        count={successInfo.count}
        semesterTitle={successInfo.title}
      />
    </div>
  );
};
