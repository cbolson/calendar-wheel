drawClockFaces();

function drawClockFaces() {
  const clockFaces = document.querySelectorAll(".clock-face");

  // Get the current date details
  const currentDate = new Date();
  const currentDay = currentDate.getDate(); // Day of the month (1 to 31)
  const currentMonth = currentDate.getMonth(); // Month (0 to 11)
  const currentYear = currentDate.getFullYear(); // Current year
  const currentWeekday = currentDate.getDay(); // Weekday (0-6, Sunday = 0)
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentSeconds = currentDate.getSeconds();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // Days in current month (1-31)

  // Get localized weekday and month names
  const locale = navigator.language || "en-US"; // Default to 'en-US'
  //const locale = 'ro-RO';
  const weekdayNames = Array.from(
    { length: 7 },
    (_, i) =>
      new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
        new Date(2021, 0, i + 3)
      ) // Jan 3rd is Sunday in 2021
  );
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2021, i))
  );

  clockFaces.forEach((clockFace) => {
    const clockType = clockFace.getAttribute("data-clock");
    const numbers = parseInt(clockFace.getAttribute("data-numbers"), 10);
    const radius = clockFace.offsetWidth / 2 - 20; // Adjusted for padding
    const center = clockFace.offsetWidth / 2; // Center of the circle

    let valueSet;
    let currentValue; // This will store the current value (e.g., current day, month, year)

    // Define the value set and current value for each clock type
    switch (clockType) {
      case "seconds":
        valueSet = Array.from({ length: 60 }, (_, i) =>
          String(i).padStart(2, "0")
        ); // 00 to 59
        currentValue = String(currentSeconds).padStart(2, "0"); // Pad current seconds
        break;
      case "minutes":
        valueSet = Array.from({ length: 60 }, (_, i) =>
          String(i).padStart(2, "0")
        ); // 00 to 59
        currentValue = String(currentMinutes).padStart(2, "0"); // Pad current minutes
        break;
      case "hours":
        valueSet = Array.from({ length: 24 }, (_, i) =>
          String(i).padStart(2, "0")
        ); // 00 to 23
        currentValue = String(currentHours).padStart(2, "0"); // Pad current hours
        break;
      case "days":
        valueSet = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1); // 1 to 31
        currentValue = currentDay; // Current day of the month
        break;
      case "months":
        valueSet = monthNames; // Use localized month names
        currentValue = currentMonth; // Current month (0-indexed)
        break;
      case "years":
        valueSet = Array.from({ length: 101 }, (_, i) => 2000 + i); // Years from 2000 to 2100
        currentValue = currentYear; // Current year
        break;
      case "day-names":
        valueSet = weekdayNames; // Use localized weekday names
        currentValue = currentWeekday; // Current weekday (0-6, Sunday = 0)
        break;
      default:
        return;
    }

    // Create and position elements on the clock face
    valueSet.forEach((value, i) => {
      const angle = i * (360 / numbers); // Determine angle for this number
      const x = center + radius * Math.cos((angle * Math.PI) / 180);
      const y = center + radius * Math.sin((angle * Math.PI) / 180);

      const element = document.createElement("span");
      element.classList.add("number");
      element.textContent = value;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`; // Rotate the number to be upright at 3 o'clock

      clockFace.appendChild(element);
    });

    // Calculate the rotation to align the current value to the 3 o'clock position
    const currentIndex = valueSet.indexOf(
      typeof valueSet[0] === "string" ? String(currentValue) : currentValue
    );
    const rotationAngle = -((currentIndex / numbers) * 360); // Negative to rotate counterclockwise

    // Apply the rotation to the clock face
    clockFace.style.transform = `rotate(${rotationAngle}deg)`;
  });
}

function rotateClockFaces() {
  const clockFaces = document.querySelectorAll(".clock-face");

  // Store the last known angles for smooth transitions
  const lastAngles = {};

  function updateRotations() {
    const now = new Date();
    const currentSecond = now.getSeconds();
    const currentMinute = now.getMinutes();
    const currentHour = now.getHours();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYear = now.getFullYear();
    const currentWeekday = now.getDay(); // 0 = Sunday, 6 = Saturday

    clockFaces.forEach((clockFace) => {
      const clockType = clockFace.getAttribute("data-clock");
      const totalNumbers = parseInt(clockFace.getAttribute("data-numbers"), 10);

      let currentValue;
      switch (clockType) {
        case "seconds":
          currentValue = currentSecond;
          break;
        case "minutes":
          currentValue = currentMinute;
          break;
        case "hours":
          currentValue = currentHour;
          break;
        case "days":
          currentValue = currentDay - 1; // Days are 1-indexed
          break;
        case "months":
          currentValue = currentMonth;
          break;
        case "years":
          currentValue = currentYear - 2000; // Align with year range (2000-2100)
          break;
        case "day-names":
          currentValue = currentWeekday; // 0 = Sunday
          break;
        default:
          return;
      }

      // Calculate target angle
      const targetAngle = (360 / totalNumbers) * currentValue;

      // Retrieve the last angle for this clock face
      const clockId = clockFace.id || clockType;
      const lastAngle = lastAngles[clockId] || 0;

      // Adjust for shortest rotation direction
      const delta = targetAngle - lastAngle;
      const shortestDelta = ((delta + 540) % 360) - 180; // Normalize between -180 and 180

      // Update the clock face rotation
      const newAngle = lastAngle + shortestDelta;
      clockFace.style.transform = `rotate(${newAngle * -1}deg)`; // Counter-clockwise for alignment

      // Store the new angle
      lastAngles[clockId] = newAngle;

      // Update "active" class
      const numbers = clockFace.querySelectorAll(".number");
      numbers.forEach((number, index) => {
        if (index === currentValue) {
          number.classList.add("active");
        } else {
          number.classList.remove("active");
        }
      });
    });

    // Request next frame
    requestAnimationFrame(updateRotations);
  }

  // Start the rotation updates
  updateRotations();
}

// Call the function to start the rotation
rotateClockFaces();
