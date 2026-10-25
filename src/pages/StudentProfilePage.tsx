import React, { useState, useEffect, useMemo } from 'react';
import {
  StudentNode,
  SkillNode,
  ProficiencyLevel
} from '../types/graph';
import {
  SkillChip,
  Button,
  Card,
  Badge,
  GraphMotif
} from '../components/design-system';
import {
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface StudentProfilePageProps {
  activeStudent: StudentNode;
  allSkills: SkillNode[];
  studentSkills: Array<{
    skill: SkillNode;
    proficiency: ProficiencyLevel;
    verified: boolean;
    acquiredDate: string;
  }>;
  onSaveProfile?: (
    updatedStudent: Partial<StudentNode>,
    selectedSkillIds: string[]
  ) => Promise<void>;
  isLoadingInitial?: boolean;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  activeStudent,
  allSkills,
  studentSkills,
  onSaveProfile,
  isLoadingInitial = false
}) => {
  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [education, setEducation] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('Fresher');
  const [preferredLocation, setPreferredLocation] = useState<string>('');
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Search in multi-select skills
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState<boolean>(false);

  // Status and Validation State
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state when activeStudent changes
  useEffect(() => {
    if (activeStudent) {
      setFullName(activeStudent.name || '');
      setEmail(activeStudent.email || '');
      setEducation(activeStudent.degree || '');
      setExperienceLevel(activeStudent.experienceLevel || 'Fresher');
      setPreferredLocation(activeStudent.preferredLocation || '');
    }
  }, [activeStudent]);

  useEffect(() => {
    if (studentSkills) {
      setSelectedSkillIds(studentSkills.map(s => s.skill.id));
    }
  }, [studentSkills]);

  // Filter skills taxonomy for search
  const filteredAvailableSkills = useMemo(() => {
    return allSkills.filter(sk => {
      const matchesSearch = sk.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                            sk.category.toLowerCase().includes(skillSearchQuery.toLowerCase());
      const notYetSelected = !selectedSkillIds.includes(sk.id);
      return matchesSearch && notYetSelected;
    });
  }, [allSkills, skillSearchQuery, selectedSkillIds]);

  // Selected skill objects
  const selectedSkillObjects = useMemo(() => {
    return selectedSkillIds
      .map(id => allSkills.find(s => s.id === id))
      .filter((s): s is SkillNode => Boolean(s));
  }, [selectedSkillIds, allSkills]);

  // Profile completion calculation (0 - 100%)
  const completionPercentage = useMemo(() => {
    let filled = 0;
    const totalFields = 6;
    if (fullName.trim()) filled++;
    if (email.trim()) filled++;
    if (education.trim()) filled++;
    if (experienceLevel.trim()) filled++;
    if (preferredLocation.trim()) filled++;
    if (selectedSkillIds.length > 0) filled++;
    return Math.round((filled / totalFields) * 100);
  }, [fullName, email, education, experienceLevel, preferredLocation, selectedSkillIds]);

  // Skill Add / Remove
  const handleAddSkill = (skillId: string) => {
    if (!selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(prev => [...prev, skillId]);
      if (errors.skills) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.skills;
          return next;
        });
      }
    }
    setSkillSearchQuery('');
  };

  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkillIds(prev => prev.filter(id => id !== skillId));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required. Please enter your name.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email format (e.g. name@college.edu).';
    }

    if (!education.trim()) {
      newErrors.education = 'Education credential is required (e.g. BCA).';
    }

    if (!experienceLevel.trim()) {
      newErrors.experienceLevel = 'Please select your experience level.';
    }

    if (!preferredLocation.trim()) {
      newErrors.preferredLocation = 'Preferred job location is required (e.g. Pune).';
    }

    if (selectedSkillIds.length === 0) {
      newErrors.skills = 'Please select at least one technical skill to enable graph matching.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      if (onSaveProfile) {
        await onSaveProfile(
          {
            name: fullName.trim(),
            email: email.trim(),
            degree: education.trim(),
            experienceLevel,
            preferredLocation: preferredLocation.trim()
          },
          selectedSkillIds
        );
      }
      setSuccessMessage('Profile saved successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Unable to save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Skeleton Loading State
  if (isLoadingInitial) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-7 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-10 bg-slate-100 rounded" />
            <div className="h-24 bg-slate-100 rounded" />
          </div>
          <div className="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
            <div className="h-20 bg-slate-100 rounded" />
            <div className="h-32 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Build Your Job Profile
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            GET/PUT /api/students/me
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Tell us about your background and skills so we can find relevant job opportunities.
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Two-Column Layout (Responsive: Form Left, Live Summary Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Profile Form */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-7 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* Field 1: Full Name */}
              <div className="space-y-1">
                <label htmlFor="fullName" className="block text-slate-700 font-semibold">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  aria-required="true"
                  aria-invalid={Boolean(errors.fullName)}
                  onChange={e => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-xs transition-all ${
                    errors.fullName
                      ? 'bg-rose-50/40 border border-rose-300 text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  } outline-none`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Field 2: Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-slate-700 font-semibold">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Your account email"
                  value={email}
                  disabled
                  aria-required="true"
                  aria-invalid={Boolean(errors.email)}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-xs transition-all ${
                    errors.email
                      ? 'bg-rose-50/40 border border-rose-300 text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  } outline-none`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Field 3: Education */}
              <div className="space-y-1">
                <label htmlFor="education" className="block text-slate-700 font-semibold">
                  Education <span className="text-rose-500">*</span>
                </label>
                <input
                  id="education"
                  type="text"
                  placeholder="e.g. BCA"
                  value={education}
                  aria-required="true"
                  aria-invalid={Boolean(errors.education)}
                  onChange={e => {
                    setEducation(e.target.value);
                    if (errors.education) setErrors(prev => ({ ...prev, education: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-xs transition-all ${
                    errors.education
                      ? 'bg-rose-50/40 border border-rose-300 text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  } outline-none`}
                />
                {errors.education && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.education}
                  </p>
                )}
              </div>

              {/* Field 4: Experience Level */}
              <div className="space-y-1">
                <label htmlFor="experienceLevel" className="block text-slate-700 font-semibold">
                  Experience Level <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    aria-required="true"
                    aria-invalid={Boolean(errors.experienceLevel)}
                    onChange={e => {
                      setExperienceLevel(e.target.value);
                      if (errors.experienceLevel) setErrors(prev => ({ ...prev, experienceLevel: '' }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-lg text-xs appearance-none transition-all cursor-pointer ${
                      errors.experienceLevel
                        ? 'bg-rose-50/40 border border-rose-300 text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                    } outline-none`}
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0–1 years">0–1 years</option>
                    <option value="1–3 years">1–3 years</option>
                    <option value="3+ years">3+ years</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.experienceLevel && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.experienceLevel}
                  </p>
                )}
              </div>

              {/* Field 5: Preferred Location */}
              <div className="space-y-1">
                <label htmlFor="preferredLocation" className="block text-slate-700 font-semibold">
                  Preferred Location <span className="text-rose-500">*</span>
                </label>
                <input
                  id="preferredLocation"
                  type="text"
                  placeholder="e.g. Pune"
                  value={preferredLocation}
                  aria-required="true"
                  aria-invalid={Boolean(errors.preferredLocation)}
                  onChange={e => {
                    setPreferredLocation(e.target.value);
                    if (errors.preferredLocation) setErrors(prev => ({ ...prev, preferredLocation: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-xs transition-all ${
                    errors.preferredLocation
                      ? 'bg-rose-50/40 border border-rose-300 text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                  } outline-none`}
                />
                {errors.preferredLocation && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.preferredLocation}
                  </p>
                )}
              </div>

              {/* Field 6: Skills (Searchable Multi-Select Component) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-semibold">
                    Skills <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {selectedSkillIds.length} skills selected
                  </span>
                </div>

                {/* Selected Skills Chips Container */}
                <div
                  className={`p-3 rounded-xl min-h-[52px] flex flex-wrap gap-1.5 transition-all ${
                    errors.skills
                      ? 'bg-rose-50/30 border border-rose-300'
                      : 'bg-slate-50/80 border border-slate-200'
                  }`}
                >
                  {selectedSkillObjects.length === 0 ? (
                    <span className="text-slate-400 text-xs italic self-center">
                      No skills selected yet. Search and select technical competencies below.
                    </span>
                  ) : (
                    selectedSkillObjects.map(sk => (
                      <span
                        key={sk.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold text-xs shadow-2xs"
                      >
                        <span>{sk.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title={`Remove ${sk.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {errors.skills && (
                  <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.skills}
                  </p>
                )}

                {/* Searchable Skills Input & Dropdown */}
                <div className="relative pt-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="skillSearch"
                      type="text"
                      placeholder="Search and add skills (e.g. Java, Python, MongoDB, SQL, Git)..."
                      aria-label="Search and add skills to profile"
                      aria-expanded={isSkillDropdownOpen}
                      value={skillSearchQuery}
                      onChange={e => {
                        setSkillSearchQuery(e.target.value);
                        setIsSkillDropdownOpen(true);
                      }}
                      onFocus={() => setIsSkillDropdownOpen(true)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                    />
                  </div>

                  {/* Dropdown Options */}
                  {isSkillDropdownOpen && (
                    <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-0.5 text-xs">
                      <div className="flex items-center justify-between px-2.5 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span>Available Taxonomy Skills</span>
                        <button
                          type="button"
                          onClick={() => setIsSkillDropdownOpen(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Close
                        </button>
                      </div>

                      {filteredAvailableSkills.length === 0 ? (
                        <div className="p-3 text-center text-slate-400 text-xs italic">
                          No matching skills available to add.
                        </div>
                      ) : (
                        filteredAvailableSkills.map(sk => (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() => handleAddSkill(sk.id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <span className="font-semibold text-slate-800 group-hover:text-blue-700">
                              {sk.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {sk.category}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Fields marked with <span className="text-rose-500 font-bold">*</span> are required
                </span>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Profile Summary */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 sm:p-7 space-y-5 bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Live Profile Summary
              </h2>
              <Badge variant="primary" size="sm">
                Graph Node Preview
              </Badge>
            </div>

            {/* Profile Completion Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Profile Completion</span>
                <span className="font-bold tabular-nums text-blue-600">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Live Attributes Display */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Name
                  </span>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {fullName.trim() || <span className="text-slate-400 italic font-normal">Not specified</span>}
                  </div>
                  {email.trim() && (
                    <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                      {email.trim()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Education
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {education.trim() || <span className="text-slate-400 italic font-normal">Not specified</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Experience
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {experienceLevel || 'Fresher'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                    Preferred Location
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {preferredLocation.trim() || <span className="text-slate-400 italic font-normal">Not specified</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Chips Summary */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Skills ({selectedSkillObjects.length})
                </span>
                <span className="text-[11px] text-slate-400">Connected</span>
              </div>

              {selectedSkillObjects.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No skills selected yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedSkillObjects.map(sk => (
                    <SkillChip
                      key={sk.id}
                      name={sk.name}
                      status="matched"
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Graph Relationship Motif */}
          <GraphMotif
            topLabel={selectedSkillObjects[0]?.name || "Java"}
            topType="Skill"
            bottomLabel={selectedSkillObjects[1]?.name || "Python"}
            bottomType="Skill"
            leftLabel={fullName.trim().split(' ')[0] || "Student"}
            leftType="Student"
            rightLabel="Backend Developer"
            rightType="Job"
            badgeLabel="Skill Relationships"
            variant="compact"
            caption="Profile skill nodes link directly to Job requirements"
          />
        </div>
      </div>
    </div>
  );
};
