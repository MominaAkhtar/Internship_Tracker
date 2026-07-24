import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  FileText, 
  Tag, 
  Briefcase, 
  Clock, 
  FileSpreadsheet 
} from 'lucide-react';
import { getApplication, deleteApplication } from '../services/applications';
import { deserializeNotes } from '../utils/notesParser';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Tracky } from '../components/mascot/Tracky';
import { API_BASE_URL } from '../api/config';

export const ViewApplication = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const data = await getApplication(id);
        if (data) {
          setApp(data);
        }
      } catch (err) {
        showToast('Error loading application details', 'error');
        navigate('/applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this application tracker?')) return;
    setDeleting(true);
    try {
      await deleteApplication(id);
      showToast('Application deleted successfully', 'success');
      navigate('/applications');
    } catch (err) {
      showToast('Failed to delete application', 'error');
    } finally {
      setDeleting(false);
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

  if (!app) {
    return (
      <div className="text-center py-12">
        <Tracky expression="confused" className="w-20 h-20 mx-auto" />
        <h2 className="text-xl font-bold mt-4">Application not found</h2>
        <Button onClick={() => navigate('/applications')} className="mt-4">
          Back to list
        </Button>
      </div>
    );
  }

  const { location, priority, notes } = deserializeNotes(app.notes);

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-left">
      {/* Header section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/applications"
            className="p-2 rounded-xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-border text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black">{app.company_name}</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">{app.position}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/applications/${id}/edit`)}
            icon={<Edit3 className="w-4 h-4" />}
            size="sm"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
            icon={<Trash2 className="w-4 h-4" />}
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main details card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-xl space-y-6"
        >
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Application Status & Priority
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant={app.status}>{app.status}</Badge>
              <Badge variant={priority === 'High' ? 'danger' : priority === 'Medium' ? 'warning' : 'primary'}>
                {priority} Priority
              </Badge>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-dark-border" />

          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <FileSpreadsheet className="w-4 h-4 text-primary-500" />
              Notes & Information
            </h3>
            {notes ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-dark-border/20 p-4 rounded-2xl border border-gray-100/50 dark:border-dark-border whitespace-pre-wrap font-medium">
                {notes}
              </p>
            ) : (
              <div className="text-sm text-gray-400 italic py-4">No custom notes recorded for this application.</div>
            )}
          </div>
        </motion.div>

        {/* Right column metadata */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Location</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Resume</span>
                  {app.resume_version ? (
                    app.resume_version.startsWith('/uploads/') ? (
                      <a 
                        href={`${API_BASE_URL}${app.resume_version}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View / Download
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{app.resume_version}</span>
                    )
                  ) : (
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Not Specified</span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Interview Date</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {app.interview_date ? new Date(app.interview_date).toLocaleString() : 'Not Scheduled'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Created On</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive mascot panel inside view */}
          <div className="p-4 bg-primary-50/50 dark:bg-primary-950/10 rounded-2xl border border-primary-100/30 flex items-center gap-3">
            <Tracky expression={app.status === 'Offered' ? 'celebrating' : 'thinking'} className="w-12 h-12 flex-shrink-0" />
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-200 leading-snug">
              {app.status === 'Offered' ? "Woohoo! Keep track of your onboarding timeline." : "Remember to follow up 3-5 days after your interview!"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewApplication;
