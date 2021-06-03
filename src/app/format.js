export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const isValidDate = (date) => date instanceof Date && !isNaN(date) && date.getFullYear()>=1980 && date<= new Date()
  if (isValidDate(date)) {
    const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
    const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
    const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
    const month = mo.charAt(0).toUpperCase() + mo.slice(1)
    return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
  }
  else {
    return "Date non valide"
  }
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}

export const formatDateForSort = (dateStr) => {
  const date = new Date(dateStr)
  const isValidDate = (date) => date instanceof Date && !isNaN(date) && date.getFullYear()>=1980 && date<= new Date();
  if (isValidDate(date)) {
    return date
  }
  else {
    return 0
  }
}