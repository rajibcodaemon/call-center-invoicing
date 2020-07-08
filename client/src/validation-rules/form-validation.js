export const valiedEmail = (value) => {
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value.toLowerCase())) {
    return false;
  } else {
    return true;
  }
}

export const isAlpha = (value) => {
  if (!/^[a-zA-Z]+$/.test(value.toLowerCase())) {
    return false;
  } else {
    return true;
  }
}

export const isPhone = (value) => {
  if (!/^\d{10}$/.test(value)) {
    return false;
  } else {
    return true;
  }
}

export const isEmpty = (value) => {
  if (value.trim().length > 0 && value.trim() !== '') {
    return false;
  } else {
    return true;
  }
}