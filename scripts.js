const MAX_SECONDS = 60;
const MAX_MINUTES = 60;
const MAX_HOURS = 24;
const DEGREES_IN_CIRCLE = 360;

const lastAngles = {};

const clockFaces = document.querySelectorAll("[data-clock]");

// Pad with '0' if value < 10
function padWithZero(value) {
  return value < 10 ? `0${value}` : value;
}
// render clock faces
function drawClockFaces() {
  const currentDate = new Date();

  // Get current date details
  const currentDateDetails = {
    day: currentDate.getDate(),
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
    weekday: currentDate.getDay(),
    hours: currentDate.getHours(),
    minutes: currentDate.getMinutes(),
    seconds: currentDate.getSeconds(),
    totalDaysInMonth: new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate(),
  };

  const locale = navigator.language || "en-US";
  //const locale = "es-ES";
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
      new Date(2021, 0, i + 3)
    )
  );
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2021, i))
  );

  const createValueSet = (length, pad = false) =>
    Array.from({ length }, (_, i) =>
      pad ? String(i).padStart(2, "0") : i + 1
    );

  clockFaces.forEach((clockFace) => {
    const clockType = clockFace.dataset.clock;
    const numbers = parseInt(clockFace.getAttribute("data-numbers"), 10);
    const radius = clockFace.offsetWidth / 2 - 20;
    const center = clockFace.offsetWidth / 2;

    let valueSet = [];
    let currentValue;

    switch (clockType) {
      case "seconds":
        valueSet = createValueSet(MAX_SECONDS, true);
        currentValue = padWithZero(currentDateDetails.seconds);
        break;
      case "minutes":
        valueSet = createValueSet(MAX_MINUTES, true);
        currentValue = padWithZero(currentDateDetails.minutes);
        break;
      case "hours":
        valueSet = createValueSet(MAX_HOURS, true);
        currentValue = padWithZero(currentDateDetails.hours);
        break;
      case "days":
        valueSet = createValueSet(currentDateDetails.totalDaysInMonth); // Dynamic for number of days
        currentValue = currentDateDetails.day;
        break;
      case "months":
        valueSet = monthNames;
        currentValue = currentDateDetails.month;
        break;
      case "years":
        valueSet = createValueSet(101, false).map((year) => 2000 + year - 1);
        currentValue = currentDateDetails.year - 2000; // Adjust for year indexing
        break;
      case "day-names":
        valueSet = weekdayNames;
        currentValue = currentDateDetails.weekday;
        break;
      default:
        console.error(`Unknown clock type: ${clockType}`);
        return;
    }

    valueSet.forEach((value, i) => {
      const angle = i * (DEGREES_IN_CIRCLE / numbers);
      const x = center + radius * Math.cos((angle * Math.PI) / 180);
      const y = center + radius * Math.sin((angle * Math.PI) / 180);

      const element = document.createElement("span");
      element.classList.add("number");
      element.textContent = value;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      clockFace.appendChild(element);
    });

    // Calculate the target angle based on the current value
    const targetAngle = (DEGREES_IN_CIRCLE / numbers) * currentValue;
    const clockId = clockFace.id || clockType;
    const lastAngle = lastAngles[clockId] || 0;
    const delta = targetAngle - lastAngle;
    const shortestDelta = ((delta + 540) % DEGREES_IN_CIRCLE) - 180;

    const newAngle = lastAngle + shortestDelta;
    clockFace.style.transform = `rotate(${newAngle * -1}deg)`;
    lastAngles[clockId] = newAngle;
  });
}
// rotate clock faces
function rotateClockFaces() {
  function updateRotations() {
    const now = new Date();
    const currentDateDetails = {
      seconds: now.getSeconds(),
      minutes: now.getMinutes(),
      hours: now.getHours(),
      day: now.getDate() - 1, // Indexed from 0 for days
      month: now.getMonth(), // 0-indexed
      year: now.getFullYear(), // Don't subtract 2000 here
      weekday: now.getDay(),
    };

    clockFaces.forEach((clockFace) => {
      const clockType = clockFace.dataset.clock;
      const totalNumbers = parseInt(clockFace.getAttribute("data-numbers"), 10);
      let currentValue;

      switch (clockType) {
        case "seconds":
          currentValue = padWithZero(now.getSeconds());
          break;
        case "minutes":
          currentValue = padWithZero(now.getMinutes());
          break;
        case "hours":
          currentValue = padWithZero(now.getHours());
          break;
        case "days":
          currentValue = now.getDate() - 1;
          break;
        case "months":
          currentValue = now.getMonth();
          break;
        case "years":
          currentValue = now.getFullYear() - 2000;
          break;

        case "day-names":
          currentValue = now.getDay();
          break;
        default:
          console.error(`Unknown clock type: ${clockType}`);
          return;
      }

      // Calculate target angle to allow continuous rotation
      const targetAngle = (DEGREES_IN_CIRCLE / totalNumbers) * currentValue;
      const clockId = clockFace.id || clockType;
      const lastAngle = lastAngles[clockId] || 0;
      const delta = targetAngle - lastAngle;
      const shortestDelta = ((delta + 540) % DEGREES_IN_CIRCLE) - 180;

      const newAngle = lastAngle + shortestDelta;
      clockFace.style.transform = `rotate(${newAngle * -1}deg)`;
      lastAngles[clockId] = newAngle;

      const numbers = clockFace.querySelectorAll(".number");
      numbers.forEach((number, index) => {
        number.classList.toggle("active", index === currentValue);
      });
    });

    requestAnimationFrame(updateRotations);
  }
  updateRotations();
}

drawClockFaces();
rotateClockFaces();
