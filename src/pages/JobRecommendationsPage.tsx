import React, { useState, useMemo } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  StudentNode,
  JobMatchCalculation
} from '../types/graph';
import {
  MatchIndicator,
  Button,
  Card,
  Badge
} from '../components/design-system/DesignTokens';
import {
  Search,
  Filter,
  X,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

interface JobRecommendationsPageProps {
  activeStudent: StudentNode;
  matches: JobMatchCalculation[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const JobRecommendationsPage: React.FC<JobRecommendationsPageProps> = ({
  activeStudent,
  matches,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const { navigate } = useRouter();

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('All');
  const [experienceFilter, setExperienceFilter] = useState<string>('All');
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);
  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'best' | 'highest' | 'lowest'>('best');

  // Mobile Filter Drawer State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Extract unique locations, job types, and skills for filters
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    matches.forEach(m => {
      // Normalize location e.g. "Pune / Remote" -> "Pune"
      const baseLoc = m.job.location.split('/')[0].trim();
      locs.add(baseLoc);
    });
    return ['All', ...Array.from(locs).sort()];
  }, [matches]);

  const uniqueJobTypes = useMemo(() => {
    const types = new Set<string>();
    matches.forEach(m => {
      if (m.job.jobType) types.add(m.job.jobType);
    });
    return ['All', ...Array.from(types).sort()];
  }, [matches]);

  const uniqueExperiences = useMemo(() => {
    const exps = new Set<string>();
    matches.forEach(m => {
      exps.add(m.job.experienceLevel);
    });
    return ['All', ...Array.from(exps).sort()];
  }, [matches]);

  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    matches.forEach(m => {
      m.matchedSkills.forEach(s => skills.add(s.skill.name));
      m.missingSkills.forEach(s => skills.add(s.skill.name));
    });
    return ['All', ...Array.from(skills).sort()];
  }, [matches]);

  // Filter and Sort Pipeline
  const filteredAndSortedMatches = useMemo(() => {
    let result = matches.filter(m => {
      // 1. Search Query (Title, Company, Description)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesTitle = m.job.title.toLowerCase().includes(q);
        const matchesCompany = m.job.company.toLowerCase().includes(q);
        const matchesDept = m.job.department?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany && !matchesDept) return false;
      }

      // 2. Location
      if (locationFilter !== 'All') {
        if (!m.job.location.toLowerCase().includes(locationFilter.toLowerCase())) {
          return false;
        }
      }

      // 3. Job Type
      if (jobTypeFilter !== 'All') {
        if (m.job.jobType !== jobTypeFilter) return false;
      }

      // 4. Experience
      if (experienceFilter !== 'All') {
        if (m.job.experienceLevel !== experienceFilter) return false;
      }

      // 5. Minimum Match %
      if (minMatchFilter > 0) {
        if (m.matchPercentage < minMatchFilter) return false;
      }

      // 6. Skill Filter
      if (skillFilter !== 'All') {
        const hasSkillInMatched = m.matchedSkills.some(ms => ms.skill.name === skillFilter);
        const hasSkillInMissing = m.missingSkills.some(ms => ms.skill.name === skillFilter);
        if (!hasSkillInMatched && !hasSkillInMissing) return false;
      }

      return true;
    });

    // Sort Options: Best Match (default), Highest Match, Lowest Match
    if (sortBy === 'best') {
      result.sort((a, b) => b.matchPercentage - a.matchPercentage || b.weightedScore - a.weightedScore);
    } else if (sortBy === 'highest') {
      result.sort((a, b) => b.matchPercentage - a.matchPercentage);
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => a.matchPercentage - b.matchPercentage);
    }

    return result;
  }, [
    matches,
    searchQuery,
    locationFilter,
    jobTypeFilter,
    experienceFilter,
    minMatchFilter,
    skillFilter,
    sortBy
  ]);

  const hasActiveFilters =
    searchQuery !== '' ||
    locationFilter !== 'All' ||
    jobTypeFilter !== 'All' ||
    experienceFilter !== 'All' ||
    minMatchFilter > 0 ||
    skillFilter !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setLocationFilter('All');
    setJobTypeFilter('All');
    setExperienceFilter('All');
    setMinMatchFilter(0);
    setSkillFilter('All');
    setSortBy('best');
  };

  // 1. LOADING STATE: Job Card Skeletons
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse" />
        </div>
        <div className="h-14 bg-white border border-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
              </div>
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-200 rounded w-16" />
                  <div className="h-6 bg-slate-200 rounded w-16" />
                </div>
              </div>
              <div className="h-9 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <Card className="p-10 max-w-xl mx-auto text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Unable to load job recommendations.</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {error || 'Unable to load job recommendations. Please try again.'}
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onRetry || (() => window.location.reload())}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Recommended Jobs
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Neo4j · Top 5 skill matches
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your top 5 published jobs, ranked by required-skill match. Jobs with no matched required skills are excluded.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Sort:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setSortBy('best')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                sortBy === 'best'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Best Match
            </button>
            <button
              onClick={() => setSortBy('highest')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                sortBy === 'highest'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Highest Match
            </button>
            <button
              onClick={() => setSortBy('lowest')}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                sortBy === 'lowest'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lowest Match
            </button>
          </div>
        </div>
      </div>

      {/* TOP SEARCH FIELD & FILTER CONTROLS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Top Search Field */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="sm:hidden flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Filter className="w-3.5 h-3.5" />}
              onClick={() => setIsMobileFilterOpen(true)}
              className="w-full"
            >
              Filters {hasActiveFilters && '• Active'}
            </Button>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 font-semibold px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP HORIZONTAL FILTER BAR */}
        <div className="hidden sm:flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Location Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Location:</span>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              aria-label="Filter by location"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Job Type:</span>
            <select
              value={jobTypeFilter}
              onChange={e => setJobTypeFilter(e.target.value)}
              aria-label="Filter by job type"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {uniqueJobTypes.map(jt => (
                <option key={jt} value={jt}>
                  {jt}
                </option>
              ))}
            </select>
          </div>

          {/* Experience Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Experience:</span>
            <select
              value={experienceFilter}
              onChange={e => setExperienceFilter(e.target.value)}
              aria-label="Filter by experience level"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              {uniqueExperiences.map(exp => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Match % */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1">
            <span className="text-slate-500 font-medium">Min Match %:</span>
            <select
              value={minMatchFilter}
              onChange={e => setMinMatchFilter(Number(e.target.value))}
              aria-label="Filter by minimum match percentage"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value={0}>Any Match</option>
              <option value={50}>≥ 50% Match</option>
              <option value={70}>≥ 70% Match</option>
              <option value={80}>≥ 80% Match</option>
            </select>
          </div>

          {/* Skill Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Skill:</span>
            <select
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
              aria-label="Filter by required or matched skill"
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1 max-w-[140px] truncate"
            >
              {uniqueSkills.map(sk => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER / MODAL */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Filter Recommended Jobs</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Location */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Location</label>
                <select
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Type */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Job Type</label>
                <select
                  value={jobTypeFilter}
                  onChange={e => setJobTypeFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  {uniqueJobTypes.map(jt => (
                    <option key={jt} value={jt}>
                      {jt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Experience Required</label>
                <select
                  value={experienceFilter}
                  onChange={e => setExperienceFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  {uniqueExperiences.map(exp => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Match % */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Minimum Match %</label>
                <select
                  value={minMatchFilter}
                  onChange={e => setMinMatchFilter(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value={0}>Any Match</option>
                  <option value={50}>≥ 50% Match</option>
                  <option value={70}>≥ 70% Match</option>
                  <option value={80}>≥ 80% Match</option>
                </select>
              </div>

              {/* Skill */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Skill</label>
                <select
                  value={skillFilter}
                  onChange={e => setSkillFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  {uniqueSkills.map(sk => (
                    <option key={sk} value={sk}>
                      {sk}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* JOB CARDS: Responsive Grid (Desktop: 2 or 3 columns, Tablet: 2 columns, Mobile: 1 column) */}
      {filteredAndSortedMatches.length === 0 ? (
        /* EMPTY STATE */
        <Card className="p-12 max-w-xl mx-auto text-center space-y-4 my-12 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">No matching jobs found.</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try changing your filters or adding more skills.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/profile')}
            >
              Update Skills
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedMatches.map((m, idx) => (
            <Card
              key={m.job.id}
              className={`p-5 sm:p-6 hover:border-slate-300 hover-card-elevation transition-all shadow-2xs flex flex-col justify-between space-y-4 group animate-card-entrance stagger-${Math.min((idx % 6) + 1, 6)}`}
            >
              {/* TOP HEADER: Title, Company, Location & Prominent Match Indicator */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug truncate">
                      {m.job.title}
                    </h2>
                    <div className="text-xs font-semibold text-slate-700 truncate">
                      {m.job.company}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{m.job.location}</span>
                    </div>
                  </div>

                  {/* PROMINENT MATCH PERCENTAGE (Prioritized) */}
                  <div className="shrink-0 text-right">
                    <MatchIndicator
                      percentage={m.matchPercentage}
                      variant="circle"
                      size="sm"
                    />
                    <span className="block text-[11px] font-bold text-slate-700 mt-1">
                      {m.matchPercentage}% Match
                    </span>
                  </div>
                </div>

                {/* METADATA CHIPS: Salary Range, Job Type, Experience Required */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  {m.job.salaryRange && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                      <IndianRupee className="w-3 h-3 text-emerald-600" />
                      <span>{m.job.salaryRange}</span>
                    </span>
                  )}
                  {m.job.jobType && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>{m.job.jobType}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{m.job.experienceLevel}</span>
                  </span>
                </div>

                {/* Progress Meter */}
                <div className="pt-1">
                  <MatchIndicator
                    percentage={m.matchPercentage}
                    variant="meter"
                    showLabel={false}
                  />
                </div>

                {/* MATCHING SKILLS SECTION (Prompt Example: ✓ Java, ✓ Python...) */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Matching Skills:</span>
                    <span className="text-emerald-700 font-semibold lowercase">
                      {m.matchedSkills.length} of {m.totalRequiredCount}
                    </span>
                  </div>
                  {m.matchedSkills.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No matching skills yet</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {m.matchedSkills.slice(0, 4).map(ms => (
                        <span
                          key={ms.skill.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{ms.skill.name}</span>
                        </span>
                      ))}
                      {m.matchedSkills.length > 4 && (
                        <span className="text-[11px] text-slate-500 font-medium px-1 py-0.5">
                          +{m.matchedSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* MISSING SKILLS SECTION (Prompt Example: Missing: Docker) */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    <span>Missing:</span>
                  </div>
                  {m.missingSkills.length === 0 ? (
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      None! All competencies satisfied.
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {m.missingSkills.slice(0, 3).map(ms => (
                        <span
                          key={ms.skill.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-semibold"
                        >
                          <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                          <span>{ms.skill.name}</span>
                        </span>
                      ))}
                      {m.missingSkills.length > 3 && (
                        <span className="text-[11px] text-slate-500 font-medium px-1 py-0.5">
                          +{m.missingSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CARD FOOTER: [View Job] Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => navigate(`/job/${m.job.id}`)}
                  className="w-full text-xs"
                >
                  View Job
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
