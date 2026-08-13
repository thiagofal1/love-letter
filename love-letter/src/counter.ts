const loveTimer = new Date(2024, 3, 20);
const loveTime = new Date().getTime() - loveTimer.getTime();
const millisecondsPerDay = 1000 * 60 * 60 * 24;
const totalDays = Math.floor(loveTime / millisecondsPerDay);
const daysElement = document.querySelector<HTMLElement>('#relationship-days')

if (daysElement) {
  daysElement.textContent = `${totalDays} DIAS`
}

const today = new Date();
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

const durationElement =
  document.querySelector<HTMLElement>('#relationship-duration');
if (durationElement) {
  durationElement.textContent =
    `${years} ANOS ${months} MESES E ${days} DIAS`;
}