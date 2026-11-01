export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/40',
        badge: 'bg-red-500 text-white',
        dot: 'bg-red-500',
      };
    case 'high':
      return {
        bg: 'bg-orange-500/20',
        text: 'text-orange-400',
        border: 'border-orange-500/40',
        badge: 'bg-orange-500 text-white',
        dot: 'bg-orange-500',
      };
    case 'medium':
      return {
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        badge: 'bg-amber-500 text-slate-900',
        dot: 'bg-amber-500',
      };
    case 'low':
    default:
      return {
        bg: 'bg-blue-500/20',
        text: 'text-blue-400',
        border: 'border-blue-500/40',
        badge: 'bg-blue-500 text-white',
        dot: 'bg-blue-500',
      };
  }
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'verified':
    case 'resolved':
    case 'completed':
    case 'fulfilled':
    case 'active':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'response_in_progress':
    case 'in_progress':
    case 'accepted':
    case 'assigned':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'pending':
    case 'open':
    case 'reported':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'rejected':
    case 'cancelled':
    case 'closed':
    case 'full':
    case 'inactive':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export const formatCategory = (category) => {
  if (!category) return '';
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getCategoryIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'flood':
      return '🌊';
    case 'fire':
      return '🔥';
    case 'earthquake':
      return '🏚️';
    case 'cyclone':
      return '🌀';
    case 'landslide':
      return '⛰️';
    case 'road_accident':
      return '🚗';
    case 'building_collapse':
      return '🏢';
    case 'weather_warning':
      return '⛈️';
    default:
      return '⚠️';
  }
};
