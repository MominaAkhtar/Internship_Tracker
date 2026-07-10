import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Award, 
  Briefcase, 
  Calendar, 
  Trophy, 
  Zap, 
  Star,
  CheckCircle2,
  ShieldAlert,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDashboardSummary } from '../services/dashboard';
import client from '../api/client';
import { API_BASE_URL } from '../api/config';
import { getApplications } from '../services/applications';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Tracky } from '../components/mascot/Tracky';

export const Profile = () => {
  const { user, reloadProfile } = useAuth();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  
  const [stats, setStats] = useState({
    total_applications: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await client.post('/auth/me/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data && res.data.success) {
        showToast('Profile picture updated!', 'success');
        await reloadProfile();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to upload profile picture.', 'error');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardSummary();
        if (res) {
          setStats(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Compute dynamic achievements
  const achievements = [
    {
      title: 'First Step taken',
      desc: 'Created your first application tracker.',
      unlocked: stats.total_applications > 0,
      icon: <Zap className="w-5 h-5 text-amber-500" />
    },
    {
      title: 'Active Jobseeker',
      desc: 'Added 5 or more applications.',
      unlocked: stats.total_applications >= 5,
      icon: <Briefcase className="w-5 h-5 text-primary-500" />
    },
    {
      title: 'Interview Ready',
      desc: 'Scheduled your first recruiter interview.',
      unlocked: stats.interview > 0,
      icon: <Calendar className="w-5 h-5 text-sky-500" />
    },
    {
      title: 'Elite Candidate',
      desc: 'Secured at least one internship offer!',
      unlocked: stats.offer > 0,
      icon: <Trophy className="w-5 h-5 text-emerald-500" />
    },
    {
      title: 'Determined Spirit',
      desc: 'Faced a rejection and kept applying.',
      unlocked: stats.rejected > 0,
      icon: <Star className="w-5 h-5 text-indigo-500" />
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black">User Profile</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Your credentials, system stats, and career achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User profile card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl flex flex-col items-center justify-between text-center relative overflow-hidden"
        >
          {/* Cover gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-500/20 to-accent-blue/10" />

          <div className="space-y-4 relative z-10 mt-10">
            {/* Avatar with image upload option */}
            <div className="relative group w-20 h-20 rounded-full bg-gradient-to-tr from-primary-400 to-secondary-200 p-[3px] shadow-md mx-auto cursor-pointer">
              <label className="cursor-pointer block w-full h-full rounded-full overflow-hidden relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  disabled={uploading} 
                />
                
                <div className="w-full h-full bg-white dark:bg-dark-card flex items-center justify-center overflow-hidden font-display font-black text-2xl text-primary-600">
                  {user?.profile_picture ? (
                    <img 
                      src={`${API_BASE_URL}${user.profile_picture}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={user?.profile_picture ? "hidden" : "flex w-full h-full items-center justify-center"}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </label>
            </div>

            <div>
              <h2 className="text-xl font-bold">{user?.name || 'Explorer'}</h2>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user?.email}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-100/50 rounded-full text-xs font-bold mx-auto">
              <Award className="w-3.5 h-3.5" />
              <span>Student Account</span>
            </div>
          </div>

          <div className="w-full border-t border-gray-50 dark:border-dark-border/40 mt-6 pt-6 space-y-4 relative z-10 text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Account Overview
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div className="p-3 bg-gray-50 dark:bg-dark-border/30 rounded-2xl">
                <span className="text-gray-400 block font-semibold">Trackers Added</span>
                <span className="text-lg font-black text-gray-800 dark:text-white mt-1 block">
                  {stats.total_applications}
                </span>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-border/30 rounded-2xl">
                <span className="text-gray-400 block font-semibold">Active Offers</span>
                <span className="text-lg font-black text-emerald-500 mt-1 block">
                  {stats.offer}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Achievements list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-xl text-left"
          >
            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-500" /> Tracky Achievements
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              Gamify your job search. Dynamic milestones unlocked as you log more actions.
            </p>

            <div className="space-y-4">
              {achievements.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
                    item.unlocked 
                      ? 'bg-emerald-500/5 border-emerald-500/10 dark:bg-emerald-950/5 dark:border-emerald-900/10' 
                      : 'bg-gray-50 border-gray-100 dark:bg-dark-border/30 dark:border-dark-border/80 opacity-55'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    item.unlocked 
                      ? 'bg-emerald-500/10 text-emerald-500' 
                      : 'bg-gray-200 dark:bg-dark-border text-gray-400'
                  }`}>
                    {item.icon}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm font-bold ${item.unlocked ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                        {item.title}
                      </h4>
                      {item.unlocked ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded">
                          Unlocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-gray-400 bg-gray-100 dark:bg-dark-border px-2 py-0.5 rounded">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
