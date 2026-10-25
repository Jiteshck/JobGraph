import React, { useState } from 'react';
import {
  StudentNode,
  SkillNode,
  ProficiencyLevel
} from '../types/graph';
import {
  SkillChip,
  Button,
  Card,
  Badge
} from './design-system/DesignTokens';
import {
  User,
  Plus,
  Trash2,
  Check,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StudentManagerProps {
  students: StudentNode[];
  activeStudent: StudentNode;
  onSelectStudent: (studentId: string) => void;
  allSkills: SkillNode[];
  studentSkills: Array<{
    skill: SkillNode;
    proficiency: ProficiencyLevel;
    verified: boolean;
    acquiredDate: string;
  }>;
  onUpdateSkillProficiency: (skillId: string, level: ProficiencyLevel) => void;
  onAddSkill: (skillId: string, level: ProficiencyLevel) => void;
  onRemoveSkill: (skillId: string) => void;
  onCreateStudent: (student: Omit<StudentNode, 'id'>) => void;
}

export const StudentManager: React.FC<StudentManagerProps> = ({
  students,
  activeStudent,
  onSelectStudent,
  allSkills,
  studentSkills,
  onUpdateSkillProficiency,
  onAddSkill,
  onRemoveSkill,
  onCreateStudent
}) => {
  const [showAddSkillModal, setShowAddSkillModal] = useState<boolean>(false);
  const [selectedSkillToAdd, setSelectedSkillToAdd] = useState<string>(allSkills[0]?.id || '');
  const [newSkillProficiency, setNewSkillProficiency] = useState<ProficiencyLevel>('Intermediate');

  const [showCreateStudentModal, setShowCreateStudentModal] = useState<boolean>(false);
  const [newStudentForm, setNewStudentForm] = useState({
    name: '',
    rollNo: '',
    degree: 'Bachelor of Computer Applications (BCA)',
    semester: 6,
    cgpa: 8.0,
    targetRole: 'Full Stack Web Developer',
    email: '',
    avatarColor: '#2563EB'
  });

  const existingSkillIds = new Set(studentSkills.map(s => s.skill.id));
  const availableSkillsToAdd = allSkills.filter(s => !existingSkillIds.has(s.id));

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillToAdd) return;
    onAddSkill(selectedSkillToAdd, newSkillProficiency);
    setShowAddSkillModal(false);
  };

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.rollNo) return;
    onCreateStudent({
      ...newStudentForm,
      email: newStudentForm.email || `${newStudentForm.name.toLowerCase().replace(/\s+/g, '')}.bca@college.edu`
    });
    setShowCreateStudentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Academic Cohort Management
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              BCA Student Profiles & Skill Graph Inventory
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage student academic records and maintain <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">(:Student)-[:HAS_SKILL]-&gt;(:Skill)</code> graph relationships.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowCreateStudentModal(true)}
            >
              New Student Record
            </Button>
          </div>
        </div>

        {/* Student Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {students.map(s => {
            const isSelected = s.id === activeStudent.id;
            return (
              <div
                key={s.id}
                onClick={() => onSelectStudent(s.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/10 shadow-sm'
                    : 'border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs"
                    style={{ backgroundColor: s.avatarColor }}
                  >
                    {s.name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {s.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {s.rollNo}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between pt-2 border-t border-slate-200/60 font-medium">
                  <span>CGPA: <strong className="text-slate-800">{s.cgpa}</strong></span>
                  <span>Sem {s.semester}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Active Student Skill Inventory Panel */}
      <Card className="p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {activeStudent.name}'s Technical Inventory
              </h3>
              <Badge variant="primary">
                {studentSkills.length} Verified Skills
              </Badge>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
              <span>{activeStudent.degree}</span>
              <span>·</span>
              <span>Target: <strong className="text-slate-700">{activeStudent.targetRole}</strong></span>
              <span>·</span>
              <span>CGPA: <strong className="text-slate-800">{activeStudent.cgpa} / 10.0</strong></span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              if (availableSkillsToAdd.length > 0) {
                setSelectedSkillToAdd(availableSkillsToAdd[0].id);
              }
              setShowAddSkillModal(true);
            }}
            disabled={availableSkillsToAdd.length === 0}
          >
            Add Skill to Graph
          </Button>
        </div>

        {/* Skills Grid */}
        {studentSkills.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No skills currently assigned to this student node.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {studentSkills.map(({ skill, proficiency, verified }) => (
              <div
                key={skill.id}
                className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {skill.category}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {skill.name}
                    </h5>
                  </div>
                  <button
                    onClick={() => onRemoveSkill(skill.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded cursor-pointer"
                    title="Remove Skill Relationship"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Proficiency Level Selector */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Proficiency:</span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    {(['Beginner', 'Intermediate', 'Advanced'] as ProficiencyLevel[]).map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => onUpdateSkillProficiency(skill.id, lvl)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          proficiency === lvl
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {lvl[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-slate-600">Level: {proficiency}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Edge
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal: Add Skill to Student */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="p-6 w-full max-w-md shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Add Skill Edge to {activeStudent.name}
            </h4>
            <p className="text-xs text-slate-500">
              Creates a new <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">[:HAS_SKILL]</code> relationship in the Neo4j graph model.
            </p>

            <form onSubmit={handleAddSkillSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Technical Skill
                </label>
                <select
                  value={selectedSkillToAdd}
                  onChange={e => setSelectedSkillToAdd(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                >
                  {availableSkillsToAdd.map(sk => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} ({sk.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Proficiency Level
                </label>
                <select
                  value={newSkillProficiency}
                  onChange={e => setNewSkillProficiency(e.target.value as ProficiencyLevel)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                >
                  <option value="Beginner">Beginner (Foundational Knowledge)</option>
                  <option value="Intermediate">Intermediate (Project Experienced)</option>
                  <option value="Advanced">Advanced (Production Capable)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddSkillModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Add Relationship
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Create New Student */}
      {showCreateStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Create New BCA Student Node (:Student)
            </h4>

            <form onSubmit={handleCreateStudentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Malhotra"
                    value={newStudentForm.name}
                    onChange={e => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">College Roll No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA-2024-150"
                    value={newStudentForm.rollNo}
                    onChange={e => setNewStudentForm({ ...newStudentForm, rollNo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Academic CGPA (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="5.0"
                    max="10.0"
                    required
                    value={newStudentForm.cgpa}
                    onChange={e => setNewStudentForm({ ...newStudentForm, cgpa: parseFloat(e.target.value) || 7.0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Semester</label>
                  <select
                    value={newStudentForm.semester}
                    onChange={e => setNewStudentForm({ ...newStudentForm, semester: parseInt(e.target.value) || 6 })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                  >
                    <option value={4}>Semester 4</option>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6 (Final Year)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Web Developer"
                  value={newStudentForm.targetRole}
                  onChange={e => setNewStudentForm({ ...newStudentForm, targetRole: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateStudentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Create Student Node
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
