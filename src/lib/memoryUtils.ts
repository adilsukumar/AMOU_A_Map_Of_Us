// Auto-generate short topics from memory descriptions
export const generateMemoryTopic = (description: string, title?: string): string => {
  if (!description?.trim()) return title || 'Memory';
  
  // If title exists and is short, use it
  if (title && title.length <= 20) return title;
  
  const text = description.toLowerCase().trim();
  
  // Common topic patterns
  const patterns = [
    { keywords: ['birthday', 'party', 'celebrate'], topic: 'Birthday Celebration' },
    { keywords: ['wedding', 'marriage', 'bride', 'groom'], topic: 'Wedding Day' },
    { keywords: ['vacation', 'trip', 'travel', 'holiday'], topic: 'Travel Adventure' },
    { keywords: ['restaurant', 'food', 'dinner', 'lunch', 'eat'], topic: 'Dining Experience' },
    { keywords: ['beach', 'ocean', 'sea', 'sand'], topic: 'Beach Visit' },
    { keywords: ['mountain', 'hiking', 'climb', 'peak'], topic: 'Mountain Adventure' },
    { keywords: ['concert', 'music', 'band', 'show'], topic: 'Music Event' },
    { keywords: ['graduation', 'degree', 'university', 'college'], topic: 'Graduation Day' },
    { keywords: ['baby', 'born', 'birth', 'newborn'], topic: 'New Baby' },
    { keywords: ['work', 'job', 'office', 'meeting'], topic: 'Work Event' },
    { keywords: ['friend', 'friends', 'hangout', 'meet'], topic: 'Friend Meetup' },
    { keywords: ['family', 'reunion', 'relatives'], topic: 'Family Time' },
    { keywords: ['park', 'nature', 'walk', 'outdoor'], topic: 'Nature Walk' },
    { keywords: ['movie', 'cinema', 'film', 'theater'], topic: 'Movie Night' },
    { keywords: ['shopping', 'mall', 'store', 'buy'], topic: 'Shopping Trip' },
    { keywords: ['hospital', 'doctor', 'medical'], topic: 'Medical Visit' },
    { keywords: ['school', 'class', 'study', 'learn'], topic: 'School Memory' },
    { keywords: ['home', 'house', 'move', 'new'], topic: 'Home Memory' },
    { keywords: ['love', 'romantic', 'date', 'kiss'], topic: 'Romantic Moment' },
    { keywords: ['sad', 'cry', 'difficult', 'hard'], topic: 'Difficult Time' },
    { keywords: ['happy', 'joy', 'amazing', 'wonderful'], topic: 'Happy Moment' },
    { keywords: ['surprise', 'unexpected', 'shock'], topic: 'Surprise Event' },
    { keywords: ['achievement', 'success', 'win', 'award'], topic: 'Achievement' },
    { keywords: ['sport', 'game', 'play', 'match'], topic: 'Sports Event' },
    { keywords: ['art', 'museum', 'gallery', 'paint'], topic: 'Art Experience' }
  ];
  
  // Find matching pattern
  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => text.includes(keyword))) {
      return pattern.topic;
    }
  }
  
  // Extract first few meaningful words
  const words = description.split(' ')
    .filter(word => word.length > 2)
    .slice(0, 3)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  
  return words.length > 0 ? words.join(' ') : 'Memory';
};