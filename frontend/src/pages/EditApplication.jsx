import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Calendar, MapPin, FileText, AlignLeft } from 'lucide-react';
import { getApplication, updateApplication } from '../services/applications';
import { serializeNotes, deserializeNotes } from '../utils/notesParser';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Tracky } from '../components/mascot/Tracky';

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
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const data = await getApplication(id);
        if (data) {
          const parsed = deserializeNotes(data.notes);
          reset({
            company_name: data.company_name,
            position: data.position,
            status: data.status,
            location: parsed.location,
            priority: parsed.priority,
            resume_version: data.resume_version || '',
            interview_date: data.interview_date ? new Date(data.interview_date).toISOString().slice(0, 16) : '',
            notes: parsed.notes,
          });
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

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const combinedNotes = serializeNotes({
        location: data.location || 'Remote',
        priority: data.priority || 'Medium',
        notes: data.notes || ''
      });

      const payload = {
        company_name: data.company_name,
        position: data.position,
        status: data.status,
        notes: combinedNotes,
        resume_version: data.resume_version || null,
        interview_date: data.interview_date ? new Date(data.interview_date).toISOString() : null,
      };

      await updateApplication(id, payload);
      showToast('Application updated successfully!', 'success');
      navigate('/applications');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              name="company_name"
              placeholder="e.g. Google"
              error={errors.company_name}
              {...register('company_name')}
            />

            <Input
              label="Job Position"
              name="position"
              placeholder="e.g. Software Engineer Intern"
              error={errors.position}
              {...register('position')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Application Status
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offered">Offered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Priority
              </label>
              <select
                {...register('priority')}
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
              {...register('location')}
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Resume / Cover Letter Version"
              name="resume_version"
              placeholder="e.g. Resume_v3"
              error={errors.resume_version}
              {...register('resume_version')}
              icon={<FileText className="w-4 h-4 text-gray-400" />}
            />

            <Input
              label="Interview Date & Time"
              name="interview_date"
              type="datetime-local"
              error={errors.interview_date}
              {...register('interview_date')}
              icon={<Calendar className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Notes & Reminders
            </label>
            <div className="relative">
              <textarea
                {...register('notes')}
                rows="4"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
              />
              <AlignLeft className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/applications/${id}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              icon={submitting ? <Tracky expression="loading" className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
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
