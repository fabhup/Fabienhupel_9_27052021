import firestore from "./Firestore.js"
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js"
import Bills  from "../containers/Bills.js"
import NewBill from "../containers/NewBill.js"
import Dashboard from "../containers/Dashboard.js"
import { formatDateForSort } from "../app/format.js"
import BillsUI from "../views/BillsUI.js"
import DashboardUI from "../views/DashboardUI.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"

export default () => {
  const rootDiv = document.getElementById('root')
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })

  window.onNavigate = (pathname) => {

    window.history.pushState(
      {},
      pathname,
      window.location.origin + pathname
    )
    if (pathname === ROUTES_PATH['Login']) {
      rootDiv.innerHTML = ROUTES({ pathname })
      document.body.style.backgroundColor="#0E5AE5"
      new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, firestore })
    } else if (pathname === ROUTES_PATH['Bills']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')
      const bills = new Bills({ document, onNavigate, firestore, localStorage  })
      bills.getBills().then(data => {
        console.log(data)
        rootDiv.innerHTML = BillsUI({ data: data.sort((a,b) => formatDateForSort(a.dateForSort) > formatDateForSort(b.dateForSort) ? -1 : 1)})
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
        new Bills({ document, onNavigate, firestore, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })
    } else if (pathname === ROUTES_PATH['NewBill']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      const datepicker = document.querySelector(`input[data-testid="datepicker"]`)
      datepicker.setAttribute('max', (new Date()).toISOString().split('T')[0]) // set max datepicker to today to avoid possibility to create bills with invalid date
      datepicker.setAttribute('min', (new Date(Date.UTC(new Date().getFullYear()-2, 0, 1))).toISOString().split('T')[0]) // set min datepicker to 01/01/Y-2 to avoid possibility to create bills before this date
      new NewBill({ document, onNavigate, firestore, localStorage })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')
    } else if (pathname === ROUTES_PATH['Dashboard']) {
      rootDiv.innerHTML = ROUTES({ pathname, loading: true })
      const bills = new Dashboard({ document, onNavigate, firestore, bills: [], localStorage })
      bills.getBillsAllUsers().then(bills => {
        rootDiv.innerHTML = DashboardUI({ data: { bills } })
        new Dashboard({ document, onNavigate, firestore, bills, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname, error })
      })
    }
  }
  
  window.onpopstate = (e) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (window.location.pathname === "/" && !user) {
      document.body.style.backgroundColor="#0E5AE5"
      rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })
    }
    else if (user) {
      onNavigate(PREVIOUS_LOCATION)
    }
  }

  if (window.location.pathname === "/" && window.location.hash === "") {
    new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, firestore })
    document.body.style.backgroundColor="#0E5AE5"
  } else if (window.location.hash !== "") {
    if (window.location.hash === ROUTES_PATH['Bills']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.add('active-icon')
      divIcon2.classList.remove('active-icon')
      const bills = new Bills({ document, onNavigate, firestore, localStorage  })
      bills.getBills().then(data => {
        rootDiv.innerHTML = BillsUI({ data })
        const divIcon1 = document.getElementById('layout-icon1')
        const divIcon2 = document.getElementById('layout-icon2')
        divIcon1.classList.add('active-icon')
        divIcon2.classList.remove('active-icon')
        new Bills({ document, onNavigate, firestore, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
      })
    } else if (window.location.hash === ROUTES_PATH['NewBill']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      new NewBill({ document, onNavigate, firestore, localStorage })
      const divIcon1 = document.getElementById('layout-icon1')
      const divIcon2 = document.getElementById('layout-icon2')
      divIcon1.classList.remove('active-icon')
      divIcon2.classList.add('active-icon')
    } else if (window.location.hash === ROUTES_PATH['Dashboard']) {
      rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, loading: true })
      const bills = new Dashboard({ document, onNavigate, firestore, bills: [], localStorage })
      bills.getBillsAllUsers().then(bills => {
        rootDiv.innerHTML = DashboardUI({ data: { bills } })
        new Dashboard({ document, onNavigate, firestore, bills, localStorage })
      }).catch(error => {
        rootDiv.innerHTML = ROUTES({ pathname: window.location.hash, error })
      })
    }
  }

  return null
}
 
