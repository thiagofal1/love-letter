export function calculateRelationshipDuration(startDateStr: string) {
  // Parse date string (YYYY-MM-DD) avoiding timezone shifts
  const [year, month, day] = startDateStr.split('-').map(Number);
  const loveTimer = new Date(year, (month || 1) - 1, day || 1);
  const today = new Date();

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const loveTime = Math.max(0, today.getTime() - loveTimer.getTime());
  const totalDays = Math.floor(loveTime / millisecondsPerDay);

  let years = today.getFullYear() - loveTimer.getFullYear();
  let months = today.getMonth() - loveTimer.getMonth();
  let days = today.getDate() - loveTimer.getDate();

  if (days < 0) {
    months--;
    const daysInPreviousMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
    days += daysInPreviousMonth;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Handle case where start date is in the future
  if (years < 0) {
    years = 0;
    months = 0;
    days = 0;
  }

  const durationString = `${years} ANOS ${months} MESES E ${days} DIAS`;
  const daysString = `${totalDays} DIAS`;

  return { years, months, days, totalDays, durationString, daysString };
}

export function updateRelationshipCounter(
  startDateStr: string = '2024-04-20',
  root: HTMLElement | Document = document
) {
  const { durationString, daysString } = calculateRelationshipDuration(startDateStr);

  const daysElement = root.querySelector<HTMLElement>('#relationship-days');
  if (daysElement) {
    daysElement.textContent = daysString;
  }

  const durationElement = root.querySelector<HTMLElement>('#relationship-duration');
  if (durationElement) {
    durationElement.textContent = durationString;
  }
}