export const getNextDate = (timeframe: string, currentDate?: Date): Date => {
  const date = currentDate || new Date();
  
  switch (timeframe) {
    case 'daily':
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      return nextDay;
    
    case 'weekly':
      const nextWeek = new Date(date);
      nextWeek.setDate(date.getDate() + 7);
      return nextWeek;
    
    case 'monthly':
      const nextMonth = new Date(date);
      nextMonth.setMonth(date.getMonth() + 1);
      return nextMonth;
    
    case 'quarterly':
      const nextQuarter = new Date(date);
      nextQuarter.setMonth(date.getMonth() + 3);
      return nextQuarter;
    
    case 'yearly':
      const nextYear = new Date(date);
      nextYear.setFullYear(date.getFullYear() + 1);
      return nextYear;
    
    case 'lifelong':
      return date; // Lifelong doesn't change
    
    default:
      return date;
  }
};

export const getPreviousDate = (timeframe: string, currentDate?: Date): Date => {
  const date = currentDate || new Date();
  
  switch (timeframe) {
    case 'daily':
      const prevDay = new Date(date);
      prevDay.setDate(date.getDate() - 1);
      return prevDay;
    
    case 'weekly':
      const prevWeek = new Date(date);
      prevWeek.setDate(date.getDate() - 7);
      return prevWeek;
    
    case 'monthly':
      const prevMonth = new Date(date);
      prevMonth.setMonth(date.getMonth() - 1);
      return prevMonth;
    
    case 'quarterly':
      const prevQuarter = new Date(date);
      prevQuarter.setMonth(date.getMonth() - 3);
      return prevQuarter;
    
    case 'yearly':
      const prevYear = new Date(date);
      prevYear.setFullYear(date.getFullYear() - 1);
      return prevYear;
    
    case 'lifelong':
      return date; // Lifelong doesn't change
    
    default:
      return date;
  }
};

export const getDateRangeForTimeframe = (timeframe: string, date?: Date): string => {
  const targetDate = date || new Date();
  
  switch (timeframe) {
    case 'daily':
      return targetDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    
    case 'weekly': {
      const startOfWeek = new Date(targetDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const formatDate = (date: Date) => date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      return `${formatDate(startOfWeek)}-${formatDate(endOfWeek)}`;
    }
    
    case 'monthly':
      return targetDate.toLocaleDateString('en-US', { 
        month: 'long'
      });
    
    case 'quarterly': {
      const quarter = Math.floor(targetDate.getMonth() / 3) + 1;
      return `Q${quarter} ${targetDate.getFullYear()}`;
    }
    
    case 'yearly':
      return targetDate.getFullYear().toString();
    
    case 'lifelong':
      return '';
    
    default:
      return '';
  }
};