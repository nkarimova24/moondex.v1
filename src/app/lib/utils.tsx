//format date
export function formatDate(dateString: string): string {
    if (!dateString) return "";
    
    const date = new Date(dateString.replace(/\//g, "-"));
    
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }