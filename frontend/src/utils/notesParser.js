/**
 * Helper utility to parse and format the notes field
 * which encodes Location, Priority, and Notes content.
 */

export const serializeNotes = ({ location = '', priority = 'Medium', notes = '' }) => {
  return `Location: ${location.trim()} | Priority: ${priority} | Notes: ${notes.trim()}`;
};

export const deserializeNotes = (rawNotes = '') => {
  const result = {
    location: 'Remote',
    priority: 'Medium',
    notes: ''
  };

  if (!rawNotes) return result;

  const parts = rawNotes.split(' | ');
  parts.forEach(part => {
    if (part.startsWith('Location:')) {
      result.location = part.replace('Location:', '').trim() || 'Remote';
    } else if (part.startsWith('Priority:')) {
      result.priority = part.replace('Priority:', '').trim() || 'Medium';
    } else if (part.startsWith('Notes:')) {
      result.notes = part.replace('Notes:', '').trim();
    }
  });

  // Fallback if the raw notes didn't follow the serialized pattern
  if (!parts.some(p => p.startsWith('Location:') || p.startsWith('Priority:'))) {
    result.notes = rawNotes;
  }

  return result;
};
