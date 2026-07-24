import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, AlignLeft, Upload, Paperclip } from 'lucide-react';
import { getApplication, updateApplication } from '../services/applications';
import { serializeNotes, deserializeNotes } from '../utils/notesParser';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Tracky } from '../components/mascot/Tracky';
import { DateTimePicker } from '../components/common/DateTimePicker';

const schema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  status: z.string().min(1, 'Status is required'),
  location: z.string().optional(),
  priority: z.string().default('Medium'),
  resume_version: z.string().optional(),
  interview_date: z.string().optional(),
  notes: z.string().optional(),
});

export const EditApplication = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumePath, setResumePath] = useState('');
  const [resumeName, setResumeName] = useState('');

  const lastSavedValuesRef = useRef({});
  const pendingUpdatesRef = useRef({});
  const isSavingRef = useRef(false);
  const debounceTimeoutRefs = useRef({});
  const saveSuccessTimeoutRef = useRef(null);

  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [saveError, setSaveError] = useState('');

  const isDifferent = (a, b) => {
    if (a === undefined) a = '';
    if (b === undefined) b = '';
    if (a === null) a = '';
    if (b === null) b = '';
    return String(a).trim() !== String(b).trim();
  };

  const processSaveQueue = async () => {
    if (isSavingRef.current) {
      return;
    }

    const updates = { ...pendingUpdatesRef.current };
    if (Object.keys(updates).length === 0) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');
    setSaveError('');

    // Clear the keys we are about to process
    for (const key of Object.keys(updates)) {
      delete pendingUpdatesRef.current[key];
    }

    try {
      const payload = {};
      let hasNotesUpdate = false;

      if ('company_name' in updates && isDifferent(updates.company_name, lastSavedValuesRef.current.company_name)) {
        payload.company_name = updates.company_name;
      }
      if ('position' in updates && isDifferent(updates.position, lastSavedValuesRef.current.position)) {
        payload.position = updates.position;
      }
      if ('status' in updates && isDifferent(updates.status, lastSavedValuesRef.current.status)) {
        payload.status = updates.status;
      }
      if ('interview_date' in updates) {
        const oldDate = lastSavedValuesRef.current.interview_date;
        const newDate = updates.interview_date;
        if (isDifferent(newDate, oldDate)) {
          payload.interview_date = newDate ? new Date(newDate).toISOString() : null;
        }
      }
      if ('resume_version' in updates && isDifferent(updates.resume_version, lastSavedValuesRef.current.resume_version)) {
        payload.resume_version = updates.resume_version;
      }

      if ('location' in updates || 'priority' in updates || 'notes' in updates) {
        const currentLoc = 'location' in updates ? updates.location : getValues('location');
        const currentPriority = 'priority' in updates ? updates.priority : getValues('priority');
        const currentNotesText = 'notes' in updates ? updates.notes : getValues('notes');

        const oldLoc = lastSavedValuesRef.current.location;
        const oldPriority = lastSavedValuesRef.current.priority;
        const oldNotesText = lastSavedValuesRef.current.notes;

        if (isDifferent(currentLoc, oldLoc) || isDifferent(currentPriority, oldPriority) || isDifferent(currentNotesText, oldNotesText)) {
          payload.notes = serializeNotes({
            location: currentLoc || 'Remote',
            priority: currentPriority || 'Medium',
            notes: currentNotesText || ''
          });
          hasNotesUpdate = true;
        }
      }

      if (Object.keys(payload).length > 0) {
        await updateApplication(id, payload);

        // Update lastSavedValuesRef.current
        if ('company_name' in payload) lastSavedValuesRef.current.company_name = payload.company_name;
        if ('position' in payload) lastSavedValuesRef.current.position = payload.position;
        if ('status' in payload) lastSavedValuesRef.current.status = payload.status;
        if ('interview_date' in payload) lastSavedValuesRef.current.interview_date = payload.interview_date ? new Date(payload.interview_date).toISOString() : '';
        if ('resume_version' in payload) lastSavedValuesRef.current.resume_version = payload.resume_version;
        if (hasNotesUpdate) {
          lastSavedValuesRef.current.location = 'location' in updates ? updates.location : getValues('location');
          lastSavedValuesRef.current.priority = 'priority' in updates ? updates.priority : getValues('priority');
          lastSavedValuesRef.current.notes = 'notes' in updates ? updates.notes : getValues('notes');
        }

        setSaveStatus('saved');

        if (saveSuccessTimeoutRef.current) {
          clearTimeout(saveSuccessTimeoutRef.current);
        }
        saveSuccessTimeoutRef.current = setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } else {
        setSaveStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      setSaveError(err.response?.data?.detail || 'Failed to save changes. Please try again.');
    } finally {
      isSavingRef.current = false;
      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        processSaveQueue();
      }
    }
  };

  const enqueueUpdate = async (name, value) => {
    const isValid = await trigger(name);
    if (!isValid) return;

    if (!isDifferent(value, lastSavedValuesRef.current[name])) {
      return;
    }

    pendingUpdatesRef.current[name] = value;
    processSaveQueue();
  };

  const handleFieldChange = (name, value) => {
    if (!isDifferent(value, lastSavedValuesRef.current[name])) {
      if (debounceTimeoutRefs.current[name]) {
        clearTimeout(debounceTimeoutRefs.current[name]);
        delete debounceTimeoutRefs.current[name];
      }
      return;
    }

    if (['company_name', 'position', 'location', 'notes'].includes(name)) {
      if (debounceTimeoutRefs.current[name]) {
        clearTimeout(debounceTimeoutRefs.current[name]);
      }
      debounceTimeoutRefs.current[name] = setTimeout(() => {
        enqueueUpdate(name, value);
      }, 750);
    } else {
      enqueueUpdate(name, value);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext)) {
      showToast('Please select a valid document file (pdf, docx, doc, txt).', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingResume(true);
    try {
      const res = await client.post('/applications/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data && res.data.resume_path) {
        setResumePath(res.data.resume_path);
        setResumeName(res.data.original_name);
        showToast('Resume uploaded successfully!', 'success');
        handleFieldChange('resume_version', res.data.resume_path);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to upload resume.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const { register, control, reset, getValues, trigger, watch, clearErrors, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const statusValue = watch('status');

  const isFinalStatus = (status) => {
    if (!status) return false;
    const finalStatuses = ['offered', 'rejected', 'withdrawn', 'accepted', 'declined'];
    return finalStatuses.includes(status.toLowerCase());
  };

  useEffect(() => {
    if (isFinalStatus(statusValue)) {
      clearErrors('interview_date');
    }
  }, [statusValue, clearErrors]);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const data = await getApplication(id);
        if (data) {
          const parsed = deserializeNotes(data.notes);
          let initialResumePath = '';
          if (data.resume_version) {
            initialResumePath = data.resume_version;
            setResumePath(data.resume_version);
            setResumeName(data.resume_version.split('/').pop());
          }
          const initialVals = {
            company_name: data.company_name,
            position: data.position,
            status: data.status,
            location: parsed.location || 'Remote',
            priority: parsed.priority || 'Medium',
            resume_version: initialResumePath,
            interview_date: data.interview_date ? new Date(data.interview_date).toISOString() : '',
            notes: parsed.notes || '',
          };
          lastSavedValuesRef.current = initialVals;
          reset(initialVals);
        }
      } catch (err) {
        showToast('Error loading application tracker details', 'error');
        navigate('/applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id, reset, navigate]);

  useEffect(() => {
    return () => {
      if (saveSuccessTimeoutRef.current) clearTimeout(saveSuccessTimeoutRef.current);
      Object.values(debounceTimeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Tracky expression="loading" className="w-16 h-16" />
        <span className="text-xs uppercase font-bold tracking-widest text-gray-400 dark:text-gray-600 animate-pulse mt-4">
          Loading application...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-left">
      <div className="flex items-center gap-3">
        <Link
          to={`/applications/${id}`}
          className="p-2 rounded-xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black">Edit Application</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">Update your application details for company positions.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
      >
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              name="company_name"
              placeholder="e.g. Google"
              error={errors.company_name}
              {...register('company_name', {
                onChange: (e) => handleFieldChange('company_name', e.target.value)
              })}
            />

            <Input
              label="Job Position"
              name="position"
              placeholder="e.g. Software Engineer Intern"
              error={errors.position}
              {...register('position', {
                onChange: (e) => handleFieldChange('position', e.target.value)
              })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Application Status
              </label>
              <select
                {...register('status', {
                  onChange: (e) => handleFieldChange('status', e.target.value)
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Assessment">Assessment</option>
                <option value="Interview">Interview</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Follow-up">Follow-up</option>
                <option value="In Progress">In Progress</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Priority
              </label>
              <select
                {...register('priority', {
                  onChange: (e) => handleFieldChange('priority', e.target.value)
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <Input
              label="Job Location"
              name="location"
              placeholder="e.g. Remote"
              error={errors.location}
              {...register('location', {
                onChange: (e) => handleFieldChange('location', e.target.value)
              })}
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Upload Resume (PDF, DOCX, DOC, TXT)
              </label>
              <div className="relative flex items-center justify-center border border-dashed border-gray-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-400 rounded-xl p-2.5 bg-gray-50/50 dark:bg-dark-border/10 transition-all h-[42px]">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleResumeUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingResume}
                />
                <div className="flex items-center gap-1.5 text-center pointer-events-none select-none">
                  {uploadingResume ? (
                    <span className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs">
                      Uploading...
                    </span>
                  ) : resumePath ? (
                    <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <Paperclip className="w-3.5 h-3.5" />
                      {resumeName}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      Choose file or drag here
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Controller
              name="interview_date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label="Interview Date & Time"
                  name="interview_date"
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    handleFieldChange('interview_date', val);
                  }}
                  error={errors.interview_date}
                  disabled={isFinalStatus(statusValue)}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Notes & Reminders
            </label>
            <div className="relative">
              <textarea
                {...register('notes', {
                  onChange: (e) => handleFieldChange('notes', e.target.value)
                })}
                rows="4"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              />
              <AlignLeft className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-semibold animate-pulse">
                  <span className="w-4 h-4 border-2 border-gray-500 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving changes...</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-bold animate-fade-in">
                  <span>✔ Changes Saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex flex-col gap-1">
                  <span className="text-rose-500 text-sm font-semibold">
                    {saveError}
                  </span>
                  <button
                    type="button"
                    onClick={() => processSaveQueue()}
                    className="text-xs text-primary-500 hover:text-primary-600 underline font-bold text-left cursor-pointer"
                  >
                    Retry now
                  </button>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/applications/${id}`)}
            >
              Back to Application
            </Button>
          </div>
        </form>

        <div className="absolute right-[-10px] bottom-[-20px] opacity-10 pointer-events-none select-none">
          <Tracky expression="thinking" className="w-36 h-36" />
        </div>
      </motion.div>
    </div>
  );
};

export default EditApplication;
