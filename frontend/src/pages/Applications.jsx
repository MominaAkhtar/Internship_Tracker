import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  FileText, 
  Calendar, 
  ExternalLink, 
  Trash2, 
  Edit3 
} from 'lucide-react';
import { getApplications, deleteApplication } from '../services/applications';
import { deserializeNotes } from '../utils/notesParser';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Tracky } from '../components/mascot/Tracky';

export const Applications = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search/Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchApps = async () => {
    try {
      setLoading(true);
      const data = await getApplications();
      if (data) {
        setApps(data);
      }
    } catch (err) {
      showToast('Error loading application tracker data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // Filter and sort computation
  useEffect(() => {
    let result = [...apps];

    // Search
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(
        app =>
          app.company_name.toLowerCase().includes(q) ||
          app.position.toLowerCase().includes(q) ||
          (app.notes && app.notes.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(app => app.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      result = result.filter(app => {
        const { priority } = deserializeNotes(app.notes);
        return priority === priorityFilter;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'company') return a.company_name.localeCompare(b.company_name);
      if (sortBy === 'position') return a.position.localeCompare(b.position);
      return 0;
    });

    setFilteredApps(result);
    setCurrentPage(1); // Reset page on filter
  }, [apps, search, statusFilter, priorityFilter, sortBy]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this application tracker?')) return;
    try {
      await deleteApplication(id);
      showToast('Application deleted successfully', 'success');
      setApps(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      showToast('Failed to delete application', 'error');
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Applications Board</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">Manage and trace your prospective internship applications.</p>
        </div>
        <Button onClick={() => navigate('/applications/new')} icon={<Plus className="w-4 h-4" />} className="w-full sm:w-auto shadow-md">
          Add Application
        </Button>
      </div>

      {/* Search, Filter, Sort Controls Panel */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Search */}
        <div className="md:col-span-1">
          <Input
            label="Search"
            placeholder="Search company or position..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status
          </label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
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

        {/* Priority Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Priority
          </label>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort By
          </label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm font-semibold focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="latest">Latest Added</option>
            <option value="oldest">Oldest Added</option>
            <option value="company">Company (A-Z)</option>
            <option value="position">Position (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Pinterest Grid Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Tracky expression="loading" className="w-16 h-16" />
          <span className="text-xs uppercase font-bold tracking-widest text-gray-400 dark:text-gray-600 animate-pulse mt-4">
            Fetching tracker board...
          </span>
        </div>
      ) : paginatedApps.length > 0 ? (
        <div className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {paginatedApps.map(app => {
                const { location, priority, notes } = deserializeNotes(app.notes);

                return (
                  <motion.div
                    key={app.id}
                    variants={cardVariants}
                    layout
                    whileHover={{ y: -6, scale: 1.01 }}
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between h-72 group relative overflow-hidden text-left"
                  >
                    {/* Glowing effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/5 to-accent-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div>
                      {/* Top header row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-border dark:to-dark-border/40 border border-primary-200/20 flex items-center justify-center text-primary-600 dark:text-primary-400 font-display font-black text-sm select-none">
                          {app.company_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          <Badge variant={app.status}>{app.status}</Badge>
                          <span className={`text-[9px] uppercase font-extrabold tracking-wider ${
                            priority === 'High' ? 'text-rose-500' : priority === 'Medium' ? 'text-amber-500' : 'text-primary-400'
                          }`}>
                            {priority}
                          </span>
                        </div>
                      </div>

                      {/* Job Title details */}
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors truncate">
                          {app.company_name}
                        </h3>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                          {app.position}
                        </p>
                      </div>

                      {/* Notes snippet */}
                      <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-3 mt-3 font-medium">
                        {notes || 'No description added yet.'}
                      </p>
                    </div>

                    {/* Bottom Metadata & actions */}
                    <div className="pt-4 border-t border-gray-50 dark:border-dark-border/40 mt-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 font-bold">
                        <span className="flex items-center gap-1 truncate max-w-[50%]">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-primary-400" />
                          <span className="truncate">{location}</span>
                        </span>
                        
                        {app.interview_date && (
                          <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 truncate">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{new Date(app.interview_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                          </span>
                        )}
                      </div>

                      {/* Action overlays visible on hover */}
                      <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-[10px] text-primary-500 font-extrabold flex items-center gap-0.5">
                          View details <ExternalLink className="w-3 h-3" />
                        </span>
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/applications/${app.id}/edit`)}
                            className="p-1.5 rounded-lg border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors cursor-pointer"
                            aria-label="Edit tracker"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={e => handleDelete(e, app.id)}
                            className="p-1.5 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                            aria-label="Delete tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Custom Pagination Component */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-xs font-bold text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State featuring a unique cute Tracky expression */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-12 text-center shadow-lg flex flex-col items-center gap-4 max-w-lg mx-auto"
        >
          <Tracky expression="confused" className="w-28 h-28" />
          <div className="space-y-1">
            <h3 className="text-xl font-bold">No application trackers found</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed mx-auto">
              {search.trim() !== '' 
                ? "We couldn't find matches for your search query. Try typing something else!" 
                : "Your board is empty! Add your first application tracker to kick off your internship journey."
              }
            </p>
          </div>
          {search.trim() === '' && (
            <Button onClick={() => navigate('/applications/new')} icon={<Plus className="w-4 h-4" />} className="mt-2">
              Add Application
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Applications;
